"use client";

import { motion } from "framer-motion";

type Theme = "yellow" | "purple" | "pink" | "blue" | "orange" | "green";

const themes: Record<Theme, { bg: string; accent: string; ink: string }> = {
  yellow: { bg: "#F9C80E", accent: "#FF6A2A", ink: "#080808" },
  purple: { bg: "#25104A", accent: "#B05CFF", ink: "#FFFFFF" },
  pink: { bg: "#E91EAE", accent: "#F9C80E", ink: "#FFFFFF" },
  blue: { bg: "#174DFF", accent: "#B8FF35", ink: "#FFFFFF" },
  orange: { bg: "#FF6A2A", accent: "#F9C80E", ink: "#0A0A0A" },
  green: { bg: "#CBFF4A", accent: "#174DFF", ink: "#090909" },
};

export function DesignCard({
  title,
  kicker,
  theme = "yellow",
  className = "",
  compact = false,
}: {
  title: string;
  kicker: string;
  theme?: Theme;
  className?: string;
  compact?: boolean;
}) {
  const colors = themes[theme];
  return (
    <motion.div
      whileHover={{ y: -8, rotate: 0 }}
      className={`relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 p-5 shadow-2xl ${className}`}
      style={{ background: colors.bg, color: colors.ink }}
    >
      <div
        className="absolute -right-16 top-1/4 h-48 w-48 rounded-full blur-[2px]"
        style={{ background: colors.accent, opacity: 0.9 }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 rounded-t-[50%] bg-black/85" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.18em]">
          <span>Vigency Studio</span>
          <span>AI / 001</span>
        </div>
        <div className="mt-auto pb-[38%]">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em]">
            {kicker}
          </p>
          <h3
            className={`font-display font-extrabold uppercase leading-[0.84] tracking-[-0.08em] ${
              compact ? "text-[27px]" : "text-[34px]"
            }`}
          >
            {title}
          </h3>
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
          <div>
            <p className="font-display text-[11px] font-bold">Built in minutes.</p>
            <p className="mt-1 text-[7px] text-white/55">Prompt → reference → output</p>
          </div>
          <div
            className="grid h-8 w-8 place-items-center rounded-full text-sm font-black text-black"
            style={{ background: colors.accent }}
          >
            ↗
          </div>
        </div>
      </div>
    </motion.div>
  );
}
