import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { listBootcamps, parseBootcampInput, saveBootcamp } from '@/lib/bootcamps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ bootcamps: await listBootcamps() });
  } catch (error) {
    console.error('List bootcamps failed', error);
    return NextResponse.json({ error: 'Could not load bootcamps. Check the Redis settings.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = parseBootcampInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const bootcamp = await saveBootcamp(parsed.input);
    revalidatePath('/');
    return NextResponse.json({ bootcamp }, { status: 201 });
  } catch (error) {
    console.error('Create bootcamp failed', error);
    return NextResponse.json({ error: 'Could not save the bootcamp. Try again.' }, { status: 500 });
  }
}
