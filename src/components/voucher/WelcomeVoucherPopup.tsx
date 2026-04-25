"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface WelcomeVoucherData {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount: number;
  expiresAt: string;
}

interface WelcomeVoucherPopupProps {
  voucher: WelcomeVoucherData | null;
  onClose: () => void;
}

export default function WelcomeVoucherPopup({ voucher, onClose }: WelcomeVoucherPopupProps) {
  const [copied, setCopied] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (voucher) {
      const colors = ["#FF6B00", "#FFD000", "#FF3B3B", "#00C07F", "#4361EE"];
      setParticles(
        Array.from({ length: 20 }, (_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 60,
          color: colors[i % colors.length],
          delay: Math.random() * 0.6,
        }))
      );
    }
  }, [voucher]);

  const handleCopy = () => {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formatDiscount = (v: WelcomeVoucherData) => {
    if (v.discountType === "percentage") return `${v.discountValue}%`;
    return `Rp${v.discountValue.toLocaleString("id-ID")}`;
  };

  const formatRp = (n: number) =>
    `Rp${n.toLocaleString("id-ID")}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <AnimatePresence>
      {voucher && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Confetti particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20, x: `${p.x}vw` }}
              animate={{ opacity: [0, 1, 1, 0], y: `${p.y}vh`, rotate: [0, 180, 360] }}
              transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
              className="absolute top-0 w-2 h-2 rounded-sm pointer-events-none"
              style={{ background: p.color, left: 0 }}
            />
          ))}

          {/* Card */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[340px] bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top gradient banner */}
            <div className="relative h-36 bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 flex flex-col items-center justify-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute top-4 left-6 w-14 h-14 rounded-full bg-white/10" />

              {/* Sneaker emoji icon */}
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
                className="text-5xl mb-1 drop-shadow-lg"
              >
                👟
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-white font-black text-lg tracking-tight drop-shadow"
              >
                Selamat Bergabung!
              </motion.p>
            </div>

            {/* Voucher ticket body */}
            <div className="px-5 pt-4 pb-5">
              {/* Ticket notch */}
              <div className="flex items-center gap-2 mb-4">
                <div className="-ml-9 w-5 h-5 rounded-full bg-gray-100" />
                <div className="flex-1 border-t-2 border-dashed border-gray-200" />
                <div className="-mr-9 w-5 h-5 rounded-full bg-gray-100" />
              </div>

              {/* Discount badge */}
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2 flex-1">
                  <p className="text-[11px] text-orange-500 font-semibold uppercase tracking-wider">Hemat</p>
                  <p className="text-2xl font-black text-orange-600 leading-tight">
                    {formatDiscount(voucher)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-gray-400 leading-relaxed">
                  <p>Min. belanja</p>
                  <p className="font-bold text-gray-700 text-xs">{formatRp(voucher.minPurchaseAmount)}</p>
                  <p className="mt-1">Berlaku sampai</p>
                  <p className="font-bold text-gray-700 text-xs">{formatDate(voucher.expiresAt)}</p>
                </div>
              </div>

              <p className="text-[12px] text-gray-500 mb-3 leading-snug">
                {voucher.description ?? "Gunakan kode ini di halaman checkout untuk mendapatkan diskon."}
              </p>

              {/* Code copy area */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopy}
                className="w-full flex items-center justify-between bg-gray-900 rounded-2xl px-4 py-3 group transition-all hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-mono font-bold text-white tracking-widest text-sm">
                    {voucher.code}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] font-bold text-green-400"
                    >
                      ✓ Tersalin!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] font-semibold text-gray-400 group-hover:text-orange-400 transition-colors"
                    >
                      Salin
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* CTA button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-2xl transition-colors shadow-md shadow-orange-100"
              >
                Mulai Belanja →
              </motion.button>

              <button
                onClick={onClose}
                className="w-full mt-2 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Nanti saja
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}