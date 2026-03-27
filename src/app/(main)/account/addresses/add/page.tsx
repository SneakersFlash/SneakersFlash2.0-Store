"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAddAddress } from "@/lib/hooks/useUsers";
import { AddressForm } from "@/components/address/AddressForm";
import type { CreateUserAddressDto } from "@/types/user.types";

export default function AddAddressPage() {
    const router = useRouter();
    const { mutate: addAddress, isPending } = useAddAddress();

    const handleSubmit = (data: CreateUserAddressDto) => {
        addAddress(data, {
        onSuccess: () => router.push("/account/addresses"),
        onError: () => alert("Failed to save address. Please check your inputs.")
        });
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-10 flex flex-col font-sans">
        <header className="px-4 py-4 flex items-center sticky top-0 bg-white z-10 border-b border-gray-100">
            <button onClick={() => router.back()} className="mr-4 text-gray-900">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-lg font-bold">Add New Address</h1>
        </header>
        <main className="flex-1 p-4">
            <AddressForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Save Address" />
        </main>
        </div>
    );
}