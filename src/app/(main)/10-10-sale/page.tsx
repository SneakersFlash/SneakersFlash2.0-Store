import type { Metadata } from 'next';
import { Suspense } from 'react';

import { productsService } from '@/lib/api/products.service';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductScrollCard } from '@/components/product/ProductScrollCard';
import VoucherClaimSection from '@/components/home/VoucherClaimSection';
import { Lowtober1010Hero } from '@/components/campaign/Lowtober1010Hero';
import { Lowtober1010Tier } from '@/components/campaign/Lowtober1010Tier';
import {
  JUMLAH_BIG_DROP,
  JUMLAH_FRESH,
  JUMLAH_MOVING,
  KUERI_BIG_DROP,
  KUERI_FRESH,
  KUERI_MOVING,
  SKU_BIG_DROP,
  SKU_FRESH,
  SKU_MOVING,
} from '@/lib/campaign/lowtober-1010';
import type { Product } from '@/types/product.types';

export const metadata: Metadata = {
  title: '10.10 Lowtober The Big Drop — SneakersFlash',
  description:
    'Prices go low, pairs go fast. Voucher toko tiering sampai 300K selama 1–10 Oktober untuk sneakers original Nike, Adidas, New Balance, ASICS, dan Puma. Puncaknya 10.10.',
};

export const revalidate = 60;

/**
 * Halaman campaign 10.10 LOWTOBER THE BIG DROP.
 *
 * Kerangkanya sama dengan halaman 9.9: hero → tier voucher → klaim voucher →
 * grid highlight → grid running → rail barang terbaru. Kurasi, tanggal, dan
 * angka tier hidup di lib/campaign/lowtober-1010.ts.
 *
 * Selama daftar SKU di file itu masih kosong, halaman menarik barang REGULER
 * dari katalog — disengaja, sampai list produk 10.10 masuk.
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

export default async function Campaign1010Page() {
  const [semuaBigDrop, semuaMoving, semuaFresh] = await Promise.all([
    ambilSection(SKU_BIG_DROP, KUERI_BIG_DROP),
    ambilSection(SKU_MOVING, KUERI_MOVING),
    ambilSection(SKU_FRESH, KUERI_FRESH),
  ]);

  // Urutan pembuangan duplikat penting. Kalau Big Drop berisi daftar SKU
  // pilihan tangan, ia tampil UTUH dan Moving yang mengalah. Kalau masih
  // fallback, Moving disaring dulu karena kuerinya paling spesifik
  // (Running/TRAINING), dan kurasi umum Big Drop yang mengalah. Fresh terakhir
  // supaya tidak mengulang apa pun yang sudah tampil.
  let bigDrop: Product[];
  let moving: Product[];
  if (SKU_BIG_DROP.length > 0) {
    bigDrop = semuaBigDrop;
    const idBigDrop = new Set(bigDrop.map((p) => p.id));
    moving = semuaMoving
      .filter((p) => !idBigDrop.has(p.id))
      .slice(0, JUMLAH_MOVING);
  } else {
    moving = semuaMoving.slice(0, JUMLAH_MOVING);
    const idMoving = new Set(moving.map((p) => p.id));
    bigDrop = semuaBigDrop
      .filter((p) => !idMoving.has(p.id))
      .slice(0, JUMLAH_BIG_DROP);
  }

  const idMoving = new Set(moving.map((p) => p.id));

  const idTerpakai = new Set([...idMoving, ...bigDrop.map((p) => p.id)]);
  const fresh = semuaFresh
    .filter((p) => !idTerpakai.has(p.id))
    .slice(0, JUMLAH_FRESH);

  // Kosong total = hampir pasti backend tak bisa dihubungi (deploy/restart).
  // Melempar error membuat ISR mempertahankan halaman baik yang terakhir;
  // kalau dibiarkan lolos, halaman kosong itu justru tersimpan di cache.
  if (bigDrop.length === 0 && moving.length === 0 && fresh.length === 0) {
    throw new Error(
      'Halaman 10.10: nol produk di ketiga section — backend produk kemungkinan tidak bisa dihubungi, atau seluruh kurasi habis stok',
    );
  }

  return (
    <div>
      <Lowtober1010Hero />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* ── Tier voucher: angka dipatok di lib supaya dua periode (termasuk
             yang belum mulai) bisa tampil sekaligus. ── */}
        <section id="tier-1010" className="pt-10 scroll-mt-24">
          <SectionHeading
            title="Makin Banyak Belanja, Makin Besar Drop-nya"
          />
          <Lowtober1010Tier />
        </section>

        {/* ── Klaim voucher: ditarik dari modul voucher yang sudah ada, difilter
             platform oleh backend, supaya kuota dan masa berlaku ikut admin. ── */}
        <section id="voucher-1010" className="pt-10 scroll-mt-24">
          <Suspense
            fallback={
              <div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl my-4" />
            }
          >
            <VoucherClaimSection
              title="10.10 Lowtober Vouchers"
              subtitle="Klaim voucher sebelum belanja, lalu gunakan kodenya saat checkout. Satu kode berlaku untuk satu akun."
            />
          </Suspense>
        </section>

        {/* ── The Big Drop ── */}
        {bigDrop.length > 0 && (
          <section id="big-drop-1010" className="pt-10 pb-4 scroll-mt-24">
            <SectionHeading
              eyebrow="01 The Big Drop"
              title="Prices Go Low"
              subtitle="Pairs pilihan yang paling sayang dilewatin selama Lowtober. Stok terbatas, harga lagi turun."
              viewAllHref="/products"
              viewAllLabel="Semua Produk"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {bigDrop.map((product, i) => (
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
          <section id="moving-1010" className="pt-10 pb-4 scroll-mt-24">
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
          <section id="fresh-1010" className="pt-10 pb-12 scroll-mt-24">
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
