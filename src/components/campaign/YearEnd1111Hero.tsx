'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { CountdownTimer } from '@/components/home/CountdownTimer';
import { useFaseCampaign } from './useFaseCampaign';
import {
  YEAR_END_BERAKHIR,
  YEAR_END_HARI_H,
  YEAR_END_PERIODE_SALE,
  YEAR_END_PERIODE_TEASER,
} from '@/lib/campaign/year-end-1111';

/**
 * Hero campaign 11.11 YEAR-END SALE.
 *
 * Copy mengikuti PDF "REVISI COPY LANDING PAGE 11.11" (5 Nov 2026) yang
 * direvisi lagi oleh PDF "revisi terbaru" (6 Nov 2026: USS dihapus, promo
 * website 9-15 Nov). Hero punya DUA kondisi:
 *  - TEASER (sebelum promo website buka 9 Nov 00:00 WIB): countdown menuju
 *    pembukaan, CTA ke jadwal & katalog reguler, TANPA tombol voucher.
 *  - SALE (9–15 Nov): "The sale continues online", CTA ke produk promo.
 * Kondisi berganti sendiri di sisi klien; sebelum mount yang tampil teaser.
 *
 * Tambahan di luar PDF: kondisi SALE tetap memasang countdown "Promo Berakhir
 * Dalam" (PDF tidak menyebut timer untuk kondisi itu).
 *
 * Warna: kuning #F5E809 + hitam + putih (6 Nov 2026, ganti dari merah).
 * Teks di atas kuning WAJIB hitam — putih di atas kuning cuma ~1,2:1.
 * Judul hero = logo upload user (public/images/logo-1111.png).
 */

const KUNING = '#F5E809';
const HITAM = '#0D0D0D';

const STRIP = [
  '11.11 Year-End Sale',
  'Countdown 6-8 Nov',
  'Promo Dimulai 9 Nov',
  'Last Chance 15 Nov',
  '100% Original',
];

/** Potongan selotip miring — murni hiasan. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

export function YearEnd1111Hero() {
  const { fase, target } = useFaseCampaign(YEAR_END_HARI_H, YEAR_END_BERAKHIR);
  const sale = fase === 'berjalan' || fase === 'selesai';

  const copy = sale
    ? {
        sub: 'The Sale Continues Online.',
        periode: YEAR_END_PERIODE_SALE,
        ctaUtama: { teks: 'Shop The Sale', href: '#deals-1111' },
        benefit: ['100% Original', 'Free Shipping*'],
        label: fase === 'selesai' ? 'Promo Sudah Berakhir' : 'Promo Berakhir Dalam:',
        headline: ['The Deals', 'Are Here.'],
        deskripsi:
          'Penawaran 11.11 YEAR-END SALE sudah tersedia di sneakersflash.com. Pilih sneakers dan ukuran favorit sebelum promo berakhir pada 15 November 2026. Stok dan ukuran mengikuti ketersediaan.',
        ctaKanan: { teks: 'Lihat Produk Promo', href: '#deals-1111' },
      }
    : {
        sub: 'The Deals Are Coming Online.',
        periode: YEAR_END_PERIODE_TEASER,
        ctaUtama: { teks: 'Lihat Jadwal Promo', href: '#jadwal-1111' },
        benefit: ['100% Original', 'Free Shipping*', 'Paylater'],
        label: 'Promo Website Dimulai Dalam:',
        headline: ['The Deals Are', 'Coming Online.'],
        deskripsi:
          'Siapkan wishlist! Promo 11.11 YEAR-END SALE di sneakersflash.com dimulai 9 November dan berlangsung sampai 15 November 2026.',
        // Katalog REGULER — sengaja tidak dilabeli promo 11.11 (arahan PDF).
        ctaKanan: { teks: 'Jelajahi Sneakers', href: '/products' },
      };

  return (
    <>
      {/* ── Strip promo berjalan ── */}
      <div className="w-full overflow-hidden py-1.5" style={{ backgroundColor: KUNING, color: HITAM }}>
        <div className="flex w-max gap-8 animate-marquee88" aria-hidden="true">
          {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((teks, i) => (
            <span
              key={i}
              className="text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap"
            >
              {teks}
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-4 md:pt-6">
        <section className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px] shadow-lg bg-[#0D0D0D]">
          <div className="relative grid lg:grid-cols-[1.35fr_1fr]">
            {/* ═══ Kiri: identitas campaign ═══ */}
            <div className="relative p-6 pb-8 md:p-9 lg:p-11 flex flex-col gap-6 justify-between min-h-[420px] lg:min-h-[520px] bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px]">
              <Selotip className="hidden lg:block top-[14%] -right-3 h-6 w-16 rotate-[-8deg] bg-[#F5E809]" />
              <Selotip className="hidden lg:block bottom-[16%] right-8 h-5 w-24 rotate-[6deg] bg-white/10" />

              <div className="flex flex-col items-start gap-3">
                <h1 className="m-0 w-full max-w-[300px] md:max-w-[420px] lg:max-w-[480px]">
                  <Image
                    src="/images/logo-1111.png"
                    alt="11.11 Year-End Sale"
                    width={2759}
                    height={1408}
                    priority
                    sizes="(min-width: 1024px) 480px, (min-width: 768px) 420px, 300px"
                    className="h-auto w-full"
                  />
                </h1>

                <span className="pt-3 text-white font-black uppercase leading-none text-xl md:text-2xl lg:text-3xl">
                  {copy.sub}
                </span>

                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                  {copy.periode}
                </span>

                <div className="flex flex-wrap gap-2.5 pt-3">
                  <Link
                    href={copy.ctaUtama.href}
                    className="inline-flex items-center justify-center px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:brightness-110"
                    style={{ backgroundColor: KUNING, color: HITAM }}
                  >
                    {copy.ctaUtama.teks}
                  </Link>
                </div>
              </div>

              {/* ── Benefit ── */}
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-5 border-t border-white/12">
                {copy.benefit.map((teks) => (
                  <span
                    key={teks}
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/75"
                  >
                    <span
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: KUNING }}
                    >
                      <Check className="h-3 w-3 text-[#0D0D0D]" strokeWidth={3.5} />
                    </span>
                    {teks}
                  </span>
                ))}
              </div>
            </div>

            {/* ═══ Kanan: countdown & pesan konversi ═══ */}
            <div
              className="relative p-6 md:p-9 lg:p-10 flex flex-col justify-center gap-6"
              style={{ backgroundColor: KUNING, color: HITAM }}
            >
              <Selotip className="hidden md:block top-6 right-6 h-5 w-20 rotate-[-7deg] bg-[#0D0D0D]" />
              <Selotip className="bottom-8 right-6 h-5 w-16 rotate-[9deg] bg-white/85" />

              {/* Tinggi dikunci supaya isi hero tidak melompat saat fase
                  ditentukan sesudah mount. */}
              <div className="relative z-10 flex flex-col gap-2 min-h-[76px]">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-85">
                  {fase === null ? '' : copy.label}
                </span>
                {fase !== null && fase !== 'selesai' && (
                  <CountdownTimer targetDate={target} tone="dark" />
                )}
              </div>

              <div className="border-t border-black/20 pt-6">
                <p className="text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight">
                  {copy.headline[0]}
                  <br />
                  {copy.headline[1]}
                </p>
                <p className="mt-3 text-sm leading-relaxed opacity-90">
                  {copy.deskripsi}
                </p>
              </div>

              <Link
                href={copy.ctaKanan.href}
                className="inline-flex w-fit items-center justify-center border-2 border-[#0D0D0D] bg-[#0D0D0D] text-white px-5 py-2.5 font-black uppercase tracking-widest text-xs transition-all duration-200 active:scale-95 hover:bg-transparent hover:text-[#0D0D0D]"
              >
                {copy.ctaKanan.teks}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
