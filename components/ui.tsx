"use client";

import Image from "next/image";
import { MotionConfig, motion } from "framer-motion";
import type { ReactNode } from "react";

export const checkoutUrl =
  process.env.NEXT_PUBLIC_CHECKOUT_URL || "#pricing";

/** Respects the visitor's reduced-motion setting for every framer-motion animation. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

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
    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
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
      whileTap={{ scale: 0.97 }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-white/90 ${className}`}
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
      initial={{ opacity: 0, y: 16 }}
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
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-6xl">
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
