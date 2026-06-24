"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const checkoutUrl =
  process.env.NEXT_PUBLIC_CHECKOUT_URL || "#offer";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-10 w-[150px] overflow-hidden ${className}`}>
      <Image
        src="/assets/vigency-logo.png"
        alt="Vigency"
        fill
        priority
        sizes="150px"
        className="scale-[1.06] object-cover object-center"
      />
    </div>
  );
}

export function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h9M8.5 3.5 13 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-yellow/15 text-[11px] font-black text-yellow">
      ✓
    </span>
  );
}

export function CtaButton({
  children,
  className = "",
  href = checkoutUrl,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F9C80E_0%,#FF6A2A_45%,#E91EAE_100%)] px-6 font-display text-sm font-bold text-white shadow-[0_14px_50px_rgba(233,30,174,.28)] transition-shadow hover:shadow-[0_18px_65px_rgba(233,30,174,.4)] ${className}`}
    >
      {children}
    </motion.a>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto mb-12 max-w-3xl text-center md:mb-16"
          : "mb-10 max-w-2xl text-left"
      }
    >
      <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.24em] text-yellow">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.045em] md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-sm leading-7 text-white/60 md:text-base">
          {description}
        </p>
      )}
    </Reveal>
  );
}
