/**
 * Sumber tunggal data campaign "Freedom in Every Step" (Kemerdekaan).
 *
 * Kurasi produknya SENGAJA masih meminjam daftar campaign 8.8 — halaman ini
 * dibuat untuk dilihat dulu bentuknya, isinya menyusul. Begitu daftar barangnya
 * final, ganti dua re-export di bawah dengan daftar SKU sendiri; struktur
 * halaman tidak perlu disentuh.
 */

import {
  SKU_PAIRS as SKU_PAIRS_88,
  SKU_FLASH_HOUR as SKU_FLASH_HOUR_88,
} from "./infinite-deals-88";

/** WIB = UTC+7, ditulis eksplisit supaya tidak ikut zona waktu server. */
export const FREEDOM_MULAI = "2026-08-13T00:00:00+07:00";
export const FREEDOM_BERAKHIR = "2026-08-17T23:59:59+07:00";

export const FREEDOM_HREF = "/freedom-in-every-step";
export const FREEDOM_NAMA = "Freedom in Every Step";

/** Sementara: sama persis dengan kurasi 8.8. */
export const SKU_PAIRS = SKU_PAIRS_88;
export const SKU_FLASH_HOUR = SKU_FLASH_HOUR_88;
