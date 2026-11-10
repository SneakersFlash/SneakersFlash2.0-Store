import type { Metadata } from 'next';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { YearEnd1111Hero } from '@/components/campaign/YearEnd1111Hero';
import Link from 'next/link';
import { teaser1111 } from '@/lib/campaign/year-end-1111';
import { SECTIONS_1111, ambilSkus1111 } from '@/lib/campaign/year-end-1111-sections';

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

export default async function Campaign1111Page() {
  const hasil = await Promise.all(SECTIONS_1111.map((s) => ambilSkus1111(s.skus)));
  const sections = SECTIONS_1111.map((s, i) => ({
    ...s,
    total: hasil[i].length,
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
                <span className="inline-block rounded bg-[#F5E809] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D]">
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
                {/* Section dipotong 12 kartu; sisanya di halaman per kategori. */}
                {s.total > s.products.length && (
                  <div className="mt-6 flex justify-center">
                    <Link
                      href={`/11-11-sale/${s.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-[#F5E809] hover:text-[#0D0D0D]"
                    >
                      See All Pairs ({s.total}) →
                    </Link>
                  </div>
                )}
              </section>
            ),
        )}
      </div>
    </div>
  );
}
