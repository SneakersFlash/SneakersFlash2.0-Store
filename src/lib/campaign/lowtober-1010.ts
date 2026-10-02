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

/**
 * THE BIG DROP — highlight utama, daftar dari user 2 Okt 2026 (131 artikel,
 * semuanya salinan clearance `LC-`). Kalau diisi, SEMUA barang berstok
 * ditampilkan (tidak dipotong JUMLAH_BIG_DROP) dan section lain mengalah.
 */
export const SKU_BIG_DROP: string[] = [
  "LC-JH9079",
  "LC-U997GY",
  "LC-DM8465800",
  "LC-1127929MCN",
  "LC-31028204",
  "LC-Fq6965700",
  "LC-100211907",
  "LC-HV3860783",
  "LC-100032921",
  "LC-Fn5215141",
  "LC-IG1811",
  "LC-URC42LB",
  "LC-IH4823",
  "LC-UA900DC2",
  "LC-DJ5982601",
  "LC-104451BKW",
  "LC-GM500TPG",
  "LC-FB2207103",
  "LC-JH8644",
  "LC-HQ6020600",
  "LC-FZ4110001",
  "LC-HF0263400",
  "LC-FQ8762100",
  "LC-FV2925300",
  "LC-1155131SSTC",
  "LC-UWRPDTBK",
  "LC-UWRPDCON",
  "LC-DQ1470002",
  "LC-232686NVOR",
  "LC-U998TA",
  "LC-100228695",
  "LC-1155111FSTS",
  "LC-1147850STLC",
  "LC-A03277C",
  "LC-IE7798",
  "LC-CZ0775001",
  "LC-HQ4425",
  "LC-FJ0698100",
  "LC-39902803",
  "LC-ID2151",
  "LC-ID2879",
  "LC-IF2391",
  "LC-1160050NCWT",
  "LC-IE1763",
  "LC-100208921",
  "LC-U998GR",
  "LC-GY9353",
  "LC-DZ2795702",
  "LC-UWRPDMMB",
  "LC-U998BG",
  "LC-1162030HSK",
  "LC-39468701",
  "LC-U9060NRH",
  "LC-UWRPDMMA",
  "LC-FD2110001",
  "LC-DM4044108",
  "LC-U998OB",
  "LC-BB650RPC",
  "LC-FD1437401",
  "LC-IE7766",
  "LC-IE7793",
  "LC-FQ8226101",
  "LC-ID9637",
  "LC-GW8588",
  "LC-37990503",
  "LC-232965TPE",
  "LC-100209934",
  "LC-DM4044102",
  "LC-DV2440002",
  "LC-ID5774",
  "LC-38469211",
  "LC-DV2440001",
  "LC-FQ9079300",
  "LC-39771705",
  "LC-1127929DHN",
  "LC-378038170",
  "LC-30969105",
  "LC-39684101",
  "LC-VN000EYEBLK",
  "LC-DV1305433",
  "LC-HQ8578",
  "LC-177964BKRD",
  "LC-MEVOZCG3",
  "LC-39857201",
  "LC-MEVOZFG3",
  "LC-UWRPDKOM",
  "LC-31040502",
  "LC-39934801",
  "LC-HQ6346",
  "LC-FD4849106",
  "LC-38754422",
  "LC-39311501",
  "LC-38469210",
  "LC-39311401",
  "LC-38660718",
  "LC-39652001",
  "LC-M475VTE",
  "LC-DN2158101",
  "LC-GV8750",
  "LC-DZ3497140",
  "LC-216259TPE",
  "LC-IE3232",
  "LC-IG6190",
  "LC-URC42EA",
  "LC-U998GB",
  "LC-38340111",
  "LC-38495804",
  "LC-38402401",
  "LC-GX0535",
  "LC-GW2415",
  "LC-38662201",
  "LC-CU9174600",
  "LC-38643002",
  "LC-CU7623002",
  "LC-A01392C",
  "LC-CU7623001",
  "LC-GX5591",
  "LC-CQ6639001",
  "LC-38636101",
  "LC-1201A942001",
  "LC-1201A942100",
  "LC-1203A641400",
  "LC-1203A594004",
  "LC-1203A600250",
  "LC-1203A603001",
  "LC-1203A603100",
  "LC-1203A606400",
  "LC-1203A330020",
  "LC-232862BBK",
  "LC-1201A476116",
  "LC-1202A360111",
];

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
