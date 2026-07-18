"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui";

function normalizeWhatsAppNumber(number: string): string {
  let cleaned = number.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "+234" + cleaned.substring(1);
  }
  return cleaned;
}

async function generateReferralCode(whatsapp: string) {
  const msgBuffer = new TextEncoder().encode(whatsapp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 8).toUpperCase();
}

export default function SuccessPage() {
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      const savedWhatsapp = sessionStorage.getItem("vigency_whatsapp");
      if (savedWhatsapp) {
        const normalized = normalizeWhatsAppNumber(savedWhatsapp);
        const code = await generateReferralCode(normalized);
        setReferralLink(`${window.location.origin}/?ref=${code}`);
      }
    }
    init();
  }, []);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink p-5 text-white">
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/15 blur-[140px]" />
      <div className="relative w-full max-w-lg rounded-[34px] border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-xl md:p-12">
        <Logo className="mx-auto mb-8" />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-yellow text-2xl font-black text-black">✓</div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow">Payment successful</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em]">Payment Successful!</h1>
        <p className="mt-4 text-sm leading-7 text-white/55">Your Spyda coupon code is on the way! Check your email and WhatsApp for your unique SPYDA-XXXX-XXXX code. Redeem it in Spyda to fund your wallet.</p>
        
        {referralLink && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
            <h3 className="font-display text-lg font-bold">Earn Free Credits</h3>
            <p className="mt-2 text-xs leading-5 text-white/50">
              Share your unique link with 10 friends. When they buy credits, you'll instantly receive a <span className="font-bold text-yellow">1,000 credit bonus</span>!
            </p>
            <div className="mt-4 flex items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="truncate pl-4 text-xs text-white/70">{referralLink}</span>
              <button
                onClick={handleCopy}
                className="h-10 shrink-0 border-l border-white/10 bg-white/5 px-4 text-xs font-semibold hover:bg-white/10 transition"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        )}

        <Link
          href="https://chat.whatsapp.com/LGvkyQeNYw2AoOI01K1v65?s=cl&p=a&mlu=1"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-display text-sm font-bold text-black"
        >
          Go to Spyda
        </Link>
      </div>
    </main>
  );
}
