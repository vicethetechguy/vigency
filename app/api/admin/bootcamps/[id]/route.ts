import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { deleteBootcamp, parseBootcampInput, saveBootcamp } from '@/lib/bootcamps';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const parsed = parseBootcampInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const bootcamp = await saveBootcamp(parsed.input, id);
    revalidatePath('/');
    return NextResponse.json({ bootcamp });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'This bootcamp no longer exists.' }, { status: 404 });
    }
    console.error('Update bootcamp failed', error);
    return NextResponse.json({ error: 'Could not save the bootcamp. Try again.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await deleteBootcamp(id);
    revalidatePath('/');
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Delete bootcamp failed', error);
    return NextResponse.json({ error: 'Could not delete the bootcamp. Try again.' }, { status: 500 });
  }
}
