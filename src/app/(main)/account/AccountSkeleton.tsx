export function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white px-4 py-4 flex items-center justify-between">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
      </div>

      {/* Profile Skeleton */}
      <div className="bg-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
        </div>
        
        {/* Card Skeleton */}
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>

      {/* My Purchases Skeleton */}
      <div className="bg-white mt-2 p-4">
        <div className="flex justify-between mb-6">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between px-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="w-12 h-3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-5 w-48 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Activity Menu Skeleton */}
      <div className="bg-white mt-2 p-4 space-y-6">
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}