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

// Menambahkan icon dan warna khusus untuk masing-masing shortcut
const SHORTCUTS = [
  { 
    label: "New Arrival", 
    href: "/products?sort=newest",   
    icon: Sparkles, 
    highlight: false,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    label: "Best Seller", 
    href: "/products?sort=popular",  
    icon: Flame,    
    highlight: false,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  { 
    label: "Last Call",   
    href: "/products?sale=true",     
    icon: Tag,      
    highlight: true,
    iconColor: "text-red-600",
    bgColor: "bg-red-600/10"
  },
  { 
    label: "Men",         
    href: "/products?gender=men",    
    icon: User,     
    highlight: false,
    iconColor: "text-zinc-700 dark:text-zinc-300",
    bgColor: "bg-zinc-100 dark:bg-zinc-800"
  },
  { 
    label: "Women",       
    href: "/products?gender=women",  
    icon: Users,    
    highlight: false,
    iconColor: "text-zinc-700 dark:text-zinc-300",
    bgColor: "bg-zinc-100 dark:bg-zinc-800"
  },
  { 
    label: "Kids",        
    href: "/products?gender=kids",   
    icon: Baby,     
    highlight: false,
    iconColor: "text-zinc-700 dark:text-zinc-300",
    bgColor: "bg-zinc-100 dark:bg-zinc-800"
  },
];

export function CategoryShortcuts() {
  return (
    <div className="px-5 py-6 bg-background">
      {/* Menggunakan grid 3 kolom. 
        Gap diperbesar sedikit agar tidak terlalu padat dan terlihat seperti menu aplikasi 
      */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-5">
        {SHORTCUTS.map((item, i) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
              whileTap={{ scale: 0.92 }}
            >
              <Link
                href={item.href}
                className="group flex flex-col items-center gap-2.5"
              >
                {/* Kontainer Icon */}
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                    "border border-border/40 shadow-sm group-hover:shadow-md group-hover:-translate-y-1",
                    item.highlight ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" : "bg-white dark:bg-zinc-900"
                  )}
                >
                  {/* Efek Lingkaran Warna di belakang Icon */}
                  <div className={cn("absolute inset-0 m-auto w-9 h-9 rounded-full", item.bgColor)} />
                  
                  {/* Ikon */}
                  <Icon 
                    size={20} 
                    strokeWidth={2.5}
                    className={cn("relative z-10", item.iconColor)} 
                  />

                  {/* Efek Ping/Pulse khusus untuk item highlight (Last Call) */}
                  {item.highlight && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-zinc-900"></span>
                    </span>
                  )}
                </div>

                {/* Label Teks */}
                <span 
                  className={cn(
                    "text-[11px] font-bold tracking-wide text-center transition-colors",
                    item.highlight ? "text-red-600 dark:text-red-500" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
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