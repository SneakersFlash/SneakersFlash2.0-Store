export function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8 animate-pulse">

      {/* ── MOBILE SKELETON (hidden on desktop) ── */}
      <div className="md:hidden">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>

        {/* Profile */}
        <div className="bg-white px-4 pt-4 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-20 bg-gray-200 rounded-xl" />
        </div>

        {/* My Purchases */}
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

        {/* Activity */}
        <div className="bg-white mt-2 p-4 space-y-5">
          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-9 h-9 bg-gray-200 rounded-lg" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP SKELETON (hidden on mobile) ── */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-8 py-10">

          {/* Page title */}
          <div className="mb-8 space-y-2">
            <div className="h-6 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>

          <div className="grid grid-cols-12 gap-6">

            {/* LEFT column */}
            <div className="col-span-5 space-y-4">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 pt-5 pb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-[100px] bg-gray-200 rounded-xl" />
              </div>

              {/* Logout */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="py-4 flex justify-center">
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* RIGHT column */}
            <div className="col-span-7 space-y-4">

              {/* My Purchases */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between px-8 py-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="w-14 h-3 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-2 border-t border-gray-50 space-y-1 pt-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-2">
                      <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-36 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-2">
                <div className="h-4 w-20 bg-gray-200 rounded py-3 mb-3 border-b border-gray-100" />
                <div className="grid grid-cols-2 gap-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Help */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-2">
                <div className="h-4 w-36 bg-gray-200 rounded py-3 mb-3 border-b border-gray-100" />
                <div className="grid grid-cols-2 gap-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}