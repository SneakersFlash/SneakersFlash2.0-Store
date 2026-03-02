"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Slide data ───────────────────────────────────────────────────────────────
// In production, this could come from a CMS or backend banners API.

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: "New Season · 2025",
    headline: "RUN YOUR\nOWN\nRULES",
    subheadline: "The latest drops from Nike, Adidas, and New Balance — exclusively on SneakersFlash.",
    cta: { label: "Shop New Arrivals", href: "/products?sort=newest" },
    secondaryCta: { label: "Explore Brands", href: "/brands" },
    // Using a gradient + geometric shapes as hero background
    // Replace src below with your actual hero image URL
    imageSrc: null as string | null,
    accentWord: "RUN",
    bgClass: "from-brand-black via-brand-gray-900 to-brand-gray-800",
  },
];

const slide = HERO_SLIDES[0];

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Marquee ticker ───────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "NEW ARRIVALS",
  "FREE SHIPPING OVER RP 500K",
  "AUTHENTIC GUARANTEED",
  "NEW DROPS EVERY FRIDAY",
  "EXCLUSIVE RELEASES",
];

function Ticker() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-border bg-brand-gray-900/80 backdrop-blur-sm">
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex whitespace-nowrap py-2.5"
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-8 text-[11px] font-display uppercase tracking-widest text-muted-foreground"
          >
            {item}
            <span className="text-primary font-bold text-base leading-none">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Background geometric elements ────────────────────────────────────────────

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgClass}`} />

      {/* Large circle — top right */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #CC0000 0%, transparent 70%)" }}
      />

      {/* Diagonal stripe set — bottom left */}
      <div className="absolute bottom-0 left-0 w-80 h-full opacity-[0.04] overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white"
            style={{
              width: "1px",
              height: "120%",
              left: `${i * 28}px`,
              top: "-10%",
              transform: "rotate(-25deg)",
              transformOrigin: "top center",
            }}
          />
        ))}
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax on scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative">
      {/* ── Main hero block ── */}
      <div className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <HeroBg />
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative z-10 container-2xl py-20"
          style={{ y: textY, opacity }}
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-primary" />
              <span className="text-xs font-display uppercase tracking-[0.3em] text-primary">
                {slide.eyebrow}
              </span>
            </motion.div>

            {/* Massive headline */}
            <motion.h1
              variants={slideRight}
              className="font-display font-bold uppercase leading-[0.9] tracking-tight mb-8"
              style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
            >
              {slide.headline.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {i === 0 ? (
                    <span className="text-foreground">{line}</span>
                  ) : i === 1 ? (
                    <>
                      <span className="text-primary">{line}</span>
                    </>
                  ) : (
                    <span className="text-foreground">{line}</span>
                  )}
                </span>
              ))}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10"
            >
              {slide.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                href={slide.cta.href}
                className="group/btn inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 font-display uppercase tracking-widest text-sm transition-all duration-200 hover:gap-5"
              >
                {slide.cta.label}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover/btn:translate-x-1"
                />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex items-center gap-3 border border-foreground/30 hover:border-foreground text-foreground px-8 py-4 font-display uppercase tracking-widest text-sm transition-all duration-200 hover:bg-white/5"
              >
                {slide.secondaryCta.label}
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-8 mt-14 pt-10 border-t border-border/50"
            >
              {[
                { value: "500+", label: "Premium Brands" },
                { value: "10K+", label: "Products" },
                { value: "100%", label: "Authentic" },
                { value: "1–3 Day", label: "Delivery" },
              ].map(({ value, label }) => (
                <div key={label} className="hidden sm:block">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Large ghost text — editorial overlay */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.6], [0.035, 0]) }}
          className="absolute right-0 bottom-8 pointer-events-none select-none overflow-hidden"
        >
          <p
            className="font-display font-black uppercase text-foreground leading-none"
            style={{ fontSize: "clamp(8rem, 25vw, 22rem)" }}
          >
            FLASH
          </p>
        </motion.div>
      </div>

      {/* ── Ticker banner ── */}
      <Ticker />
    </section>
  );
}
