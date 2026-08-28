"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  GAME_MULAI,
  GAME_SELESAI,
  RODA_CX,
  RODA_CY,
  RODA_R,
  RODA_SRC,
} from "@/lib/game/merdeka-game";

const HREF = "/merdeka-game";

/**
 * Pemotongan roda jadi lingkaran tombol.
 *
 * Gambar rodanya TIDAK bisa dipakai apa adanya: jarum segitiganya ikut tergambar
 * di PNG yang sama, di atas piringan. Kalau seluruh gambar diputar, jarumnya ikut
 * berputar dan tidak menunjuk apa pun - persoalan yang sama sudah dipecahkan di
 * PrizeWheel, dan angkanya dipakai ulang di sini alih-alih dikira-kira.
 *
 * Piringannya dikurung lingkaran (RODA_CX/CY/R) lalu diputar; jarumnya digambar
 * ulang dalam keadaan diam. Kebetulan yang membantu: lingkaran piringan mulai di
 * 4,83% tinggi gambar sementara jarum bawaannya berakhir di 5,2%, jadi
 * pemotongan ini sekaligus membuang jarum yang menempel di gambar.
 *
 * SKALA melebarkan gambar sampai diameter piringan sama dengan diameter tombol;
 * GESER_* menggeser pusat piringan ke tengah tombol. Keduanya DITURUNKAN dari
 * konstanta, bukan angka hasil coba-coba - kalau asetnya diganti dan RODA_*
 * diukur ulang, tombol ini ikut benar sendiri tanpa disentuh.
 */
const SKALA = 1 / (2 * RODA_R);
const GESER_X = -(RODA_CX * SKALA - 0.5) * 100;
const GESER_Y = -(RODA_CY * SKALA - 0.5) * 100;

/**
 * Tombol mengambang menuju Merdeka Game.
 *
 * Duduk PERSIS di atas tombol chat: chat ada di `bottom-[80px] lg:bottom-5`
 * dengan tinggi 56px, jadi 80+56+12 = 148 dan 20+56+12 = 88. Kalau tombol chat
 * dipindah, dua angka ini ikut dipindah.
 *
 * z-40, satu tingkat DI BAWAH chat (z-50), dan itu disengaja: panel chat terbuka
 * di koordinat yang hampir sama (`bottom-[150px] lg:bottom-[88px]`). Dengan z-40
 * panel putihnya menutupi tombol ini saat chat dibuka - lebih rapi daripada dua
 * lapisan yang saling tindih setengah-setengah.
 */
export function MerdekaFloatingButton() {
  const pathname = usePathname();
  const kurangiGerak = useReducedMotion();
  const [tampil, setTampil] = useState(false);

  // Keputusan "campaign masih jalan atau belum" diambil SESUDAH mount. Kalau
  // dihitung saat render pertama, nilainya ikut ter-prerender lalu tersimpan di
  // cache - tombolnya bisa awet setelah campaign lewat, atau hilang sebelum
  // mulai, tergantung kapan halamannya kebetulan dibangun.
  useEffect(() => {
    const sekarang = Date.now();
    if (sekarang < Date.parse(GAME_MULAI)) return;
    if (sekarang >= Date.parse(GAME_SELESAI)) return;

    // Jeda kecil supaya tombolnya masuk setelah halaman tenang, bukan ikut
    // berebut perhatian di detik pertama.
    const t = setTimeout(() => setTampil(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Percuma di halaman gamenya sendiri; di checkout jangan menarik orang keluar
  // dari alur bayar.
  const disembunyikan =
    pathname === HREF ||
    pathname.startsWith(`${HREF}/`) ||
    pathname.startsWith("/checkout") ||
    // /links dipakai sebagai link-in-bio; tombol melayang merusak tampilannya.
    pathname === "/links";

  if (disembunyikan) return null;

  return (
    <Link
      href={HREF}
      title="Main Merdeka Game - The 17-Box Climb"
      aria-label="Main Merdeka Game, The 17-Box Climb"
      className={cn(
        "group fixed right-5 z-40 block h-14 w-14 rounded-full",
        "bottom-[148px] lg:bottom-[88px]",
        "transition-all duration-300 ease-out active:scale-95",
        tampil
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      {/* Denyut emas - bahasa visual yang sama dengan tombol campaign sebelumnya.
          Di belakang piringan, dan mati kalau pengunjung minta gerakan dikurangi. */}
      {!kurangiGerak && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-[#F2B33D] opacity-20 [animation-duration:2.6s]"
        />
      )}

      {/* Piringan roda, terkurung lingkaran lalu diputar pelan. */}
      <span className="absolute inset-0 overflow-hidden rounded-full border-2 border-[#F2B33D] bg-[#080D22] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-[1.06]">
        <motion.img
          src={RODA_SRC}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute max-w-none select-none"
          style={{
            width: `${SKALA * 100}%`,
            height: `${SKALA * 100}%`,
            left: `${GESER_X}%`,
            top: `${GESER_Y}%`,
          }}
          animate={kurangiGerak ? undefined : { rotate: 360 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        />
      </span>

      {/* Jarum diam di atas piringan, meniru roda aslinya. Segitiga CSS, bukan
          potongan gambar - di ukuran 56px potongan jarumnya cuma jadi bubur. */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[-3px] h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#F2B33D] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      />
    </Link>
  );
}
