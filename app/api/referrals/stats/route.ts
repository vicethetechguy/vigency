import { NextResponse } from "next/server";
import { lookupReferrer, getReferralCount } from "@/lib/referrals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || code.length !== 8) {
    return NextResponse.json({ error: "Invalid referral code." }, { status: 400 });
  }

  try {
    const whatsapp = await lookupReferrer(code);
    if (!whatsapp) {
      return NextResponse.json({ error: "Referral code not found." }, { status: 404 });
    }

    const count = await getReferralCount(whatsapp);
    
    return NextResponse.json({ 
      count,
      target: 10,
      reward: 1000,
      earned: count >= 10
    });
  } catch (error) {
    return NextResponse.json({ error: "Could not fetch referral stats." }, { status: 500 });
  }
}
