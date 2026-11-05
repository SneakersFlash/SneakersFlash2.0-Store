"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils/formatPrice";

export interface HargaTeaserInfo {
  /** Harga promo yang BELUM berlaku. */
  harga: number;
  /** Label pendek, mis. "Harga 11.11". */
  label: string;
  /** Teks kapan mulai berlaku, mis. "mulai 11 Nov". */
  keterangan: string;
  /** ISO dengan zona waktu — sesudah jam ini label hilang sendiri. */
  berlakuMulai: string;
}

/**
 * Label harga promo yang akan datang, di bawah harga normal kartu produk.
 *
 * Sengaja TIDAK menggantikan harga normal: sebelum promo buka, harga yang bisa
 * dibayar tetap harga normal, dan label ini cuma pengumuman. Begitu jamnya
 * lewat, backend sudah mengirim harga event sendiri, jadi label ini hilang
 * (dicek sesudah mount supaya render server = klien).
 */
export function HargaTeaser({ info }: { info: HargaTeaserInfo }) {
  const [lewat, setLewat] = useState(false);

  useEffect(() => {
    const cek = () => setLewat(Date.now() >= Date.parse(info.berlakuMulai));
    cek();
    const t = setInterval(cek, 30_000);
    return () => clearInterval(t);
  }, [info.berlakuMulai]);

  if (lewat) return null;

  return (
    <div className="mb-1.5 rounded bg-[#E50012] px-1.5 py-1 text-white leading-tight">
      <span className="block text-[9px] lg:text-[10px] font-bold uppercase tracking-wider opacity-90">
        {info.label} · {info.keterangan}
      </span>
      <span className="block text-[12px] lg:text-[14px] font-black">
        {formatPrice(info.harga)}
      </span>
    </div>
  );
}
