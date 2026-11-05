/**
 * Sumber tunggal data campaign "11.11 YEAR END SALE" (November 2026).
 *
 * Dipakai bersama oleh halaman /11-11-sale, panel hitung mundur di beranda, dan
 * tombol mengambangnya, supaya tanggal dan kurasi tidak ditulis dua kali dan
 * tidak bisa selisih.
 *
 * Semua batas waktu ditulis dengan +07:00 eksplisit: yang menentukan periode
 * adalah jam WIB pembeli, bukan zona waktu server (kontainer berjalan di UTC).
 */

export const YEAR_END_NAMA = "11.11 YEAR END SALE";
export const YEAR_END_HREF = "/11-11-sale";

/** Awal road-to. */
export const YEAR_END_MULAI = "2026-11-05T00:00:00+07:00";
/** Hari-H 11.11 — hitung mundur road-to menuju jam ini. */
export const YEAR_END_HARI_H = "2026-11-11T00:00:00+07:00";
/** Campaign selesai: panel beranda & tombol mengambang hilang sendiri. */
export const YEAR_END_BERAKHIR = "2026-11-12T00:00:00+07:00";

/** Rentang penuh campaign — dipakai untuk teks, bukan timer. */
export const YEAR_END_PERIODE = "5 – 11 November 2026";

/**
 * Slug event 11.11 di backend (dibuat saat sheet harga diskon masuk).
 *
 * Panel event generik di beranda (EventCampaignSection) ikut menampilkan event
 * ini begitu produknya tersync — padahal beranda sudah punya panel 11.11
 * sendiri. Slug ini dipakai untuk menyaringnya supaya tidak tampil dobel.
 */
export const YEAR_END_EVENT_SLUG = "11-11-year-end-sale";

/* ═══════════════════════════════════════════════════════════════════════════
   KURASI PRODUK

   Selama daftar SKU di bawah masih KOSONG, halaman mengambil barang reguler
   dari katalog lewat filter di `KUERI_*` — disengaja sampai sheet harga 11.11
   masuk dan event-nya tersync.

   Begitu event tersync: isi array dengan `sku_parent` salinan event (BERIKUT
   prefiks event-nya, mis. `YE-<kode>`). Filter `?skus=` backend mencocokkan
   PERSIS, jadi kode telanjang bikin daftarnya memendek diam-diam, bukan error.
   Urutan array = urutan tayang.
   ═══════════════════════════════════════════════════════════════════════════ */

/** YEAR END DEALS — highlight utama, juga dipakai rail panel beranda. */
export const SKU_DEALS: string[] = [];

/** KEEP MOVING — running & training. */
export const SKU_MOVING: string[] = [];

/** FRESH DROPS — rail geser barang terbaru. */
export const SKU_FRESH: string[] = [];

/* ── Kueri fallback ────────────────────────────────────────────────────────
   Sama dengan 10.10: kategori "Lifestyle/Casual" TIDAK bisa dipakai sebagai
   filter (garis miringnya bikin backend mengembalikan seluruh katalog tanpa
   error), jadi highlight diambil dari kurasi hype backend.
   ── */

export const KUERI_DEALS = {
  curated: true,
  type: "Footwear",
  limit: 48,
} as const;

export const KUERI_MOVING = {
  categories: ["Running", "TRAINING"],
  type: "Footwear",
  limit: 48,
} as const;

export const KUERI_FRESH = {
  type: "Footwear",
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 48,
} as const;

/** Berapa produk yang tampil per section sesudah barang habis stok dibuang. */
export const JUMLAH_DEALS = 12;
export const JUMLAH_MOVING = 8;
export const JUMLAH_FRESH = 10;
/** Rail panel beranda sebelum "lihat semua". */
export const JUMLAH_BERANDA = 10;
