import type { Metadata } from 'next';
import { Suspense } from 'react';

import { productsService } from '@/lib/api/products.service';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import VoucherClaimSection from '@/components/home/VoucherClaimSection';
import { YearEnd1111Hero } from '@/components/campaign/YearEnd1111Hero';
import {
  SKU_99K_500K,
  SKU_500K_999K,
  SKU_REGULER,
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
 * Hero → klaim voucher → tiga section harga (99K–500K, 500K–999K, Reguler).
 * Isi section = daftar SKU dari sheet 11.11 di lib/campaign/year-end-1111.ts;
 * harga 11.11-nya menempel lewat event id 11 dan baru berlaku 11 Nov 00:00 WIB.
 * Sebelum itu kartu menampilkan harga normal — disengaja.
 *
 * Tabel tier voucher belum dipasang karena voucher 11.11 belum dibuat.
 */

/** Produk habis stok tidak ditampilkan: percuma makan slot, tetap tak bisa dibeli. */
const berstok = (hasil: { data?: Product[] } | null) =>
  (hasil?.data ?? []).filter((p) => Number(p?.totalStock ?? 0) > 0);

/** Gagal fetch = daftar kosong, supaya satu section tidak menjatuhkan halaman. */
async function ambilSkus(skus: string[]): Promise<Product[]> {
  if (skus.length === 0) return [];
  const hasil = await productsService
    .getProducts({ skus, limit: skus.length, page: 1 } as any)
    .catch(() => ({ data: [] as Product[] }));
  return berstok(hasil);
}

const SECTIONS = [
  {
    id: 'harga-99k-500k',
    eyebrow: '01 Under 500K',
    title: '99K – 500K',
    subtitle: 'Pairs paling ramah kantong di 11.11. Cepet-cepetan, stoknya tipis.',
    skus: SKU_99K_500K,
  },
  {
    id: 'harga-500k-999k',
    eyebrow: '02 Under 1 Juta',
    title: '500K – 999K',
    subtitle: 'Sneakers original di bawah sejuta buat nutup tahun.',
    skus: SKU_500K_999K,
  },
  {
    id: 'reguler-1111',
    eyebrow: '03 Reguler',
    title: 'Reguler',
    subtitle: 'Pairs incaran dengan harga 11.11 yang cuma berlaku sehari.',
    skus: SKU_REGULER,
  },
];

export default async function Campaign1111Page() {
  const hasil = await Promise.all(SECTIONS.map((s) => ambilSkus(s.skus)));
  const sections = SECTIONS.map((s, i) => ({ ...s, products: hasil[i] }));

  // Kosong total = hampir pasti backend tak bisa dihubungi (deploy/restart).
  // Melempar error membuat ISR mempertahankan halaman baik yang terakhir;
  // kalau dibiarkan lolos, halaman kosong itu justru tersimpan di cache.
  if (sections.every((s) => s.products.length === 0)) {
    throw new Error(
      'Halaman 11.11: nol produk di semua section — backend produk kemungkinan tidak bisa dihubungi, atau seluruh kurasi habis stok',
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

        {/* Jangkar #deals-1111 dipakai tombol hero "Shop The Sale". */}
        <div id="deals-1111" className="scroll-mt-24" />

        {sections.map(
          (s, idx) =>
            s.products.length > 0 && (
              <section
                key={s.id}
                id={s.id}
                className={`pt-10 scroll-mt-24 ${idx === sections.length - 1 ? 'pb-12' : 'pb-4'}`}
              >
                <SectionHeading
                  eyebrow={s.eyebrow}
                  title={s.title}
                  subtitle={s.subtitle}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {s.products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      priority={idx === 0 && i < 4}
                    />
                  ))}
                </div>
              </section>
            ),
        )}
      </div>
    </div>
  );
}
