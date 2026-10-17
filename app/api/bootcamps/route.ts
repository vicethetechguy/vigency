import { NextResponse } from 'next/server';
import { getPublishedBootcamps } from '@/lib/bootcamps';

export const runtime = 'nodejs';
export const revalidate = 60;

/** Public list of bootcamps shown on the landing page (drafts excluded). */
export async function GET() {
  try {
    return NextResponse.json({ bootcamps: await getPublishedBootcamps() });
  } catch {
    return NextResponse.json({ bootcamps: [] });
  }
}
