"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowIcon,
  CheckIcon,
  CtaButton,
  Logo,
  Reveal,
  SectionIntro,
} from "./ui";

/* ------------------------------------------------------------------ */
/*  Tier data (mirrors lib/checkout.ts — client-safe display values)  */
/* ------------------------------------------------------------------ */

type Tier = {
  key: string;
  label: string;
  credits: number;
  priceNGN: string;
  priceUSD: string;
  amountNGN: number;
  badge?: string;
  popular?: boolean;
};

const tiers: Tier[] = [
  { key: "starter", label: "Starter", credits: 500, priceNGN: "₦7,000", priceUSD: "$5", amountNGN: 7_000 },
  { key: "creator", label: "Creator", credits: 1_000, priceNGN: "₦13,000", priceUSD: "$10", amountNGN: 13_000, popular: true },
  { key: "studio", label: "Studio", credits: 2_800, priceNGN: "₦25,000", priceUSD: "$25", amountNGN: 25_000, badge: "+300 bonus" },
];

/* ------------------------------------------------------------------ */
/*  Static content arrays                                              */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    number: "01",
    numberColor: "#F9C80E",
    title: "Instant Coupon Codes",
    description: "Pay and receive a unique SPYDA-XXXX-XXXX code in seconds — delivered to your email and WhatsApp.",
    icon: "⚡",
  },
  {
    number: "02",
    numberColor: "#E91EAE",
    title: "Three Credit Tiers",
    description: "Starter (500), Creator (1,000), or Studio (2,800 with a bonus) — pick the level that fits your workflow.",
    icon: "◆",
  },
  {
    number: "03",
    numberColor: "#FF6A2A",
    title: "Single-Use & Secure",
    description: "Each code redeems once, locked atomically. No double-spend, no sharing — guaranteed one use.",
    icon: "🔒",
  },
  {
    number: "04",
    numberColor: "#B05CFF",
    title: "Earn SPYDA Tokens",
    description: "For every 1,000 credits you actually spend on generations, earn 1 SPYDA pre-launch token. Use more, earn more.",
    icon: "✦",
  },
];

const examples = [
  { title: "Bago2x Data", kicker: "Digital subscription campaign", image: "/assets/showcase-data.png" },
  { title: "Eatly", kicker: "Food app campaign", image: "/assets/showcase-eatly.png" },
  { title: "Tales of Taste", kicker: "Restaurant promotion", image: "/assets/showcase-taste.png" },
  { title: "Gexipay", kicker: "Fintech campaign", image: "/assets/showcase-gexipay.png" },
  { title: "FluxyPrime", kicker: "Logistics promotion", image: "/assets/showcase-fluxy.png" },
  { title: "Melt Verse", kicker: "Product advertisement", image: "/assets/showcase-meltverse.png" },
  { title: "Charis Cedarine", kicker: "Event hospitality", image: "/assets/showcase-charis.png" },
];

const faqs = [
  {
    q: "What are Spyda Credits?",
    a: "Spyda Credits are the internal currency used inside Spyda. You spend credits to power AI generations — 20 credits per round on managed AI, or 5 credits if you bring your own API key.",
  },
  {
    q: "How do coupon codes work?",
    a: "After a successful payment, you receive a unique single-use code in the format SPYDA-XXXX-XXXX. Enter the code on Spyda's funding page to add the credits to your wallet instantly.",
  },
  {
    q: "What are the credit tiers?",
    a: "Three denominations: Starter (500 credits for ₦7,000 / $5), Creator (1,000 credits for ₦13,000 / $10), and Studio (2,800 credits for ₦25,000 / $25). The Studio tier includes a 300-credit bonus.",
  },
  {
    q: "What are SPYDA Tokens?",
    a: "For every 1,000 credits you actually spend on generations (not merely funded), your account earns 1 SPYDA pre-launch token. Funding alone earns nothing — only consumption does.",
  },
  {
    q: "Can a coupon code be used more than once?",
    a: "No. Each code is single-use. The system validates and burns it atomically — even two simultaneous redemption attempts will not work. Once redeemed, the code is dead forever.",
  },
  {
    q: "How do I redeem my code?",
    a: "Go to Spyda's funding page, enter your SPYDA-XXXX-XXXX code, and the credits will be added to your wallet balance immediately.",
  },
];

function ArtworkCard({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`group relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-[#111] shadow-2xl ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 76vw, 340px"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.08]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

function Navigation() {
  return (
    <div className="fixed inset-x-0 top-0 z-40 pt-3">
      <nav className="container-shell glass flex h-16 items-center justify-between rounded-2xl px-3.5 md:h-[70px] md:rounded-[22px] md:px-5">
        <a href="#top" aria-label="Vigency home">
          <Logo className="md:w-[172px]" />
        </a>
        <div className="hidden items-center gap-7 text-xs font-semibold text-white/55 lg:flex">
          <a className="transition-colors hover:text-white" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-white" href="#examples">Samples</a>
          <a className="transition-colors hover:text-white" href="#pricing">Pricing</a>
          <a className="transition-colors hover:text-white" href="#faq">FAQ</a>
        </div>
        <CtaButton className="min-h-10 px-4 text-xs md:min-h-11 md:px-5" href="#pricing">
          Buy Credits <ArrowIcon />
        </CtaButton>
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroGradientPosition = useTransform(
    heroScroll,
    [0, 0.72],
    ["68%", "32%"],
  );
  const travelingGlowY = useTransform(
    heroScroll,
    [0, 0.5, 1],
    ["4%", "48%", "92%"],
  );

  const headingLines = ["FUND YOUR", "SPYDA", "WALLET"];

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative min-h-screen overflow-hidden pb-20 pt-32 md:pt-40"
    >
      <div className="absolute left-[-12%] top-24 -z-10 h-[440px] w-[440px] rounded-full bg-purple/15 blur-[130px]" />
      <div className="absolute right-[-8%] top-40 -z-10 h-[520px] w-[520px] rounded-full bg-pink/15 blur-[150px]" />
      <div className="container-shell">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-yellow/20 bg-yellow/[0.07] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow" />
            </span>
            Spyda Credits
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group font-display text-[clamp(3.25rem,10.5vw,8.4rem)] font-extrabold leading-[0.87] tracking-[-0.075em]"
          >
            <span className="relative block">
              <span className="relative z-10 block text-white/90">
                {headingLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
              <motion.span
                aria-hidden="true"
                style={{ backgroundPositionY: heroGradientPosition }}
                className="pointer-events-none absolute inset-0 z-20 block bg-[linear-gradient(to_bottom,transparent_0%,transparent_29%,#F9C80E_40%,#FF6A2A_50%,#E91EAE_60%,transparent_71%,transparent_100%)] bg-[length:100%_300%] bg-clip-text text-transparent"
              >
                {headingLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </motion.span>
              <span
                aria-hidden="true"
                className="hero-heading-hover pointer-events-none absolute inset-0 z-30 block bg-[linear-gradient(110deg,#F9C80E_0%,#FF6A2A_25%,#E91EAE_50%,#B05CFF_72%,#F9C80E_100%)] bg-[length:250%_100%] bg-clip-text text-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                {headingLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </span>
          </motion.h1>
          <motion.div
            aria-hidden="true"
            style={{ top: travelingGlowY }}
            className="pointer-events-none absolute left-1/2 -z-10 h-32 w-[72%] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,rgba(249,200,14,.28),rgba(233,30,174,.25))] blur-[75px]"
          />
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/60 md:text-lg md:leading-8"
          >
            Buy Spyda Credits instantly. Get a single-use coupon code.
            Redeem it in Spyda to power your AI-driven design generations.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.26 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <CtaButton className="w-full px-7 sm:w-auto" href="#pricing">
              Buy Credits <span className="opacity-70">→</span> from ₦7,000
            </CtaButton>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="https://chat.whatsapp.com/FE1MVRwyBZf2zyQucuEkf1"
              target="_blank"
              rel="noopener noreferrer"
              className="glass inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 font-display text-sm font-bold sm:w-auto"
            >
              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/assets/zero-club-icon.png"
                  alt=""
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </span>
              Join our Zero Club
            </motion.a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs"
          >
            {tiers.map((tier) => (
              <span key={tier.key} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-semibold text-white/50">
                {tier.label}: <span className="text-white">{tier.credits.toLocaleString()}</span> credits
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-[1060px] md:mt-20"
        >
          <div className="absolute inset-x-[12%] -top-10 -z-10 h-48 rounded-full bg-[linear-gradient(90deg,#F9C80E,#E91EAE)] opacity-20 blur-[80px]" />
          <div className="display-card overflow-hidden rounded-[30px] border border-white/10 bg-[#0c0c0c] p-2 md:rounded-[40px] md:p-3">
            <div className="relative aspect-[1/1.04] overflow-hidden rounded-[24px] bg-black md:aspect-[16/8.6] md:rounded-[32px]">
              <Image
                src="/assets/design-collage.png"
                alt="Examples of graphic designs created with Spyda AI"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1060px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between md:inset-x-7 md:bottom-7">
                <div className="rounded-2xl border border-white/10 bg-black/65 p-3 backdrop-blur-md md:p-4">
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Powered by Spyda
                  </p>
                  <p className="mt-1 font-display text-sm font-bold md:text-base">
                    Credits in. Designs out.
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/65 px-4 py-2 text-[10px] font-bold backdrop-blur-md sm:flex">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Ready to create
                </div>
              </div>
            </div>
          </div>
          {["500 Credits", "1,000 Credits", "2,800 Credits", "SPYDA Tokens"].map(
            (label, index) => (
              <motion.div
                key={label}
                animate={{ y: [0, index % 2 ? -7 : 7, 0] }}
                transition={{ duration: 4 + index, repeat: Infinity, ease: "easeInOut" }}
                className={`glass absolute hidden rounded-full px-4 py-2 text-[10px] font-bold shadow-xl md:block ${
                  index === 0
                    ? "-left-5 top-[18%]"
                    : index === 1
                      ? "-right-8 top-[25%]"
                      : index === 2
                        ? "bottom-[18%] -left-9"
                        : "-right-5 bottom-[14%]"
                }`}
              >
                <span className="mr-2 text-yellow">✦</span>
                {label}
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Inside (Benefits)                                                  */
/* ------------------------------------------------------------------ */

function Inside() {
  return (
    <section id="inside" className="section-pad relative">
      <div className="container-shell">
        <SectionIntro
          eyebrow="Why Spyda Credits"
          title={<>Everything you <span className="gradient-text">need.</span></>}
          description="A simple, secure system to fund your Spyda wallet and power unlimited AI design generations."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {benefits.map((item, index) => (
            <Reveal key={item.number} delay={index * 0.07}>
              <motion.article
                whileHover={{ y: -7 }}
                className="group relative min-h-[250px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.035] p-6 transition-colors hover:bg-white/[0.055] md:p-8"
              >
                <div
                  className="absolute right-5 top-2 font-display text-[86px] font-black opacity-[0.16]"
                  style={{ color: item.numberColor }}
                >
                  {item.number}
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] font-display text-xl font-bold text-yellow transition-transform group-hover:rotate-6 group-hover:scale-110">
                  {item.icon}
                </div>
                <p
                  className="mt-12 text-[10px] font-bold tracking-[0.2em]"
                  style={{ color: item.numberColor }}
                >
                  {item.number}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">
                  {item.description}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Transformation (video)                                             */
/* ------------------------------------------------------------------ */

function Transformation() {
  return (
    <section id="transformation" className="section-pad relative">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/10 blur-[160px]" />
      <div className="container-shell">
        <SectionIntro
          eyebrow="See Spyda in action"
          title={<>From credits <span className="text-white/25">→</span> final design.</>}
          description="Watch how Spyda turns your credits into polished, campaign-ready visuals in minutes."
        />
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="display-card overflow-hidden rounded-xl bg-gradient-to-br from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] p-[1.5px] shadow-[0_30px_100px_rgba(0,0,0,.35)]"
          >
            <div className="overflow-hidden rounded-[10.5px] bg-black">
              <video
                src="/assets/spyda-website-video-final.mp4"
                className="aspect-video w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Examples (Carousel)                                                */
/* ------------------------------------------------------------------ */

function Examples() {
  const [active, setActive] = useState<(typeof examples)[number] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const categories = ["Business", "Crypto", "Events", "Agency", "Real Estate", "Tech", "Fashion"];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % examples.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = carousel.querySelectorAll<HTMLElement>("[data-showcase-card]");
    const card = cards[activeIndex];
    if (!card) return;
    carousel.scrollTo({
      left: Math.max(0, card.offsetLeft - Math.max(12, (window.innerWidth - card.offsetWidth) / 2)),
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <section id="examples" className="section-pad overflow-hidden">
      <div className="container-shell">
        <SectionIntro
          eyebrow="Designed for range"
          title={<>What you can <span className="gradient-text">create.</span></>}
          description="One framework. Entirely different worlds. Swipe through a few directions."
        />
        <div className="hide-scrollbar mb-7 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category, i) => (
            <button
              key={category}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-bold ${
                i === 0 ? "border-yellow bg-yellow text-black" : "border-white/10 bg-white/[0.03] text-white/45"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={carouselRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(12px,calc((100vw-1180px)/2))] pb-8"
      >
        {examples.map((example, i) => (
          <motion.button
            key={example.title}
            data-showcase-card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveIndex(i);
              setActive(example);
            }}
            className="w-[76vw] max-w-[320px] shrink-0 snap-center text-left"
          >
            <ArtworkCard src={example.image} alt={`${example.title} graphic design example`} />
            <div className="mt-4 flex items-center justify-between px-1">
              <div>
                <p className="font-display text-sm font-bold">{example.kicker}</p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-white/35">Tap to expand</p>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-xs">↗</span>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-1 flex justify-center gap-1.5">
        {examples.map((example, i) => (
          <button
            key={example.title}
            onClick={() => setActiveIndex(i)}
            aria-label={`Show ${example.title}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === activeIndex ? "w-7 bg-yellow" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px]"
            >
              <button
                onClick={() => setActive(null)}
                className="mb-3 ml-auto grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"
                aria-label="Close example"
              >
                ×
              </button>
              <ArtworkCard
                src={active.image}
                alt={`${active.title} graphic design example`}
                className="max-h-[78vh] w-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works (replaces Story)                                      */
/* ------------------------------------------------------------------ */

const howItWorksSteps = [
  {
    step: "01",
    color: "#F9C80E",
    title: "Pick your tier & pay",
    description: "Choose Starter, Creator, or Studio. Pay securely via Paystack in Naira or USD.",
    icon: "💳",
  },
  {
    step: "02",
    color: "#FF6A2A",
    title: "Get your coupon code",
    description: "A unique SPYDA-XXXX-XXXX code is generated instantly and delivered to your email and WhatsApp.",
    icon: "🎟️",
  },
  {
    step: "03",
    color: "#E91EAE",
    title: "Redeem in Spyda",
    description: "Enter the code on Spyda's funding page. Credits land in your wallet in seconds.",
    icon: "🔓",
  },
  {
    step: "04",
    color: "#B05CFF",
    title: "Create & earn",
    description: "Spend credits on AI generations. For every 1,000 credits spent, earn 1 SPYDA pre-launch token.",
    icon: "✨",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad relative">
      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/10 blur-[160px]" />
      <div className="container-shell">
        <SectionIntro
          eyebrow="Simple 4-step flow"
          title={<>How Spyda <span className="gradient-text">works.</span></>}
          description="From payment to your first generation in under two minutes."
        />
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 md:grid-cols-2">
            {howItWorksSteps.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-6 transition-colors hover:bg-white/[0.055] md:p-8"
                >
                  {/* Step number watermark */}
                  <div
                    className="absolute -right-2 -top-3 font-display text-[100px] font-black leading-none opacity-[0.07]"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </div>

                  {/* Connector line (except last) */}
                  {index < howItWorksSteps.length - 1 && (
                    <div
                      className="absolute -bottom-4 left-1/2 hidden h-8 w-px md:block"
                      style={{ background: `linear-gradient(to bottom, ${item.color}40, transparent)` }}
                    />
                  )}

                  <div className="relative">
                    <div
                      className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border text-2xl transition-transform group-hover:scale-110"
                      style={{ borderColor: `${item.color}30`, background: `${item.color}10` }}
                    >
                      {item.icon}
                    </div>
                    <p
                      className="text-[10px] font-bold tracking-[0.2em]"
                      style={{ color: item.color }}
                    >
                      STEP {item.step}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.03em] md:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/50">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Credit usage info bar */}
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-col items-center gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-6 text-center sm:flex-row sm:text-left md:p-8">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow/10 text-xl">
                ⚡
              </div>
              <div>
                <p className="font-display text-base font-bold">Credit Usage</p>
                <p className="mt-1 text-sm leading-6 text-white/50">
                  Each generation costs <span className="font-semibold text-white">20 credits</span> on managed AI, or just{" "}
                  <span className="font-semibold text-white">5 credits</span> if you bring your own API key.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Access Form Modal (with tier selection)                            */
/* ------------------------------------------------------------------ */

function AccessFormModal({
  open,
  close,
  selectedTier,
}: {
  open: boolean;
  close: () => void;
  selectedTier: Tier;
}) {
  const [checkoutError, setCheckoutError] = useState("");
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError("");
    setIsStartingCheckout(true);

    const formData = new FormData(event.currentTarget);
    const customer = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      whatsapp: String(formData.get("whatsapp") || ""),
      whatsappConsent: formData.get("whatsappConsent") === "on",
      tier: selectedTier.key,
    };

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      const result = (await response.json()) as {
        authorizationUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result.error || "Could not start secure checkout.");
      }

      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Could not start secure checkout.",
      );
      setIsStartingCheckout(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[85] grid place-items-center overflow-y-auto bg-black/85 p-4 backdrop-blur-xl"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-form-title"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="gradient-border relative my-auto w-full max-w-lg overflow-hidden rounded-[32px] p-6 shadow-[0_35px_130px_rgba(233,30,174,.24)] md:p-9"
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-pink/20 blur-[80px]" />
            <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-yellow/10 blur-[80px]" />
            <button
              type="button"
              onClick={close}
              aria-label="Close access form"
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-xl text-white/50 transition-colors hover:text-white"
            >
              ×
            </button>

            <div className="relative">
              <div className="mb-6 flex h-12 w-[138px] items-center overflow-hidden rounded-2xl border border-white/10 bg-black/35 px-2">
                <Logo className="h-9 w-[120px]" />
              </div>

              {/* Selected tier badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow/20 bg-yellow/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow">
                {selectedTier.label} — {selectedTier.credits.toLocaleString()} credits
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-yellow">
                Secure checkout
              </p>
              <h3
                id="access-form-title"
                className="mt-3 max-w-sm font-display text-3xl font-bold leading-[1.05] tracking-[-0.045em] md:text-4xl"
              >
                Fund your Spyda wallet.
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Enter your details below to continue to the secure {selectedTier.priceNGN} checkout and receive your coupon code.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Full Name
                  </span>
                  <input
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Enter your full name"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-yellow/50 focus:bg-white/[0.065] focus:ring-4 focus:ring-yellow/[0.06]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Email Address
                  </span>
                  <input
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-yellow/50 focus:bg-white/[0.065] focus:ring-4 focus:ring-yellow/[0.06]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    WhatsApp Number
                  </span>
                  <input
                    name="whatsapp"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    pattern="[+0-9 ()-]{7,20}"
                    placeholder="+234 800 000 0000"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-sm font-medium text-white outline-none transition placeholder:text-white/25 focus:border-yellow/50 focus:bg-white/[0.065] focus:ring-4 focus:ring-yellow/[0.06]"
                  />
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <input
                    name="whatsappConsent"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-yellow"
                  />
                  <span className="text-[10px] leading-5 text-white/45">
                    I agree to receive my Spyda coupon code, purchase confirmation,
                    and relevant Vigency or Zero Club offers on WhatsApp. I can
                    opt out later.
                  </span>
                </label>

                {checkoutError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="rounded-xl border border-orange/20 bg-orange/10 px-4 py-3 text-xs leading-5 text-orange"
                  >
                    {checkoutError}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={isStartingCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F9C80E_0%,#FF6A2A_45%,#E91EAE_100%)] px-6 font-display text-base font-bold shadow-[0_15px_50px_rgba(233,30,174,.28)] disabled:cursor-wait disabled:opacity-60"
                >
                  {isStartingCheckout ? "Opening Paystack…" : `Pay ${selectedTier.priceNGN}`}{" "}
                  {!isStartingCheckout && <ArrowIcon />}
                </motion.button>

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">
                  <span>◉ Secure payment</span>
                  <span>⚡ Instant coupon code</span>
                  <span>✓ Single-use guarantee</span>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Offer / Pricing (3-tier grid)                                      */
/* ------------------------------------------------------------------ */

function Offer() {
  const [accessFormOpen, setAccessFormOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier>(tiers[1]); // default to Creator

  const openCheckout = (tier: Tier) => {
    setSelectedTier(tier);
    setAccessFormOpen(true);
  };

  return (
    <>
      <section id="pricing" className="section-pad relative">
        <div className="container-shell">
          <SectionIntro
            eyebrow="Pick your tier"
            title={<>Get your <span className="gradient-text">Spyda Credits.</span></>}
            description="Three tiers. Pick what fits your workflow. Pay once, get your coupon code instantly."
          />
          <Reveal>
            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
              {tiers.map((tier) => {
                const isPopular = tier.popular;
                return (
                  <motion.div
                    key={tier.key}
                    whileHover={{ y: -8 }}
                    className={`relative overflow-hidden rounded-[30px] border p-6 md:p-8 ${
                      isPopular
                        ? "border-yellow/40 bg-white/[0.06] shadow-[0_30px_100px_rgba(249,200,14,.12)]"
                        : "border-white/[0.08] bg-white/[0.035]"
                    }`}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute right-4 top-4 rounded-full bg-yellow px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                        Most popular
                      </div>
                    )}

                    {/* Bonus badge */}
                    {tier.badge && (
                      <div className="absolute right-4 top-4 rounded-full bg-pink/20 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-pink">
                        {tier.badge}
                      </div>
                    )}

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      {tier.label}
                    </p>

                    {/* Credits */}
                    <p className="mt-4 font-display text-5xl font-extrabold tracking-[-0.06em] md:text-6xl">
                      {tier.credits.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/40">Spyda Credits</p>

                    <div className="my-5 h-px bg-white/[0.08]" />

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold tracking-tight">{tier.priceNGN}</span>
                      <span className="text-xs text-white/35">{tier.priceUSD}</span>
                    </div>

                    {/* Features */}
                    <div className="mt-5 space-y-2.5">
                      {[
                        `${tier.credits.toLocaleString()} credits to your wallet`,
                        "Unique SPYDA-XXXX-XXXX code",
                        "Single-use, secure & instant",
                        "Earn SPYDA tokens on spend",
                      ].map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5 text-sm text-white/60">
                          <CheckIcon /> {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.button
                      type="button"
                      onClick={() => openCheckout(tier)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 font-display text-sm font-bold ${
                        isPopular
                          ? "bg-[linear-gradient(135deg,#F9C80E_0%,#FF6A2A_45%,#E91EAE_100%)] shadow-[0_14px_50px_rgba(233,30,174,.28)]"
                          : "border border-white/15 bg-white/[0.06] transition-colors hover:bg-white/[0.1]"
                      }`}
                    >
                      Buy {tier.label} <ArrowIcon />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

          {/* Rate info */}
          <Reveal delay={0.15}>
            <p className="mt-8 text-center text-xs text-white/30">
              Base rate: $1 = 100 credits · NGN rate: ₦1,500 = $1 · Studio tier includes a 300-credit bonus
            </p>
          </Reveal>
        </div>
      </section>
      <AccessFormModal
        open={accessFormOpen}
        close={() => setAccessFormOpen(false)}
        selectedTier={selectedTier}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Social Proof                                                       */
/* ------------------------------------------------------------------ */

function SocialProof() {
  const peopleByRole = {
    "Creative founder": { name: "Fatima Acheampong", role: "Creative Founder" },
    "Social media manager": { name: "Olosunde Eniitan", role: "Social Media Manager" },
    "Brand designer": { name: "Eunice Sharon Eyo", role: "Brand Designer" },
  } as const;

  return (
    <section className="pb-10">
      <div className="container-shell">
        <p className="mb-6 text-center text-[9px] font-bold uppercase tracking-[0.24em] text-white/25">People who use Spyda Credits</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["\u201CSpyda credits made my design workflow ten times faster. Just fund and create.\u201D", "Creative founder"],
            ["\u201CThe coupon code system is seamless — I paid and had credits in my wallet within a minute.\u201D", "Social media manager"],
            ["\u201CThe Studio tier bonus is a no-brainer. 2,800 credits for ₦25k is incredible value.\u201D", "Brand designer"],
          ].map(([quote, role], i) => {
            const person = peopleByRole[role as keyof typeof peopleByRole];

            return (
            <Reveal key={quote} delay={i * 0.08}>
              <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-6">
                <div className="mb-4 text-xs tracking-[0.2em] text-yellow">★★★★★</div>
                <p className="font-display text-base font-semibold leading-6">{quote}</p>
                <div className="mt-5">
                  <p className="font-display text-sm font-bold text-white">{person.name}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">{person.role}</p>
                </div>
              </div>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section-pad">
      <div className="container-shell max-w-4xl">
        <SectionIntro eyebrow="Questions, answered" title="Before you ask." />
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-base font-bold md:text-lg">{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-lg"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-6 text-sm leading-7 text-white/55">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      <div className="absolute inset-x-[15%] bottom-[-45%] -z-10 h-[600px] rounded-full bg-[linear-gradient(90deg,#F9C80E,#E91EAE)] opacity-25 blur-[150px]" />
      <div className="container-shell text-center">
        <Reveal>
          <p className="mb-5 font-display text-xs font-bold uppercase tracking-[0.24em] text-yellow">Your next design starts here</p>
          <h2 className="mx-auto max-w-5xl font-display text-[clamp(3rem,9vw,7rem)] font-extrabold leading-[0.9] tracking-[-0.07em]">
            Fund your Spyda wallet today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/55">
            Pick your tier. Get your coupon code. Start creating professional designs with Spyda.
          </p>
          <CtaButton className="mt-8 min-h-14 px-8 text-base" href="#pricing">Buy Spyda Credits → from ₦7,000</CtaButton>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Exit Intent Modal                                                  */
/* ------------------------------------------------------------------ */

function ExitModal({ open, close }: { open: boolean; close: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-xl"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="gradient-border relative w-full max-w-md overflow-hidden rounded-[30px] p-7 text-center"
          >
            <button onClick={close} aria-label="Close offer" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50">×</button>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yellow/10 text-2xl">✦</div>
            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.22em] text-yellow">Wait—before you go</p>
            <h3 className="mt-3 font-display text-3xl font-bold tracking-[-0.045em]">Don&apos;t miss your Spyda Credits.</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">Fund your Spyda wallet starting from just ₦7,000 and get creating.</p>
            <CtaButton className="mt-6 w-full" href="#pricing" onClick={close}>Buy Spyda Credits <ArrowIcon /></CtaButton>
            <button onClick={close} className="mt-4 text-[10px] font-semibold text-white/30">No thanks, I&apos;ll pass</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [exitOpen, setExitOpen] = useState(false);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (event.clientY <= 5 && !sessionStorage.getItem("vigency-exit-seen")) {
        sessionStorage.setItem("vigency-exit-seen", "true");
        setExitOpen(true);
      }
    };
    document.addEventListener("mouseout", handler);
    return () => document.removeEventListener("mouseout", handler);
  }, []);

  return (
    <main className="page-shell">
      <motion.div style={{ width: progress }} className="fixed left-0 top-0 z-[90] h-[3px] bg-gradient-to-r from-yellow via-orange to-pink" />
      <div className="grain" />
      <Navigation />
      <Hero />
      <Inside />
      <Transformation />
      <Examples />
      <HowItWorks />
      <Offer />
      <SocialProof />
      <FAQ />
      <FinalCTA />
      <footer className="border-t border-white/[0.07] py-8">
        <div className="container-shell flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo className="opacity-80" />
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">© 2026 Vigency. Make ideas visible.</p>
        </div>
      </footer>
      <div className="glass fixed bottom-3 left-3 right-3 z-30 flex items-center justify-between rounded-2xl p-2 pl-4 md:hidden">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-white/35">Spyda Credits</p>
          <p className="mt-0.5 font-display text-sm font-bold">From ₦7,000</p>
        </div>
        <CtaButton className="min-h-11 px-5 text-xs" href="#pricing">Buy Credits <ArrowIcon /></CtaButton>
      </div>
      <ExitModal open={exitOpen} close={() => setExitOpen(false)} />
    </main>
  );
}
