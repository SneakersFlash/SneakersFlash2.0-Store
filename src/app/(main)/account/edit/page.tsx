// src/app/setup-profile/page.tsx (or wherever this lives)
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMyProfile, useUpdateProfile, useAddAddress } from "@/lib/hooks/useUsers";
import { AddressForm } from "@/components/address/AddressForm";
import type { CreateUserAddressDto } from "@/types/user.types";

export default function SetupProfilePage() {
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const addAddress = useAddAddress();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill name when profile loads
  useEffect(() => {
    if (profile?.name) {
      const [first = "", ...rest] = profile.name.split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
    }
  }, [profile]);

  // This function is triggered when the AddressForm's internal submit button is clicked
  const handleCombineSubmit = async (addressData: CreateUserAddressDto) => {
    setSubmitError(null);
    
    if (!firstName.trim()) {
      setSubmitError("First name is required.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      // 1. Update the core User Profile (Name + Phone)
      // We take the phone number from the AddressForm payload so they stay in sync
      await updateProfile.mutateAsync({ 
        name: fullName, 
        phone: addressData.phone 
      });

      // 2. Save the Address
      // Ensure the very first address is always forced to be the default
      await addAddress.mutateAsync({
        ...addressData,
        isDefault: true, 
      });

      // 3. Redirect to account page on success
      router.push("/account");
    } catch (error) {
      console.error("Failed to setup profile:", error);
      setSubmitError("Failed to save profile. Please check your inputs and try again.");
    }
  };

  const isSaving = updateProfile.isPending || addAddress.isPending;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-gray-900 pb-10">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold">Setup Profile</h1>
      </header>

      <main className="flex-1 p-4">
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-600 font-medium text-center">
            {submitError}
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          {/* ── Core Profile Info (Managed by this page) ── */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Personal Details
            </h4>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Your name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" placeholder="First Name" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text" placeholder="Last Name" value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Your email</label>
              <input type="email" value={profile?.email ?? ""} disabled
                className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>
          </div>

          {/* ── Address Info (Delegated to AddressForm) ── */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Delivery Address
            </h4>
            
            <AddressForm 
              // We pass the phone number down so the form initializes with it
              initialData={{ 
                phone: profile?.phone || "",
                recipientName: profile?.name || "",
                isDefault: true // Force the checkbox to be true visually
              }} 
              onSubmit={handleCombineSubmit} 
              isLoading={isSaving} 
              submitLabel="Complete Setup" 
            />
          </div>

        </div>
      </main>
    </div>
  );
}