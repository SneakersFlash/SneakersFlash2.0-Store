'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import {
  SAVETAMBER_HREF,
  SAVETAMBER_NAMA,
  periodeSavetamberAktif,
  type PeriodeSavetamber,
} from '@/lib/campaign/savetamber';

/**
 * Pop-up voucher toko tiering SAVETAMBER di beranda.
 *
 * Menggantikan pop-up Clearance Sale (25 Sep 2026). Perilakunya sengaja sama
 * persis dengan pendahulunya — muncul sebentar setelah beranda terbuka,
 * bertahan 5 detik, menutup sendiri, sekali per sesi — yang diganti isinya.
 *
 * Tabel tier ikut jam pembeli: tier 25 Sep sampai tengah malam WIB, lalu tier
 * 26–30 Sep, lalu pop-up berhenti muncul sendiri — tanpa deploy.
 */

/** Jeda sebelum muncul — memberi ruang buat elemen terbesar beranda selesai render. */
const JEDA_MUNCUL_MS = 900;

/** Lama tampil sebelum menutup sendiri. */
const DURASI_TAMPIL_MS = 5000;

/**
 * Sekali per sesi peramban. Beranda sering dikunjungi berkali-kali dalam satu
 * kunjungan (balik dari produk, dari keranjang, dari pencarian) — tanpa ini,
 * pop-up yang sama menghadang orang yang sudah melihatnya.
 */
const SEKALI_PER_SESI = true;

/**
 * Kuncinya sengaja BEDA dari pop-up sebelumnya (`popup-clearance-tampil`).
 * Kalau dipakai ulang, sesi peramban yang masih hidup sudah tertandai "pernah
 * lihat" dan pop-up SAVETAMBER tidak akan pernah muncul buat mereka.
 */
const KUNCI_SESI = 'popup-savetamber-tampil';

/** Potongan selotip miring — murni hiasan. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

const STRIP = [
  'Voucher Toko Tiering',
  'Extra Disc. Up To 4%',
  SAVETAMBER_NAMA,
  '100% Original',
];

export function SavetamberPopup() {
  const pathname = usePathname();
  const kurangiGerak = useReducedMotion();

  const [periode, setPeriode] = useState<PeriodeSavetamber | null>(null);
  const [berjalan, setBerjalan] = useState(true); // jeda hitung mundur saat disentuh

  const tampil = periode !== null;
  const tutup = useCallback(() => setPeriode(null), []);

  // Periode diambil sesudah mount: kalau dihitung saat render server,
  // jawabannya ikut jam build/cache, bukan jam pembeli.
  //
  // Penandaan "sudah pernah tampil" sengaja ditulis DI DALAM timeout, bukan saat
  // efeknya jalan. React memasang-lepas-memasang ulang efek di mode ketat, jadi
  // menandai lebih awal berarti pemasangan kedua membaca tandanya sendiri dan
  // pop-up tidak pernah muncul sama sekali.
  useEffect(() => {
    if (pathname !== '/') return;
    if (!periodeSavetamberAktif()) return;

    if (SEKALI_PER_SESI) {
      try {
        if (sessionStorage.getItem(KUNCI_SESI) === '1') return;
      } catch {
        // Mode privat / storage diblokir: biarkan tampil, jangan bikin error.
      }
    }

    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KUNCI_SESI, '1');
      } catch {
        /* sama seperti di atas: bukan alasan untuk gagal */
      }
      setPeriode(periodeSavetamberAktif());
    }, JEDA_MUNCUL_MS);

    return () => clearTimeout(t);
  }, [pathname]);

  // Hitung mundur penutupan. Dijeda selama kursor/jari menahan kartu — orang
  // yang sedang membaca tabel tier tidak boleh kehilangan bacaannya.
  useEffect(() => {
    if (!tampil || !berjalan) return;
    const t = setTimeout(tutup, DURASI_TAMPIL_MS);
    return () => clearTimeout(t);
  }, [tampil, berjalan, tutup]);

  // Esc menutup, seperti dialog lain di toko.
  useEffect(() => {
    if (!tampil) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tutup();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tampil, tutup]);

  return (
    <AnimatePresence>
      {periode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center px-5"
          role="dialog"
          aria-modal="true"
          aria-label="Promo voucher SAVETAMBER"
        >
          {/* Latar gelap: sekali klik = tutup, tanpa ikut pindah ke voucher. */}
          <button
            type="button"
            aria-label="Tutup promo"
            onClick={tutup}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={kurangiGerak ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={kurangiGerak ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onMouseEnter={() => setBerjalan(false)}
            onMouseLeave={() => setBerjalan(true)}
            onTouchStart={() => setBerjalan(false)}
            onTouchEnd={() => setBerjalan(true)}
            className="relative w-full max-w-[340px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
          >
            {/* Seluruh kartu adalah satu tautan. Dibuat sebagai lapisan absolut,
                bukan pembungkus, supaya tombol tutup tidak jadi tautan bersarang
                di dalam tautan. */}
            <Link
              href={SAVETAMBER_HREF}
              onClick={tutup}
              className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6E70A] focus-visible:ring-offset-2"
            >
              <span className="sr-only">
                Klaim voucher SAVETAMBER — diskon sampai 4%
              </span>
            </Link>

            {/* Tombol tutup DI ATAS lapisan tautan (z lebih tinggi), kalau tidak
                kliknya diambil tautan. Kotak sentuhnya 44×44. */}
            <button
              type="button"
              onClick={tutup}
              aria-label="Tutup promo SAVETAMBER"
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D0D0D]/85 shadow">
                <X className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
            </button>

            {/* ── Strip berjalan ── */}
            <div className="w-full overflow-hidden bg-[#0D0D0D] py-1.5 text-white">
              <div className="flex w-max gap-6 animate-marquee88" aria-hidden="true">
                {[...STRIP, ...STRIP, ...STRIP, ...STRIP].map((teks, i) => (
                  <span
                    key={i}
                    className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.1em]"
                  >
                    {teks}
                  </span>
                ))}
              </div>
            </div>

            {/* Garis hitung mundur — di bawah strip, bukan di dasar kartu:
                di dasar, lengkung sudut 20px memakan hampir seluruh garisnya. */}
            <motion.div
              key={berjalan ? 'jalan' : 'jeda'}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: berjalan ? 0 : 1 }}
              transition={{
                duration: berjalan ? DURASI_TAMPIL_MS / 1000 : 0,
                ease: 'linear',
              }}
              className="h-1 w-full origin-left bg-[#F6E70A]"
              aria-hidden="true"
            />

            {/* ── Badan ── latar kisi titik dari gradient CSS, bukan gambar:
                pop-up 5 detik tidak boleh menunggu unduhan. */}
            <div className="relative bg-white bg-[radial-gradient(rgba(0,0,0,0.07)_1px,transparent_1px)] [background-size:14px_14px] px-5 pb-5 pt-6">
              <Selotip className="left-3 top-2 h-4 w-16 rotate-[-8deg] bg-[#F6E70A]" />

              <div className="relative flex flex-col items-center gap-3 text-center">
                <Image
                  src="/images/logo_basic.png"
                  alt="Sneakers Flash"
                  width={140}
                  height={36}
                  priority
                  className="h-6 w-auto object-contain"
                />

                <div className="flex flex-col items-center gap-1.5">
                  <h2 className="text-[30px] font-black uppercase leading-none tracking-tight text-[#0D0D0D]">
                    {SAVETAMBER_NAMA}
                  </h2>
                  <span className="rounded-full bg-[#0D0D0D] px-3.5 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                    {periode.label}
                  </span>
                </div>

                {/* Tabel tier: persen jadi blok kuning supaya mata langsung
                    menangkap tangganya (2 → 3 → 4), rincian di sebelahnya. */}
                <ul className="flex w-full flex-col gap-1.5">
                  {periode.tier.map((t) => (
                    <li
                      key={t.persen}
                      className="flex items-center gap-3 rounded-xl border border-[#0D0D0D]/10 bg-white px-2.5 py-2 text-left"
                    >
                      <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F6E70A] text-[18px] font-black text-[#0D0D0D]">
                        {t.persen}%
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="text-[13px] font-black uppercase text-[#0D0D0D]">
                          Maks. {t.maks}
                        </span>
                        <span className="text-[11px] font-semibold text-[#0D0D0D]/65">
                          Min. belanja {t.minBelanja}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Kaki: ajakan ── */}
            <div className="relative flex items-center justify-center gap-2 bg-[#0D0D0D] py-3.5 text-white">
              <span className="text-[13px] font-black uppercase tracking-widest">
                Klaim Vouchernya
              </span>
              <ArrowRight size={15} strokeWidth={3} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
