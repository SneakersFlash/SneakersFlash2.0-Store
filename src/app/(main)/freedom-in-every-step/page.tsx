import type { Metadata } from "next";
import { Suspense } from "react";

import { productsService } from "@/lib/api/products.service";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductScrollCard } from "@/components/product/ProductScrollCard";
import VoucherClaimSection from "@/components/home/VoucherClaimSection";
import { FreedomHero } from "@/components/campaign/FreedomHero";
import { Campaign88Grid } from "@/components/campaign/Campaign88Grid";
import {
  SKU_PAIRS,
  SKU_FLASH_HOUR,
  FREEDOM_LIMIT_GRID,
  FREEDOM_SEMUA_PRODUK_HREF,
} from "@/lib/campaign/freedom-in-every-step";

export const metadata: Metadata = {
  title: "Freedom in Every Step — SneakersFlash",
  description:
    "Merdeka buat pilih langkahmu. Promo Kemerdekaan 13–17 Agustus untuk sneakers original Nike, Adidas, New Balance, dan Puma. Stok terbatas.",
};

export const revalidate = 60;

/**
 * Halaman campaign "Freedom in Every Step".
 *
 * Struktur & komponennya sengaja mengikuti halaman 8.8; grid-nya pun memakai
 * Campaign88Grid — komponen itu netral, tidak ada tulisan 8.8 di dalamnya.
 * Kurasi produknya sudah final dan datang dari tab campaign di sheet Freedom
 * (lihat lib/campaign/freedom-in-every-step.ts).
 */
export default async function FreedomCampaignPage() {
  const [hasilPairs, hasilFlash] = await Promise.all([
    productsService
      .getProducts({ skus: SKU_PAIRS, limit: FREEDOM_LIMIT_GRID, page: 1 })
      .catch(() => ({ data: [] as any[] })),
    // Daftar Flash Hour boleh kosong. Kalau kosong, request-nya dilewati: limit 0
    // ditolak backend (@Min(1)) sehingga fetch-nya cuma jadi 400 yang tertelan
    // .catch() dan terulang tiap revalidasi.
    SKU_FLASH_HOUR.length > 0
      ? productsService
          .getProducts({
            skus: SKU_FLASH_HOUR,
            limit: SKU_FLASH_HOUR.length,
            page: 1,
          })
          .catch(() => ({ data: [] as any[] }))
      : Promise.resolve({ data: [] as any[] }),
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
      "Halaman Freedom in Every Step: nol produk — backend produk kemungkinan tidak bisa dihubungi, atau seluruh kurasi habis stok",
    );
  }

  return (
    // font-helvetica-88 mengganti keluarga font SELURUH halaman ini (lihat
    // globals.css). Dipasang di pembungkus supaya hanya halaman campaign yang
    // terpengaruh — halaman lain tetap Inter.
    //
    // --primary ditimpa DI SINI, bukan di globals.css: variabel itu dipakai
    // seluruh toko (kuning #F6E70A), jadi mengubahnya di sana akan mewarnai
    // ulang semua halaman. Ditulis sebagai style inline di pembungkus, nilainya
    // diwarisi turun sehingga setiap bg-primary/text-primary di dalam halaman
    // ini jadi #9E0107 — dan berhenti begitu keluar dari div ini.
    // Format HSL tanpa fungsi hsl() karena begitulah token Tailwind di proyek
    // ini dibaca. 357.7 98.7% 31.2% == #9E0107.
    <div
      className="font-helvetica-88"
      style={
        {
          "--primary": "357.7 98.7% 31.2%",
          "--primary-foreground": "0 0% 100%",
        } as React.CSSProperties
      }
    >
      <FreedomHero />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* ── Voucher: ditarik dari modul voucher yang sudah ada, difilter
             platform oleh backend. Sengaja tidak di-hardcode supaya kuota dan
             masa berlaku ikut yang di admin. ── */}
        <section id="voucher-freedom">
          <Suspense
            fallback={
              <div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl my-4" />
            }
          >
            <VoucherClaimSection
              title="GET 81K FLASH POINT"
              subtitle="Daftar akun Sneakers Flash pada 13-17 Agustus 2026 dan dapatkan 81K Flash Point. Bisa digunakan untuk seluruh produk, tanpa minimum pembelian, dan tanpa masa kedaluwarsa."
            />
          </Suspense>
        </section>

        {/* ── Grid utama ── */}
        <section id="pilihan-freedom" className="pt-8 pb-4 scroll-mt-24">
          <SectionHeading
            title="Pairs Worth Checking Out"
            subtitle="Pilihan sneakers yang sayang banget kalau dilewatin di Freedom in Every Step."
            // Katalog penuh campaign ada di halaman event-nya, bukan di /products
            // yang isinya seluruh katalog toko.
            viewAllHref={FREEDOM_SEMUA_PRODUK_HREF}
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
