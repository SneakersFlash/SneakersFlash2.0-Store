import { ProductCard } from "./ProductCard";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import type { Product } from "@/types/product.types";

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: 2 | 3 | 4;
  priorityCount?: number; // First N cards get priority image loading
}

const COLUMN_CLASSES = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  columns = 4,
  priorityCount = 4,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductSkeletonGrid count={skeletonCount} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-2xl uppercase tracking-widest text-muted-foreground/40">
          No Products Found
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${COLUMN_CLASSES[columns]} gap-x-4 gap-y-8`}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
