import { NextResponse } from "next/server";
import {
  createCouponCode,
  isValidTier,
  normalizeWhatsAppNumber,
  saveCheckoutLeadToSheet,
  TIERS,
  type TierKey,
} from "@/lib/checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Payment is not configured yet." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      whatsapp?: string;
      whatsappConsent?: boolean;
      tier?: string;
    };

    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const whatsapp = normalizeWhatsAppNumber(body.whatsapp || "");

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: "Enter your full name." },
        { status: 400 },
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (!body.whatsappConsent) {
      return NextResponse.json(
        { error: "WhatsApp consent is required for delivery and bonuses." },
        { status: 400 },
      );
    }

    if (!body.tier || !isValidTier(body.tier)) {
      return NextResponse.json(
        { error: "Select a valid tier." },
        { status: 400 },
      );
    }

    const tier = body.tier as TierKey;
    const selectedTier = TIERS[tier];

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const couponCode = createCouponCode();

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: selectedTier.amountKobo,
          currency: "NGN",
          callback_url: `${origin}/success`,
          metadata: {
            full_name: fullName,
            whatsapp,
            whatsapp_consent: true,
            coupon_code: couponCode,
            product: `Spyda Credits — ${selectedTier.label}`,
            tier,
            credit_amount: selectedTier.credits,
          },
        }),
      },
    );

    const result = (await paystackResponse.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    };

    if (!paystackResponse.ok || !result.status || !result.data?.authorization_url) {
      return NextResponse.json(
        { error: result.message || "Could not start the secure checkout." },
        { status: 502 },
      );
    }

    try {
      await saveCheckoutLeadToSheet({
        fullName,
        email,
        whatsapp,
        status: "Started Checkout",
        reference: result.data.reference,
        promoCode: couponCode,
        amount: (selectedTier.amountKobo / 100).toString(),
        tier,
        credits: selectedTier.credits,
      });
    } catch (error) {
      console.error("Google Sheets lead save failed", error);
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
