/**
 * Sumber tunggal data campaign "Infinite Deals 8.8".
 *
 * Dipakai bersama oleh halaman /8-8-sale dan section-nya di beranda, supaya
 * kurasi dan tanggalnya tidak perlu ditulis dua kali dan tidak bisa selisih.
 */

/** WIB = UTC+7, ditulis eksplisit supaya tidak ikut zona waktu server. */
export const CAMPAIGN_88_MULAI = "2026-08-08T00:00:00+07:00";
export const CAMPAIGN_88_BERAKHIR = "2026-08-10T23:59:59+07:00";

export const CAMPAIGN_88_HREF = "/8-8-sale";
export const CAMPAIGN_88_NAMA = "Infinite Deals 8.8";

/**
 * Section "Pairs Worth Checking Out" — 25 kode artikel (sku_parent), 5 per
 * merek. Urutan array = urutan tayang; backend menjaganya lewat ?skus=.
 *
 * Kode yang tidak ada di katalog SF (salah ketik, produk nonaktif, atau milik
 * platform lain) dilewati diam-diam oleh backend: daftarnya memendek, bukan
 * error. Menambah/mengurangi barang = cukup sunting daftar di sini.
 */
export const SKU_PAIRS = [
  "410866",      // SALOMON XT 6 Black Phantom
  "474453",      // SALOMON XT 6 Vanilla Ice Almond Milk
  "474671",      // SALOMON XT 6 Mindful 3 White Papper
  "477334",      // SALOMON XT 6 Expanse Ltr Peat
  "477375",      // SALOMON XT 6 Roasted Clay
  "BB550VGC",    // NEW BALANCE 550 V1 Vintage Brown Pack
  "MFCXCE4",     // NEW BALANCE FuelCell Rebel V4 Clay Ash
  "ML574EVW",    // NEW BALANCE 574 Grey Nimbus Cloud
  "MS327CBW",    // NEW BALANCE 327 Black
  "U20026PU",    // NEW BALANCE 2002R Tan Black
  "1203A330022", // ASICS Gel Lyte III OG
  "1203A574001", // ASICS GT 2160 X Grip Swany X Atmos
  "1203A603001", // ASICS Gel K1011 Black Pure Silver
  "1203A740101", // ASICS Gel Kayano 14 White Papaya
  "1203A896750", // ASICS Gel NYC 2.0 Sulphur Black
  "CJ1288001",   // NIKE Air Zoom Spiridon Cage 2
  "DD8959001",   // NIKE Air Force 1 07 Triple Black
  "FZ2068001",   // NIKE Air Max Sunder Black Silver
  "HF0263400",   // NIKE Cortez Txt Midnight Navy White
  "IB8174100",   // NIKE Shox Ride 2 Metallic Platinum
  "IG6190",      // ADIDAS Hand 2 Grey Light Blue Gum
  "JI2625",      // ADIDAS Hamburg W White Blue Gum
  "JI3218",      // ADIDAS Samba 62 Collegiate Green
  "JP7149",      // ADIDAS Adizero Evo SL Black White
  "JQ7643",      // ADIDAS Equipment Agravic Core Black
];

/**
 * Section "Flash Hour" — rail geser, potongan paling dalam.
 *
 * PENTING — prefiks `LC-`. Kelimanya barang clearance, dan di katalog SF salinan
 * clearance punya `sku_parent` sendiri yang berprefiks `LC-` (produk regulernya
 * cuma ada di katalog TS). Filter `?skus=` backend mencocokkan `sku_parent`
 * PERSIS, jadi menulis kode artikel telanjang di sini bikin rail-nya kosong
 * tanpa error — daftarnya cuma memendek diam-diam.
 */
export const SKU_FLASH_HOUR = [
  "LC-100220888", // REEBOK Court Clean White Light Blue
  "LC-37703011",  // PUMA Transport Modern Feather Gray Yellow Blaze Black
  "LC-IB2748101", // NIKE Charge Canvas White — produk NONAKTIF, tidak akan tayang
  "LC-JI4601",    // ADIDAS Galaxy 7 Dark Blue
  "LC-ME430RK3",  // NEW BALANCE 430 V3 Black White
];

/** Berapa produk yang tampil di panel beranda sebelum "lihat semua". */
export const JUMLAH_SOROTAN_BERANDA = 10;
