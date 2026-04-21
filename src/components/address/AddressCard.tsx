// src/components/AddressCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, MapPin, MoreHorizontal, Star, Trash2 } from "lucide-react";
import type { UserAddress } from "@/types/user.types";
import { useUpdateAddress, useDeleteAddress } from "@/lib/hooks/useUsers";

interface AddressCardProps {
    address: UserAddress;
}

export function AddressCard({ address }: AddressCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
    const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

    const handleSetDefault = () => {
        updateAddress({ id: address.id, data: { isDefault: true } });
        setIsMenuOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this address?")) {
        deleteAddress(address.id);
        }
        setIsMenuOpen(false);
    };

    return (
        <div
        className={`bg-white px-2 py-2 rounded-lg border-2 transition-all ${
            address.isDefault ? "border-primary" : "border-gray-200"
        }`}
        >
        {/* Top Row: Label & Share */}
        <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
            <h2 className="font-bold text-[12px] text-gray-900">
                {address.label || "Address"}
            </h2>
            {address.isDefault && (
                <span className="bg-primary font-bold text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Utama
                </span>
            )}
            </div>
            {/* <button className="text-gray-900 p-1" aria-label="Share Address">
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
            </button> */}
        </div>

        {/* Middle Row: Contact & Address Info */}
        <div className="mb-3 space-y-[0.5px]">
            <p className="text-[12px] text-gray-800">{address.recipientName}</p>
            <p className="text-[13px] text-gray-500">{address.phone}</p>
            <p className="text-[13px] text-gray-500 leading-relaxed">
            {address.addressLine}
            {address.district?.name && `, ${address.district.name}`}
            {address.city?.name && `, ${address.city.name}`}
            </p>
        </div>

        {/* Map Pin */}
        <div className="flex items-center gap-1.5 mb-4">
            <MapPin className="w-4 h-4 text-yellow" strokeWidth={2} />
            <span className="text-[13px] font-medium text-gray-800">Pin Map</span>
        </div>

        {/* Bottom Row: Actions */}
        <div className="flex gap-2 relative">
            <Link
            href={`/account/addresses/${address.id}/edit`}
            className={`flex items-center justify-center py-2.5 border border-gray-300 rounded-lg text-[13px] font-bold text-gray-900 hover:bg-gray-50 transition-colors ${
                address.isDefault ? "flex-1" : "flex-[4]"
            }`}
            >
            Edit Address
            </Link>
            
            {/* More Options Menu (Only for non-default addresses) */}
            {!address.isDefault && (
            <div className="relative flex-[1]">
                <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full h-full flex items-center justify-center border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
                >
                <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-20">
                    <button 
                    onClick={handleSetDefault}
                    disabled={isUpdating}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left disabled:opacity-50 border-b border-gray-50"
                    >
                    <Star className="w-4 h-4 text-gray-400" /> 
                    {isUpdating ? "Setting..." : "Set as Default"}
                    </button>
                    <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left disabled:opacity-50"
                    >
                    <Trash2 className="w-4 h-4 text-red-500" /> 
                    {isDeleting ? "Deleting..." : "Delete Address"}
                    </button>
                </div>
                )}
            </div>
            )}
        </div>
        </div>
    );
}