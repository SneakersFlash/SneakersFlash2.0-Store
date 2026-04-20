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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:py-10 text-gray-900 font-sans">
      {/* CONTAINER: Max width 5xl */}
      <div className="w-full max-w-6xl mx-auto min-h-screen md:min-h-fit md:rounded-2xl md:border md:border-gray-200 flex flex-col md:overflow-hidden md:bg-white md:shadow-sm">
        
        {/* HEADER BLOCK: Sticky di mobile, static di desktop */}
        <div className="bg-white sticky top-0 z-10 shadow-sm md:shadow-none md:static border-b border-gray-100">
          <header className="flex px-4 py-4 md:px-8 md:py-6 items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="flex md:hidden w-10 h-10 items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="text-gray-900" />
            </button>
            
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">Add New Address</p>
              <p className="text-sm text-gray-400 mt-2 hidden md:block">
                Fill in the details below to add a new delivery address
              </p>
            </div>
          </header>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          {/* Form Wrapper: Card style di mobile, menyatu dengan container di desktop */}
          <div className="bg-white p-5 md:p-0 rounded-2xl shadow-sm border border-gray-100 md:border-none md:shadow-none">
            <AddressForm 
              onSubmit={handleSubmit} 
              isLoading={isPending} 
              submitLabel="Save Address" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}