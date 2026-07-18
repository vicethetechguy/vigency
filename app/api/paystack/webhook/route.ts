import { NextResponse } from "next/server";
import {
  hasWhatsAppPaymentConfig,
  saveCheckoutLeadToSheet,
  sendWhatsAppPaymentTemplate,
  sendAdminWhatsAppAlert,
  TIERS,
  type TierKey,
  verifyPaystackSignature,
} from "@/lib/checkout";
import {
  claimPaymentReference,
  releasePaymentReference,
} from "@/lib/webhook-dedup";
import { generateSpydaCoupon } from "@/lib/spyda";
import { storePayment } from "@/lib/redis";
import {
  lookupReferrer,
  incrementReferralCount,
  markReferralRewardEarned,
  registerReferralCode,
  generateReferralCode,
} from "@/lib/referrals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaystackChargeEvent = {
  event?: string;
  data?: {
    status?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    customer?: {
      email?: string;
    };
    metadata?: {
      full_name?: string;
      whatsapp?: string;
      whatsapp_consent?: boolean;
      referral_code?: string;
      product?: string;
      tier?: string;
      credit_amount?: number;
    };
  };
};

const validAmounts = new Set<number>(Object.values(TIERS).map((t) => t.amountKobo));

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PaystackChargeEvent;

  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const transaction = payload.data;
  const metadata = transaction?.metadata;

  if (
    transaction?.status !== "success" ||
    !validAmounts.has(transaction.amount!) ||
    transaction.currency !== "NGN" ||
    !metadata?.product?.startsWith("Spyda Credits") ||
    metadata.whatsapp_consent !== true ||
    !transaction.reference ||
    !metadata.full_name ||
    !metadata.whatsapp
  ) {
    return NextResponse.json(
      { error: "Transaction validation failed." },
      { status: 400 },
    );
  }

  const tier = metadata.tier;
  const creditAmount = metadata.credit_amount;

  const claimed = await claimPaymentReference(transaction.reference);
  if (!claimed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  let couponCode = "PENDING";
  try {
    const coupon = await generateSpydaCoupon(creditAmount as 500 | 1000 | 2800);
    couponCode = coupon.code;
  } catch (error) {
    console.error("Spyda coupon generation failed", error);
  }

  try {
    await saveCheckoutLeadToSheet({
      fullName: metadata.full_name,
      email: transaction.customer?.email,
      whatsapp: metadata.whatsapp,
      status: "Paid",
      reference: transaction.reference,
      promoCode: couponCode,
      tier,
      credits: creditAmount,
    });
  } catch (error) {
    console.error("Google Sheets paid save failed", error);
  }

  try {
    await storePayment({
      reference: transaction.reference,
      fullName: metadata.full_name,
      email: transaction.customer?.email || "",
      whatsapp: metadata.whatsapp,
      tier: tier || "unknown",
      credits: creditAmount || 0,
      amountNGN: transaction.amount! / 100,
      couponCode,
      referralCode: metadata.referral_code,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Redis store payment failed", error);
  }

  if (hasWhatsAppPaymentConfig()) {
    try {
      await sendWhatsAppPaymentTemplate({
        fullName: metadata.full_name,
        whatsapp: metadata.whatsapp,
        promoCode: couponCode,
      });
    } catch (error) {
      console.error("WhatsApp payment message failed", error);
    }
  }

  try {
    await sendAdminWhatsAppAlert({
      fullName: metadata.full_name,
      email: transaction.customer?.email || "",
      whatsapp: metadata.whatsapp,
      tier: tier || "unknown",
      credits: creditAmount || 0,
      amountNGN: transaction.amount! / 100,
      couponCode,
    });
  } catch (error) {
    console.error("Admin WhatsApp alert failed", error);
  }

  try {
    if (metadata.referral_code) {
      const referrerWhatsapp = await lookupReferrer(metadata.referral_code);
      if (referrerWhatsapp) {
        const count = await incrementReferralCount(referrerWhatsapp);
        if (count === 10) {
          const bonusCoupon = await generateSpydaCoupon(1000);
          await markReferralRewardEarned(referrerWhatsapp);
          if (hasWhatsAppPaymentConfig()) {
            await sendWhatsAppPaymentTemplate({
              fullName: "Partner",
              whatsapp: referrerWhatsapp,
              promoCode: bonusCoupon.code,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Referral processing failed", error);
  }

  try {
    const newRefCode = generateReferralCode(metadata.whatsapp);
    await registerReferralCode(newRefCode, metadata.whatsapp);
  } catch (error) {
    console.error("Referral code registration failed", error);
  }

  return NextResponse.json({ received: true });
}
