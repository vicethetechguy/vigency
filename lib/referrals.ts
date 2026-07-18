import crypto from 'node:crypto';
import { redisCommand, redisPipeline } from './redis';

export function generateReferralCode(whatsapp: string): string {
  return crypto.createHash('sha256').update(whatsapp).digest('hex').substring(0, 8).toUpperCase();
}

export async function registerReferralCode(code: string, whatsapp: string): Promise<void> {
  await redisCommand(['SET', `referral:${code}`, whatsapp]);
}

export async function lookupReferrer(code: string): Promise<string | null> {
  const result = await redisCommand(['GET', `referral:${code}`]);
  return result ? String(result) : null;
}

export async function incrementReferralCount(referrerWhatsapp: string): Promise<number> {
  const count = await redisCommand(['INCR', `referral:count:${referrerWhatsapp}`]);
  await redisCommand(['ZADD', 'referrals:leaderboard', String(count), referrerWhatsapp]);
  return Number(count);
}

export async function getReferralCount(whatsapp: string): Promise<number> {
  const count = await redisCommand(['GET', `referral:count:${whatsapp}`]);
  return Number(count || 0);
}

export async function getReferralLeaderboard(): Promise<Array<{ whatsapp: string; count: number; earned: boolean }>> {
  const data = await redisCommand(['ZREVRANGE', 'referrals:leaderboard', 0, -1, 'WITHSCORES']);
  if (!data || data.length === 0) return [];
  
  const leaderboard: Array<{ whatsapp: string; count: number; earned: boolean }> = [];
  const pipelineCommands = [];
  for (let i = 0; i < data.length; i += 2) {
    const whatsapp = String(data[i]);
    pipelineCommands.push(['GET', `referral:earned:${whatsapp}`]);
  }
  
  const earnedResults = await redisPipeline(pipelineCommands);
  
  for (let i = 0; i < data.length; i += 2) {
    const whatsapp = String(data[i]);
    const count = Number(data[i+1]);
    const earnedStr = earnedResults[i / 2];
    leaderboard.push({ whatsapp, count, earned: earnedStr === '1' });
  }
  
  return leaderboard;
}

export async function markReferralRewardEarned(whatsapp: string): Promise<void> {
  await redisCommand(['SET', `referral:earned:${whatsapp}`, '1']);
}
