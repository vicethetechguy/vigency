import crypto from 'node:crypto';
import { redisCommand, redisPipeline } from './redis';

/**
 * Upcoming bootcamps shown on the landing page and managed from /admin.
 *
 * Storage (Upstash Redis):
 *   bootcamps                 hash   id -> Bootcamp JSON (no image bytes)
 *   bootcamp:image:<id>       string cover image as a data URL (resized in the browser before upload)
 */

export const BOOTCAMP_STATUSES = ['open', 'closing', 'full', 'draft'] as const;
export type BootcampStatus = (typeof BOOTCAMP_STATUSES)[number];

export type Bootcamp = {
  id: string;
  title: string;
  summary: string;
  startDate: string; // YYYY-MM-DD
  duration: string; // e.g. "8 weeks"
  schedule: string; // e.g. "Tue & Thu, 6pm WAT"
  format: string; // e.g. "Live online on Zero Club"
  price: number; // NGN, 0 = free
  originalPrice?: number; // NGN, shown struck through when higher than price
  registerUrl: string;
  status: BootcampStatus;
  hasImage: boolean;
  createdAt: number;
  updatedAt: number;
};

export type BootcampInput = Omit<Bootcamp, 'id' | 'hasImage' | 'createdAt' | 'updatedAt'> & {
  /** data:image/... to set, null to remove, undefined to keep the current image */
  image?: string | null;
};

const HASH = 'bootcamps';
const imageKey = (id: string) => `bootcamp:image:${id}`;
export const MAX_IMAGE_DATA_URL_LENGTH = 700_000; // ~500 KB of image bytes

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function toNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

/** Checks and normalises what the admin form sends. Returns an error message or the clean input. */
export function parseBootcampInput(body: any): { error: string } | { input: BootcampInput } {
  const title = clean(body?.title, 80);
  const summary = clean(body?.summary, 240);
  const startDate = clean(body?.startDate, 10);
  const duration = clean(body?.duration, 40);
  const schedule = clean(body?.schedule, 80);
  const format = clean(body?.format, 60);
  const registerUrl = clean(body?.registerUrl, 500);
  const status = BOOTCAMP_STATUSES.includes(body?.status) ? (body.status as BootcampStatus) : 'draft';
  const price = toNumber(body?.price);
  const originalPrice = toNumber(body?.originalPrice);

  if (!title) return { error: 'Add a bootcamp name.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { error: 'Choose a start date.' };
  if (price === undefined) return { error: 'Enter a price in naira. Use 0 for a free bootcamp.' };
  try {
    const url = new URL(registerUrl);
    if (url.protocol !== 'https:') throw new Error();
  } catch {
    return { error: 'Registration link must be a full https:// link, such as your Zero Form link.' };
  }

  let image: string | null | undefined = undefined;
  if (body?.image === null) image = null;
  else if (typeof body?.image === 'string' && body.image) {
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(body.image)) {
      return { error: 'Cover image must be a JPG, PNG or WebP picture.' };
    }
    if (body.image.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return { error: 'Cover image is too large. Use a picture under 500 KB.' };
    }
    image = body.image;
  }

  return {
    input: {
      title,
      summary,
      startDate,
      duration,
      schedule,
      format,
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      registerUrl,
      status,
      image,
    },
  };
}

function parseStored(json: string): Bootcamp | null {
  try {
    return JSON.parse(json) as Bootcamp;
  } catch {
    return null;
  }
}

function byStartDate(a: Bootcamp, b: Bootcamp) {
  return a.startDate.localeCompare(b.startDate) || a.createdAt - b.createdAt;
}

export async function listBootcamps(): Promise<Bootcamp[]> {
  const flat = ((await redisCommand(['HGETALL', HASH])) || []) as string[];
  const items: Bootcamp[] = [];
  for (let i = 1; i < flat.length; i += 2) {
    const b = parseStored(flat[i]);
    if (b) items.push(b);
  }
  return items.sort(byStartDate);
}

/** What the landing page shows: everything except drafts, soonest first. */
export async function getPublishedBootcamps(): Promise<Bootcamp[]> {
  return (await listBootcamps()).filter((b) => b.status !== 'draft');
}

export async function getBootcamp(id: string): Promise<Bootcamp | null> {
  const json = (await redisCommand(['HGET', HASH, id])) as string | null;
  return json ? parseStored(json) : null;
}

export async function getBootcampImage(id: string): Promise<string | null> {
  return (await redisCommand(['GET', imageKey(id)])) as string | null;
}

export async function saveBootcamp(input: BootcampInput, id?: string): Promise<Bootcamp> {
  const existing = id ? await getBootcamp(id) : null;
  if (id && !existing) throw new Error('NOT_FOUND');

  const now = Date.now();
  const { image, ...fields } = input;
  const bootcampId = existing?.id ?? crypto.randomUUID().slice(0, 12);
  const hasImage = image === undefined ? existing?.hasImage ?? false : image !== null;

  const record: Bootcamp = {
    ...fields,
    id: bootcampId,
    hasImage,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const commands: unknown[][] = [['HSET', HASH, bootcampId, JSON.stringify(record)]];
  if (typeof image === 'string') commands.push(['SET', imageKey(bootcampId), image]);
  if (image === null) commands.push(['DEL', imageKey(bootcampId)]);
  await redisPipeline(commands);

  return record;
}

export async function deleteBootcamp(id: string): Promise<boolean> {
  const [removed] = await redisPipeline([
    ['HDEL', HASH, id],
    ['DEL', imageKey(id)],
  ]);
  return Number(removed) > 0;
}
