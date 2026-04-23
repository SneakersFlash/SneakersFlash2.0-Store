import { categoriesService } from "@/lib/api/categories.service";
import { ProductListingClient } from "./ProductListingClient";
import Image from "next/image";

type ProductsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  
  let categoryData = null;
  let subCategories: any = [];

  if (categorySlug) {
    try {
      const categories = await categoriesService.getAll();
      categoryData = categories.find((c: any) => c.slug === categorySlug) || null;
      
      if (categoryData && categoryData.children) {
        subCategories = categoryData.children; 
      }
    } catch (error) {
      console.error("Failed to fetch category");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      {/* HEADER BANNER CATEGORY */}
      {categoryData?.imageUrl && (
        <div className="relative w-full h-[25vh] min-h-[220px] md:h-[35vh] shrink-0 overflow-hidden">
          <Image
            src={categoryData.imageUrl}
            alt={categoryData.name}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 container mx-auto max-w-7xl px-4 flex flex-col justify-end pb-8 md:pb-12">
            <span className="text-[#FF6B00] font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] mb-1.5 md:mb-2">
              Explore Collection
            </span>
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