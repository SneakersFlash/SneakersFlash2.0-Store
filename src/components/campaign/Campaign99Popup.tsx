'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import {
  CAMPAIGN_99_BERAKHIR,
  CAMPAIGN_99_HREF,
  CAMPAIGN_99_PERIODE,
} from '@/lib/campaign/next-in-rotation-99';

/**
 * Pop-up campaign 9.9 di beranda.
 *
 * Muncul sesaat setelah beranda terbuka, bertahan 5 detik, lalu menutup
 * sendiri. Diklik di mana pun → halaman /9-9-sale.
 *
 * Desainnya sengaja meniru header banner /9-9-sale (strip promo kuning, latar
 * grid BG_LAYOUT, kunci visual, potongan selotip, panel kuning penuh) supaya
 * orang yang mengkliknya mendarat di halaman yang terasa jelas sama — bukan
 * dua kreatif berbeda yang kebetulan menuju satu tempat.
 *
 * Seperti tombol mengambangnya, pop-up ini mematikan dirinya sendiri begitu
 * campaign lewat: mencabutnya tidak butuh deploy.
 */

/** Jeda sebelum muncul — memberi ruang buat elemen terbesar beranda selesai render. */
const JEDA_MUNCUL_MS = 900;

/** Lama tampil sebelum menutup sendiri. Ini angka yang diminta: 5 detik. */
const DURASI_TAMPIL_MS = 5000;

/**
 * Sekali per sesi peramban. Beranda sering dikunjungi berkali-kali dalam satu
 * kunjungan (balik dari produk, dari keranjang, dari pencarian) — tanpa ini,
 * pop-up yang sama menghadang orang yang sudah melihatnya. Ubah ke `false`
 * kalau memang mau muncul di setiap pembukaan beranda.
 */
const SEKALI_PER_SESI = true;
const KUNCI_SESI = 'popup-99-tampil';

/** Potongan selotip miring — murni hiasan, sama seperti di hero. */
function Selotip({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute block ${className}`} />;
}

const STRIP = [
  '9.9 Next In Rotation',
  'Disc. Up To 70%',
  'Extra Voucher 300K',
  '100% Original',
];

export function Campaign99Popup() {
  const pathname = usePathname();
  const kurangiGerak = useReducedMotion();

  const [tampil, setTampil] = useState(false);
  const [berjalan, setBerjalan] = useState(true); // jeda hitung mundur saat disentuh

  const tutup = useCallback(() => setTampil(false), []);

  // Keputusan "campaign masih hidup atau tidak" diambil sesudah mount: kalau
  // dihitung saat render server, jawabannya ikut jam build, bukan jam pembeli.
  //
  // Penandaan "sudah pernah tampil" sengaja ditulis DI DALAM timeout, bukan saat
  // efeknya jalan. React memasang-lepas-memasang ulang efek di mode ketat, jadi
  // menandai lebih awal berarti pemasangan kedua membaca tandanya sendiri dan
  // pop-up tidak pernah muncul sama sekali.
  useEffect(() => {
    if (pathname !== '/') return;
    if (Date.now() >= Date.parse(CAMPAIGN_99_BERAKHIR)) return;

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
          className="fixed inset-0 z-[9998] flex items-center justify-center px-5 font-rotation-99"
          role="dialog"
          aria-modal="true"
          aria-label="Promo 9.9 Next In Rotation"
        >
          {/* Latar gelap: sekali klik = tutup, tanpa ikut membuka campaign. */}
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
              href={CAMPAIGN_99_HREF}
              onClick={tutup}
              className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F7E608] focus-visible:ring-offset-2"
            >
              <span className="sr-only">
                Buka halaman 9.9 Next In Rotation — diskon sampai 70%
              </span>
            </Link>

            {/* Tombol tutup duduk DI ATAS lapisan tautan (z lebih tinggi),
                kalau tidak, kliknya diambil tautan dan pop-up malah pindah
                halaman. Kotak sentuhnya 44×44 sesuai ambang minimum. */}
            <button
              type="button"
              onClick={tutup}
              aria-label="Tutup promo 9.9"
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full text-[#0D0D0D] transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D0D0D]/85 shadow">
                <X className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
            </button>

            {/* ── Strip promo berjalan — pembuka yang sama dengan hero ── */}
            <div className="w-full overflow-hidden bg-[#F7E608] py-1.5 text-[#0D0D0D]">
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
                sudut 20px memakan hampir seluruh garisnya. */}
            <motion.div
              key={berjalan ? 'jalan' : 'jeda'}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: berjalan ? 0 : 1 }}
              transition={{
                duration: berjalan ? DURASI_TAMPIL_MS / 1000 : 0,
                ease: 'linear',
              }}
              className="h-1 w-full origin-left bg-[#0D0D0D]"
              aria-hidden="true"
            />

            {/* ── Badan: latar grid + kunci visual, seperti panel kiri hero ── */}
            <div className="relative bg-white bg-[url('/images/BG_LAYOUT.jpg')] bg-cover bg-center px-6 pb-6 pt-7">
              <Selotip className="left-3 top-2 h-4 w-16 rotate-[-8deg] bg-[#F7E608]" />

              <div className="relative flex flex-col items-center gap-3 text-center">
                <Image
                  src="/images/logo_square_2_trim.png"
                  alt="9.9 Next In Rotation — Different days call for different pairs"
                  width={1539}
                  height={1223}
                  // Pop-up ini cuma hidup 5 detik: gambar yang baru mendarat di
                  // detik ketiga sama saja dengan tidak ada.
                  priority
                  className="h-auto w-[190px]"
                />

                <div className="flex flex-col gap-0.5">
                  <span className="teks-kv-99 text-2xl uppercase leading-none text-[#0D0D0D]">
                    Disc. up to 70%
                  </span>
                  <span className="teks-kv-99 text-sm uppercase leading-tight text-[#0D0D0D]/75">
                    Extra Voucher up to 300K
                  </span>
                </div>

                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#0D0D0D]/65">
                  {CAMPAIGN_99_PERIODE}
                </span>
              </div>
            </div>

            {/* ── Kaki kuning: ajakan, mengambil peran panel kanan hero ── */}
            <div className="relative flex items-center justify-center gap-2 bg-[#F7E608] py-3.5 text-[#0D0D0D]">
              <span className="text-[13px] font-black uppercase tracking-widest">
                Belanja 9.9 Sekarang
              </span>
              <ArrowRight size={15} strokeWidth={3} />
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
