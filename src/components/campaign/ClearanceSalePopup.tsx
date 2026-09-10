'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import {
  CLEARANCE_BERAKHIR,
  CLEARANCE_DISKON,
  CLEARANCE_HREF,
  CLEARANCE_PERIODE,
} from '@/lib/campaign/clearance-sale';

/**
 * Pop-up Clearance Sale di beranda.
 *
 * Turunan langsung dari pop-up 9.9 yang dicabut 10 Sep 2026: perilakunya
 * (muncul sebentar setelah beranda terbuka, bertahan 5 detik, menutup sendiri,
 * sekali per sesi) sengaja dipertahankan persis — yang diganti cuma isinya.
 *
 * Warnanya hitam-putih, BUKAN kuning campaign: pita Clearance di kartu produk
 * hitam-putih, dan pop-up yang kuning akan terasa seperti campaign lain yang
 * kebetulan menuju halaman clearance.
 *
 * Ia mematikan dirinya sendiri sesudah CLEARANCE_BERAKHIR — mencabutnya tidak
 * butuh deploy.
 */

/** Jeda sebelum muncul — memberi ruang buat elemen terbesar beranda selesai render. */
const JEDA_MUNCUL_MS = 900;

/** Lama tampil sebelum menutup sendiri. */
const DURASI_TAMPIL_MS = 5000;

/**
 * Sekali per sesi peramban. Beranda sering dikunjungi berkali-kali dalam satu
 * kunjungan (balik dari produk, dari keranjang, dari pencarian) — tanpa ini,
 * pop-up yang sama menghadang orang yang sudah melihatnya. Ubah ke `false`
 * kalau memang mau muncul di setiap pembukaan beranda.
 */
const SEKALI_PER_SESI = true;

/**
 * Kuncinya sengaja BEDA dari kunci pop-up 9.9 (`popup-99-tampil`). Kalau
 * dipakai ulang, orang yang sesi peramban-nya masih hidup dari kunjungan
 * sebelumnya sudah tertandai "pernah lihat" dan tidak akan pernah melihat
 * pop-up clearance-nya.
 */
const KUNCI_SESI = 'popup-clearance-tampil';

/** Potongan selotip miring — murni hiasan. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

const STRIP = [
  'Clearance Sale',
  'Disc. Up To 70%',
  'Stok Terbatas',
  '100% Original',
];

export function ClearanceSalePopup() {
  const pathname = usePathname();
  const kurangiGerak = useReducedMotion();

  const [tampil, setTampil] = useState(false);
  const [berjalan, setBerjalan] = useState(true); // jeda hitung mundur saat disentuh

  const tutup = useCallback(() => setTampil(false), []);

  // Keputusan "event masih hidup atau tidak" diambil sesudah mount: kalau
  // dihitung saat render server, jawabannya ikut jam build, bukan jam pembeli.
  //
  // Penandaan "sudah pernah tampil" sengaja ditulis DI DALAM timeout, bukan saat
  // efeknya jalan. React memasang-lepas-memasang ulang efek di mode ketat, jadi
  // menandai lebih awal berarti pemasangan kedua membaca tandanya sendiri dan
  // pop-up tidak pernah muncul sama sekali.
  useEffect(() => {
    if (pathname !== '/') return;
    if (Date.now() >= Date.parse(CLEARANCE_BERAKHIR)) return;

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
      setTampil(true);
    }, JEDA_MUNCUL_MS);

    return () => clearTimeout(t);
  }, [pathname]);

  // Hitung mundur penutupan. Dijeda selama kursor/jari menahan kartu — orang
  // yang sedang membaca tidak boleh kehilangan bacaannya di tengah jalan.
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
      {tampil && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center px-5"
          role="dialog"
          aria-modal="true"
          aria-label="Promo Clearance Sale"
        >
          {/* Latar gelap: sekali klik = tutup, tanpa ikut membuka eventnya. */}
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
                di dalam tautan — pembaca layar tersesat kalau begitu. */}
            <Link
              href={CLEARANCE_HREF}
              onClick={tutup}
              className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6E70A] focus-visible:ring-offset-2"
            >
              <span className="sr-only">
                Buka halaman Clearance Sale — diskon sampai 70%
              </span>
            </Link>

            {/* Tombol tutup duduk DI ATAS lapisan tautan (z lebih tinggi),
                kalau tidak, kliknya diambil tautan dan pop-up malah pindah
                halaman. Kotak sentuhnya 44×44 sesuai ambang minimum. */}
            <button
              type="button"
              onClick={tutup}
              aria-label="Tutup promo Clearance Sale"
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D0D0D]/85 shadow">
                <X className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
            </button>

            {/* ── Strip berjalan: hitam-putih, sewarna pita Clearance di kartu ── */}
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

            {/* Garis hitung mundur: memberi tahu pop-up ini akan pergi sendiri,
                jadi tidak terasa seperti penghalang yang harus dilawan.
                Ditaruh di bawah strip, bukan di dasar kartu — di dasar, lengkung
                sudut 20px memakan hampir seluruh garisnya. Kuning brand supaya
                terlihat di antara dua blok hitam. */}
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

            {/* ── Badan ──
                Latar kisi titik dibuat dari gradient CSS, bukan berkas gambar:
                pop-up ini cuma hidup 5 detik, jadi apa pun yang harus diunduh
                dulu berisiko mendarat sesudah kartunya pergi. */}
            <div className="relative bg-white bg-[radial-gradient(rgba(0,0,0,0.07)_1px,transparent_1px)] [background-size:14px_14px] px-6 pb-6 pt-7">
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

                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-[28px] font-black uppercase leading-none tracking-tight text-[#0D0D0D]">
                    Clearance
                    <br />
                    Sale
                  </h2>

                  {/* Angka diskon dibalik jadi blok hitam: di kartu yang putih,
                      teks hitam biasa hilang di antara judul dan tanggal. */}
                  <span className="rounded-full bg-[#0D0D0D] px-3.5 py-1 text-[13px] font-black uppercase tracking-wide text-white">
                    {CLEARANCE_DISKON}
                  </span>
                </div>

                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#0D0D0D]/65">
                  {CLEARANCE_PERIODE}
                </span>
              </div>
            </div>

            {/* ── Kaki: ajakan ── */}
            <div className="relative flex items-center justify-center gap-2 bg-[#0D0D0D] py-3.5 text-white">
              <span className="text-[13px] font-black uppercase tracking-widest">
                Belanja Clearance Sekarang
              </span>
              <ArrowRight size={15} strokeWidth={3} />
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
