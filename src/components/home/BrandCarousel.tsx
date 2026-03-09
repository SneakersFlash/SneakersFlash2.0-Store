"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const BRANDS = [
  { name: "Nike",        slug: "nike",        logoText: "NIKE"      },
  { name: "Adidas",      slug: "adidas",      logoText: "adidas"    },
  { name: "Puma",        slug: "puma",        logoText: "PUMA"      },
  { name: "Skechers",    slug: "skechers",    logoText: "SKECHERS"  },
  { name: "New Balance", slug: "new-balance", logoText: "NB"        },
  { name: "Reebok",      slug: "reebok",      logoText: "Reebok"    },
];

function BrandCard({
  brand,
  index,
}: {
  brand: (typeof BRANDS)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      // Perhatikan w-36 (144px), ini akan jadi acuan perhitungan scroll kita
      className="flex-shrink-0 snap-start"
    >
      <Link
        href={`/products?brand=${brand.slug}`}
        className="group flex items-center justify-center bg-white border border-border/40 shadow-sm rounded-2xl w-36 h-16 hover:border-zinc-900/20 hover:shadow-md transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100/0 via-zinc-100/0 to-zinc-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <span
          className={`font-black tracking-tighter text-zinc-900 select-none relative z-10 transition-transform duration-300 group-hover:scale-110 ${
            brand.slug === "adidas"
              ? "text-xl italic"
              : brand.slug === "skechers"
              ? "text-base"
              : "text-2xl"
          }`}
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {brand.logoText}
        </span>
      </Link>
    </motion.div>
  );
}

export function BrandCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Jika user sedang interaksi (hover/touch), hentikan timer
    if (isPaused) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        
        // Jarak geser: Lebar 1 card (w-36 = 144px) + gap (gap-3 = 12px) = 156px
        const scrollAmount = 156; 

        // Cek apakah sudah mentok sampai ke item paling kanan
        // Tambahkan toleransi beberapa pixel (-10) agar lebih akurat
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          // Jika mentok, kembali ke awal dengan smooth
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Geser ke kanan sebanyak 1 kartu
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 2500); // Bergeser setiap 2.5 detik

    // Bersihkan interval saat komponen dibongkar
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="py-6 bg-background flex flex-col gap-4 relative">
      <div className="px-5 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground tracking-tight">
          Shop by Brand
        </h3>
        <Link
          href="/brands"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-zinc-900 transition-colors"
        >
          View All
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="relative w-full">
        <div
          ref={carouselRef}
          // Fungsi untuk menghentikan animasi saat disentuh / di-hover
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-5 pb-4 pt-1 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />

          {BRANDS.map((brand, i) => (
            <BrandCard key={brand.slug} brand={brand} index={i} />
          ))}

          <div className="w-2 flex-shrink-0" />
        </div>

        <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}