import crypto from 'node:crypto';

export type PaymentRecord = {
  reference: string;
  fullName: string;
  email: string;
  whatsapp: string;
  tier: string;
  credits: number;
  amountNGN: number;
  couponCode: string;
  referralCode?: string;
  referredBy?: string;
  timestamp: number;
}

export async function redisCommand(command: unknown[]): Promise<any> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new Error('Redis credentials missing');
  }

  const response = await fetch(redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status}`);
  }

  const data = await response.json() as { result?: any };
  return data.result;
}

export async function redisPipeline(commands: unknown[][]): Promise<any[]> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new Error('Redis credentials missing');
  }

  const pipelineUrl = redisUrl.endsWith('/') ? `${redisUrl}pipeline` : `${redisUrl}/pipeline`;
  
  const response = await fetch(pipelineUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Redis pipeline failed: ${response.status}`);
  }

  const data = await response.json() as { result: any; error?: string }[];
  return data.map(d => d.result);
}

export async function storePayment(payment: PaymentRecord): Promise<void> {
  const hashKey = `payment:${payment.reference}`;
  
  const hsetCommand = ['HSET', hashKey];
  for (const [k, v] of Object.entries(payment)) {
    if (v !== undefined && v !== null) {
      hsetCommand.push(k, String(v));
    }
  }

  const commands = [
    hsetCommand,
    ['ZADD', 'payments:all', String(payment.timestamp), payment.reference],
    ['INCRBYFLOAT', 'stats:total_revenue', String(payment.amountNGN)],
    ['INCR', 'stats:total_payments'],
    ['INCR', `stats:tier:${payment.tier}`],
    ['INCRBY', 'stats:total_credits', String(payment.credits)]
  ];

  await redisPipeline(commands);
}

export async function getRecentPayments(limit: number = 50): Promise<PaymentRecord[]> {
  const references = await redisCommand(['ZREVRANGE', 'payments:all', 0, limit - 1]) as string[];
  if (!references || references.length === 0) return [];

  const pipelineCommands = references.map(ref => ['HGETALL', `payment:${ref}`]);
  const results = await redisPipeline(pipelineCommands);

  return results.map(res => {
    const record: any = {};
    for (let i = 0; i < res.length; i += 2) {
      record[res[i]] = res[i + 1];
    }
    
    return {
      reference: record.reference || '',
      fullName: record.fullName || '',
      email: record.email || '',
      whatsapp: record.whatsapp || '',
      tier: record.tier || '',
      credits: Number(record.credits || 0),
      amountNGN: Number(record.amountNGN || 0),
      couponCode: record.couponCode || '',
      referralCode: record.referralCode,
      referredBy: record.referredBy,
      timestamp: Number(record.timestamp || 0),
    } as PaymentRecord;
  });
}

export async function getStats(): Promise<{ totalRevenue: number; totalPayments: number; totalCredits: number; tierBreakdown: Record<string, number> }> {
  const [revenueStr, paymentsStr, creditsStr] = await redisPipeline([
    ['GET', 'stats:total_revenue'],
    ['GET', 'stats:total_payments'],
    ['GET', 'stats:total_credits']
  ]);

  let cursor = 0;
  const tierKeys: string[] = [];
  do {
    const res = await redisCommand(['SCAN', cursor, 'MATCH', 'stats:tier:*', 'COUNT', 100]);
    cursor = Number(res[0]);
    tierKeys.push(...res[1]);
  } while (cursor !== 0);

  const tierBreakdown: Record<string, number> = {};
  if (tierKeys.length > 0) {
    const tierVals = await redisPipeline(tierKeys.map(k => ['GET', k]));
    tierKeys.forEach((key, idx) => {
      const tierName = key.replace('stats:tier:', '');
      tierBreakdown[tierName] = Number(tierVals[idx] || 0);
    });
  }

  return {
    totalRevenue: Number(revenueStr || 0),
    totalPayments: Number(paymentsStr || 0),
    totalCredits: Number(creditsStr || 0),
    tierBreakdown
  };
}
