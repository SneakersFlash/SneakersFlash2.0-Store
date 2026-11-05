import type { Metadata } from 'next';
import { Suspense } from 'react';

import { productsService } from '@/lib/api/products.service';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductScrollCard } from '@/components/product/ProductScrollCard';
import VoucherClaimSection from '@/components/home/VoucherClaimSection';
import { YearEnd1111Hero } from '@/components/campaign/YearEnd1111Hero';
import {
  JUMLAH_DEALS,
  JUMLAH_FRESH,
  JUMLAH_MOVING,
  KUERI_DEALS,
  KUERI_FRESH,
  KUERI_MOVING,
  SKU_DEALS,
  SKU_FRESH,
  SKU_MOVING,
} from '@/lib/campaign/year-end-1111';
import type { Product } from '@/types/product.types';

export const metadata: Metadata = {
  title: '11.11 Year End Sale — SneakersFlash',
  description:
    'Last big sale of the year. Road to 11.11 mulai 5 November, harga turun 11 November untuk sneakers original Nike, Adidas, New Balance, ASICS, dan Puma.',
};

export const revalidate = 60;

/**
 * Halaman campaign 11.11 YEAR END SALE.
 *
 * Kerangkanya halaman 10.10: hero → klaim voucher → grid highlight → grid
 * running → rail barang terbaru. Tabel tier voucher belum dipasang karena
 * voucher 11.11 belum dibuat — tambahkan section-nya kalau angkanya sudah ada.
 * Kurasi dan tanggal hidup di lib/campaign/year-end-1111.ts.
 *
 * Selama daftar SKU di file itu masih kosong, halaman menarik barang REGULER
 * dari katalog — disengaja, sampai event harga 11.11 tersync dari sheet.
 */

/** Produk habis stok tidak ditampilkan: percuma makan slot, tetap tak bisa dibeli. */
const berstok = (hasil: { data?: Product[] } | null) =>
  (hasil?.data ?? []).filter((p) => Number(p?.totalStock ?? 0) > 0);

/**
 * Ambil satu section: pakai daftar SKU kalau ada isinya, kalau tidak jatuh ke
 * kueri katalog. Gagal fetch dikembalikan sebagai daftar kosong supaya satu
 * section yang bermasalah tidak menjatuhkan seluruh halaman.
 */
async function ambilSection(
  skus: string[],
  kueri: Record<string, unknown>,
): Promise<Product[]> {
  const filter = skus.length
    ? { skus, limit: skus.length, page: 1 }
    : { ...kueri, page: 1 };

  const hasil = await productsService
    .getProducts(filter as any)
    .catch(() => ({ data: [] as Product[] }));

  return berstok(hasil);
}

export default async function Campaign1111Page() {
  const [semuaDeals, semuaMoving, semuaFresh] = await Promise.all([
    ambilSection(SKU_DEALS, KUERI_DEALS),
    ambilSection(SKU_MOVING, KUERI_MOVING),
    ambilSection(SKU_FRESH, KUERI_FRESH),
  ]);

  // Urutan pembuangan duplikat penting. Kalau Deals berisi daftar SKU
  // pilihan tangan, ia tampil UTUH dan Moving yang mengalah. Kalau masih
  // fallback, Moving disaring dulu karena kuerinya paling spesifik
  // (Running/TRAINING), dan kurasi umum Deals yang mengalah. Fresh terakhir
  // supaya tidak mengulang apa pun yang sudah tampil.
  let deals: Product[];
  let moving: Product[];
  if (SKU_DEALS.length > 0) {
    deals = semuaDeals;
    const idDeals = new Set(deals.map((p) => p.id));
    moving = semuaMoving
      .filter((p) => !idDeals.has(p.id))
      .slice(0, JUMLAH_MOVING);
  } else {
    moving = semuaMoving.slice(0, JUMLAH_MOVING);
    const idMoving = new Set(moving.map((p) => p.id));
    deals = semuaDeals
      .filter((p) => !idMoving.has(p.id))
      .slice(0, JUMLAH_DEALS);
  }

  const idMoving = new Set(moving.map((p) => p.id));

  const idTerpakai = new Set([...idMoving, ...deals.map((p) => p.id)]);
  const fresh = semuaFresh
    .filter((p) => !idTerpakai.has(p.id))
    .slice(0, JUMLAH_FRESH);

  // Kosong total = hampir pasti backend tak bisa dihubungi (deploy/restart).
  // Melempar error membuat ISR mempertahankan halaman baik yang terakhir;
  // kalau dibiarkan lolos, halaman kosong itu justru tersimpan di cache.
  if (deals.length === 0 && moving.length === 0 && fresh.length === 0) {
    throw new Error(
      'Halaman 11.11: nol produk di ketiga section — backend produk kemungkinan tidak bisa dihubungi, atau seluruh kurasi habis stok',
    );
  }

  return (
    <div>
      <YearEnd1111Hero />

      <div className="container mx-auto px-4 max-w-7xl">

        {/* ── Klaim voucher: ditarik dari modul voucher yang sudah ada, difilter
             platform oleh backend, supaya kuota dan masa berlaku ikut admin. ── */}
        <section id="voucher-1111" className="pt-10 scroll-mt-24">
          <Suspense
            fallback={
              <div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl my-4" />
            }
          >
            <VoucherClaimSection
              title="11.11 Year End Vouchers"
              subtitle="Klaim voucher sebelum belanja, lalu gunakan kodenya saat checkout. Satu kode berlaku untuk satu akun."
            />
          </Suspense>
        </section>

        {/* ── Year End Deals ── */}
        {deals.length > 0 && (
          <section id="deals-1111" className="pt-10 pb-4 scroll-mt-24">
            <SectionHeading
              eyebrow="01 Year End Deals"
              title="Last Big Sale Of The Year"
              subtitle="Pairs pilihan buat nutup tahun. Harga 11.11 berlaku 11 November, stok terbatas."
              viewAllHref="/products"
              viewAllLabel="Semua Produk"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {deals.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  priority={i < 4}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Keep Moving ── */}
        {moving.length > 0 && (
          <section id="moving-1111" className="pt-10 pb-4 scroll-mt-24">
            <SectionHeading
              eyebrow="02 Keep Moving"
              title="Run & Train"
              subtitle="Pairs buat lari, latihan, dan hari-hari yang bikin kamu terus bergerak."
              viewAllHref="/products?category=Running"
              viewAllLabel="Lihat Running"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {moving.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Fresh Drops ── */}
        {fresh.length > 0 && (
          <section id="fresh-1111" className="pt-10 pb-12 scroll-mt-24">
            <SectionHeading
              eyebrow="03 Fresh Drops"
              title="Just Dropped"
              subtitle="Barang yang baru masuk. Kalau masih ada slot kosong di rak, mulai dari sini."
              viewAllHref="/products?sort=newest"
              viewAllLabel="Lihat Terbaru"
            />
            <div className="flex gap-3 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2">
              {fresh.map((product, i) => (
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
