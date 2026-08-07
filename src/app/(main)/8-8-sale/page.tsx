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
const SKU_CAMPAIGN = [
  // ── Delapan pertama → grid utama ──
  "FQ8226101",  // NIKE Court Legacy Next Nature White Blue
  "BB650RPC",   // NEW BALANCE 650R Angora Beige
  "MEVOZFG3",   // NEW BALANCE Ff X Evoz V3 Shadow Grey
  "U998BG",     // NEW BALANCE 998 Made In Usa Brown Green
  "UWRPDKOM",   // NEW BALANCE Wrpd Runner Green Black
  "38643002",   // PUMA Trc Blaze Chance Black White
  "38636101",   // PUMA Trc Blaze Re Collection White
  "ID2151",     // ADIDAS Superstar 82 Crystal White Clear Blue
  // ── Sisanya → rail geser ──
  "39311401",   // PUMA Clyde Huskie White
  "GW2415",     // ADIDAS Superstar Pride Love Unites
  "FJ5472121",  // NIKE Air Max 1 Time Warp White
  "CU9174600",  // NIKE Airmax 2090 Sp Infrared Duck Camo
  "U998GB",     // NEW BALANCE 998 Made In Usa Grey Cream
  "IE1763",     // ADIDAS Ultraboost Light Bold Onix Silver Metallic
];

/** Berapa produk pertama yang tampil di grid; sisanya masuk rail geser. */
const JUMLAH_GRID = 8;

export default async function Campaign88Page() {
  const hasil = await productsService
    .getProducts({ skus: SKU_CAMPAIGN, limit: SKU_CAMPAIGN.length, page: 1 })
    .catch(() => ({ data: [] as any[] }));

  // Produk habis stok tidak ditampilkan — percuma makan slot highlight karena
  // tetap tidak bisa dibeli. totalStock dihitung backend dari stok varian.
  const produk = (hasil?.data ?? []).filter(
    (p: any) => Number(p?.totalStock ?? 0) > 0,
  );

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

  const produkGrid = produk.slice(0, JUMLAH_GRID);
  const produkRail = produk.slice(JUMLAH_GRID);

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
          <Campaign88Grid products={produkGrid} />
        </section>

        {/* ── Rail geser ── */}
        {produkRail.length > 0 && (
          <section className="pt-8 pb-12">
            <SectionHeading
              title="Flash Hour"
              subtitle="Kesempatan singkat buat harga yang lebih hemat."
            />
            <div className="flex gap-3 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2">
              {produkRail.map((product: any, i: number) => (
                <div key={product.id} className="snap-start shrink-0">
                  <ProductScrollCard product={product} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
