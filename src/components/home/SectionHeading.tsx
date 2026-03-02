"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  className,
  align = "left",
}: SectionHeadingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className
      )}
    >
      <div>
        {/* Red accent line + eyebrow */}
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: 48 } : { width: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-1 bg-primary mb-3"
        />

        {eyebrow && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="label mb-2"
          >
            {eyebrow}
          </motion.p>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide"
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm text-muted-foreground mt-2 max-w-md"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {viewAllHref && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <Link
            href={viewAllHref}
            className="group/link inline-flex items-center gap-2 text-sm font-display uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            {viewAllLabel}
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/link:translate-x-1"
            />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
