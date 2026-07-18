"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo, ArrowIcon } from "@/components/ui";

export default function RewardsPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ count: number; target: number; reward: number; earned: boolean } | null>(null);

  const checkStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 8) {
      setError("Please enter a valid 8-character referral code.");
      return;
    }

    setLoading(true);
    setError("");
    setStats(null);

    try {
      const res = await fetch(`/api/referrals/stats?code=${code.toUpperCase()}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch stats");
      
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-ink text-white overflow-hidden flex flex-col items-center justify-center p-5">
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/15 blur-[140px] pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 hover:opacity-80 transition">
        <Logo className="w-32" />
      </Link>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-3">Rewards <span className="gradient-text">Tracker</span></h1>
          <p className="text-sm text-white/50">Enter your referral code to see your progress toward your 1,000 Spyda credits bonus.</p>
        </div>

        <div className="gradient-border relative rounded-[24px] p-6 shadow-[0_35px_100px_rgba(233,30,174,.15)] backdrop-blur-xl bg-black/40">
          <form onSubmit={checkStats} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 mb-2">
                Your Referral Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  maxLength={8}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-bold tracking-[0.2em] text-white outline-none transition placeholder:text-white/20 placeholder:font-medium placeholder:tracking-normal focus:border-yellow/50 focus:bg-white/[0.065]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-orange bg-orange/10 border border-orange/20 rounded-xl p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 8}
              className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-6 font-display text-sm font-bold text-black transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Check Progress"} <ArrowIcon />
            </button>
          </form>

          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Referrals</p>
                      <p className="font-display text-3xl font-bold">{stats.count} <span className="text-lg text-white/30">/ {stats.target}</span></p>
                    </div>
                    {stats.earned && (
                      <div className="px-3 py-1 bg-yellow/10 border border-yellow/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-yellow">
                        Reward Earned
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stats.count / stats.target) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[linear-gradient(90deg,#F9C80E_0%,#FF6A2A_50%,#E91EAE_100%)]"
                    />
                  </div>
                  
                  <p className="text-xs text-white/50 text-center">
                    {stats.earned 
                      ? "Congratulations! Your 1,000 credit bonus has been sent to your WhatsApp." 
                      : `${stats.target - stats.count} more to unlock 1,000 Spyda credits.`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
