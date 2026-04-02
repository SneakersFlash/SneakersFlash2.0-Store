"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);

    return (
        <div className="min-h-screen bg-white sm:bg-gray-50 flex flex-col items-center pt-20 px-4">
        <div className="w-full max-w-md bg-white p-8 sm:rounded-2xl sm:shadow-sm sm:border border-gray-100 text-center flex flex-col items-center">
            
            {/* Icon Success Animasi Sederhana */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 text-sm mb-8">
            Hore! Pesanan kamu dengan nomor <span className="font-bold text-gray-800">{resolvedParams.id}</span> sudah berhasil dibayar dan sedang kami proses.
            </p>
            
            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
            <button 
                onClick={() => router.push(`/orders/${resolvedParams.id}/detail`)} 
                className="w-full bg-[#202020] text-white hover:bg-black font-medium py-3.5 rounded-lg transition flex items-center justify-center gap-2"
            >
                View Order Details
                <ArrowRight size={18} />
            </button>
            
            <button 
                onClick={() => router.push(`/`)} 
                className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-medium py-3.5 rounded-lg transition flex items-center justify-center gap-2"
            >
                <ShoppingBag size={18} />
                Continue Shopping
            </button>
            </div>

        </div>
        </div>
    );
}