"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PromoStripProps {
  eyebrow?: string;
  headline: string;
  sub?: string;
  ctaLabel: string;
  ctaHref: string;
  variant?: "yellow" | "dark";
}

export function PromoStrip({
  eyebrow = "Limited Time",
  headline,
  sub,
  ctaLabel,
  ctaHref,
  variant = "yellow",
}: PromoStripProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const isYellow = variant === "yellow";

  return (
    <section
      ref={ref}
      className={cn(
        "relative overflow-hidden py-14",
        isYellow
          ? "bg-primary"                                   // solid yellow
          : "bg-muted border-y border-border"              // muted (dark/light aware)
      )}
    >
      {/* Ghost text */}
      <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none">
        <p
          className={cn(
            "font-display font-black uppercase leading-none",
            isYellow ? "text-black/10" : "text-foreground/[0.03]"
          )}
          style={{ fontSize: "clamp(6rem, 20vw, 18rem)" }}
        >
          FLASH
        </p>
      </div>

      {/* Lightning bolt accent */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none hidden xl:block"
      >
        <Zap
          size={80}
          className={cn(
            "opacity-10",
            isYellow ? "text-black" : "text-primary"
          )}
          fill="currentColor"
        />
      </motion.div>

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
                  size={13}
                  className={isYellow ? "text-black/60 fill-black/60" : "text-primary fill-primary"}
                />
                <span className={cn(
                  "text-xs font-display uppercase tracking-[0.2em]",
                  isYellow ? "text-black/70" : "text-primary"
                )}>
                  {eyebrow}
                </span>
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={cn(
                "font-display text-3xl md:text-5xl font-bold uppercase tracking-tight",
                isYellow ? "text-black" : "text-foreground"
              )}
            >
              {headline}
            </motion.h2>

            {sub && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.25 }}
                className={cn(
                  "text-sm mt-2",
                  isYellow ? "text-black/60" : "text-muted-foreground"
                )}
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
              className={cn(
                "group inline-flex items-center gap-3 px-8 py-4",
                "font-display uppercase tracking-widest text-sm transition-all duration-200",
                isYellow
                  ? "bg-black text-brand-yellow hover:bg-brand-gray-900"
                  : "bg-primary text-primary-foreground hover:bg-brand-yellowDark"
              )}
            >
              {ctaLabel}
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}