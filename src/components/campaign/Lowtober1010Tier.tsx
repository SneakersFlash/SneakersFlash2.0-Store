'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { LOWTOBER_PERIODE_VOUCHER } from '@/lib/campaign/lowtober-1010';

/**
 * Tabel tier voucher toko 10.10 — dua periode berdampingan.
 *
 * Periode yang sedang berlaku diberi label "Berlaku Sekarang", yang sudah
 * lewat diredupkan. Status dihitung SESUDAH mount: halaman di-cache ISR, jadi
 * jam render server bisa terpaut jauh dari jam pembeli (dan menghitungnya saat
 * render memicu hydration mismatch). Sebelum mount semua kartu tampil netral.
 */
type Status = 'lewat' | 'aktif' | 'nanti';

export function Lowtober1010Tier() {
  const [sekarang, setSekarang] = useState<number | null>(null);

  useEffect(() => {
    setSekarang(Date.now());
    // Cukup per menit — pergantian tier cuma terjadi sekali, tengah malam 10 Okt.
    const t = setInterval(() => setSekarang(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const statusDari = (mulai: string, berakhir: string): Status | null => {
    if (sekarang === null) return null;
    if (sekarang >= Date.parse(berakhir)) return 'lewat';
    if (sekarang >= Date.parse(mulai)) return 'aktif';
    return 'nanti';
  };

  return (
    <div className="grid gap-3 md:gap-4 md:grid-cols-2">
      {LOWTOBER_PERIODE_VOUCHER.map((p, idx) => {
        const status = statusDari(p.mulai, p.berakhir);
        // Kartu hari-H dibuat gelap supaya puncak campaign menonjol.
        const hariH = idx === LOWTOBER_PERIODE_VOUCHER.length - 1;

        return (
          <div
            key={p.label}
            className={cn(
              'relative overflow-hidden rounded-[20px] border-2 p-5 md:p-6 transition-opacity',
              hariH
                ? 'border-[#0D0D0D] bg-[#0D0D0D] text-white'
                : 'border-[#0D0D0D]/10 bg-white text-[#0D0D0D]',
              status === 'lewat' && 'opacity-45',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[0.22em]',
                    hariH ? 'text-white/65' : 'text-[#0D0D0D]/60',
                  )}
                >
                  {p.label}
                </span>
                <h3 className="text-xl md:text-2xl font-black uppercase leading-none tracking-tight">
                  {p.judul}
                </h3>
              </div>

              {status === 'aktif' && (
                <span className="shrink-0 rounded-full bg-[#F7E608] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0D0D0D]">
                  Berlaku Sekarang
                </span>
              )}
              {status === 'lewat' && (
                <span className="shrink-0 rounded-full bg-black/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Sudah Berakhir
                </span>
              )}
              {status === 'nanti' && (
                <span
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider',
                    hariH ? 'bg-white/15 text-white' : 'bg-black/10',
                  )}
                >
                  Segera
                </span>
              )}
            </div>

            {/* Persen jadi blok kuning supaya tangganya (2 → 3 → 4) langsung
                tertangkap mata, rinciannya di sebelah. */}
            <ul className="mt-5 flex flex-col gap-2">
              {p.tier.map((t) => (
                <li
                  key={t.persen}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5',
                    hariH ? 'bg-white/[0.07]' : 'bg-[#F5F5F5]',
                  )}
                >
                  <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-[#F7E608] text-xl font-black text-[#0D0D0D]">
                    {t.persen}%
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-black uppercase">
                      Maks. {t.maks}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        hariH ? 'text-white/65' : 'text-[#0D0D0D]/65',
                      )}
                    >
                      Min. belanja {t.minBelanja}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
