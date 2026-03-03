import { cn } from "@/lib/utils/cn";

interface ProductSkeletonProps {
  className?: string;
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-none", className)} />;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div className={cn("group", className)}>
      {/* Image area */}
      <SkeletonBox className="w-full aspect-product" />

      {/* Info */}
      <div className="pt-3 space-y-2">
        {/* Brand */}
        <SkeletonBox className="h-2.5 w-16" />
        {/* Name */}
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
        {/* Price */}
        <SkeletonBox className="h-5 w-24 mt-1" />
        {/* Sizes */}
        <div className="flex gap-1 mt-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards — use while products are loading.
 */
export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {[...Array(count)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
