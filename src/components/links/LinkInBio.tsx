"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Instagram,
  MessageCircle,
  ShoppingBag,
  Check,
  Link2,
  ArrowUpRight,
} from "lucide-react";
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

/**
 * Wordmark resmi: huruf putih + petir kuning-oranye sebagai huruf "S" pada
 * FLASH. Varian putih yang benar untuk latar gelap - `logo_basic.png` hurufnya
 * hitam dan akan lenyap di sini.
 *
 * Ini turunan 600px dari logo_basic_white.png (master 2084px tetap disimpan),
 * dipangkas ke bbox-nya dan dikuantisasi ke 128 warna: 9 KB, dari 68 KB.
 * Penurunannya penting karena `images.unoptimized: true` di next.config.ts -
 * next/image di proyek ini TIDAK menurunkan resolusi apa pun, jadi memakai
 * master berarti mengirim gambar 2084px untuk slot 300px. Halaman ini dibuka
 * dari bio Instagram, di ponsel, dengan kuota, dan gambar ini elemen LCP-nya.
 *
 * Kalau logo diganti, regenerasi turunan ini juga - jangan tunjuk balik ke
 * master. Dimensi di bawah harus cocok dengan file supaya next/image memesan
 * ruang yang benar dan tata letak tidak bergeser saat gambar masuk.
 */
const WORDMARK = {
  src: "/images/logo-wordmark-white-600.png",
  width: 600,
  height: 283,
} as const;

/**
 * Gaya huruf yang meniru wordmark: berat, MIRING, MELEBAR, dan tracking negatif
 * supaya huruf hampir bersentuhan seperti di logo. Ini kebalikan persis dari
 * default lama halaman ini (Oswald - sempit, tegak, tracking positif).
 *
 * Lebar diatur lewat `font-stretch`, bukan `font-variation-settings`. Sumbu wdth
 * Archivo terekspos sebagai `font-stretch: 62% 125%` di @font-face, dan properti
 * high-level itu menyatu dengan font-weight/font-style; font-variation-settings
 * memintas keduanya dan di sebagian engine mengembalikan sumbu yang tidak
 * disebut - termasuk BERAT - ke nilai default, jadi teks bisa diam-diam kehilangan
 * ketebalannya.
 *
 * 106% ditahan di bawah lebar penuh logo supaya label terpanjang - "Belanja
 * Sekarang" - tetap muat satu baris di layar 320px.
 *
 * Semua ini bergantung pada `axes: ["wdth"]` di app/links/page.tsx: tanpa baris
 * itu font terunduh tanpa sumbu lebar dan font-stretch tidak error, cuma tidak
 * berefek apa-apa.
 */
const WORDMARK_TYPE =
  "font-brand font-extrabold italic uppercase tracking-[-0.02em] [font-stretch:106%]";

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
        "font-brand text-sm font-medium text-brand-gray-200",
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
          hanya untuk latar. Noda atas sekaligus jadi pendar di belakang logo,
          jadi wordmark tidak perlu efek glow sendiri. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-[360px] w-[360px] rounded-full bg-brand-amber/10 blur-[120px]"
      />

      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center px-5 pb-16 pt-14 sm:pt-20">
        {/* ── Identitas ────────────────────────────────────────────────────
            Wordmark asli, bukan teks yang ditulis ulang. Versi lama menyusun
            "SneakersFlash" dari huruf biasa, padahal logo sebenarnya berbunyi
            "SNKRS FLASH" dengan petir sebagai huruf S - jadi halaman ini
            menampilkan merek yang bahkan tidak ada di logonya.

            Gambarnya dipasang di dalam <h1> supaya halaman tetap punya satu
            heading level-1; teks yang dibaca screen reader sekarang datang dari
            atribut alt. */}
        <motion.div {...rise(0)} className="flex flex-col items-center text-center">
          <h1 className="m-0">
            <Image
              src={WORDMARK.src}
              alt="SneakersFlash"
              width={WORDMARK.width}
              height={WORDMARK.height}
              priority
              sizes="(max-width: 640px) 260px, 300px"
              className="h-auto w-[260px] sm:w-[300px]"
            />
          </h1>

          <p className="mt-6 max-w-[340px] font-brand text-[15px] font-normal leading-relaxed text-brand-gray-200">
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
                    <span
                      className={cn("block text-[17px] leading-tight text-white", WORDMARK_TYPE)}
                    >
                      {label}
                    </span>
                    {/* Caption sengaja TEGAK dan lebar normal. Kalau ikut miring
                        seperti label, kemiringan berhenti jadi penanda merek dan
                        berubah jadi kebisingan - lagipula teks kecil yang miring
                        lebih berat dibaca. */}
                    <span className="mt-1 block truncate font-brand text-[13px] font-normal not-italic text-brand-gray-200">
                      {caption}
                    </span>
                  </span>

                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-brand-gray-400 transition-colors duration-200 group-hover:text-primary"
                  />
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* ── Kaki halaman ───────────────────────────────────────────────── */}
        <motion.footer {...rise(0.36)} className="mt-10 flex flex-col items-center gap-4">
          <CopyLinkButton />
          {/* Tracking lebar di sini disengaja sebagai lawan dari tracking rapat
              wordmark: ukuran kecil butuh ruang antar huruf, dan kontrasnya
              menjauhkan baris ini dari peran judul. */}
          <p className="font-brand text-[11px] font-semibold uppercase not-italic tracking-[0.18em] text-brand-gray-400">
            &copy; SneakersFlash
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
