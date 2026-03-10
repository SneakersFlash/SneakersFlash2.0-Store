import { ProductDetailClient } from "./ProductDetailClient";

// Di Next.js 15, params adalah Promise
type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Wajib di-await
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return (
    <div className="min-h-screen bg-white">
      <ProductDetailClient slug={slug} />
    </div>
  );
}