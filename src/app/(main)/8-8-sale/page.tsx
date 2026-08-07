import type { Metadata } from "next";
import { Suspense } from "react";

import { productsService } from "@/lib/api/products.service";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductScrollCard } from "@/components/product/ProductScrollCard";
import VoucherClaimSection from "@/components/home/VoucherClaimSection";
import { Campaign88Hero } from "@/components/campaign/Campaign88Hero";
import { Campaign88Grid } from "@/components/campaign/Campaign88Grid";
import { SKU_PAIRS, SKU_FLASH_HOUR } from "@/lib/campaign/infinite-deals-88";

export const metadata: Metadata = {
  title: "Infinite Deals 8.8 — SneakersFlash",
  description:
    "Keuntungan tanpa batas, belanja makin puas. Diskon spesial tanggal kembar 8–10 Agustus untuk sneakers original Nike, Adidas, New Balance, dan Puma. Stok terbatas.",
};

export const revalidate = 60;

/**
 * Halaman campaign Infinite Deals 8.8.
 *
 * Kurasi produk & tanggalnya hidup di lib/campaign/infinite-deals-88.ts karena
 * dipakai bareng section beranda — menambah/mengurangi barang cukup di sana.
 */
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
    // font-helvetica-88 mengganti keluarga font SELURUH halaman ini (lihat
    // globals.css). Dipasang di pembungkus supaya hanya halaman campaign yang
    // terpengaruh — halaman lain tetap Inter.
    <div className="font-helvetica-88">
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
            title="Endless Voucher 300k Off"
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
    </div>
  );
}
