"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const SHORTCUTS = [
  { 
    label: "New Arrival", 
    href: "/products?sort=newest",   
    isBold: false,
    isRed: false,
    textClass: "text-[12px] md:text-[15px] tracking-wide", // Sedikit diperbesar di dekstop
  },
  { 
    label: "Best Seller", 
    href: "/products?sort=popular",  
    isBold: false,
    isRed: false,
    textClass: "text-[12px] md:text-[15px] tracking-wide",
  },
  { 
    label: "Last Call",   
    href: "/products?sale=true",     
    isBold: false, 
    isRed: true,
    textClass: "text-[12px] md:text-[15px] tracking-wide",
  },
  { 
    label: "Man",         
    href: "/products?gender=men",    
    isBold: false,
    isRed: false,
    textClass: "text-[12px] md:text-[15px] tracking-wide",
  },
  { 
    label: "Woman",       
    href: "/products?gender=women",  
    isBold: false,
    isRed: false,
    textClass: "text-[12px] md:text-[15px] tracking-wide",
  },
  { 
    label: "Kids",        
    href: "/products?gender=kids",   
    isBold: false,
    isRed: false,
    textClass: "text-[12px] md:text-[15px] tracking-wide",
  },
];

export function CategoryShortcuts() {
  return (
    // Tambahkan padding vertikal (py) yang lebih lega di desktop
    <div className="px-4 py-0.5 md:py-6 w-full bg-[#F5F5F5]"> 
      {/* PERUBAHAN UTAMA:
        - Mobile: grid-cols-3 (3 kolom, 2 baris)
        - Desktop: md:grid-cols-6 (6 kolom sejajar 1 baris)
        - Desktop: Max width diperbesar ke md:max-w-6xl
      */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-5 max-w-2xl md:max-w-7xl mx-auto">
        {SHORTCUTS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Link
              href={item.href}
              // Di desktop, tinggi tombol (h) diperbesar dan ditambahkan efek hover (hover:-translate-y-1)
              className="flex items-center justify-center bg-white rounded-xl md:rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100 h-[50px] md:h-[84px] px-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span 
                className={cn(
                  "text-center whitespace-pre-wrap leading-[1.2]",
                  item.textClass,
                  item.isBold ? "font-bold text-gray-900" : "font-medium text-gray-700",
                  item.isRed ? "text-[#E50000]" : ""
                )}
              >
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}