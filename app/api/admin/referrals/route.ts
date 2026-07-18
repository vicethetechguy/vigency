import { NextResponse } from 'next/server';
import { getReferralLeaderboard } from '@/lib/referrals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const password = request.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const leaderboard = await getReferralLeaderboard();
  return NextResponse.json({ leaderboard });
}
