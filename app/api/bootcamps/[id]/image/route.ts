import { getBootcamp, getBootcampImage } from '@/lib/bootcamps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Serves a bootcamp's cover image. The landing page adds ?v=<updatedAt>, so it can be cached for a long time. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [bootcamp, dataUrl] = await Promise.all([getBootcamp(id), getBootcampImage(id)]).catch(() => [null, null]);
  if (!bootcamp || !dataUrl) return new Response('Not found', { status: 404 });

  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return new Response('Not found', { status: 404 });

  return new Response(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
