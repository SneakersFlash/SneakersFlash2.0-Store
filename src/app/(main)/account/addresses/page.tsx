// src/app/account/addresses/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { useMyAddresses } from "@/lib/hooks/useUsers";
import { AddressCard } from "@/components/address/AddressCard";
import Image from "next/image";

export default function ListAddressPage() {
    const router = useRouter();
    const { data: addresses, isLoading, error } = useMyAddresses();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="relative w-[50px] h-[50px]">
                <Image
                    src="/images/petir.svg"
                    alt="Loading"
                    fill
                    className="object-contain animate-bounce text-yellow-300"
                />
                </div>
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

    const sortedAddresses = addresses
        ? [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
        : [];

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">

            {/* ── MOBILE LAYOUT (unchanged) ── */}
            <div className="flex flex-col pb-24 md:hidden">
                <header className="bg-white px-4 py-4 flex items-center sticky top-0 z-10 shadow-sm">
                    <button onClick={() => router.back()} className="mr-4 text-gray-900">
                        <ArrowLeft className="w-6 h-6" strokeWidth={2} />
                    </button>
                    <p className="text-[16px] font-bold">List Address</p>
                </header>

                <main className="flex-1 p-4 flex flex-col gap-4">
                    {sortedAddresses.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">No addresses found.</div>
                    ) : (
                        sortedAddresses.map((address) => (
                            <AddressCard key={address.id} address={address} />
                        ))
                    )}
                    <Link
                        href="/account/addresses/add"
                        className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Address
                    </Link>
                </main>
            </div>

            {/* ── DESKTOP LAYOUT (≥ md) ── */}
            <div className="hidden md:block">
                <div className="max-w-6xl mx-auto px-8 py-10">

                    {/* Back + page title — no card, just clean inline header */}
                    <div className="flex items-center gap-3 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-none">My Addresses</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                {sortedAddresses.length} address{sortedAddresses.length !== 1 ? "es" : ""} saved
                            </p>
                        </div>
                    </div>

                    {/* Address grid — 2 cols on large screens */}
                    {sortedAddresses.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No addresses saved yet.</p>
                            <p className="text-sm text-gray-400">Add your first address to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {sortedAddresses.map((address) => (
                                <AddressCard key={address.id} address={address} />
                            ))}
                        </div>
                    )}

                    {/* Add New Address */}
                    <Link
                        href="/account/addresses/add"
                        className="mt-4 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-medium hover:bg-white hover:border-orange-400 hover:text-orange-500 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Address
                    </Link>
                </div>
            </div>

        </div>
    );
}