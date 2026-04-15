import { Suspense } from "react";
import MyVouchersContent from "./content";

export const dynamic = "force-dynamic";

export default function MyVouchersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B00]" />
            </div>
            }>
            <MyVouchersContent />
        </Suspense>
    );
}