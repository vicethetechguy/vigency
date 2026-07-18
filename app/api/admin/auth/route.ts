import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin not configured.' }, { status: 503 });
  }
  
  if (password !== adminPassword) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  
  return NextResponse.json({ valid: true });
}
