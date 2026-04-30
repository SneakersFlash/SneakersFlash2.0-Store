import { Suspense } from "react";
import MyVouchersContent from "./content";
import PageLoader from "@/components/common/PageLoader";

export const dynamic = "force-dynamic";

export default function MyVouchersPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <MyVouchersContent />
        </Suspense>
    );
}