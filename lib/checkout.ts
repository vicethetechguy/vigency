import crypto from "node:crypto";

export const TIERS = {
  starter: { amountKobo: 700_000, credits: 500, label: "Starter", priceNGN: "₦7,000", priceUSD: "$5" },
  creator: { amountKobo: 1_300_000, credits: 1_000, label: "Creator", priceNGN: "₦13,000", priceUSD: "$10" },
  studio:  { amountKobo: 2_500_000, credits: 2_800, label: "Studio", priceNGN: "₦25,000", priceUSD: "$25" },
} as const;

export type TierKey = keyof typeof TIERS;

const VALID_TIER_KEYS = new Set<string>(Object.keys(TIERS));

export function isValidTier(tier: string): tier is TierKey {
  return VALID_TIER_KEYS.has(tier);
}

export async function sendAdminWhatsAppAlert({
  fullName, email, whatsapp, tier, credits, amountNGN, couponCode
}: {
  fullName: string; email: string; whatsapp: string;
  tier: string; credits: number; amountNGN: number; couponCode: string;
}): Promise<void> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v23.0';
  
  if (!token || !phoneNumberId || !adminNumber) return;
  
  const message = [
    '💰 New Spyda Payment!',
    '━━━━━━━━━━━━━━━',
    `👤 ${fullName}`,
    `📧 ${email}`,
    `📱 ${whatsapp}`,
    `🎯 Tier: ${tier} (${credits.toLocaleString()} credits)`,
    `💵 ₦${amountNGN.toLocaleString()}`,
    `🎟️ Code: ${couponCode}`,
    '━━━━━━━━━━━━━━━',
  ].join('\n');
  
  await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: adminNumber,
      type: 'text',
      text: { body: message },
    }),
  });
}

export function normalizeWhatsAppNumber(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
  }

  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Enter a valid WhatsApp number with its country code.");
  }

  return digits;
}

export function verifyPaystackSignature(rawBody: string, signature: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function saveCheckoutLeadToSheet({
  fullName,
  email,
  whatsapp,
  status,
  reference,
  promoCode,
  amount = "10000",
  tier,
  credits,
}: {
  fullName: string;
  email?: string;
  whatsapp: string;
  status: "Started Checkout" | "Paid";
  reference?: string;
  promoCode: string;
  amount?: string;
  tier?: string;
  credits?: number;
}) {
  const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  if (!sheetsUrl) return;

  const response = await fetch(sheetsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName,
      email: email || "",
      whatsapp,
      status,
      reference: reference || "",
      promoCode,
      amount,
      tier: tier || "",
      credits: credits ?? "",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Sheets save failed: ${response.status} ${error}`);
  }
}

export function hasWhatsAppPaymentConfig() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

export async function sendWhatsAppPaymentTemplate({
  fullName,
  whatsapp,
  promoCode,
}: {
  fullName: string;
  whatsapp: string;
  promoCode: string;
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName =
    process.env.WHATSAPP_TEMPLATE_NAME || "vigency_payment_success";
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";

  if (!token || !phoneNumberId) {
    throw new Error("WhatsApp Cloud API credentials are not configured.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: whatsapp,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: fullName },
                { type: "text", text: promoCode },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${error}`);
  }

  return response.json();
}
