// src/app/account/addresses/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useMyAddresses } from "@/lib/hooks/useUsers";
import { AddressCard } from "@/components/address/AddressCard";

export default function ListAddressPage() {
    const router = useRouter();
    const { data: addresses, isLoading, error } = useMyAddresses();

    if (isLoading) {
        return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-[#F8F9FA]">
            <p className="text-red-500 font-medium">Failed to load addresses.</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-orange-500 font-bold">
            Try Again
            </button>
        </div>
        );
    }

    // Sort: Default address appears first
    const sortedAddresses = addresses
        ? [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
        : [];

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 flex flex-col font-sans">
        <header className="bg-white px-4 py-4 flex items-center sticky top-0 z-10 shadow-sm">
            <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-900"
            >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <p className="text-[16px] font-bold">List Address</p>
        </header>

        <main className="flex-1 p-4 flex flex-col gap-4">
            {sortedAddresses.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
                No addresses found.
            </div>
            ) : (
            sortedAddresses.map((address) => (
                <AddressCard key={address.id} address={address} />
            ))
            )}

            {/* Add New Address Button */}
            <Link 
            href="/account/addresses/add"
            className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
            <Plus className="w-5 h-5" />
            Add New Address
            </Link>
        </main>
        </div>
    );
}