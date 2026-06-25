import crypto from "node:crypto";

export const PRODUCT_AMOUNT_KOBO = 1_000_000;
export const PRODUCT_CURRENCY = "NGN";

export function createPromoCode() {
  return crypto.randomInt(100_000, 1_000_000).toString();
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
