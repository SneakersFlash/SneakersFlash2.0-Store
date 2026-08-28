"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, MessageCircle, ShoppingBag, Check, Link2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Konstanta ────────────────────────────────────────────────────────────────

/**
 * JANGAN ganti route halaman ini tanpa memasang redirect dari /links.
 *
 * QR permanen di /public/qr/sneakersflash-qr.{svg,png} meng-encode URL ini dan
 * sudah beredar dalam bentuk cetak (stiker, kemasan, banner). QR-nya sengaja
 * tidak ditampilkan di halaman - tidak ada gunanya untuk pengunjung yang sudah
 * sampai di sini - jadi ketergantungan itu tidak terlihat dari UI. Memindahkan
 * route tanpa redirect akan mematikan semua cetakan yang sudah tersebar, dan
 * itu tidak bisa ditarik kembali.
 */
const PAGE_URL = "https://sneakersflash.com/links";


// TikTok tidak tersedia di lucide-react - pakai path resmi seperti di Footer.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.74a4.85 4.85 0 0 1-1-.05z" />
    </svg>
  );
}

/**
 * Sumber tunggal daftar tautan. Menambah kanal baru cukup menambah satu entri
 * di sini - urutannya sekaligus jadi urutan tampil dan urutan animasi.
 */
const LINKS = [
  {
    label: "Belanja Sekarang",
    caption: "sneakersflash.com",
    href: "https://sneakersflash.com",
    Icon: ShoppingBag,
    tint: "#F6E70A",
  },
  {
    label: "WhatsApp",
    caption: "Chat admin - stok, size & order",
    href: "https://wa.me/6281313911391",
    Icon: MessageCircle,
    /** Warna kanal, dipakai tipis untuk aksen ikon saja. */
    tint: "#25D366",
  },
  {
    label: "Instagram",
    caption: "@sneakers_flash",
    href: "https://instagram.com/sneakers_flash",
    Icon: Instagram,
    tint: "#E1306C",
  },
  {
    label: "TikTok",
    caption: "@sneakers_flash",
    href: "https://www.tiktok.com/@sneakers_flash",
    Icon: TikTokIcon,
    tint: "#25F4EE",
  },
] as const;

// ─── Tombol salin tautan ──────────────────────────────────────────────────────

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PAGE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard diblokir (http non-secure / izin ditolak). Diamkan saja -
      // URL-nya tetap terbaca di layar, jadi user masih bisa menyalin manual.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Tautan tersalin" : `Salin tautan ${PAGE_URL}`}
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-sm px-4 py-2",
        "font-body text-sm text-brand-gray-200",
        "border border-white/10 bg-white/[0.04]",
        "transition-colors duration-200 hover:bg-white/[0.08] hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
        "cursor-pointer"
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Tersalin" : "Salin tautan"}
    </button>
  );
}

// ─── Halaman ──────────────────────────────────────────────────────────────────

export function LinkInBio() {
  const reduceMotion = useReducedMotion();

  // Satu sumber untuk seluruh animasi masuk. Saat user minta "reduced motion",
  // durasinya dinolkan alih-alih blok animasinya dihapus - strukturnya tetap
  // sama, jadi tidak ada cabang render kedua yang harus ikut dirawat.
  const rise = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-black">
      {/* ── Cahaya ambien ────────────────────────────────────────────────────
          Dua noda kuning ber-blur berat. Murni dekoratif dan statis: tidak ada
          animasi yang berjalan terus supaya baterai ponsel tidak ikut terbakar
          hanya untuk latar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-[360px] w-[360px] rounded-full bg-brand-amber/10 blur-[120px]"
      />

      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center px-5 pb-16 pt-14 sm:pt-20">
        {/* ── Identitas ──────────────────────────────────────────────────── */}
        <motion.div {...rise(0)} className="flex flex-col items-center text-center">
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/30 bg-brand-gray-900 shadow-[0_0_50px_-12px_rgba(246,231,10,0.5)]">
            <Image
              src="/images/petir.svg"
              alt=""
              width={44}
              height={44}
              priority
              className="h-11 w-11"
            />
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-[0.08em] text-white sm:text-5xl">
            Sneakers<span className="text-primary">Flash</span>
          </h1>

          <p className="mt-3 max-w-[340px] font-body text-[15px] leading-relaxed text-brand-gray-200">
            Sneakers original, 100% authentic. Kilat sampai ke kaki lo.
          </p>
        </motion.div>

        {/* ── Tautan ─────────────────────────────────────────────────────── */}
        <nav aria-label="Tautan resmi SneakersFlash" className="mt-10 w-full">
          <ul className="flex flex-col gap-3">
            {LINKS.map(({ label, caption, href, Icon, tint }, i) => (
              <motion.li key={label} {...rise(0.08 + i * 0.07)}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group flex min-h-[72px] items-center gap-4 rounded-sm px-5 py-4",
                    "border border-white/10 bg-white/[0.045] backdrop-blur-sm",
                    "transition-[transform,background-color,border-color] duration-200 ease-out",
                    "hover:-translate-y-0.5 hover:border-primary/50 hover:bg-white/[0.08]",
                    "active:translate-y-0 active:scale-[0.985]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
                    "motion-reduce:transform-none motion-reduce:transition-none",
                    "cursor-pointer"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-brand-gray-900"
                    style={{ color: tint }}
                  >
                    <Icon className="h-[22px] w-[22px]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-semibold uppercase tracking-[0.06em] text-white">
                      {label}
                    </span>
                    <span className="mt-0.5 block truncate font-body text-[13px] text-brand-gray-200">
                      {caption}
                    </span>
                  </span>

                  {/* Panah gaya-lama: rotasi 45deg dari ikon garis, biar tidak
                      perlu impor ikon tambahan hanya untuk satu chevron. */}
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-lg text-brand-gray-400 transition-colors duration-200 group-hover:text-primary"
                  >
                    &rarr;
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* ── Kaki halaman ───────────────────────────────────────────────── */}
        <motion.footer {...rise(0.36)} className="mt-10 flex flex-col items-center gap-4">
          <CopyLinkButton />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-gray-400">
            &copy; SneakersFlash
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
