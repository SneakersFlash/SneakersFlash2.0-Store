"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface WelcomePointsData {
  amount: number;
  balanceAfter: number;
  name: string;
  description?: string;
}

interface WelcomePointsPopupProps {
  points: WelcomePointsData | null;
  onClose: () => void;
}

/**
 * Popup bonus poin member baru (promo Kemerdekaan).
 * Sengaja dipisah dari WelcomeVoucherPopup: tidak ada kode untuk disalin —
 * poin sudah langsung masuk saldo, jadi CTA-nya belanja / cek saldo.
 */
export default function WelcomePointsPopup({ points, onClose }: WelcomePointsPopupProps) {
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (points) {
      const colors = ["#FF3B3B", "#FFFFFF", "#FF6B00", "#FFD000", "#FF3B3B"];
      setParticles(
        Array.from({ length: 20 }, (_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 60,
          color: colors[i % colors.length],
          delay: Math.random() * 0.6,
        }))
      );
    }
  }, [points]);

  const formatNumber = (n: number) => n.toLocaleString("id-ID");

  return (
    <AnimatePresence>
      {points && (
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
            {/* Top banner */}
            <div className="relative h-36 bg-gradient-to-br from-red-600 via-red-500 to-orange-400 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute top-4 left-6 w-14 h-14 rounded-full bg-white/10" />

              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.2 }}
                className="text-5xl mb-1 drop-shadow-lg"
              >
                🎉
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-center px-3"
              >
                <p className="text-white font-black text-lg tracking-tight drop-shadow leading-none">
                  FREEDOM IN STEP
                </p>
                <p className="text-white/90 font-bold text-[10px] tracking-[0.15em] uppercase mt-1">
                  Your freedom starts now
                </p>
              </motion.div>
            </div>

            {/* Body */}
            <div className="px-5 pt-4 pb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="-ml-9 w-5 h-5 rounded-full bg-gray-100" />
                <div className="flex-1 border-t-2 border-dashed border-gray-200" />
                <div className="-mr-9 w-5 h-5 rounded-full bg-gray-100" />
              </div>

              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-3 text-center">
                <p className="text-[11px] text-red-500 font-semibold uppercase tracking-wider">
                  {"You've unlocked"}
                </p>
                <p className="text-3xl font-black text-red-600 leading-tight">
                  {formatNumber(points.amount)}
                </p>
                <p className="text-[11px] font-bold text-red-500 tracking-wide">FLASH POINT</p>
              </div>

              {/* Copy promo dipegang di sini, bukan dari `description` backend —
                  ganti kalimat marketing tidak perlu ikut deploy API. */}
              <p className="text-[12px] text-gray-500 mb-1 leading-snug">
                81K Flash Point udah masuk ke akun kamu. Saatnya bebas pilih pair
                untuk langkah berikutnya.
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                Saldo poin sekarang:{" "}
                <span className="font-bold text-gray-700">{formatNumber(points.balanceAfter)}</span>
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-2xl transition-colors shadow-md shadow-red-100"
              >
                Mulai Belanja →
              </motion.button>

              <Link
                href="/account"
                onClick={onClose}
                className="block w-full mt-2 text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Lihat saldo poin saya
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
