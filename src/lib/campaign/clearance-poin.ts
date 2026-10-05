/**
 * Klaim 100.000 FlashPoint lewat pop-up di halaman Clearance Sale.
 *
 * Tanggal di sini HARUS sama dengan `CLEARANCE_POINTS_CLAIM` di backend
 * (`src/common/constants/loyalty.ts`). Backend yang memutuskan boleh/tidaknya
 * klaim; angka di sini cuma supaya pop-up berhenti tampil tepat waktu.
 */
export const CLEARANCE_POIN_JUMLAH = 100000;
export const CLEARANCE_POIN_LABEL = "100K";
export const CLEARANCE_POIN_HREF = "/events/clearance-sale";
export const CLEARANCE_POIN_MULAI = "2026-10-05T00:00:00+07:00";
/** Eksklusif: berlaku sampai 11 Okt 2026 23:59 WIB. */
export const CLEARANCE_POIN_BERAKHIR = "2026-10-12T00:00:00+07:00";

export function klaimPoinClearanceAktif(now: Date = new Date()): boolean {
  return (
    now >= new Date(CLEARANCE_POIN_MULAI) &&
    now < new Date(CLEARANCE_POIN_BERAKHIR)
  );
}
