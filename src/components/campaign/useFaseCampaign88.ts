"use client";

import { useEffect, useState } from "react";
import {
  CAMPAIGN_88_MULAI,
  CAMPAIGN_88_BERAKHIR,
} from "@/lib/campaign/infinite-deals-88";

export type FaseCampaign = "pra" | "berjalan" | "selesai";

export interface StatusCampaign88 {
  /** null selama belum mount — jangan render label/timer sebelum ini terisi. */
  fase: FaseCampaign | null;
  label: string;
  /** Tanggal yang sedang dihitung mundur. */
  target: string;
}

/**
 * Fase campaign, dihitung SESUDAH mount.
 *
 * Kalau dihitung saat render, server dan klien bisa menghasilkan label berbeda
 * dan React melempar hydration mismatch — apalagi halaman ini di-prerender dan
 * di-cache, sehingga "jam server" bisa terpaut jauh dari jam pembeli.
 */
export function useFaseCampaign88(): StatusCampaign88 {
  const [fase, setFase] = useState<FaseCampaign | null>(null);

  useEffect(() => {
    const hitung = (): FaseCampaign => {
      const now = Date.now();
      if (now < Date.parse(CAMPAIGN_88_MULAI)) return "pra";
      if (now < Date.parse(CAMPAIGN_88_BERAKHIR)) return "berjalan";
      return "selesai";
    };

    setFase(hitung());
    const timer = setInterval(() => setFase(hitung()), 1000);
    return () => clearInterval(timer);
  }, []);

  const label =
    fase === "pra"        ? "Dimulai Dalam:"
    : fase === "berjalan" ? "Berakhir Dalam:"
    : fase === "selesai"  ? "Sale Sudah Berakhir"
    : "";

  return {
    fase,
    label,
    target: fase === "pra" ? CAMPAIGN_88_MULAI : CAMPAIGN_88_BERAKHIR,
  };
}
