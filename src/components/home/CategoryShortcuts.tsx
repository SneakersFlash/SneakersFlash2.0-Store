"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const SHORTCUTS = [
  { 
    label: "NEW\nARRIVAL", // \n forces the line break like the image
    href: "/products?sort=newest",   
    isBold: true,
    isRed: false,
    textClass: "text-[11px] uppercase tracking-wide",
  },
  { 
    label: "Best Seller", 
    href: "/products?sort=popular",  
    isBold: false,
    isRed: false,
    textClass: "text-[13px]",
  },
  { 
    label: "Last Call",   
    href: "/products?sale=true",     
    isBold: true, 
    isRed: true,
    textClass: "text-[13px]",
  },
  { 
    label: "Man",         
    href: "/products?gender=men",    
    isBold: false,
    isRed: false,
    textClass: "text-[13px]",
  },
  { 
    label: "Woman",       
    href: "/products?gender=women",  
    isBold: false,
    isRed: false,
    textClass: "text-[13px]",
  },
  { 
    label: "Kids",        
    href: "/products?gender=kids",   
    isBold: false,
    isRed: false,
    textClass: "text-[13px]",
  },
];

export function CategoryShortcuts() {
  return (
    <div className="px-3 py-2 w-full bg-[#F5F5F5]"> {/* Slight gray background matching your image */}
      <div className="grid grid-cols-3 gap-2.5 max-w-2xl mx-auto">
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
              className="flex items-center justify-center bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100 h-[64px] px-2 hover:shadow-md transition-all duration-200"
            >
              <span 
                className={cn(
                  "text-center whitespace-pre-wrap leading-[1.2]",
                  item.isBold ? "font-bold text-gray-900" : "font-medium text-gray-700",
                  item.isRed && "text-[#E50000]",
                  item.textClass
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