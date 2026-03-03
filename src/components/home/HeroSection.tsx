"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

// ─── Ticker ───────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "NEW ARRIVALS",
  "FREE SHIPPING OVER RP 500K",
  "100% AUTHENTIC",
  "NEW DROPS EVERY FRIDAY",
  "EXCLUSIVE RELEASES",
];

function Ticker() {
  const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-border bg-muted/50">
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap py-2.5"
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-8 text-[11px] font-display uppercase tracking-widest text-muted-foreground"
          >
            {item}
            <Zap size={10} className="text-primary fill-primary" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Background ───────────────────────────────────────────────────────────────

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base — matches dark bg; will be card color in light mode */}
      <div className="absolute inset-0 bg-card" />

      {/* Yellow radial glow — top right */}
      <div
        className="absolute -top-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245,184,0,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Second glow — bottom left */}
      <div
        className="absolute -bottom-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245,184,0,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Diagonal rule lines */}
      <div className="absolute bottom-0 right-0 w-96 h-full opacity-[0.025] overflow-hidden pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-foreground"
            style={{
              width: "1px",
              height: "120%",
              right: `${i * 26}px`,
              top: "-10%",
              transform: "rotate(20deg)",
              transformOrigin: "top center",
            }}
          />
        ))}
      </div>

      {/* Noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};
const slideLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Main Hero ────────────────────────────────────────────────────────────────

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY    = useTransform(scrollYProgress, [0, 1], ["0%",  "25%"]);
  const textY  = useTransform(scrollYProgress, [0, 1], ["0%",  "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={sectionRef} className="relative">
      <div className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden">

        {/* Parallax BG */}
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
                New Season · 2025
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={slideLeft}
              className="font-display font-bold uppercase leading-[0.88] tracking-tighter mb-8"
              style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
            >
              <span className="block text-foreground">RUN YOUR</span>
              {/* "OWN" gets the yellow gradient — mirrors the logo's bolt color */}
              <span className="block text-gradient-yellow">OWN</span>
              <span className="block text-foreground">RULES</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10"
            >
              The latest drops from Nike, Adidas, and New Balance — exclusively on SNKRS Flash.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                href="/products?sort=newest"
                className="group/btn btn-primary gap-3 hover:gap-4 transition-all"
              >
                Shop New Arrivals
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover/btn:translate-x-1"
                />
              </Link>
              <Link
                href="/brands"
                className="btn-ghost"
              >
                Explore Brands
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="hidden sm:flex items-center gap-8 mt-14 pt-10 border-t border-border/50"
            >
              {[
                { value: "500+",   label: "Premium Brands" },
                { value: "10K+",   label: "Products"       },
                { value: "100%",   label: "Authentic"      },
                { value: "1–3 Day",label: "Delivery"       },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Ghost "FLASH" watermark */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.6], [0.04, 0]) }}
          className="absolute right-0 bottom-6 pointer-events-none select-none overflow-hidden"
        >
          <p
            className="font-display font-black uppercase text-foreground leading-none"
            style={{ fontSize: "clamp(7rem, 24vw, 20rem)" }}
          >
            FLASH
          </p>
        </motion.div>

        {/* Animated lightning bolt accent — mirrors logo */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 right-12 md:right-24 pointer-events-none hidden lg:block"
        >
          <Zap
            size={48}
            className="text-primary drop-shadow-[0_0_20px_rgba(245,184,0,0.5)]"
            fill="currentColor"
          />
        </motion.div>
      </div>

      {/* Ticker */}
      <Ticker />
    </section>
  );
}
