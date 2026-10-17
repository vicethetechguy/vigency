"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarDays, ExternalLink, ImagePlus, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import type { Bootcamp, BootcampStatus } from '@/lib/bootcamps';
import { formatPrice, formatStartDate, hasStarted, imageUrl, STATUS_LABEL } from '@/lib/bootcamp-format';

type FormState = {
  title: string;
  summary: string;
  startDate: string;
  duration: string;
  schedule: string;
  format: string;
  price: string;
  originalPrice: string;
  registerUrl: string;
  status: BootcampStatus;
  /** data URL of a new picture, null to remove the current one, undefined to keep it */
  image?: string | null;
};

const EMPTY: FormState = {
  title: '',
  summary: '',
  startDate: '',
  duration: '',
  schedule: '',
  format: 'Live online on Zero Club',
  price: '',
  originalPrice: '',
  registerUrl: '',
  status: 'open',
};

const STATUS_OPTIONS: { value: BootcampStatus; label: string }[] = [
  { value: 'open', label: 'Open for registration' },
  { value: 'closing', label: 'Closing soon' },
  { value: 'full', label: 'Fully booked' },
  { value: 'draft', label: 'Draft (hidden from the website)' },
];

const STATUS_STYLE: Record<BootcampStatus, string> = {
  open: 'bg-accent/10 text-accent border-accent/25',
  closing: 'bg-[#FF6A2A]/10 text-[#FF8A55] border-[#FF6A2A]/25',
  full: 'bg-white/[0.05] text-white/60 border-white/10',
  draft: 'bg-white/[0.03] text-white/40 border-dashed border-white/15',
};

const MAX_DATA_URL = 700_000;

/** Shrinks a picture in the browser so uploads stay small (max 1600px wide, JPEG). */
async function resizeImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.85, 0.75, 0.65, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', quality);
    if (url.length <= MAX_DATA_URL) return url;
  }
  throw new Error('too-large');
}

const inputClass =
  'w-full bg-white/[0.03] border border-white/[0.1] rounded-[14px] px-4 py-3 text-sm font-medium text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors';
const labelClass = 'block text-sm font-semibold text-white/80 mb-2';
const hintClass = 'mt-1.5 text-xs text-white/40';

export function BootcampsAdmin({ password }: { password: string }) {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<{ id?: string; current?: Bootcamp } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const headers = { 'x-admin-password': password, 'Content-Type': 'application/json' };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/bootcamps', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load bootcamps.');
      setBootcamps(data.bootcamps || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load bootcamps.');
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const startCreate = () => {
    setEditing({});
    setForm(EMPTY);
    setFormError('');
  };

  const startEdit = (b: Bootcamp) => {
    setEditing({ id: b.id, current: b });
    setForm({
      title: b.title,
      summary: b.summary,
      startDate: b.startDate,
      duration: b.duration,
      schedule: b.schedule,
      format: b.format,
      price: String(b.price),
      originalPrice: b.originalPrice ? String(b.originalPrice) : '',
      registerUrl: b.registerUrl,
      status: b.status,
    });
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setEditing(null);
    setFormError('');
  };

  const onPickImage = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setFormError('Cover image must be a JPG, PNG or WebP picture.');
      return;
    }
    try {
      set('image', await resizeImage(file));
      setFormError('');
    } catch {
      setFormError('That picture is too large to upload. Try a smaller one.');
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(editing?.id ? `/api/admin/bootcamps/${editing.id}` : '/api/admin/bootcamps', {
        method: editing?.id ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the bootcamp.');
      setNotice(
        form.status === 'draft'
          ? `"${form.title}" saved as a draft. It won't show on the website until you change its status.`
          : `"${form.title}" is saved and showing on the landing page.`
      );
      closeForm();
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save the bootcamp.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b: Bootcamp) => {
    setConfirmDelete(null);
    const res = await fetch(`/api/admin/bootcamps/${b.id}`, { method: 'DELETE', headers });
    if (res.ok) {
      setNotice(`"${b.title}" deleted.`);
      if (editing?.id === b.id) closeForm();
      load();
    } else {
      setNotice('Could not delete the bootcamp. Try again.');
    }
  };

  const previewImage =
    typeof form.image === 'string' ? form.image : form.image === null ? null : editing?.current?.hasImage ? imageUrl(editing.current) : null;

  return (
    <div className="space-y-6">
      {notice && (
        <div role="status" className="flex items-start justify-between gap-4 rounded-[14px] border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-white">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="Dismiss" className="text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="bg-[#111111] border border-white/[0.08] rounded-[20px] overflow-hidden">
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between gap-4">
            <h2 className="text-xl font-display font-bold text-white">{editing.id ? 'Edit bootcamp' : 'Add a bootcamp'}</h2>
            <button type="button" onClick={closeForm} className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05]" aria-label="Close form">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="bc-title" className={labelClass}>Bootcamp name</label>
                <input id="bc-title" className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="UI/UX Design Bootcamp" maxLength={80} required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bc-summary" className={labelClass}>Short description</label>
                <textarea id="bc-summary" className={`${inputClass} min-h-[88px] resize-y`} value={form.summary} onChange={(e) => set('summary', e.target.value)} placeholder="Design and prototype a real mobile app in Figma, from research to a clickable prototype." maxLength={240} />
                <p className={hintClass}>One or two sentences on what students will be able to do. {240 - form.summary.length} characters left.</p>
              </div>
              <div>
                <label htmlFor="bc-start" className={labelClass}>Start date</label>
                <input id="bc-start" type="date" className={inputClass} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
              </div>
              <div>
                <label htmlFor="bc-duration" className={labelClass}>Duration</label>
                <input id="bc-duration" className={inputClass} value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="8 weeks" maxLength={40} />
              </div>
              <div>
                <label htmlFor="bc-schedule" className={labelClass}>Class times</label>
                <input id="bc-schedule" className={inputClass} value={form.schedule} onChange={(e) => set('schedule', e.target.value)} placeholder="Tue and Thu, 6pm WAT" maxLength={80} />
              </div>
              <div>
                <label htmlFor="bc-format" className={labelClass}>Where it happens</label>
                <input id="bc-format" className={inputClass} value={form.format} onChange={(e) => set('format', e.target.value)} placeholder="Live online on Zero Club" maxLength={60} />
              </div>
              <div>
                <label htmlFor="bc-price" className={labelClass}>Price (₦)</label>
                <input id="bc-price" type="number" inputMode="numeric" min={0} step={1} className={inputClass} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="25000" required />
                <p className={hintClass}>Enter 0 for a free bootcamp.</p>
              </div>
              <div>
                <label htmlFor="bc-original" className={labelClass}>Original price (₦, optional)</label>
                <input id="bc-original" type="number" inputMode="numeric" min={0} step={1} className={inputClass} value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="50000" />
                <p className={hintClass}>Shown crossed out next to the price, for discounts.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bc-url" className={labelClass}>Registration link</label>
                <input id="bc-url" type="url" className={inputClass} value={form.registerUrl} onChange={(e) => set('registerUrl', e.target.value)} placeholder="https://…" required />
                <p className={hintClass}>The Zero Form link students open when they tap Register.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bc-status" className={labelClass}>Status</label>
                <select id="bc-status" className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as BootcampStatus)}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#111111]">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className={labelClass}>Cover image (optional)</span>
              <div className="relative aspect-[16/10] rounded-[14px] border border-dashed border-white/15 bg-white/[0.02] overflow-hidden grid place-items-center">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="Cover preview" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-white/40 text-sm px-6">
                    <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    A flyer or photo, landscape works best
                  </div>
                )}
              </div>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="bc-image" onChange={(e) => { onPickImage(e.target.files?.[0]); e.target.value = ''; }} />
              <div className="mt-3 flex flex-wrap gap-2">
                <label htmlFor="bc-image" className="press cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-white/40">
                  <ImagePlus className="h-4 w-4" /> {previewImage ? 'Replace image' : 'Upload image'}
                </label>
                {previewImage && (
                  <button type="button" onClick={() => set('image', null)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/60 hover:text-white">
                    Remove
                  </button>
                )}
              </div>
              <p className={hintClass}>JPG, PNG or WebP. Large pictures are shrunk automatically.</p>
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:justify-end">
            {formError && <p role="alert" className="text-sm text-accent sm:mr-auto">{formError}</p>}
            <button type="button" onClick={closeForm} className="rounded-full px-5 py-3 text-sm font-semibold text-white/70 hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-full bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              {saving ? 'Saving…' : editing.id ? 'Save changes' : form.status === 'draft' ? 'Save draft' : 'Publish bootcamp'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/[0.06] rounded-[20px] overflow-hidden">
        <div className="p-6 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white">Upcoming bootcamps</h2>
            <p className="text-sm text-white/50 mt-1">Everything here except drafts is shown on the landing page, soonest first.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} aria-label="Refresh" className="p-2.5 text-white/50 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-full border border-white/[0.05]">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {!editing && (
              <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90">
                <Plus className="h-4 w-4" /> Add bootcamp
              </button>
            )}
          </div>
        </div>

        {loadError ? (
          <p className="p-6 text-sm text-accent">{loadError}</p>
        ) : !loading && bootcamps.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 text-white/20" />
            <p className="text-white font-semibold">No bootcamps yet</p>
            <p className="text-sm text-white/50 mt-1 mb-5">Add your first bootcamp and it will appear on the landing page.</p>
            {!editing && (
              <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90">
                <Plus className="h-4 w-4" /> Add bootcamp
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {bootcamps.map((b) => {
              const started = hasStarted(b.startDate) && b.status !== 'draft';
              return (
                <li key={b.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative h-16 w-24 shrink-0 rounded-[12px] overflow-hidden bg-white/[0.04] border border-white/[0.06] grid place-items-center">
                      {b.hasImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(b)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <CalendarDays className="h-6 w-6 text-white/20" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white truncate">{b.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                      </div>
                      <p className="text-sm text-white/50 mt-1">
                        Starts {formatStartDate(b.startDate)}
                        {b.duration && ` · ${b.duration}`} · {formatPrice(b.price)}
                      </p>
                      {started && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#FF8A55]">
                          <AlertTriangle className="h-3.5 w-3.5" /> Start date has passed. Update it, mark it fully booked or delete it.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    {confirmDelete === b.id ? (
                      <>
                        <span className="text-sm text-white/70 mr-1">Delete this bootcamp?</span>
                        <button type="button" onClick={() => remove(b)} className="rounded-full bg-accent text-white px-4 py-2 text-sm font-semibold">Delete</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-full px-4 py-2 text-sm font-semibold text-white/60 hover:text-white">Keep</button>
                      </>
                    ) : (
                      <>
                        <a href={b.registerUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05]" aria-label={`Open registration link for ${b.title}`}>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button type="button" onClick={() => startEdit(b)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-white/40">
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(b.id)} className="p-2.5 rounded-full text-white/50 hover:text-accent hover:bg-accent/10" aria-label={`Delete ${b.title}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
