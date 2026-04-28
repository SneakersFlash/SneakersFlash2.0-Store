"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    label: "WOMEN",
    href: "/products?gender=women",
    image: "https://res.cloudinary.com/ds2hpv3bl/image/upload/v1777357503/women_gb9k0i.jpg",
    span: "col-span-1",
  },
  {
    label: "KIDS",
    href: "/products?gender=kids",
    image: "https://res.cloudinary.com/ds2hpv3bl/image/upload/v1777357502/kids_02_iyv40w.jpg",
    span: "col-span-1",
  },
  {
    label: "MEN",
    href: "/products?gender=men",
    image: "https://res.cloudinary.com/ds2hpv3bl/image/upload/v1777357498/mens_01_b5okfb.jpg",
    span: "col-span-1",
  },
  {
    label: "CASUAL",
    href: "/products?category=lifestyle-casual",
    image: "https://res.cloudinary.com/ds2hpv3bl/image/upload/v1777357502/casual_o12kkq.jpg",
    span: "col-span-1 md:col-span-1",        // di mobile 1 kolom, di desktop tetap
    tall: true,                               // kartu bawah lebih tinggi
  },
  {
    label: "SPORTS",
    href: "/products?category=sports",
    image: "https://res.cloudinary.com/ds2hpv3bl/image/upload/v1777357500/sports_dmnujz.jpg",
    span: "col-span-1 md:col-span-1",
    tall: true,
  },
];

export function CategoryShortcuts() {
  return (
    <div className="w-full px-4 py-4 md:py-6 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto">

        {/* Baris 1 — 3 kartu sejajar */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-2 md:mb-3">
          {CATEGORIES.slice(0, 3).map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i} height="h-[140px] md:h-[280px]" />
          ))}
        </div>

        {/* Baris 2 — 2 kartu lebih lebar */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {CATEGORIES.slice(3).map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i + 3} height="h-[180px] md:h-[360px]" />
          ))}
        </div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type Cat = (typeof CATEGORIES)[number];

function CategoryCard({ cat, index, height }: { cat: Cat; index: number; height: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-xl md:rounded-2xl ${height} group`}
    >
      {/* Background image */}
      <Image
        src={cat.image}
        alt={cat.label}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />

      {/* Dark overlay gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" /> */}

      {/* Content */}
      <Link
        href={cat.href}
        className="absolute inset-0 flex flex-col items-center justify-center p-3 md:p-6"
      >
        {/* Label */}
        <span
          className="
            font-black uppercase leading-none tracking-tight text-white
            text-[22px] md:text-[52px]
            drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]
            mb-2 md:mb-4
          "
        >
          {cat.label}
        </span>

        {/* Shop Now button */}
        {/* <span
          className="
            inline-flex items-center justify-center
            bg-[#E50000] hover:bg-red-700 active:scale-95
            text-white font-bold uppercase tracking-widest
            text-[9px] md:text-[13px]
            px-3 py-1.5 md:px-5 md:py-2.5
            rounded-full
            transition-all duration-200
            shadow-lg
          "
        >
          Shop Now
        </span> */}
      </Link>
    </motion.div>
  );
}