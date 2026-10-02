'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { CountdownTimer } from '@/components/home/CountdownTimer';
import { useFaseCampaign } from './useFaseCampaign';
import {
  LOWTOBER_BERAKHIR,
  LOWTOBER_HARI_H,
  LOWTOBER_PERIODE,
} from '@/lib/campaign/lowtober-1010';

/**
 * Hero campaign 10.10 LOWTOBER THE BIG DROP.
 *
 * Kerangkanya sama dengan hero 9.9 (bidang dibelah dua: pesan + penawaran,
 * strip berjalan di atas, selotip miring sebagai aksen), tapi judulnya
 * TIPOGRAFI, bukan gambar — KV 10.10 belum ada. Kalau KV/logo masuk, ganti
 * isi <h1> dengan <Image> seperti di 9.9 dan biarkan alt-nya memuat nama
 * campaign.
 *
 * Panel kiri hitam dan "10.10" kuning: kuning di atas hitam ~15:1, sedangkan
 * kuning di atas putih cuma 1,3:1 dan tak terbaca. Kuning dipatok #F7E608
 * seperti 9.9 supaya token `--primary` toko tidak ikut berubah.
 *
 * Hitung mundur selalu menuju hari-H: sebelum 10 Okt ia menghitung ke
 * 10.10 ("Dimulai Dalam"), pada 10 Okt ke tengah malamnya ("Berakhir Dalam").
 */

const KEUNGGULAN = ['100% Original', 'Tukar Ukuran 7 Hari', 'Kirim Hari Yang Sama'];

const STRIP = [
  '10.10 Lowtober',
  'The Big Drop',
  'Extra Voucher Up To 300K',
  '100% Original',
  'sneakersflash.com',
];

/** Potongan selotip miring — murni hiasan, tidak membawa makna apa pun. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

export function Lowtober1010Hero() {
  const { fase, target } = useFaseCampaign(LOWTOBER_HARI_H, LOWTOBER_BERAKHIR);

  const label =
    fase === 'pra'
      ? '10.10 Dimulai Dalam:'
      : fase === 'berjalan'
        ? 'The Big Drop Berakhir Dalam:'
        : fase === 'selesai'
          ? 'Sale Sudah Berakhir'
          : '';

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
        <section className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px] shadow-lg bg-[#0D0D0D]">
          <div className="relative grid lg:grid-cols-[1.35fr_1fr]">
            {/* ═══ Kiri: pesan ═══
                Latar titik dari gradient CSS, bukan gambar — tak ada unduhan
                tambahan di layar pertama. */}
            <div className="relative p-6 pb-8 md:p-9 lg:p-11 flex flex-col gap-6 justify-between min-h-[420px] lg:min-h-[520px] bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px]">
              <Selotip className="hidden lg:block top-[14%] -right-3 h-6 w-16 rotate-[-8deg] bg-[#F7E608]" />
              <Selotip className="hidden lg:block bottom-[16%] right-8 h-5 w-24 rotate-[6deg] bg-white/10" />

              <div className="flex flex-col items-start gap-3">
                <h1 className="m-0 flex flex-col leading-[0.85]">
                  <span className="text-[#F7E608] font-black tracking-[-0.04em] text-[88px] md:text-[128px] lg:text-[156px]">
                    10.10
                  </span>
                  <span className="text-white font-black uppercase tracking-tight text-[44px] md:text-[64px] lg:text-[76px]">
                    Lowtober
                  </span>
                  {/* "The Big Drop" duduk di pita kuning miring — satu-satunya
                      unsur "drop" yang kelihatan tanpa KV. */}
                  <span className="mt-3 inline-block w-fit -rotate-2 bg-[#F7E608] px-3 py-1.5 text-[#0D0D0D] font-black uppercase tracking-tight text-[22px] md:text-[30px] lg:text-[34px]">
                    The Big Drop
                  </span>
                </h1>

                <div className="flex flex-col gap-0.5 pt-3">
                  <span className="text-white font-black uppercase leading-none text-xl md:text-2xl lg:text-3xl">
                    Extra Voucher up to 300K
                  </span>
                </div>

                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
                  {LOWTOBER_PERIODE}
                </span>

                <div className="flex flex-wrap gap-2.5 pt-3">
                  <Link
                    href="#voucher-1010"
                    className="inline-flex items-center justify-center bg-[#F7E608] text-[#0D0D0D] px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:brightness-95"
                  >
                    Claim Voucher
                  </Link>
                  <Link
                    href="#big-drop-1010"
                    className="inline-flex items-center justify-center border border-white/25 text-white px-6 py-3 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:bg-white hover:text-[#0D0D0D]"
                  >
                    Shop The Drop
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
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#F7E608]">
                      <Check className="h-3 w-3 text-[#0D0D0D]" strokeWidth={3.5} />
                    </span>
                    {teks}
                  </span>
                ))}
              </div>
            </div>

            {/* ═══ Kanan: penawaran ═══ */}
            <div className="relative bg-[#F7E608] text-[#0D0D0D] p-6 md:p-9 lg:p-10 flex flex-col justify-center gap-6">
              {/* Selotip atas di KANAN — di layar sempit label hitung mundur
                  mulai persis di y=24px dan akan tertimbun kalau di kiri. */}
              <Selotip className="top-6 right-6 h-5 w-20 rotate-[-7deg] bg-[#0D0D0D]" />
              <Selotip className="bottom-8 right-6 h-5 w-16 rotate-[9deg] bg-white/85" />

              {/* Tinggi dikunci supaya isi hero tidak melompat saat fase
                  ditentukan sesudah mount. */}
              <div className="relative z-10 flex flex-col gap-2 min-h-[76px]">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                  {label}
                </span>
                {fase !== null && fase !== 'selesai' && (
                  // Panel kuning: angka putih bawaan CountdownTimer tak terbaca.
                  <CountdownTimer targetDate={target} tone="dark" />
                )}
              </div>

              <div className="border-t border-black/15 pt-6">
                <p className="text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight">
                  Prices Go Low,
                  <br />
                  Pairs Go Fast.
                </p>
                <p className="mt-3 text-sm leading-relaxed opacity-80">
                  Klaim vouchernya dulu, lalu ambil pair kamu sebelum
                  stoknya ikut drop. Puncaknya 10 Oktober, voucher sampai 300K.
                </p>
              </div>

              <Link
                href="#tier-1010"
                className="inline-flex w-fit items-center justify-center border-2 border-[#0D0D0D] bg-white px-5 py-2.5 font-black uppercase tracking-widest text-xs transition-all duration-200 active:scale-95 hover:bg-[#0D0D0D] hover:text-white"
              >
                Lihat Tier Voucher
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
