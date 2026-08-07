import type { Metadata } from "next";
import { Suspense } from "react";

import { productsService } from "@/lib/api/products.service";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductScrollCard } from "@/components/product/ProductScrollCard";
import VoucherClaimSection from "@/components/home/VoucherClaimSection";
import { Campaign88Hero } from "@/components/campaign/Campaign88Hero";
import { Campaign88Grid } from "@/components/campaign/Campaign88Grid";

export const metadata: Metadata = {
  title: "Infinite Deals 8.8 — SneakersFlash",
  description:
    "Keuntungan tanpa batas, belanja makin puas. Diskon spesial tanggal kembar 8–10 Agustus untuk sneakers original Nike, Adidas, New Balance, dan Puma. Stok terbatas.",
};

export const revalidate = 60;

/**
 * Kurasi campaign 08.08 — daftar KODE ARTIKEL (sku_parent) pilihan tangan.
 * Urutan array = urutan tayang; backend menjaganya lewat ?skus=.
 *
 * Pola yang sama dipakai home page. Kode yang tidak ada di katalog SF (salah
 * ketik, produk nonaktif, atau milik platform lain) dilewati diam-diam oleh
 * backend: daftarnya memendek, bukan error.
 *
 * Menambah/mengurangi produk = cukup sunting daftar di bawah.
 */
/** Section "Pairs Worth Checking Out" — 25 kode artikel, 5 per merek. */
const SKU_PAIRS = [
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

/** Section "Flash Hour" — rail geser, potongan paling dalam. */
const SKU_FLASH_HOUR = [
  "39311401",   // PUMA Clyde Huskie White
  "GW2415",     // ADIDAS Superstar Pride Love Unites
  "FJ5472121",  // NIKE Air Max 1 Time Warp White
  "CU9174600",  // NIKE Airmax 2090 Sp Infrared Duck Camo
  "U998GB",     // NEW BALANCE 998 Made In Usa Grey Cream
  "IE1763",     // ADIDAS Ultraboost Light Bold Onix Silver Metallic
];

export default async function Campaign88Page() {
  const [hasilPairs, hasilFlash] = await Promise.all([
    productsService
      .getProducts({ skus: SKU_PAIRS, limit: SKU_PAIRS.length, page: 1 })
      .catch(() => ({ data: [] as any[] })),
    productsService
      .getProducts({ skus: SKU_FLASH_HOUR, limit: SKU_FLASH_HOUR.length, page: 1 })
      .catch(() => ({ data: [] as any[] })),
  ]);

  // Produk habis stok tidak ditampilkan — percuma makan slot highlight karena
  // tetap tidak bisa dibeli. totalStock dihitung backend dari stok varian.
  const berstok = (r: any) =>
    (r?.data ?? []).filter((p: any) => Number(p?.totalStock ?? 0) > 0);

  const produkPairs = berstok(hasilPairs);
  const produkFlash = berstok(hasilFlash);
  const produk = [...produkPairs, ...produkFlash];

  // Kalau kosong total, penyebabnya hampir pasti backend sedang tidak bisa
  // dihubungi (deploy/restart) — fetch di atas punya .catch() yang mengembalikan
  // array kosong. Melempar error penting di sini: dengan ISR, render yang gagal
  // membuat Next mempertahankan halaman baik yang terakhir dan mencoba lagi
  // nanti. Kalau dibiarkan lolos, halaman kosong itu justru tersimpan di cache.
  if (produk.length === 0) {
    throw new Error(
      "Halaman 08.08: nol produk — backend produk kemungkinan tidak bisa dihubungi, atau seluruh kurasi habis stok",
    );
  }

  return (
    <>
      <Campaign88Hero />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* ── Voucher: ditarik dari modul voucher yang sudah ada, difilter
             platform oleh backend. Sengaja tidak di-hardcode supaya kuota dan
             masa berlaku ikut yang di admin. ── */}
        <Suspense
          fallback={
            <div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl my-4" />
          }
        >
          <VoucherClaimSection
            title="Endless Discount Voucher"
            subtitle="Klaim voucher sebelum belanja, lalu gunakan kodenya saat checkout. Satu kode berlaku untuk satu akun dengan kuota terbatas setiap hari."
          />
        </Suspense>

        {/* ── Grid utama ── */}
        <section id="pilihan-88" className="pt-8 pb-4 scroll-mt-24">
          <SectionHeading
            eyebrow="8 – 10 Agustus"
            title="Pairs Worth Checking Out"
            subtitle="Pilihan sneakers pilihan yang sayang banget kalau dilewatin di Infinite Deals."
            viewAllHref="/products"
            viewAllLabel="Semua Produk"
          />
          <Campaign88Grid products={produkPairs} />
        </section>

        {/* ── Rail geser ── */}
        {produkFlash.length > 0 && (
          <section className="pt-8 pb-12">
            <SectionHeading
              title="Flash Hour"
              subtitle="Kesempatan singkat buat harga yang lebih hemat."
            />
            <div className="flex gap-3 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2">
              {produkFlash.map((product: any, i: number) => (
                <div key={product.id} className="snap-start shrink-0">
                  <ProductScrollCard product={product} index={i} showStock />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
