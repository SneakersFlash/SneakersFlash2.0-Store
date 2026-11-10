import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { teaser1111 } from '@/lib/campaign/year-end-1111';
import { SECTIONS_1111, ambilSkus1111 } from '@/lib/campaign/year-end-1111-sections';

export const revalidate = 60;

/**
 * "See All Pairs" 11.11 — semua produk berstok dari satu section landing
 * (landing sendiri dipotong 12 kartu per section). Tujuan tombol di bawah
 * tiap section /11-11-sale.
 */
export function generateStaticParams() {
  return SECTIONS_1111.map((s) => ({ kategori: s.id }));
}

type Props = { params: Promise<{ kategori: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const s = SECTIONS_1111.find((x) => x.id === kategori);
  if (!s) return {};
  return {
    title: `${s.title} — 11.11 Year-End Sale — SneakersFlash`,
    description: s.subtitle,
  };
}

export default async function Kategori1111Page({ params }: Props) {
  const { kategori } = await params;
  const s = SECTIONS_1111.find((x) => x.id === kategori);
  if (!s) notFound();

  const products = await ambilSkus1111(s.skus);
  const lain = SECTIONS_1111.filter((x) => x.id !== s.id);

  return (
    <div className="container mx-auto px-4 max-w-7xl pt-8 pb-12">
      <Link
        href={`/11-11-sale#${s.id}`}
        className="mb-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.15em] text-gray-600 hover:text-[#0D0D0D]"
      >
        ← 11.11 Year-End Sale
      </Link>

      <SectionHeading
        eyebrow={s.eyebrow}
        title={s.title}
        subtitle={`${s.subtitle} ${products.length} pairs tersedia.`}
      />

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          Semua produk di kategori ini sudah habis.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={Math.min(i, 8)}
              priority={i < 4}
              hargaTeaser={teaser1111(product.skuParent)}
            />
          ))}
        </div>
      )}

      {/* Pindah kategori tanpa balik ke landing. */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {lain.map((x) => (
          <Link
            key={x.id}
            href={`/11-11-sale/${x.id}`}
            className="rounded-full border border-[#0D0D0D] px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-[#0D0D0D] transition hover:bg-[#F5E809]"
          >
            {x.title} →
          </Link>
        ))}
      </div>
    </div>
  );
}
