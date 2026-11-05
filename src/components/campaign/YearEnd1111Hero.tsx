'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { CountdownTimer } from '@/components/home/CountdownTimer';
import { useFaseCampaign } from './useFaseCampaign';
import {
  YEAR_END_BERAKHIR,
  YEAR_END_HARI_H,
  YEAR_END_PERIODE,
} from '@/lib/campaign/year-end-1111';

/**
 * Hero campaign 11.11 YEAR END SALE.
 *
 * Kerangka hero 10.10 (bidang dibelah dua: pesan + penawaran, strip berjalan,
 * selotip miring sebagai aksen), judul TIPOGRAFI karena KV belum ada. Kalau
 * KV/logo masuk, ganti isi <h1> dengan <Image> dan biarkan alt-nya memuat nama
 * campaign.
 *
 * Warna: merah #E50012 + hitam + putih, supaya tidak tertukar dengan kuning
 * 9.9/10.10. Teks putih di atas merah ~4,9:1 (lolos AA); merah di atas hitam
 * hanya dipakai untuk angka raksasa (teks besar, ambangnya 3:1).
 *
 * Hitung mundur selalu menuju harga 11.11: sebelum 11 Nov ia menghitung ke
 * 11.11 00:00 WIB, pada 11 Nov ke tengah malamnya.
 */

const MERAH = '#E50012';

const KEUNGGULAN = ['100% Original', 'Tukar Ukuran 7 Hari', 'Kirim Hari Yang Sama'];

const STRIP = [
  '11.11 Year End Sale',
  'Last Big Sale Of The Year',
  'Harga Turun 11.11',
  '100% Original',
  'sneakersflash.com',
];

/** Potongan selotip miring — murni hiasan. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

export function YearEnd1111Hero() {
  const { fase, target } = useFaseCampaign(YEAR_END_HARI_H, YEAR_END_BERAKHIR);

  const label =
    fase === 'pra'
      ? 'Harga 11.11 Turun Dalam:'
      : fase === 'berjalan'
        ? 'Harga 11.11 Berakhir Dalam:'
        : fase === 'selesai'
          ? 'Sale Sudah Berakhir'
          : '';

  return (
    <>
      {/* ── Strip promo berjalan ── */}
      <div className="w-full text-white overflow-hidden py-1.5" style={{ backgroundColor: MERAH }}>
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
            {/* ═══ Kiri: pesan ═══ */}
            <div className="relative p-6 pb-8 md:p-9 lg:p-11 flex flex-col gap-6 justify-between min-h-[420px] lg:min-h-[520px] bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px]">
              <Selotip className="hidden lg:block top-[14%] -right-3 h-6 w-16 rotate-[-8deg] bg-[#E50012]" />
              <Selotip className="hidden lg:block bottom-[16%] right-8 h-5 w-24 rotate-[6deg] bg-white/10" />

              <div className="flex flex-col items-start gap-3">
                <h1 className="m-0 flex flex-col leading-[0.85]">
                  <span
                    className="font-black tracking-[-0.04em] text-[88px] md:text-[128px] lg:text-[156px]"
                    style={{ color: MERAH }}
                  >
                    11.11
                  </span>
                  <span className="text-white font-black uppercase tracking-tight text-[44px] md:text-[64px] lg:text-[76px]">
                    Year End
                  </span>
                  <span
                    className="mt-3 inline-block w-fit -rotate-2 px-3 py-1.5 text-white font-black uppercase tracking-tight text-[22px] md:text-[30px] lg:text-[34px]"
                    style={{ backgroundColor: MERAH }}
                  >
                    Sale
                  </span>
                </h1>

                <span className="pt-3 text-white font-black uppercase leading-none text-xl md:text-2xl lg:text-3xl">
                  Last Big Sale Of The Year
                </span>

                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                  {YEAR_END_PERIODE}
                </span>

                <div className="flex flex-wrap gap-2.5 pt-3">
                  <Link
                    href="#deals-1111"
                    className="inline-flex items-center justify-center text-white px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:brightness-110"
                    style={{ backgroundColor: MERAH }}
                  >
                    Shop The Sale
                  </Link>
                  <Link
                    href="#voucher-1111"
                    className="inline-flex items-center justify-center border border-white/25 text-white px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-white hover:text-[#0D0D0D]"
                  >
                    Claim Voucher
                  </Link>
                </div>
              </div>

              {/* ── Baris kepercayaan ── */}
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-5 border-t border-white/12">
                {KEUNGGULAN.map((teks) => (
                  <span
                    key={teks}
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/75"
                  >
                    <span
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: MERAH }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                    </span>
                    {teks}
                  </span>
                ))}
              </div>
            </div>

            {/* ═══ Kanan: hitung mundur & penawaran ═══ */}
            <div
              className="relative text-white p-6 md:p-9 lg:p-10 flex flex-col justify-center gap-6"
              style={{ backgroundColor: MERAH }}
            >
              <Selotip className="top-6 right-6 h-5 w-20 rotate-[-7deg] bg-[#0D0D0D]" />
              <Selotip className="bottom-8 right-6 h-5 w-16 rotate-[9deg] bg-white/85" />

              {/* Tinggi dikunci supaya isi hero tidak melompat saat fase
                  ditentukan sesudah mount. */}
              <div className="relative z-10 flex flex-col gap-2 min-h-[76px]">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-85">
                  {label}
                </span>
                {fase !== null && fase !== 'selesai' && (
                  <CountdownTimer targetDate={target} />
                )}
              </div>

              <div className="border-t border-white/25 pt-6">
                <p className="text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight">
                  Close The Year,
                  <br />
                  Open A New Box.
                </p>
                <p className="mt-3 text-sm leading-relaxed opacity-90">
                  Sale besar terakhir tahun ini. Harga 11.11 turun tepat jam
                  00:00 WIB tanggal 11 November — pasang alarm, stoknya terbatas.
                </p>
              </div>

              <Link
                href="#deals-1111"
                className="inline-flex w-fit items-center justify-center border-2 border-white bg-[#0D0D0D] px-5 py-2.5 font-black uppercase tracking-widest text-xs transition-all duration-200 active:scale-95 hover:bg-white hover:text-[#0D0D0D]"
              >
                Lihat Deals
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
