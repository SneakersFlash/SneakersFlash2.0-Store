import { productsService } from '@/lib/api/products.service';
import {
  SKU_99K_500K,
  SKU_500K_999K,
  SKU_REGULER,
} from '@/lib/campaign/year-end-1111';
import type { Product } from '@/types/product.types';

/**
 * Tiga section harga 11.11, dipakai landing /11-11-sale (dipotong 12 kartu)
 * dan halaman "See All Pairs" /11-11-sale/[kategori] (semua yang berstok).
 * `id` = segmen URL halaman kategorinya.
 */
export const SECTIONS_1111 = [
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

/** Produk habis stok tidak ditampilkan: percuma makan slot, tetap tak bisa dibeli. */
const berstok = (hasil: { data?: Product[] } | null) =>
  (hasil?.data ?? []).filter((p) => Number(p?.totalStock ?? 0) > 0);

/** Gagal fetch = daftar kosong, supaya satu section tidak menjatuhkan halaman. */
export async function ambilSkus1111(skus: string[]): Promise<Product[]> {
  if (skus.length === 0) return [];
  const hasil = await productsService
    .getProducts({ skus, limit: skus.length, page: 1 } as any)
    .catch(() => ({ data: [] as Product[] }));
  return berstok(hasil);
}

