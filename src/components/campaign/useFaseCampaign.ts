"use client";

import { useEffect, useState } from "react";

export type FaseCampaign = "pra" | "berjalan" | "selesai";

export interface StatusCampaign {
  /** null selama belum mount — jangan render label/timer sebelum ini terisi. */
  fase: FaseCampaign | null;
  label: string;
  /** Tanggal yang sedang dihitung mundur. */
  target: string;
}

/**
 * Fase campaign, dihitung SESUDAH mount.
 *
 * Versi generik dari useFaseCampaign88 — tanggalnya dikirim pemanggil supaya
 * satu hook bisa dipakai banyak campaign.
 *
 * Kalau fase dihitung saat render, server dan klien bisa menghasilkan label
 * berbeda dan React melempar hydration mismatch — apalagi halaman campaign
 * di-prerender dan di-cache, sehingga "jam server" bisa terpaut jauh dari jam
 * pembeli.
 */
export function useFaseCampaign(
  mulai: string,
  berakhir: string,
): StatusCampaign {
  const [fase, setFase] = useState<FaseCampaign | null>(null);

  useEffect(() => {
    const hitung = (): FaseCampaign => {
      const now = Date.now();
      if (now < Date.parse(mulai)) return "pra";
      if (now < Date.parse(berakhir)) return "berjalan";
      return "selesai";
    };

    setFase(hitung());
    const timer = setInterval(() => setFase(hitung()), 1000);
    return () => clearInterval(timer);
  }, [mulai, berakhir]);

  const label =
    fase === "pra"        ? "Dimulai Dalam:"
    : fase === "berjalan" ? "Berakhir Dalam:"
    : fase === "selesai"  ? "Sale Sudah Berakhir"
    : "";

  return {
    fase,
    label,
    target: fase === "pra" ? mulai : berakhir,
  };
}
