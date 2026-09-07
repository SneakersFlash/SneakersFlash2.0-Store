/**
 * Sumber tunggal data campaign "9.9 NEXT IN ROTATION".
 *
 * Dipakai bersama oleh halaman /9-9-sale dan tombol mengambangnya, supaya
 * tanggal dan kurasinya tidak perlu ditulis dua kali dan tidak bisa selisih.
 *
 * Ide besarnya (dari creative brief): 9.9 adalah MOMEN BELI, "Next in Rotation"
 * adalah ALASAN memilih. Rotation dipecah jadi Daily → Active → Next?, dan
 * halaman ini bertugas mengisi slot "Next?" itu dengan barang yang benar-benar
 * ada stoknya.
 */

/** WIB = UTC+7, ditulis eksplisit supaya tidak ikut zona waktu server. */
export const CAMPAIGN_99_MULAI = "2026-09-08T00:00:00+07:00";
export const CAMPAIGN_99_BERAKHIR = "2026-09-09T23:59:59+07:00";

/** Rentang penuh campaign di sosial media — dipakai untuk teks, bukan timer. */
export const CAMPAIGN_99_PERIODE = "3 – 9 September 2026";

export const CAMPAIGN_99_HREF = "/9-9-sale";
export const CAMPAIGN_99_NAMA = "9.9 NEXT IN ROTATION";
export const CAMPAIGN_99_TAGLINE = "Different days call for different pairs.";

/* ═══════════════════════════════════════════════════════════════════════════
   KURASI PRODUK

   Selama daftar SKU di bawah masih KOSONG, halaman mengambil barang reguler
   dari katalog lewat filter di `KUERI_*` — itu keadaan yang disengaja sampai
   produk khusus 9.9 selesai disync.

   Begitu produk 9.9 masuk: isi array-nya dengan `sku_parent` (kode artikel),
   dan halaman otomatis berhenti memakai kueri fallback untuk slot itu. Tidak
   ada kode lain yang perlu disentuh.

   PENTING — salinan event punya prefiks sendiri. Kalau barangnya disync sebagai
   produk event (Flash Sale / Clearance), `sku_parent`-nya berprefiks `FS-` atau
   `LC-`. Filter `?skus=` backend mencocokkan PERSIS, jadi menulis kode telanjang
   untuk barang event bikin daftarnya memendek diam-diam, bukan error.
   ═══════════════════════════════════════════════════════════════════════════ */

/** 01 DAILY — lifestyle, netral, dipakai hampir tiap hari. */
export const SKU_DAILY: string[] = [];

/** 02 ACTIVE — running & training, buat hari yang lebih bergerak. */
export const SKU_ACTIVE: string[] = [];

/** FRESH PICKS — hero SKU / current favourites, bukan kategori rotation ketiga. */
export const SKU_FRESH: string[] = [];

/* ── Kueri fallback ────────────────────────────────────────────────────────
   Dipakai hanya kalau daftar SKU di atas kosong.

   Kenapa `categories` untuk Active tapi `curated` untuk Daily: kategori
   "Lifestyle/Casual" TIDAK bisa dipakai sebagai filter — garis miring di
   namanya membuat backend mengabaikan filternya dan mengembalikan seluruh
   katalog sepatu (915 produk), tanpa error. "Running"/"TRAINING" aman.
   Jadi Daily diambil dari kurasi hype backend, lalu barang Active dibuang
   dari daftarnya di halaman supaya dua section tidak menampilkan barang sama.
   ── */

export const KUERI_DAILY = {
  curated: true,
  type: "Footwear",
  limit: 48,
} as const;

export const KUERI_ACTIVE = {
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
export const JUMLAH_DAILY = 12;
export const JUMLAH_ACTIVE = 8;
export const JUMLAH_FRESH = 10;
