"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Archivo } from "next/font/google";
import { ChevronRight } from "lucide-react";
import styles from "./EventCampaignSection.module.css";

// Archivo cuma dipakai panel event (judul marquee pakai font-stretch 115%),
// jadi dimuat di sini, bukan di root layout.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

interface EventCampaignSectionProps {
  campaigns: any[];
}

export function EventCampaignSection({ campaigns }: EventCampaignSectionProps) {
  // Produk yang stoknya habis tidak ditampilkan sama sekali di section event —
  // sebelumnya cuma dikasih badge "Sold Out" tapi tetap makan slot. Campaign yang
  // jadi kosong ikut disembunyikan supaya tidak nyisa banner event tanpa produk.
  const visibleCampaigns = (campaigns ?? [])
    .map((campaign: any) => ({
      ...campaign,
      products: (campaign.products ?? []).filter((p: any) => !p.isSoldOut),
    }))
    .filter((campaign: any) => campaign.products.length > 0);

  if (visibleCampaigns.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-4">
      {visibleCampaigns.map((campaign: any) => (
        <EventCampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Ulang item sampai cukup panjang, lalu digandakan supaya loop marquee mulus. */
function loop<T>(items: T[], min = 8): T[] {
  if (items.length === 0) return [];
  const out: T[] = [];
  while (out.length < min) out.push(...items);
  return out.concat(out);
}

/** Sisa waktu ke `target`. `null` sebelum mount supaya render server = klien. */
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function countdownParts(target: string, now: number | null) {
  let s =
    now === null ? 0 : Math.max(0, Math.floor((Date.parse(target) - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return [
    { v: pad(d), l: "HARI" },
    { v: pad(h), l: "JAM" },
    { v: pad(m), l: "MNT" },
    { v: pad(s), l: "DTK" },
  ];
}

const SPEED_SECONDS = 60; // durasi 1 putaran baris produk

/**
 * Satu campaign event. Tampilan panel mengikuti desain LowtoberSection:
 * judul berjalan, timer kotak, dua baris produk yang bergerak berlawanan arah
 * dan keluar dari sisi panel. Kartu produknya tetap kartu lama.
 */
function EventCampaignCard({ campaign }: { campaign: any }) {
  // Semua campaign menuju halaman event generik. Pengecualian landing khusus
  // dicabut 18 Agt 2026 bersama Freedom in Every Step.
  const href = `/events/${campaign.slug}`;

  // Event bisa tayang lebih dulu daripada boleh dibeli. Nilai awalnya diambil
  // dari backend (isCheckoutOpen) supaya render server dan klien sama; sesudah
  // mount jam pembeli yang menentukan, jadi labelnya berganti sendiri saat jam
  // buka lewat tanpa perlu halaman ini di-render ulang.
  const now = useNow();
  const bukaLewat =
    !!campaign.checkoutOpensAt &&
    now !== null &&
    now >= Date.parse(campaign.checkoutOpensAt);
  const menungguBelanja = campaign.isCheckoutOpen === false && !bukaLewat;

  const showTimer = campaign.isTimer && campaign.countDownEnd;
  const timerTarget = menungguBelanja
    ? campaign.checkoutOpensAt
    : campaign.countDownEnd;
  const parts = showTimer ? countdownParts(timerTarget, now) : [];

  const products: any[] = campaign.products ?? [];
  const [row1, row2] = useMemo(() => {
    const even = products.filter((_, i) => i % 2 === 0);
    const odd = products.filter((_, i) => i % 2 === 1);
    return [loop(even), loop(odd.length ? odd : products)];
  }, [products]);

  const title = String(campaign.title ?? "");
  const words = Array.from({ length: 20 }, (_, i) => (i % 2 ? title : "SALE"));

  return (
    <section
      className={`${styles.section} ${archivo.variable}`}
      aria-label={title}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.marquee} aria-hidden="true">
            <div
              className={`${styles.move} ${styles.left}`}
              style={{ animationDuration: `${Math.round(SPEED_SECONDS * 0.6)}s` }}
            >
              {words.map((w, i) => (
                <span key={i} className={styles.word}>
                  {w}
                </span>
              ))}
            </div>
          </div>
          <h2 className={styles.srOnly}>{title}</h2>

          <div className={styles.divider} />

          <div className={styles.timerRow}>
            {showTimer && (
              <div className={styles.timerWrap}>
                <span className={styles.timerLabel}>
                  {menungguBelanja ? "Belanja Dibuka Dalam" : "Berakhir Dalam"}
                </span>
                <div
                  className={styles.timer}
                  role="timer"
                  aria-label={menungguBelanja ? "Belanja dibuka dalam" : "Sisa waktu promo"}
                >
                  {parts.map((t) => (
                    <div key={t.l} className={styles.box}>
                      <span className={styles.boxV}>{t.v}</span>
                      <span className={styles.boxL}>{t.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Link
              href={href}
              className={styles.seeAll}
              aria-label={`Lihat semua promo ${title}`}
            >
              <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {[
          { items: row1, dir: styles.left },
          { items: row2, dir: styles.right },
        ].map((row, r) => (
          <div key={r} className={styles.lane}>
            <div
              className={`${styles.move} ${row.dir}`}
              style={{ animationDuration: `${SPEED_SECONDS}s` }}
            >
              {row.items.map((p: any, i: number) => {
                // Paruh kedua cuma salinan untuk loop: disembunyikan dari
                // pembaca layar & urutan Tab supaya produk tidak terbaca dobel.
                const duplicate = i >= row.items.length / 2;
                return (
                  <div
                    key={`${p.productVariantId}-${i}`}
                    className={styles.item}
                    aria-hidden={duplicate || undefined}
                  >
                    <EventProductCard p={p} duplicate={duplicate} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Kartu produk event — bentuknya SENGAJA sama dengan kartu sebelumnya. */
function EventProductCard({ p, duplicate }: { p: any; duplicate: boolean }) {
  const stockPercentage = p.stockBar
    ? Math.min((p.stockBar.sold / p.stockBar.total) * 100, 100)
    : 0;
  const sisaStok = p.stockBar
    ? p.stockBar.total - p.stockBar.sold
    : 0;

  return (
    <Link href={`/products/${p.slug}`} tabIndex={duplicate ? -1 : undefined}>
      {/* 2. Tambahkan nama spesifik pada group: group/card */}
      <div className="w-[155px] lg:w-[220px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 group/card flex flex-col h-full border border-transparent">
        <div className="relative aspect-square w-full bg-[#F5F5F5]">
          {/* BADGE DISKON MELAYANG */}
          {p.discountPercent > 0 && (
            <div className="absolute top-2 left-2 z-20">
              <span className="bg-[#E50000] text-white text-[10px] lg:text-[11px] font-black px-2 py-1 rounded shadow-sm">
                -{p.discountPercent}%
              </span>
            </div>
          )}

          {p.images && p.images.length > 0 ? (
            <>
              {/* 3. Ubah group-hover menjadi group-hover/card */}
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className={`object-cover object-top transition-all duration-700 ${
                  p.images.length > 1
                    ? "group-hover/card:opacity-0"
                    : "group-hover/card:scale-105"
                }`}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {p.images.length > 1 && (
                <Image
                  src={p.images[1]}
                  alt={`${p.name} hover`}
                  fill
                  className="object-cover object-top absolute inset-0 opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
            </>
          ) : p.image ? (
            <Image
              src={p.image}
              alt={p.name}
              fill
              className="object-cover object-top group-hover/card:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              👟
            </div>
          )}

          {p.isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
              <span className="bg-gray-900 text-white font-black text-xs md:text-sm px-3 py-1 rounded-full border border-gray-600">
                HABIS
              </span>
            </div>
          )}
        </div>

        {/* Info Produk */}
        <div className="space-y-1 p-2.5 flex-grow bg-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#E50000]">
            {p.isSoldOut ? "Sold Out" : "Event Promo"}
          </p>
          <p className="text-[12px] font-medium text-gray-900 line-clamp-2">
            {p.name}
          </p>
          {p.availableSizes && p.availableSizes.length > 0 && (
            <p className="text-[10px] lg:text-[11px] text-[#888888] mb-2 lg:mb-3 line-clamp-1">
              Sizes: {p.availableSizes.slice(0, 5).join(", ")}
              {p.availableSizes.length > 5 && "..."}
            </p>
          )}
          <p className="font-bold text-[14px] lg:text-[18px]">
            Rp {p.finalPrice?.toLocaleString("id-ID")}
          </p>

          <div className="flex items-center gap-1.5 mb-1.5">
            {p.originalPrice > p.finalPrice && (
              <p className="text-[10px] line-through text-gray-400">
                Rp {p.originalPrice?.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        {/* Flash Sale Stock Bar */}
        {p.stockBar && p.stockBar.total > 0 && (
          <div className="px-2.5 pb-2.5 bg-white">
            <div className="relative h-[16px] w-full bg-red-300 rounded-full overflow-hidden flex items-center justify-center shadow-inner">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-700 rounded-full transition-all duration-1000"
                style={{ width: `${stockPercentage}%` }}
              />
              {stockPercentage > 80 && !p.isSoldOut && (
                <span className="absolute left-1 text-[10px] z-10 animate-pulse">
                  🔥
                </span>
              )}
              <span className="relative z-10 text-[9px] font-bold text-white drop-shadow-md uppercase tracking-wider">
                {p.isSoldOut ? "SOLD" : `Available ${sisaStok}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
