import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { productsService } from '@/lib/api/products.service';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductScrollCard } from '@/components/product/ProductScrollCard';
import VoucherClaimSection from '@/components/home/VoucherClaimSection';
import { Campaign99Hero } from '@/components/campaign/Campaign99Hero';
import { RotationExplainer99 } from '@/components/campaign/RotationExplainer99';
import {
  JUMLAH_ACTIVE,
  JUMLAH_DAILY,
  JUMLAH_FRESH,
  KUERI_ACTIVE,
  KUERI_DAILY,
  KUERI_FRESH,
  SKU_ACTIVE,
  SKU_DAILY,
  SKU_FRESH,
} from '@/lib/campaign/next-in-rotation-99';
import type { Product } from '@/types/product.types';

export const metadata: Metadata = {
  title: '9.9 Next In Rotation — SneakersFlash',
  description:
    'Different days call for different pairs. Diskon tanggal kembar 9.9 untuk sneakers original Nike, Adidas, New Balance, ASICS, dan Puma. Klaim vouchernya, lalu isi slot berikutnya di rotasi kamu.',
};

export const revalidate = 60;

/**
 * Halaman campaign 9.9 NEXT IN ROTATION.
 *
 * Susunannya mengikuti urutan pesan di creative brief: kebutuhan (rotation
 * belum lengkap) → relevansi (Daily & Active) → penawaran (voucher) → aksi.
 * Kurasi dan tanggalnya hidup di lib/campaign/next-in-rotation-99.ts.
 *
 * Selama daftar SKU di file itu masih kosong, halaman menarik barang REGULER
 * dari katalog — disengaja, sampai produk khusus 9.9 selesai disync.
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

export default async function Campaign99Page() {
  const [semuaDaily, semuaActive, semuaFresh] = await Promise.all([
    ambilSection(SKU_DAILY, KUERI_DAILY),
    ambilSection(SKU_ACTIVE, KUERI_ACTIVE),
    ambilSection(SKU_FRESH, KUERI_FRESH),
  ]);

  // Urutan pembuangan duplikat penting. Active disaring paling dulu karena
  // kuerinya paling spesifik (kategori Running/TRAINING); Daily memakai kurasi
  // umum yang bisa memuat sepatu lari yang sama, jadi Daily-lah yang mengalah.
  // Fresh Picks terakhir supaya tidak mengulang apa pun yang sudah tampil.
  const active = semuaActive.slice(0, JUMLAH_ACTIVE);

  const idActive = new Set(active.map((p) => p.id));
  const daily = semuaDaily
    .filter((p) => !idActive.has(p.id))
    .slice(0, JUMLAH_DAILY);

  const idTerpakai = new Set([...idActive, ...daily.map((p) => p.id)]);
  const fresh = semuaFresh
    .filter((p) => !idTerpakai.has(p.id))
    .slice(0, JUMLAH_FRESH);

  // Kalau kosong total, penyebabnya hampir pasti backend sedang tidak bisa
  // dihubungi (deploy/restart) — fetch di atas punya .catch() yang mengembalikan
  // array kosong. Melempar error penting di sini: dengan ISR, render yang gagal
  // membuat Next mempertahankan halaman baik yang terakhir dan mencoba lagi
  // nanti. Kalau dibiarkan lolos, halaman kosong itu justru tersimpan di cache.
  if (daily.length === 0 && active.length === 0 && fresh.length === 0) {
    throw new Error(
      'Halaman 9.9: nol produk di ketiga section — backend produk kemungkinan tidak bisa dihubungi, atau seluruh kurasi habis stok',
    );
  }

  return (
    // font-rotation-99 mengganti keluarga font SELURUH halaman ini (lihat
    // globals.css). Dipasang di pembungkus supaya hanya halaman campaign yang
    // terpengaruh — halaman lain tetap memakai font toko.
    <div className="font-rotation-99">
      <Campaign99Hero />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* ── Penjelas rotation: inti pesan campaign ── */}
        <section id="rotation-99" className="pt-10 pb-2 scroll-mt-24">
          <SectionHeading
            eyebrow="The Rotation"
            title="Different Days Call For Different Pairs"
            subtitle="Satu buat harian, satu buat hari yang lebih bergerak — dan satu slot yang biasanya masih kosong. 9.9 alasan buat ngisinya."
          />
          <RotationExplainer99 />
        </section>

        {/* ── Voucher: ditarik dari modul voucher yang sudah ada, difilter
             platform oleh backend. Sengaja tidak di-hardcode supaya kuota dan
             masa berlaku ikut yang di admin. ── */}
        <section id="voucher-99" className="pt-10 scroll-mt-24">
          <Suspense
            fallback={
              <div className="h-32 w-full animate-pulse bg-gray-100 rounded-xl my-4" />
            }
          >
            <VoucherClaimSection
              title="9.9 Next In Rotation Vouchers"
              subtitle="Klaim voucher sebelum belanja, lalu gunakan kodenya saat checkout. Satu kode berlaku untuk satu akun dengan kuota terbatas setiap hari."
            />
          </Suspense>
        </section>

        {/* ── 01 Daily ── */}
        {daily.length > 0 && (
          <section id="daily-99" className="pt-10 pb-4 scroll-mt-24">
            <SectionHeading
              eyebrow="01 Daily"
              title="Daily Rotation"
              subtitle="Pairs that work with almost everything — buat rutinitas dan hampir semua outfit."
              viewAllHref="/products?type=Footwear"
              viewAllLabel="Semua Produk"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {daily.map((product, i) => (
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

        {/* ── 02 Active ── */}
        {active.length > 0 && (
          <section id="active-99" className="pt-10 pb-4 scroll-mt-24">
            <SectionHeading
              eyebrow="02 Active"
              title="Active Rotation"
              subtitle="Ready when your day gets moving — running dan training, fokus di bantalan dan kenyamanan."
              viewAllHref="/products?category=Running"
              viewAllLabel="Semua Running"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {active.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── 03 Next? → Fresh Picks ── */}
        {fresh.length > 0 && (
          <section id="fresh-99" className="pt-10 pb-4 scroll-mt-24">
            <SectionHeading
              eyebrow="03 Next ?"
              title="Fresh Picks"
              subtitle="Barang yang baru masuk rak. Kalau slot ketiga di rotasi kamu masih kosong, mulai dari sini."
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

        {/* ── Penutup: satu ajakan terakhir ──
             Brief: kalau CTA-nya mengarah ke website, alamat websitenya harus
             kelihatan — bukan cuma tersirat. */}
        <section className="my-12">
          <div className="rounded-2xl bg-[#0D0D0D] px-6 py-10 md:px-10 md:py-12 flex flex-col items-start gap-5">
            <p className="text-3xl md:text-5xl font-black uppercase leading-[0.95] tracking-tight text-white">
              Find your next pair
              <br />
              <span className="text-primary">before the deal ends.</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-7 py-3.5 font-black uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 hover:brightness-95"
              >
                Shop Now
              </Link>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                sneakersflash.com
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
