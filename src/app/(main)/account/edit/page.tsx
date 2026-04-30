// src/app/setup-profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageLoader from "@/components/common/PageLoader";
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

  const handleCombineSubmit = async (addressData: CreateUserAddressDto) => {
    setSubmitError(null);

    if (!firstName.trim()) {
      setSubmitError("First name is required.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      await updateProfile.mutateAsync({
        name: fullName,
        phone: addressData.phone,
      });

      await addAddress.mutateAsync({
        ...addressData,
        isDefault: true,
      });

      router.push("/account");
    } catch (error) {
      console.error("Failed to setup profile:", error);
      setSubmitError("Failed to save profile. Please check your inputs and try again.");
    }
  };

  const isSaving = updateProfile.isPending || addAddress.isPending;

  if (profileLoading) {
    return <PageLoader />;
  }

  const personalDetailsSection = (
    <div className="space-y-4 border-b border-gray-100 pb-6">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <span className="bg-[#FFF0E6] text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-xs">
          1
        </span>
        Personal Details
      </h4>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Your name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-colors"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Your email</label>
        <input
          type="email"
          value={profile?.email ?? ""}
          disabled
          className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
      </div>
    </div>
  );

  const addressSection = (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <span className="bg-[#FFF0E6] text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-xs">
          2
        </span>
        Delivery Address
      </h4>

      <AddressForm
        initialData={{
          phone: profile?.phone || "",
          recipientName: profile?.name || "",
          isDefault: true,
        }}
        onSubmit={handleCombineSubmit}
        isLoading={isSaving}
        submitLabel="Complete Setup"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:py-10 text-gray-900 font-sans">
      {/* CONTAINER: Max width 5xl, seragam dengan halaman Address/Orders */}
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
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-none">Setup Profile</h1>
              <p className="text-sm text-gray-400 mt-2 hidden md:block">
                Complete your profile to get started
              </p>
            </div>
          </header>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center justify-center">
              {submitError}
            </div>
          )}

          {/* Wrapper form: card style di mobile, menyatu (tanpa border) di desktop */}
          <div className="bg-white p-5 md:p-0 rounded-2xl shadow-sm border border-gray-100 md:border-none md:shadow-none space-y-6 md:space-y-8">
            {personalDetailsSection}
            {addressSection}
          </div>
        </div>
      </div>
    </div>
  );
}