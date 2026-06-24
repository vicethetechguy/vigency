import Link from "next/link";
import { Logo } from "@/components/ui";

export default function SuccessPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink p-5 text-white">
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/15 blur-[140px]" />
      <div className="relative w-full max-w-lg rounded-[34px] border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-xl md:p-12">
        <Logo className="mx-auto mb-8" />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-yellow text-2xl font-black text-black">✓</div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow">Payment successful</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em]">You’re in.</h1>
        <p className="mt-4 text-sm leading-7 text-white/55">Your access instructions are on the way. Check the email you used at checkout.</p>
        <Link href="/" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-display text-sm font-bold text-black">Back to Vigency</Link>
      </div>
    </main>
  );
}
