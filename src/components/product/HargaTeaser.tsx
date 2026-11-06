"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils/formatPrice";

export interface HargaTeaserInfo {
  /** Harga promo yang BELUM berlaku. */
  harga: number;
  /** Label pendek, mis. "Harga 11.11". */
  label: string;
  /** Teks kapan mulai berlaku, mis. "mulai 9 Nov". */
  keterangan: string;
  /** ISO dengan zona waktu — sesudah jam ini label hilang sendiri. */
  berlakuMulai: string;
}

const dua = (n: number) => String(n).padStart(2, "0");

/** "2h 14:03:22" — hari cuma ditulis kalau masih ada. */
function formatSisa(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hari = Math.floor(total / 86400);
  const jam = Math.floor((total % 86400) / 3600);
  const menit = Math.floor((total % 3600) / 60);
  const detik = total % 60;
  const jms = `${dua(jam)}:${dua(menit)}:${dua(detik)}`;
  return hari > 0 ? `${hari}h ${jms}` : jms;
}

/**
 * Label harga promo yang akan datang, di bawah harga normal kartu produk,
 * lengkap dengan hitung mundur ke jam mulai berlakunya.
 *
 * Sengaja TIDAK menggantikan harga normal: sebelum promo buka, harga yang bisa
 * dibayar tetap harga normal, dan label ini cuma pengumuman. Begitu jamnya
 * lewat, backend sudah mengirim harga event sendiri, jadi label ini hilang.
 *
 * Sisa waktu dihitung sesudah mount (render server = klien: "--:--:--"),
 * lalu berdetak tiap detik.
 */
export function HargaTeaser({ info }: { info: HargaTeaserInfo }) {
  const [sisa, setSisa] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.parse(info.berlakuMulai);
    const cek = () => setSisa(target - Date.now());
    cek();
    const t = setInterval(cek, 1000);
    return () => clearInterval(t);
  }, [info.berlakuMulai]);

  if (sisa !== null && sisa <= 0) return null;

  return (
    <div
      className="mb-1.5 rounded bg-[#F5E809] px-1.5 py-1 text-[#0D0D0D] leading-tight"
      aria-label={`${info.label} ${formatPrice(info.harga)}, ${info.keterangan}`}
    >
      {/* Baris "Harga 11.11 · mulai 9 Nov" dibuang atas permintaan user
          (6 Nov): dobel dengan timer. `label`/`keterangan` tetap dipakai
          sebagai aria-label. */}
      <span className="flex flex-wrap items-center gap-x-1 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider">
        <span className="opacity-90">Mulai dalam</span>
        <span className="font-mono tabular-nums">
          {sisa === null ? "--:--:--" : formatSisa(sisa)}
        </span>
      </span>
      <span className="block text-[12px] lg:text-[14px] font-black">
        {formatPrice(info.harga)}
      </span>
    </div>
  );
}
