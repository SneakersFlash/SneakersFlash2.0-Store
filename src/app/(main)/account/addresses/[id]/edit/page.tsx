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
      <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:py-10 text-gray-900 font-sans">
        <div className="w-full max-w-6xl mx-auto min-h-screen md:min-h-fit md:rounded-2xl md:border md:border-gray-200 flex flex-col md:overflow-hidden md:bg-white md:shadow-sm">
          {/* Header skeleton */}
          <div className="bg-white sticky top-0 z-10 shadow-sm md:shadow-none md:static border-b border-gray-100">
            <header className="flex px-4 py-4 md:px-8 md:py-6 items-center gap-4">
              <div className="flex md:hidden w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 w-56 bg-gray-100 rounded-md mt-2 hidden md:block animate-pulse" />
              </div>
            </header>
          </div>

          <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
            <div className="bg-white p-5 md:p-0 rounded-2xl shadow-sm border border-gray-100 md:border-none md:shadow-none animate-pulse space-y-6">
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
              </div>

              {/* Submit button skeleton */}
              <div className="h-14 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !address) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
          <p className="text-gray-900 font-medium text-lg">Address not found</p>
          <p className="text-gray-500 text-sm mt-2">The address you are trying to edit might have been deleted or does not exist.</p>
          <button 
            onClick={() => router.back()} 
            className="mt-6 w-full py-3 bg-[#1C1C1C] text-white rounded-xl font-bold hover:bg-black transition-colors"
          >
            Go Back
          </button>
        </div>
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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:py-10 text-gray-900 font-sans">
      {/* CONTAINER: Max width 5xl */}
      <div className="w-full max-w-5xl mx-auto min-h-screen md:min-h-fit md:rounded-2xl md:border md:border-gray-200 flex flex-col md:overflow-hidden md:bg-white md:shadow-sm">
        
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
              <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">Edit Address</p>
              <p className="text-sm text-gray-400 mt-2 hidden md:block">
                Update your delivery address details
              </p>
            </div>
          </header>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          {/* Form Wrapper: Card style di mobile, menyatu dengan container di desktop */}
          <div className="bg-white p-5 md:p-0 rounded-2xl shadow-sm border border-gray-100 md:border-none md:shadow-none">
            <AddressForm 
              initialData={address} 
              onSubmit={handleSubmit} 
              isLoading={isUpdating} 
              submitLabel="Update Address" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}