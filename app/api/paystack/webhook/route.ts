import { NextResponse } from "next/server";
import {
  hasWhatsAppPaymentConfig,
  PRODUCT_AMOUNT_KOBO,
  PRODUCT_CURRENCY,
  saveCheckoutLeadToSheet,
  sendWhatsAppPaymentTemplate,
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
      promo_code?: string;
      product?: string;
    };
  };
};

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
    transaction.amount !== PRODUCT_AMOUNT_KOBO ||
    transaction.currency !== PRODUCT_CURRENCY ||
    metadata?.product !== "Vigency AI Prompt System" ||
    metadata.whatsapp_consent !== true ||
    !transaction.reference ||
    !metadata.full_name ||
    !metadata.whatsapp ||
    !metadata.promo_code
  ) {
    return NextResponse.json(
      { error: "Transaction validation failed." },
      { status: 400 },
    );
  }

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
      promoCode: metadata.promo_code,
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
        promoCode: metadata.promo_code,
      });
    } catch (error) {
      console.error("WhatsApp payment message failed", error);
    }
  }

  return NextResponse.json({ received: true });
}
