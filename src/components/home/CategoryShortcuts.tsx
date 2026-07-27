"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    label: "WOMEN",
    href: "/products?gender=women",
    image: "https://ik.imagekit.io/wzcsyc58s/sf%20web/women.jpg.jpeg",
    span: "col-span-1",
  },
  // Kartu KIDS dihapus: katalog SF tidak punya satu pun produk anak, jadi
  // kartunya selalu mendarat di halaman kosong. Kembalikan kalau stok anak
  // sudah masuk (baris pertama tinggal dikembalikan ke 3 kolom).
  {
    label: "MEN",
    href: "/products?gender=men",
    image: "https://ik.imagekit.io/wzcsyc58s/sf%20web/mens.jpg.jpeg",
    span: "col-span-1",
  },
  {
    label: "CASUAL",
    // Slug katalognya "lifestylecasual", tanpa tanda hubung.
    href: "/products?category=lifestylecasual",
    image: "https://ik.imagekit.io/wzcsyc58s/sf%20web/casual.jpg.jpeg",
    span: "col-span-1 md:col-span-1",        // di mobile 1 kolom, di desktop tetap
    tall: true,                               // kartu bawah lebih tinggi
  },
  {
    // Kategori "sports" tidak ada di katalog (0 produk). Diarahkan ke Running,
    // satu-satunya kategori olahraga yang benar-benar terisi (110 produk).
    label: "RUNNING",
    href: "/products?category=running",
    image: "https://ik.imagekit.io/wzcsyc58s/sf%20web/sports.jpg.jpeg",
    span: "col-span-1 md:col-span-1",
    tall: true,
  },
];

export function CategoryShortcuts() {
  return (
    <div className="w-full px-4 py-4 md:py-6 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto">

        {/* Baris 1 — 2 kartu sejajar (dulu 3, sebelum kartu KIDS dihapus) */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-3">
          {CATEGORIES.slice(0, 2).map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i} height="h-[140px] md:h-[280px]" />
          ))}
        </div>

        {/* Baris 2 — 2 kartu lebih lebar */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {CATEGORIES.slice(2).map((cat, i) => (
            <CategoryCard key={cat.label} cat={cat} index={i + 2} height="h-[180px] md:h-[360px]" />
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