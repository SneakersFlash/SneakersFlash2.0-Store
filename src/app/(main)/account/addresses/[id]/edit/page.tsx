"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMyAddress, useUpdateAddress } from "@/lib/hooks/useUsers";
import { AddressForm } from "@/components/address/AddressForm";
import type { CreateUserAddressDto } from "@/types/user.types";

export default function EditAddressPage() {
    const router = useRouter();
    const params = useParams();
    const addressId = Number(params.id);

    const { data: address, isLoading, isError } = useMyAddress(addressId);
    const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

    if (isLoading) {
        return (
        <div className="min-h-screen bg-white text-gray-900 pb-10 flex flex-col font-sans">
            {/* Header skeleton */}
            <header className="px-4 py-4 flex items-center sticky top-0 bg-white z-10 border-b border-gray-100">
            <button onClick={() => router.back()} className="mr-4 text-gray-900">
                <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-lg font-bold">Edit Address</h1>
            </header>

            <main className="flex-1 p-4 space-y-6 animate-pulse">
            {/* Label chips */}
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                <div className="flex gap-2">
                <div className="h-9 w-16 bg-gray-200 rounded-xl" />
                <div className="h-9 w-16 bg-gray-200 rounded-xl" />
                <div className="h-9 w-24 bg-gray-200 rounded-xl" />
                </div>
            </div>

            {/* Recipient + Phone */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 rounded-md" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
                <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
            </div>

            {/* Map */}
            <div className="space-y-2">
                <div className="flex justify-between">
                <div className="h-4 w-28 bg-gray-200 rounded-md" />
                <div className="h-6 w-28 bg-gray-200 rounded-full" />
                </div>
                <div className="h-52 bg-gray-200 rounded-xl" />
            </div>

            {/* Area Details */}
            <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
            </div>

            {/* Street */}
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                <div className="h-24 bg-gray-200 rounded-xl" />
            </div>

            {/* Default checkbox row */}
            <div className="h-14 bg-gray-200 rounded-xl" />

            {/* Submit button */}
            <div className="h-14 bg-gray-200 rounded-xl" />
            </main>
        </div>
        );
    }

    if (isError || !address) {
        return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <p className="text-gray-500">Address not found.</p>
            <button onClick={() => router.back()} className="mt-4 text-orange-500 font-bold">Go Back</button>
        </div>
        );
    }

    const handleSubmit = (data: CreateUserAddressDto) => {
        updateAddress({ id: addressId, data }, {
        onSuccess: () => router.push("/account/addresses"),
        onError: () => alert("Failed to update address. Please try again.")
        });
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-10 flex flex-col font-sans">
        <header className="px-4 py-4 flex items-center sticky top-0 bg-white z-10 border-b border-gray-100">
            <button onClick={() => router.back()} className="mr-4 text-gray-900">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-lg font-bold">Edit Address</h1>
        </header>
        <main className="flex-1 p-4">
            <AddressForm initialData={address} onSubmit={handleSubmit} isLoading={isUpdating} submitLabel="Update Address" />
        </main>
        </div>
    );
}