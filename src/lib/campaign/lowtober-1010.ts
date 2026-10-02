/**
 * Sumber tunggal data campaign "10.10 LOWTOBER THE BIG DROP" (Oktober 2026).
 *
 * Dipakai bersama oleh halaman /10-10-sale, pop-up beranda, dan tombol
 * mengambangnya, supaya tanggal, tier voucher, dan kurasi tidak ditulis dua
 * kali dan tidak bisa selisih.
 *
 * Semua batas waktu ditulis dengan +07:00 eksplisit: yang menentukan periode
 * adalah jam WIB pembeli, bukan zona waktu server (kontainer berjalan di UTC).
 */

export const LOWTOBER_NAMA = "10.10 LOWTOBER";
export const LOWTOBER_SUBNAMA = "The Big Drop";
export const LOWTOBER_HREF = "/10-10-sale";

/** Awal road-to (tier pertama berlaku). */
export const LOWTOBER_MULAI = "2026-10-01T00:00:00+07:00";
/** Hero day 10.10 — tier kedua berlaku mulai jam ini. */
export const LOWTOBER_HARI_H = "2026-10-10T00:00:00+07:00";
/** Campaign selesai: pop-up & tombol mengambang berhenti muncul sendiri. */
export const LOWTOBER_BERAKHIR = "2026-10-11T00:00:00+07:00";

/** Rentang penuh campaign — dipakai untuk teks, bukan timer. */
export const LOWTOBER_PERIODE = "1 – 10 Oktober 2026";

/* ═══════════════════════════════════════════════════════════════════════════
   VOUCHER TOKO TIERING

   Angkanya SALINAN dari tabel `vouchers` campaign id 12 di backend
   (LOWTOBER-2/3/4 untuk 1–9 Okt, LOWTOBER1010-2/3/4 untuk 10 Okt). Pop-up cuma
   hidup 5 detik, jadi tidak menunggu API — kalau voucher di admin diubah, ubah
   juga di sini. Klaim yang sebenarnya tetap lewat VoucherClaimSection.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface TierLowtober {
  persen: number;
  maks: string;
  minBelanja: string;
}

export interface PeriodeLowtober {
  label: string;
  /** Teks pendek untuk kartu di halaman campaign. */
  judul: string;
  mulai: string;
  berakhir: string;
  tier: TierLowtober[];
}

/** Berurutan: periode pertama yang `berakhir`-nya belum lewat adalah yang tampil. */
export const LOWTOBER_PERIODE_VOUCHER: PeriodeLowtober[] = [
  {
    label: "1 – 9 Oktober",
    judul: "Road To 10.10",
    mulai: LOWTOBER_MULAI,
    berakhir: LOWTOBER_HARI_H,
    tier: [
      { persen: 2, maks: "35RB", minBelanja: "700RB" },
      { persen: 3, maks: "100RB", minBelanja: "1,5JT" },
      { persen: 4, maks: "150RB", minBelanja: "2JT" },
    ],
  },
  {
    label: "Khusus 10 Oktober",
    judul: "The Big Drop 10.10",
    mulai: LOWTOBER_HARI_H,
    berakhir: LOWTOBER_BERAKHIR,
    tier: [
      { persen: 2, maks: "50RB", minBelanja: "1JT" },
      { persen: 3, maks: "150RB", minBelanja: "1,5JT" },
      { persen: 4, maks: "300RB", minBelanja: "2,5JT" },
    ],
  },
];

/** Periode yang berlaku pada `sekarang`, atau null di luar jendela campaign. */
export function periodeLowtoberAktif(
  sekarang: number = Date.now(),
): PeriodeLowtober | null {
  if (sekarang < Date.parse(LOWTOBER_MULAI)) return null;
  return (
    LOWTOBER_PERIODE_VOUCHER.find((p) => sekarang < Date.parse(p.berakhir)) ??
    null
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   KURASI PRODUK

   Selama daftar SKU di bawah masih KOSONG, halaman mengambil barang reguler
   dari katalog lewat filter di `KUERI_*` — disengaja sampai list produk 10.10
   masuk.

   Begitu list masuk: isi array-nya dengan `sku_parent` (kode artikel), dan
   section itu otomatis berhenti memakai kueri fallback. Urutan array = urutan
   tayang.

   PENTING — salinan event punya prefiks sendiri (`FS-` / `LC-`). Filter
   `?skus=` backend mencocokkan PERSIS, jadi menulis kode telanjang untuk barang
   event bikin daftarnya memendek diam-diam, bukan error.
   ═══════════════════════════════════════════════════════════════════════════ */

/** THE BIG DROP — highlight utama. */
export const SKU_BIG_DROP: string[] = [];

/** KEEP MOVING — running & training. */
export const SKU_MOVING: string[] = [];

/** FRESH DROPS — rail geser barang terbaru. */
export const SKU_FRESH: string[] = [];

/* ── Kueri fallback ────────────────────────────────────────────────────────
   Dipakai hanya kalau daftar SKU di atas kosong. Sama dengan 9.9: kategori
   "Lifestyle/Casual" TIDAK bisa dipakai sebagai filter (garis miringnya bikin
   backend mengembalikan seluruh katalog tanpa error), jadi highlight diambil
   dari kurasi hype backend, lalu barang running dibuang dari situ di halaman.
   ── */

export const KUERI_BIG_DROP = {
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
export const JUMLAH_BIG_DROP = 12;
export const JUMLAH_MOVING = 8;
export const JUMLAH_FRESH = 10;
