import { categoriesService } from "@/lib/api/categories.service";
import { ProductListingClient } from "./ProductListingClient";
import Image from "next/image";

// 1. Tipe data searchParams WAJIB berupa Promise di Next.js 15
type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // 2. WAJIB di-await sebelum nilainya bisa dibaca
  const resolvedParams = await searchParams;
  
  // 3. Ambil nilai category setelah di-await
  const categorySlug = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  
  let categoryData = null;
  let subCategories: any = [];

  if (categorySlug) {
    try {
      // Ambil data dari NestJS API Anda
      const categories = await categoriesService.getAll();
      categoryData = categories.find((c: any) => c.slug === categorySlug) || null;
      
      // Mengambil anak kategori jika disematkan pada properti 'children'
      if (categoryData && categoryData.children) {
        subCategories = categoryData.children; 
      }
    } catch (error) {
      console.error("Failed to fetch category");
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      {categoryData?.imageUrl && (
        <div className="relative w-full h-48 md:h-64 bg-gray-900 shrink-0">
          <Image
            src={categoryData.imageUrl}
            alt={categoryData.name}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-3xl font-display font-bold uppercase tracking-widest drop-shadow-md">
              {categoryData.name}
            </h1>
          </div>
        </div>
      )}

      {/* --- CLIENT COMPONENT --- */}
      <ProductListingClient
        categoryName={categoryData?.name}
        subCategories={subCategories}
      />
    </div>
  );
}