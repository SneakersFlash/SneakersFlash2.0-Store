/**
 * ONE MORE THING — campaign spin kode unik dari folded card paket marketplace.
 *
 * Sumber desain: docs/one-more-thing/design/reference.dc.html (port apa adanya).
 * Spek: docs/one-more-thing/HANDOFF.md.
 *
 * File ini memegang SATU-SATUNYA peta slot roda di sisi storefront. Backend
 * wajib memakai urutan yang sama persis (HANDOFF §1 "Wheel slot order"), karena
 * server yang memilih slotIndex dan roda cuma berhenti di sana.
 */

export type RewardKey =
  | "FP_50K"
  | "FP_100K"
  | "FP_150K"
  | "SOCKS"
  | "DOUBLE_BOX";
export type RewardType = "FLASH_POINT" | "PHYSICAL";

/** Urutan slot = urutan warna conic-gradient: kuning, terang, ink, terang, kuning, terang, ink, terang. */
export const OMT_SLOT_MAP: readonly RewardKey[] = [
  "FP_50K",
  "SOCKS",
  "FP_100K",
  "DOUBLE_BOX",
  "FP_150K",
  "SOCKS",
  "FP_50K",
  "DOUBLE_BOX",
] as const;

export const OMT_SLOT_DEG = 360 / OMT_SLOT_MAP.length; // 45

/** Teks di tiap juring + warna tulisannya (ikut warna juring). */
export const OMT_SEGMENTS: { top: string; cap: string; fg: string }[] = [
  { top: "50K", cap: "Flash Point", fg: "#040707" },
  { top: "Kaos", cap: "kaki", fg: "#111213" },
  { top: "100K", cap: "Flash Point", fg: "#ffffff" },
  { top: "Double", cap: "box", fg: "#111213" },
  { top: "150K", cap: "Flash Point", fg: "#040707" },
  { top: "Kaos", cap: "kaki", fg: "#111213" },
  { top: "50K", cap: "Flash Point", fg: "#ffffff" },
  { top: "Double", cap: "box", fg: "#111213" },
];

/** Info tampilan per jenis reward: medali hasil + kalimat deskripsi. */
export const OMT_REWARDS: Record<
  RewardKey,
  { type: RewardType; top: string; cap: string; value?: string; name?: string }
> = {
  FP_50K: {
    type: "FLASH_POINT",
    top: "50K",
    cap: "Flash Point",
    value: "Rp 50.000",
  },
  FP_100K: {
    type: "FLASH_POINT",
    top: "100K",
    cap: "Flash Point",
    value: "Rp 100.000",
  },
  FP_150K: {
    type: "FLASH_POINT",
    top: "150K",
    cap: "Flash Point",
    value: "Rp 150.000",
  },
  SOCKS: { type: "PHYSICAL", top: "Kaos", cap: "kaki", name: "kaos kaki" },
  DOUBLE_BOX: {
    type: "PHYSICAL",
    top: "Double",
    cap: "box",
    name: "double box",
  },
};

/** Copy final dari PDF "COPY REVISION / 19 NOV 2026" — JANGAN diubah. */
export const OMT_COPY = {
  codeInvalid: "Kode tidak valid. Periksa kembali kode pada stiker di kartu.",
  codeUsed:
    "Kode ini sudah digunakan. Satu kode hanya berlaku untuk satu kali spin.",
  // Tidak ada di PDF/handoff — HANDOFF §4 cuma minta "generic error". Perlu disetujui.
  genericError: "Terjadi kendala. Coba lagi beberapa saat.",
};

export function rewardDescription(key: RewardKey): string {
  const r = OMT_REWARDS[key];
  return r.type === "FLASH_POINT"
    ? `Kamu dapat Flash Point senilai ${r.value}. Gunakan saat pembelian berikutnya di website sesuai ketentuan.`
    : `Kamu dapat ${r.name}. Klaim bersama pesanan website berikutnya sesuai ketentuan.`;
}

/**
 * Nilai yang MASIH MENUNGGU keputusan (HANDOFF §5). Sengaja dibiarkan berupa
 * placeholder yang kelihatan jelas di halaman — jangan diisi tebakan.
 */
export const OMT_PENDING = {
  startDate: process.env.NEXT_PUBLIC_OMT_START_DATE || "[TANGGAL MULAI]",
  endDate: process.env.NEXT_PUBLIC_OMT_END_DATE || "[TANGGAL BERAKHIR]",
  csWhatsapp: process.env.NEXT_PUBLIC_OMT_CS_WHATSAPP || "[NOMOR WHATSAPP CS]",
  instagramUrl: process.env.NEXT_PUBLIC_OMT_INSTAGRAM_URL || "[LINK INSTAGRAM]",
};

/** Sudut putar akhir supaya pointer (di atas) jatuh di tengah slot. HANDOFF §1. */
export function spinTarget(windRot: number, slotIndex: number): number {
  const mod = ((windRot % 360) + 360) % 360;
  return (
    windRot -
    mod +
    360 * 6 +
    (360 - (slotIndex * OMT_SLOT_DEG + OMT_SLOT_DEG / 2))
  );
}
