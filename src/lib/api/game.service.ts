import apiClient from "./client";

/**
 * Klien API game Kemerdekaan.
 *
 * Perhatikan yang TIDAK ada di sini: tidak ada fungsi untuk memilih hadiah.
 * Juring pemenang ditentukan backend dan dikirim lewat balasan `finish`, jadi
 * mengutak-atik berkas ini tidak mengubah hadiah siapa pun.
 */

export type HasilRonde =
  | { outcome: "no_prize"; boxes: number }
  | {
      outcome: "points";
      slotIndex: number;
      prizeLabel: string;
      pointsAwarded: number;
      balanceAfter: number;
    }
  | { outcome: "already_won"; slotIndex: number; prizeLabel: string }
  | {
      outcome: "apparel_won";
      slotIndex: number;
      prizeLabel: string;
      claimCode: string;
      perluVerifikasiEmail: true;
    };

export interface StatusGame {
  open: boolean;
  startAt: string;
  endAt: string;
  target: number;
  timeLimitSec: number;
  playsPerDay: number;
  sudahMainHariIni: boolean;
  nextResetAt: string;
  canPlay: boolean;
  hasilTerakhir: {
    outcome: string | null;
    boxes: number;
    reachedTop: boolean;
    pointsAwarded: number;
    prizeLabel: string | null;
  } | null;
}

export interface HasilVerifikasi {
  status: "verified";
  code: string;
  prizeLabel: string;
  nama: string | null;
  whatsappUrl: string;
}

export interface KlaimSaya {
  code: string;
  status: "pending_verification" | "verified" | "fulfilled" | "expired";
  prizeLabel: string;
  createdAt: string;
  verifiedAt: string | null;
  fulfilledAt: string | null;
  whatsappUrl: string | null;
}

export const gameService = {
  async status(): Promise<StatusGame> {
    const { data } = await apiClient.get<StatusGame>("/game/merdeka/status");
    return data;
  },

  /** Memotong jatah hari ini. Panggil tepat saat ronde dimulai, bukan lebih awal. */
  async start(): Promise<{
    nonce: string;
    target: number;
    timeLimitSec: number;
  }> {
    const { data } = await apiClient.post("/game/merdeka/start");
    return data;
  },

  async finish(body: {
    nonce: string;
    boxes: number;
    reachedTop: boolean;
  }): Promise<HasilRonde> {
    const { data } = await apiClient.post<HasilRonde>(
      "/game/merdeka/finish",
      body,
    );
    return data;
  },

  /** Endpoint publik: dipanggil dari tautan email, bisa jadi tanpa sesi login. */
  async verifikasiKlaim(token: string): Promise<HasilVerifikasi> {
    const { data } = await apiClient.post<HasilVerifikasi>(
      "/game/merdeka/claims/verify",
      { token },
    );
    return data;
  },

  async klaimSaya(): Promise<KlaimSaya[]> {
    const { data } = await apiClient.get<KlaimSaya[]>("/game/merdeka/claims/me");
    return data;
  },
};
