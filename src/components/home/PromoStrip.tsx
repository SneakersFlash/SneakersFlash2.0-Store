"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

interface PromoStripProps {
  eyebrow?: string;
  headline: string;
  sub?: string;
  ctaLabel: string;
  ctaHref: string;
  variant?: "red" | "dark";
}

export function PromoStrip({
  eyebrow = "Limited Time",
  headline,
  sub,
  ctaLabel,
  ctaHref,
  variant = "red",
}: PromoStripProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const isRed = variant === "red";

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden py-14 ${
        isRed ? "bg-primary" : "bg-brand-gray-800 border-y border-border"
      }`}
    >
      {/* Ghost text bg */}
      <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none">
        <p
          className={`font-display font-black uppercase leading-none ${
            isRed ? "text-white/10" : "text-white/[0.03]"
          }`}
          style={{ fontSize: "clamp(6rem, 20vw, 18rem)" }}
        >
          SALE
        </p>
      </div>

      <div className="relative z-10 container-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            {eyebrow && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-3"
              >
                <Zap
                  size={14}
                  className={isRed ? "text-white/80" : "text-primary"}
                  fill="currentColor"
                />
                <span
                  className={`text-xs font-display uppercase tracking-[0.2em] ${
                    isRed ? "text-white/80" : "text-primary"
                  }`}
                >
                  {eyebrow}
                </span>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`font-display text-3xl md:text-5xl font-bold uppercase tracking-tight ${
                isRed ? "text-white" : "text-foreground"
              }`}
            >
              {headline}
            </motion.h2>

            {sub && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.25 }}
                className={`text-sm mt-2 ${
                  isRed ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {sub}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="shrink-0"
          >
            <Link
              href={ctaHref}
              className={`group inline-flex items-center gap-3 px-8 py-4 font-display uppercase tracking-widest text-sm transition-all duration-200 ${
                isRed
                  ? "bg-white text-primary hover:bg-white/90"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {ctaLabel}
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
