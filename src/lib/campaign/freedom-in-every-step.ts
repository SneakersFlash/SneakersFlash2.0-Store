/**
 * Sumber tunggal data campaign "Freedom in Every Step" (Kemerdekaan).
 *
 * Halaman campaign menyorot SEPULUH barang pilihan, bukan seluruh isi campaign.
 * Katalog lengkapnya (210 produk) tinggal di event backend dan dibuka lewat
 * tautan "Semua Produk" ke /events/freedom-in-every-step, jadi daftar panjang
 * itu tidak perlu ditulis ulang di sini. Kurasi yang sama juga dipakai section
 * event di beranda: sepuluh produk ini ditandai `is_highlight` di tabel
 * event_products, dan backend memakai penanda itu.
 *
 * PENTING soal prefiks `LC-`. Tiga dari sepuluh barang ini salinan clearance,
 * dan di katalog SF salinan clearance punya `sku_parent` sendiri yang berprefiks
 * `LC-`. Filter `?skus=` backend mencocokkan `sku_parent` PERSIS (meski tak peduli
 * besar-kecil huruf), jadi menulis kodenya telanjang bikin barangnya hilang dari
 * grid tanpa error. Jangan "rapikan" prefiks ini.
 *
 * Harga promonya TIDAK diatur di sini; angka di komentar cuma catatan saat
 * kurasi dibuat (14 Agt 2026). Yang berlaku adalah harga event di backend.
 */

/** WIB = UTC+7, ditulis eksplisit supaya tidak ikut zona waktu server. */
export const FREEDOM_MULAI = "2026-08-12T00:00:00+07:00";
export const FREEDOM_BERAKHIR = "2026-08-17T23:59:59+07:00";

/**
 * Jam belanja dibuka — BEDA dari jam campaign mulai.
 *
 * Campaign tayang 12 Agt supaya orang bisa lihat-lihat dan menyusun keranjang
 * lebih dulu, tapi pesanan baru boleh diselesaikan 15 Agt. Angka ini harus sama
 * dengan `events.checkout_opens_at` event id 9 di backend: yang menolak checkout
 * adalah backend, yang di sini cuma menghitung mundur dan menahan tombol supaya
 * pembeli tidak menabrak penolakan itu.
 */
export const FREEDOM_BELANJA_BUKA = "2026-08-15T00:00:00+07:00";

export const FREEDOM_HREF = "/freedom-in-every-step";
export const FREEDOM_NAMA = "Freedom in Every Step";

/**
 * Nama pendek untuk tempat sempit: menu navbar dan tombol mengambang.
 * "Freedom in Every Step" terlalu panjang untuk dua tempat itu.
 */
export const FREEDOM_LABEL_PENDEK = "Freedom Step";

/**
 * Voucher campaign. Jendelanya sama persis dengan jam belanja dibuka sampai
 * campaign berakhir (15-17 Agt), jadi tanggalnya memakai ulang dua konstanta di
 * atas — bukan ditulis lagi, supaya tidak bisa selisih.
 *
 * Kodenya dipakai storefront untuk mengenali voucher aslinya di daftar klaim:
 * selama voucher ini belum mulai, home menampilkan kartu bocoran; begitu yang
 * asli muncul di daftar, kartu bocorannya menyingkir sendiri.
 */
export const FREEDOM_VOUCHER_KODE = "FREEDOM17";

/** Slug event backend yang memuat katalog lengkap campaign beserta harganya. */
export const FREEDOM_EVENT_SLUG = "freedom-in-every-step";

/** Tautan "Semua Produk" dari halaman campaign: katalog penuh campaign. */
export const FREEDOM_SEMUA_PRODUK_HREF = `/events/${FREEDOM_EVENT_SLUG}`;

/**
 * Dipakai sebagai `limit` saat menarik grid — SENGAJA bukan `SKU_PAIRS.length`.
 *
 * Satu kode artikel bisa cocok ke lebih dari satu produk di katalog (ada
 * kembaran yang hanya beda besar-kecil huruf), sehingga memakai panjang array
 * bisa memotong produk terakhir tanpa gejala apa pun. Dilebihkan supaya kembaran
 * yang muncul belakangan tidak langsung memotong grid.
 */
export const FREEDOM_LIMIT_GRID = 40;

/**
 * Section "Pairs Worth Checking Out" — sepuluh barang pilihan campaign.
 *
 * Urutan array = urutan tayang, dan sama dengan `display_order` 0-9 di
 * event_products supaya beranda dan halaman campaign menyorot barang yang sama
 * dengan urutan yang sama. Kalau daftar ini diubah, ubah juga penanda
 * `is_highlight` di backend — kalau tidak, beranda dan halaman campaign
 * menyorot barang yang berbeda.
 *
 * Kode yang tidak ada di katalog SF dilewati diam-diam oleh backend: daftarnya
 * memendek, bukan error.
 */
export const SKU_PAIRS = [
  "FZ1347100",      // NIKE Cortez White Varsity Red — Rp1.359.000
  "LC-FD6033008",   // NIKE Quest 6 Black Red — Rp1.039.000
  "39771707",       // PUMA Seoul White Red Fire — Rp1.239.000
  "WRCELLR5",       // NEW BALANCE FuelCell Supercomp Elite V5 — Rp2.379.000
  "JJ5663",         // ADIDAS Basefwd Black Red — Rp699.000
  "JH9079",         // ADIDAS Samoa White Red — Rp1.379.000
  "LC-LAB13194DTR", // NEW BALANCE Mesh Pocket Backpack Black Red — Rp429.000
  "FQ8762100",      // NIKE Field General 82 SP White Varsity Red — Rp1.279.000
  "38660718",       // PUMA Army Trainer White Red Gum — Rp1.299.000
  "LC-GX0535",      // ADIDAS Supernova Boost Black Acid Red — Rp889.000
];

/**
 * Section "Flash Hour" — SENGAJA kosong.
 *
 * Sheet campaign ini tidak menandai barang mana yang masuk potongan sekejap
 * (kolom `tag` kosong di seluruh 794 baris), jadi tidak ada dasar untuk memilih
 * isinya. Selama array ini kosong, section Flash Hour tidak dirender dan
 * request-nya pun tidak ditembakkan (lihat page.tsx). Mau dihidupkan: tulis
 * kode artikelnya di sini, ingat prefiks `LC-` untuk barang clearance.
 */
export const SKU_FLASH_HOUR: string[] = [];
