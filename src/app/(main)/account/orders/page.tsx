import { Suspense } from "react";
import MyOrdersContent from "./content";

export const dynamic = "force-dynamic";

export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <span className="text-[#FF6B00] font-bold">Loading orders...</span>
      </div>
    }>
      <MyOrdersContent/>
    </Suspense>
  );
}