import type { Metadata } from "next";
import { ProductDetailClient } from "./ProductDetailClient";
import { productsService } from "@/lib/api/products.service";

// Di Next.js 15, params adalah Promise
type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sneakersflash.com";

/** Ambil produk, diamkan kegagalannya. */
async function ambilProduk(slug: string): Promise<any | null> {
  try {
    const product: any = await productsService.getProduct(slug);
    return product?.name ? product : null;
  } catch {
    return null;
  }
}

function gambarProduk(product: any): string | undefined {
  return product.imageUrl ?? product.images?.[0]?.url ?? product.images?.[0];
}

/**
 * Metadata per produk.
 *
 * Sebelumnya halaman ini mewarisi metadata root, sehingga SELURUH 900+ halaman
 * produk memakai judul dan deskripsi yang sama persis ("SneakersFlash — Premium
 * Sneakers & Footwear"). Google tidak punya bahan untuk membedakan satu produk
 * dari yang lain, dan setiap tautan yang dibagikan tampil dengan judul generik.
 *
 * Kalau produknya gagal diambil (backend mati, slug tidak dikenal), metadata
 * root yang dipakai — halaman tetap tampil, hanya tanpa metadata khusus.
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ambilProduk(slug);
  if (!product) return {};

  const brand = product.brand?.name ?? "";
  const harga = Number(product.basePrice ?? 0);
  const hargaTeks = harga
    ? `Rp ${harga.toLocaleString("id-ID")}`
    : "harga terbaik";
  const gambar = gambarProduk(product);

  const judul = brand ? `${product.name} — ${brand}` : product.name;
  const deskripsi = (
    `Beli ${product.name}${brand ? ` dari ${brand}` : ""} ${hargaTeks} di ` +
    `SneakersFlash. 100% original, garansi penukaran, gratis ongkir.`
  ).slice(0, 300);

  return {
    title: judul,
    description: deskripsi,
    alternates: { canonical: `${SITE_URL}/products/${slug}` },
    openGraph: {
      type: "website",
      title: judul,
      description: deskripsi,
      url: `${SITE_URL}/products/${slug}`,
      ...(gambar ? { images: [{ url: gambar }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: judul,
      description: deskripsi,
      ...(gambar ? { images: [gambar] } : {}),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  // Wajib di-await
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // JSON-LD Product: tanpa ini hasil pencarian Google tidak pernah menampilkan
  // harga maupun status stok. Dirender di server dan diam-diam dilewati kalau
  // produknya gagal diambil — data terstruktur bukan alasan halaman gagal.
  const product = await ambilProduk(slug);
  let jsonLd: string | null = null;

  if (product) {
    const stok = Number(product.totalStock ?? 0);
    const gambar = gambarProduk(product);

    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      ...(gambar ? { image: [gambar] } : {}),
      ...(product.brand?.name
        ? { brand: { "@type": "Brand", name: product.brand.name } }
        : {}),
      ...(product.skuParent ? { sku: product.skuParent } : {}),
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/products/${slug}`,
        priceCurrency: "IDR",
        price: Number(product.basePrice ?? 0),
        availability:
          stok > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <ProductDetailClient slug={slug} />
    </div>
  );
}
