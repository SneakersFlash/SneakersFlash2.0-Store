"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

// Static brand data — replace with API call to /brands if needed
const BRANDS = [
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "New Balance", slug: "new-balance" },
  { name: "Puma", slug: "puma" },
  { name: "Converse", slug: "converse" },
  { name: "Vans", slug: "vans" },
  { name: "Reebok", slug: "reebok" },
  { name: "Jordan", slug: "jordan" },
  { name: "Under Armour", slug: "under-armour" },
  { name: "Asics", slug: "asics" },
];

export function BrandStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="border-y border-border bg-brand-gray-900/50 py-12">
      <div className="container-2xl">
        <motion.p
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="label text-center mb-8"
        >
          Brands We Carry
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {BRANDS.map((brand, i) => (
            <motion.div
              key={brand.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={`/products?brand=${brand.slug}`}
                className="group inline-flex items-center justify-center px-5 py-2.5 border border-border bg-brand-gray-800 hover:border-primary/50 hover:bg-brand-gray-700 transition-all duration-200"
              >
                <span className="font-display text-sm uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
