"use client";

import { useProducts } from "@/lib/hooks/useProducts";
import { ProductGrid } from "./ProductGrid";

interface RelatedProductsProps {
  categoryName?: string;
  currentProductId: string;
}

export function RelatedProducts({ categoryName, currentProductId }: RelatedProductsProps) {
  const { data, isLoading } = useProducts({ category: categoryName, limit: 5 });
    
  const products = (data?.data || [])
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (!isLoading && products.length === 0) return null;

  return (
    <div className="w-full">
      <ProductGrid 
        products={products} 
        isLoading={isLoading} 
        columns={4}
        skeletonCount={4} 
      />
    </div>
  );
}