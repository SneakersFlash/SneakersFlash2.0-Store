
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductGrid } from "./ProductGrid";

// ==========================================
export function RelatedProducts({ categoryName, currentProductId }: { categoryName?: string, currentProductId: string }) {
  // Ambil produk berdasarkan kategori yang sama, limit 5 (karena 1 mungkin produk yang sama dan akan di-filter)
    const { data, isLoading } = useProducts({ categoryName, limit: 5 });
    
    // Filter agar produk yang sedang dilihat tidak muncul di rekomendasi, lalu ambil maksimal 4
    const products = (data?.data || [])
        .filter((p) => p.id !== currentProductId)
        .slice(0, 4);

    // Jika tidak ada data yang terkait, jangan render apa-apa
    if (!isLoading && products.length === 0) return null;

    return (
        <ProductGrid 
        products={products} 
        isLoading={isLoading} 
        columns={2} 
        skeletonCount={4} 
        />
    );
}