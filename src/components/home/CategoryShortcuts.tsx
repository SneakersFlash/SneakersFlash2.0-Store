"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { 
  Sparkles, 
  Flame, 
  Tag, 
  User, 
  Users, 
  Baby 
} from "lucide-react";

const SHORTCUTS = [
  { 
    label: "New Arrival", 
    href: "/products?sort=newest",   
    icon: Sparkles, 
    highlight: false,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  { 
    label: "Best Seller", 
    href: "/products?sort=popular",  
    icon: Flame,    
    highlight: false,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100"
  },
  { 
    label: "Last Call",   
    href: "/products?sale=true",     
    icon: Tag,      
    highlight: true, // Akan memunculkan efek ping merah
    iconColor: "text-red-600",
    bgColor: "bg-red-100"
  },
  { 
    label: "Men",         
    href: "/products?gender=men",    
    icon: User,     
    highlight: false,
    iconColor: "text-gray-700",
    bgColor: "bg-gray-100"
  },
  { 
    label: "Women",       
    href: "/products?gender=women",  
    icon: Users,    
    highlight: false,
    iconColor: "text-gray-700",
    bgColor: "bg-gray-100"
  },
  { 
    label: "Kids",        
    href: "/products?gender=kids",   
    icon: Baby,     
    highlight: false,
    iconColor: "text-gray-700",
    bgColor: "bg-gray-100"
  },
];

export function CategoryShortcuts() {
  return (
    <div className="px-4 py-2 w-full">
      {/* RESPONSIVE GRID:
        - Mobile (< sm): grid 3 kolom
        - Tablet (sm - md): grid 3 kolom atau flex
        - Desktop (> md): grid 6 kolom sejajar 1 baris di tengah (max-w-4xl mx-auto)
      */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-2 md:gap-x-4 max-w-4xl mx-auto justify-items-center">
        {SHORTCUTS.map((item, i) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              whileTap={{ scale: 0.92 }}
              className="w-full flex justify-center"
            >
              <Link
                href={item.href}
                className="group flex flex-col items-center gap-3 w-full max-w-[90px]"
              >
                {/* Kontainer Icon */}
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[20px] transition-all duration-300",
                    "border border-gray-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-gray-200",
                    item.highlight ? "bg-red-50 border-red-100" : "bg-white"
                  )}
                >
                  {/* Efek Lingkaran Warna di belakang Icon */}
                  <div className={cn("absolute inset-0 m-auto w-10 h-10 md:w-11 md:h-11 rounded-full opacity-60 group-hover:opacity-100 transition-opacity", item.bgColor)} />
                  
                  {/* Ikon */}
                  <Icon 
                    size={22} 
                    strokeWidth={2.5}
                    className={cn("relative z-10", item.iconColor)} 
                  />

                  {/* Efek Ping/Pulse khusus untuk item highlight (Last Call) */}
                  {item.highlight && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                    </span>
                  )}
                </div>

                {/* Label Teks */}
                <span 
                  className={cn(
                    "text-[11px] md:text-xs font-bold tracking-tight text-center transition-colors line-clamp-1",
                    item.highlight ? "text-red-600" : "text-gray-600 group-hover:text-black"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}