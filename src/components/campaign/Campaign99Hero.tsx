'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { CountdownTimer } from '@/components/home/CountdownTimer';
import { useFaseCampaign } from './useFaseCampaign';
import {
  CAMPAIGN_99_BERAKHIR,
  CAMPAIGN_99_MULAI,
  CAMPAIGN_99_PERIODE,
  CAMPAIGN_99_TAGLINE,
} from '@/lib/campaign/next-in-rotation-99';

/**
 * Hero campaign 9.9 NEXT IN ROTATION.
 *
 * Bentuknya mengikuti KV di creative brief: bidang dibelah dua — hitam untuk
 * pesan, kuning untuk penawaran — dengan potongan selotip miring sebagai aksen
 * collage. Kuningnya sengaja memakai token `primary` toko, bukan hex lepas:
 * brief menyebut kuning sebagai jembatan antara campaign di sosial media dan
 * pengalaman belanja di website, jadi warnanya harus sama persis dengan yang
 * dipakai tombol dan lencana di seluruh toko.
 */

const KEUNGGULAN = [
  '100% Original',
  'Tukar Ukuran 7 Hari',
  'Kirim Hari Yang Sama',
];

const STRIP = [
  '9.9 Next In Rotation',
  'Different Days Call For Different Pairs',
  'Gratis Ongkir',
  '100% Original',
  'sneakersflash.com',
];

/** Potongan selotip miring — murni hiasan, tidak membawa makna apa pun. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

export function Campaign99Hero() {
  const { fase, label, target } = useFaseCampaign(
    CAMPAIGN_99_MULAI,
    CAMPAIGN_99_BERAKHIR,
  );

  return (
    <>
      {/* ── Strip promo berjalan ── */}
      <div className="w-full bg-[#F7E608] text-[#0D0D0D] overflow-hidden py-1.5">
        <div className="flex w-max gap-8 animate-marquee88" aria-hidden="true">
          {/* Digandakan — lihat @keyframes marquee88 di globals.css */}
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
        {/* Latar panel kiri memakai BG_LAYOUT.jpg (putih bergrid tipis).
            Panel kanan tetap kuning penuh dan menimpanya di separuh kanan.
            Karena latarnya kini TERANG, semua teks di panel kiri dibalik jadi
            near-black — kuning di atas putih cuma 1,3:1 dan tak terbaca. */}
        <section
          className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px] shadow-lg bg-white bg-[url('/images/BG_LAYOUT.jpg')] bg-cover bg-center"
        >
          <div className="relative grid lg:grid-cols-[1.35fr_1fr]">
            {/* ═══ Kiri: pesan ═══ */}
            <div className="relative p-6 pb-8 md:p-9 lg:p-11 flex flex-col gap-6 justify-between min-h-[420px] lg:min-h-[520px]">
              <Selotip className="hidden lg:block top-[14%] -right-3 h-6 w-16 rotate-[-8deg] bg-[#F7E608]" />
              <Selotip className="hidden lg:block bottom-[16%] right-8 h-5 w-24 rotate-[6deg] bg-[#0D0D0D]/10" />

              <div className="flex flex-col items-start gap-3">
                <h1 className="flex flex-col leading-[0.86] tracking-[-0.03em]">
                  <span className="text-[#0D0D0D] text-6xl md:text-7xl lg:text-8xl font-black">
                    9.9
                  </span>
                  <span className="text-[#0D0D0D] text-4xl md:text-6xl lg:text-7xl font-black">
                    NEXT IN
                  </span>
                  <span className="text-[#0D0D0D] text-4xl md:text-6xl lg:text-7xl font-black">
                    ROTATION
                  </span>
                </h1>

                <p className="teks-ringan mt-1 text-base md:text-lg text-[#0D0D0D]/70 max-w-md leading-relaxed">
                  {CAMPAIGN_99_TAGLINE}
                </p>

                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-[#0D0D0D]/65">
                  {CAMPAIGN_99_PERIODE}
                </span>

                <div className="flex flex-wrap gap-2.5 pt-3">
                  <Link
                    href="#voucher-99"
                    className="inline-flex items-center justify-center bg-[#F7E608] text-[#0D0D0D] px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:brightness-95"
                  >
                    Claim Voucher
                  </Link>
                  <Link
                    href="#rotation-99"
                    className="inline-flex items-center justify-center border border-[#0D0D0D]/15 bg-[#F6F6F6] text-[#0D0D0D] px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-[#0D0D0D] hover:text-white"
                  >
                    Find Your Next Pair
                  </Link>
                </div>
              </div>

              {/* ── Baris kepercayaan ── */}
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-5 border-t border-[#0D0D0D]/12">
                {KEUNGGULAN.map((teks) => (
                  <span
                    key={teks}
                    className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#0D0D0D]/75"
                  >
                    {/* Centang duduk di bulatan hitam — di latar putih, ikon
                        telanjang hilang di antara garis grid. */}
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#0D0D0D]">
                      <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                    </span>
                    {teks}
                  </span>
                ))}
              </div>
            </div>

            {/* ═══ Kanan: penawaran ═══
                Kuning penuh, sesuai brief: di fase commercial kuning jadi warna
                dominan, bukan sekadar aksen. */}
            <div className="relative bg-[#F7E608] text-[#0D0D0D] p-6 md:p-9 lg:p-10 flex flex-col justify-center gap-6">
              <Selotip className="top-6 left-6 h-5 w-20 rotate-[-7deg] bg-[#0D0D0D]" />
              <Selotip className="bottom-8 right-6 h-5 w-16 rotate-[9deg] bg-white/85" />

              {/* Tinggi dikunci supaya isi hero tidak melompat saat fase
                  ditentukan sesudah mount. */}
              <div className="flex flex-col gap-2 min-h-[76px]">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                  {label}
                </span>
                {fase !== null && fase !== 'selesai' && (
                  // Panel ini kuning, jadi angka putih bawaan CountdownTimer
                  // praktis tidak terbaca — wajib varian gelap.
                  <CountdownTimer targetDate={target} tone="dark" />
                )}
              </div>

              <div className="border-t border-black/15 pt-6">
                <p className="text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight">
                  What&apos;s Next
                  <br />
                  In Yours?
                </p>
                <p className="teks-ringan mt-3 text-sm leading-relaxed opacity-80">
                  Daily, Active, lalu slot yang belum terisi. Klaim vouchernya
                  dulu, baru pilih pair berikutnya.
                </p>
              </div>

              <Link
                href="#voucher-99"
                className="inline-flex w-fit items-center justify-center border-2 border-[#0D0D0D] bg-white px-5 py-2.5 font-black uppercase tracking-widest text-xs transition-all duration-200 active:scale-95 hover:bg-[#0D0D0D] hover:text-white"
              >
                Extra Voucher
              </Link>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                sneakersflash.com
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
