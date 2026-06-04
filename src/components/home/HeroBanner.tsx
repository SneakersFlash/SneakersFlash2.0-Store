"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildImageUrl } from "@/lib/utils/imageUrl";
import type { Banner } from "@/lib/api/banners.service";

interface HeroBannerProps {
  banners: Banner[];
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%" }),
  center: { zIndex: 1, x: 0 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? "100%" : "-100%" }),
};

const AUTO_SLIDE_DELAY = 5000;

export function HeroBanner({ banners }: HeroBannerProps) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setPage((prev) => prev + newDirection);
    },
    []
  );

  useEffect(() => {
    if (isHovered || !banners || banners.length <= 1) return;
    const timer = setInterval(() => paginate(1), AUTO_SLIDE_DELAY);
    return () => clearInterval(timer);
  }, [isHovered, paginate, banners]);

  // Loading Skeleton dengan rasio yang disesuaikan
  if (!banners || banners.length === 0) {
    return (
      <div className="w-full sm:px-4 lg:px-6 sm:pt-4 mb-2 sm:mb-6">
        {/* Mobile: 1280x930 | Desktop: 1600x500 */}
        <div className="w-full aspect-[128/93] sm:aspect-[16/5] bg-zinc-200 dark:bg-zinc-800 animate-pulse sm:rounded-2xl" />
      </div>
    );
  }

  const imageIndex = Math.abs(page % banners.length);
  const currentBanner = banners[imageIndex];

  return (
    // Wrapper luar: Di mobile full-bleed, di layar sm (640px) ke atas diberi margin & padding
    <div className="w-full sm:px-4 lg:px-6 sm:pt-4 mb-4 sm:mb-6">
      <div
        // PERUBAHAN UTAMA: aspect-[128/93] untuk HP, aspect-[16/5] untuk Desktop
        className="relative w-full aspect-[128/93] sm:aspect-[16/5] overflow-hidden sm:rounded-2xl bg-zinc-100 dark:bg-zinc-900 group shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.6, ease: "easeInOut" },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) paginate(1);
              else if (swipe > 10000) paginate(-1);
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Link href={currentBanner.targetUrl || "/"} className="block w-full h-full relative">
              
              {/* GAMBAR MOBILE (Ditampilkan jika lebar layar < 640px) */}
              <div className="block sm:hidden absolute inset-0">
                <Image
                  src={currentBanner.imageMobileUrl.startsWith("http") ? currentBanner.imageMobileUrl : buildImageUrl(currentBanner.imageMobileUrl)}
                  alt={currentBanner.title}
                  fill
                  className="object-cover object-center" 
                  priority={imageIndex === 0}
                />
              </div>

              {/* GAMBAR DESKTOP (Ditampilkan jika lebar layar >= 640px) */}
              <div className="hidden sm:block absolute inset-0">
                <Image
                  src={currentBanner.imageDesktopUrl.startsWith("http") ? currentBanner.imageDesktopUrl : buildImageUrl(currentBanner.imageDesktopUrl)}
                  alt={currentBanner.title}
                  fill
                  className="object-cover object-center"
                  priority={imageIndex === 0}
                />
              </div>

            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigasi Kiri / Kanan (Hanya Desktop) */}
        {banners.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); paginate(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm text-zinc-900 opacity-0 group-hover:opacity-100 transition-all z-10 hidden sm:flex hover:bg-white shadow-md"><ChevronLeft size={20} /></button>
            <button onClick={(e) => { e.preventDefault(); paginate(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm text-zinc-900 opacity-0 group-hover:opacity-100 transition-all z-10 hidden sm:flex hover:bg-white shadow-md"><ChevronRight size={20} /></button>
          </>
        )}

        {/* Indikator Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 drop-shadow-md ${
                  idx === imageIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}