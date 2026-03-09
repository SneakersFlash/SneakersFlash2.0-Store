"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full aspect-[4/3] max-h-[350px] overflow-hidden bg-gradient-to-br from-[#0088FF] to-[#0055FF] px-4 py-6"
    >
      {/* ── Kiri: Teks Utama & Tombol ── */}
      <div className="relative z-20 flex flex-col h-full justify-between w-1/2">
        <div>
          <h2 className="font-display font-black text-white text-4xl sm:text-5xl uppercase leading-none tracking-tight drop-shadow-md">
            GASPOL
          </h2>
          <div className="inline-block bg-primary text-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded-sm mt-1">
            Gajian Seru Poll
          </div>
        </div>

        {/* Nanti di sini bisa ditaruh <Image> gambar sepatu absolut */}

        <motion.div whileTap={{ scale: 0.95 }} className="mt-auto">
          <Link
            href="/products?sale=true"
            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md shadow-lg"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>

      {/* ── Kanan: Stacking Badges ── */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
        
        {/* Discount Badge */}
        <div className="bg-primary border-2 border-primary rounded-xl px-3 py-1 text-center min-w-[100px] shadow-md transform rotate-2">
          <p className="text-[9px] font-bold text-zinc-900 uppercase leading-tight">
            Discount
          </p>
          <p className="font-display font-black text-blue-700 text-3xl leading-none">
            60<span className="text-lg">%</span>
          </p>
        </div>

        {/* Voucher Badge */}
        <div className="bg-[#0055FF] border-2 border-[#0088FF] rounded-xl px-3 py-1 text-center min-w-[110px] shadow-md -transform -rotate-1">
          <p className="text-[9px] font-bold text-white uppercase leading-tight">
            Voucher
          </p>
          <p className="font-display font-black text-primary text-3xl leading-none">
            200<span className="text-lg">K</span>
          </p>
        </div>

        {/* Sneakers Start From */}
        <div className="bg-white rounded-xl px-3 py-1 text-center min-w-[110px] shadow-md transform rotate-1 mt-1">
          <p className="text-[9px] font-bold text-zinc-500 uppercase leading-tight">
            Sneakers start from
          </p>
          <p className="font-display font-black text-[#0066FF] text-2xl leading-none">
            499<span className="text-sm">K</span>
          </p>
        </div>

      </div>

      {/* Grid Background Pattern (Opsional agar mirip desain) */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
    </motion.div>
  );
}