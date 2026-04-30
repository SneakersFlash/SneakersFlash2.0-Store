import { Suspense } from "react";
import MyOrdersContent from "./content";
import PageLoader from "@/components/common/PageLoader";

export const dynamic = "force-dynamic";

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MyOrdersContent />
    </Suspense>
  );
}