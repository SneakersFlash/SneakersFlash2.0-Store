import type { Metadata } from 'next';
import { productsService } from '@/lib/api/products.service';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { YearEnd1111Hero } from '@/components/campaign/YearEnd1111Hero';
import {
  SKU_99K_500K,
  SKU_500K_999K,
  SKU_REGULER,
  teaser1111,
} from '@/lib/campaign/year-end-1111';
import type { Product } from '@/types/product.types';

export const metadata: Metadata = {
  title: '11.11 Year-End Sale — SneakersFlash',
  description:
    'Promo 11.11 YEAR-END SALE di sneakersflash.com mulai 9 November sampai 15 November 2026 untuk sneakers original Nike, Adidas, New Balance, ASICS, dan Puma.',
};

export const revalidate = 60;

/**
 * Halaman campaign 11.11 YEAR-END SALE.
 *
 * Hero → jadwal promo → tiga section harga (99K–500K, 500K–999K, Reguler).
 * Copy mengikuti PDF "revisi terbaru" (6 Nov 2026, di root repo).
 * Isi section = daftar SKU dari sheet 11.11 di lib/campaign/year-end-1111.ts;
 * harga 11.11-nya menempel lewat event id 11 (9 Nov 00:00 – 15 Nov 23:59 WIB).
 * Sebelum promo buka kartu tetap harga normal + label teaser "Harga 11.11".
 *
 * Section klaim voucher DICABUT atas arahan PDF: mekanisme voucher belum
 * disetujui. Pasang lagi (VoucherClaimSection) kalau sudah final.
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

/**
 * Maksimal kartu per section. Daftar SKU-nya jauh lebih panjang (62/116/170) —
 * user tidak mau semuanya ditumpahkan; yang tampil = yang termurah duluan.
 */
const JUMLAH_PER_SECTION = 12;

const JADWAL = [
  {
    judul: 'Countdown Promo',
    waktu: '6-8 Nov 2026',
    ket: 'Siapkan wishlist! Promo website dimulai 9 November.',
  },
  {
    judul: 'Promo Dimulai',
    waktu: '9 Nov 2026',
    ket: '11.11 YEAR-END SALE dimulai di sneakersflash.com.',
  },
  {
    judul: 'Last Chance',
    waktu: '15 Nov 2026',
    ket: 'Hari terakhir promo 11.11. Belanja sebelum periode berakhir.',
  },
];

const SECTIONS = [
  {
    id: 'harga-99k-500k',
    eyebrow: '01 | Sandals & Sneakers',
    title: '99K-500K',
    subtitle: 'Sandal 99K dan sneakers 300K-500K. Pilihan produk dan ukuran mengikuti ketersediaan.',
    skus: SKU_99K_500K,
  },
  {
    id: 'harga-500k-999k',
    eyebrow: '02 | Sneakers Under 1 Juta',
    title: '500K-999K',
    subtitle: 'Pilihan sneakers 100% original dengan harga di bawah Rp1 juta. Stok dan ukuran mengikuti ketersediaan.',
    skus: SKU_500K_999K,
  },
  {
    id: 'reguler-1111',
    eyebrow: '03 | Selected Sneakers',
    title: 'Price Drops',
    subtitle: 'Sneakers pilihan dengan harga spesial selama 11.11 YEAR-END SALE. Stok dan ukuran mengikuti ketersediaan.',
    skus: SKU_REGULER,
  },
];

export default async function Campaign1111Page() {
  const hasil = await Promise.all(SECTIONS.map((s) => ambilSkus(s.skus)));
  const sections = SECTIONS.map((s, i) => ({
    ...s,
    products: hasil[i].slice(0, JUMLAH_PER_SECTION),
  }));

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
        {/* ── Jadwal promo — tujuan tombol hero "Lihat Jadwal Promo". Teks dari
             bagian "Informasi tambahan di bawah hero" di PDF revisi. ── */}
        <section id="jadwal-1111" className="pt-10 scroll-mt-24">
          <SectionHeading eyebrow="Jadwal Promo Website" title="11.11 Year-End Sale" />
          <ol className="grid gap-3 sm:grid-cols-3">
            {JADWAL.map((j, i) => (
              <li
                key={j.judul}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E50012]">
                  {String(i + 1).padStart(2, '0')} {j.judul}
                </span>
                <p className="mt-1 text-base font-black uppercase tracking-tight text-[#0D0D0D]">
                  {j.waktu}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{j.ket}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-gray-500">
            *Free shipping mengikuti syarat dan ketentuan website.
          </p>
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
                      hargaTeaser={teaser1111(product.skuParent)}
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
