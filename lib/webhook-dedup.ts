const processedReferences = new Map<string, number>();

function getReferenceKey(reference: string) {
  return `vigency:paystack:${reference}:whatsapp`;
}

export async function claimPaymentReference(reference: string) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = getReferenceKey(reference);

  if (redisUrl && redisToken) {
    const response = await fetch(redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "SET",
        key,
        "1",
        "NX",
        "EX",
        60 * 60 * 24 * 30,
      ]),
    });

    if (!response.ok) {
      throw new Error(`Could not claim webhook reference: ${response.status}`);
    }

    const data = (await response.json()) as { result?: string | null };
    return data.result === "OK";
  }

  // Development fallback. Configure Upstash Redis in production so Paystack
  // webhook retries cannot send the same WhatsApp message more than once.
  const now = Date.now();
  for (const [savedReference, savedAt] of processedReferences) {
    if (now - savedAt > 30 * 24 * 60 * 60 * 1000) {
      processedReferences.delete(savedReference);
    }
  }

  if (processedReferences.has(reference)) return false;
  processedReferences.set(reference, now);
  return true;
}

export async function releasePaymentReference(reference: string) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    await fetch(redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["DEL", getReferenceKey(reference)]),
    });
    return;
  }

  processedReferences.delete(reference);
}
