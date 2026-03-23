import { Suspense } from "react";
import MyOrdersContent from "./content";

export const dynamic = "force-dynamic"; // ← add this

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <MyOrdersContent/>
    </Suspense>
  );
}