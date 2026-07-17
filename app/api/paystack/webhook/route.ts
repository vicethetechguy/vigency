import { NextResponse } from "next/server";
import {
  hasWhatsAppPaymentConfig,
  saveCheckoutLeadToSheet,
  sendWhatsAppPaymentTemplate,
  TIERS,
  type TierKey,
  verifyPaystackSignature,
} from "@/lib/checkout";
import {
  claimPaymentReference,
  releasePaymentReference,
} from "@/lib/webhook-dedup";

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
      coupon_code?: string;
      product?: string;
      tier?: string;
      credit_amount?: number;
    };
  };
};

const validAmounts = new Set<number>(Object.values(TIERS).map(t => t.amountKobo));

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
    !metadata.whatsapp ||
    !metadata.coupon_code
  ) {
    return NextResponse.json(
      { error: "Transaction validation failed." },
      { status: 400 },
    );
  }

  const couponCode = metadata.coupon_code;
  const tier = metadata.tier;
  const creditAmount = metadata.credit_amount;

  const claimed = await claimPaymentReference(transaction.reference);
  if (!claimed) {
    return NextResponse.json({ received: true, duplicate: true });
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
    await releasePaymentReference(transaction.reference);
    console.error("Google Sheets paid save failed", error);
    return NextResponse.json(
      { error: "Payment record save failed." },
      { status: 500 },
    );
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

  return NextResponse.json({ received: true });
}
