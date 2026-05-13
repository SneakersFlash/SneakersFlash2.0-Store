"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  ChevronRight,
  Wallet,
  Package,
  Truck,
  ShoppingBag,
  Ticket,
  MapPin,
  Heart,
  Clock,
  Star,
  Store,
  HelpCircle,
  MessageSquare,
  FileText,
  LucideIcon
} from "lucide-react";
import { useMyProfile } from "@/lib/hooks/useUsers";
import { useAuthStore } from "@/lib/store/authStore";
import { AccountSkeleton } from "./AccountSkeleton";

const PURCHASE_STATUS = [
  { icon: Wallet, label: "Payment", href: "/account/orders?status=payment" },
  { icon: Package, label: "Process", href: "/account/orders?status=process" },
  { icon: Truck, label: "Shipping", href: "/account/orders?status=shipping" },
  { icon: ShoppingBag, label: "Receive", href: "/account/orders?status=receive" },
];

const ORDER_MENU = [
  { icon: Ticket, label: "My Voucher", href: "/account/my-vouchers" },
  { icon: Wallet, label: "Payment Confirmation", href: "/account/payment-confirmation" },
];

const ACTIVITY_MENU = [
  { icon: MapPin, label: "Address", href: "/account/addresses" },
  { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
  { icon: Clock, label: "Last preview", href: "/account/recently-viewed" },
  { icon: Star, label: "Your review", href: "/account/reviews" },
];

const HELP_MENU = [
  { icon: Store, label: "About us", href: "/about" },
  { icon: HelpCircle, label: "Help center", href: "/help" },
  { icon: MessageSquare, label: "Ask Customer Service", href: "/contact" },
  { icon: FileText, label: "Term", href: "/terms" },
];

export default function MyAccountPage() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const { data: profile, isLoading, error } = useMyProfile();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (isLoading) return <AccountSkeleton />;
  
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <p className="text-red-500 font-regular">Failed to load profile data.</p>
        <p className="text-[12px] text-gray-500 mt-2">Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-8 lg:pb-16">

      {/* ── MOBILE HEADER (hidden on desktop) ── */}
      <header className="flex md:hidden bg-white px-4 py-4 items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <p className="text-[16px] font-bold">My Account</p>
      </header>

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden">
        {/* Profile Section */}
        <div className="bg-white px-4 pt-4 pb-6">
          <Link href="/account/edit" className="flex items-center justify-between mb-6 gap-2 group">
            <div className="flex items-center gap-4 flex-1">
              <UserCircle className="w-14 h-14 text-gray-800 shrink-0 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
              <div className="w-full flex-1">
                <p className="font-semibold text-base">{profile.name || "User Name"}</p>
                <div className="flex flex-col text-[12px] text-gray-600 mt-0.5">
                  <span className="truncate">{profile.email || "user@email.com"}</span>
                  <span className="mt-1">{profile.phone || "-"}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="text-gray-400 w-6 h-6 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Membership Card */}
          <div className="bg-gradient-to-r from-orange-400 via-orange-600 to-amber-800 rounded-xl p-4 text-white relative overflow-hidden h-[80px] flex flex-col justify-center shadow-lg shadow-orange-100">
            <div className="relative z-10">
              <p className="font-bold text-lg">{profile.customerTier.toUpperCase()}</p>
              <p className="text-[12px] opacity-90">
                Flash Poin {Number(profile.pointsBalance?.d?.[0] || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="absolute right-[-10px] bottom-[-20px] opacity-30 pointer-events-none transform rotate-[-15deg]">
              <svg width="150" height="100" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.9 14.2l-3.3-4.1c-.5-.6-1.3-.9-2.1-.8l-4 .5c-.3 0-.6-.1-.8-.3L8.2 6.3c-.6-.8-1.7-1.1-2.6-.7L2 7.4v10.8c0 1.1.9 2 2 2h15.2c1.7 0 2.9-1.6 2.4-3.2l-.1-.4c-.1-.3-.1-.5.4-.8.4-.2.6-.6.6-1.1 0-.3-.2-.5-.6-.5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* My Purchases */}
        <div className="bg-white mt-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-[12px] text-gray-500 font-semibold">My Purchases</p>
            <Link href="/account/orders" className="text-[12px] text-orange-500 font-bold hover:underline">
              Purchase History &gt;
            </Link>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            {PURCHASE_STATUS.map((item) => (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 group">
                <div className="p-3 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors">
                  <item.icon className="w-6 h-6 text-gray-700 group-hover:text-orange-500" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] text-gray-700 font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-50">
            {ORDER_MENU.map((item) => (
              <MenuItem key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white mt-2 px-4 py-2">
          <p className="text-[12px] text-gray-500 font-semibold py-2 border-b border-gray-100 mb-2">Activity</p>
          {ACTIVITY_MENU.map((item) => (
            <MenuItem key={item.label} item={item} />
          ))}
        </div>

        {/* Help */}
        <div className="bg-white mt-2 px-4 py-2">
          <p className="text-[12px] text-gray-500 font-semibold py-2 border-b border-gray-100 mb-2">Information and help</p>
          {HELP_MENU.map((item) => (
            <MenuItem key={item.label} item={item} />
          ))}
        </div>

        {/* Logout - Mobile */}
        <div className="bg-white mt-2">
          <button
            onClick={handleLogout}
            className="w-full py-4 text-center font-bold text-orange-500"
          >
            Log out
          </button>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (≥ md) ── */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-8 py-10">

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 leading-none">My Account</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your profile and preferences</p>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-12 gap-6">

            {/* LEFT: Profile + Logout */}
            <div className="col-span-5 space-y-4">

              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 pt-5 pb-6">
                <Link href="/account/edit" className="flex items-center justify-between mb-6 gap-2 group">
                  <div className="flex items-center gap-4 flex-1">
                    <UserCircle className="w-16 h-16 text-gray-800 shrink-0 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base">{profile.name || "User Name"}</p>
                      <div className="flex flex-col text-[12px] text-gray-500 mt-0.5 gap-0.5">
                        <span className="truncate">{profile.email || "user@email.com"}</span>
                        <span>{profile.phone || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 w-5 h-5 shrink-0 group-hover:translate-x-1 group-hover:text-orange-400 transition-all" />
                </Link>

                {/* Membership card */}
                <div className="bg-gradient-to-r from-orange-400 via-orange-600 to-amber-800 rounded-xl p-4 text-white relative overflow-hidden h-[100px] flex flex-col justify-center shadow-lg shadow-orange-100">
                  <div className="relative z-10 ml-2">
                    <p className="font-bold text-xl">{"Bronze"}</p>
                    <p className="text-sm opacity-90">
                      Flash Poin {Number(profile.pointsBalance?.d?.[0] || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="absolute right-[-10px] bottom-[-20px] opacity-30 pointer-events-none transform rotate-[-15deg]">
                    <svg width="150" height="100" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.9 14.2l-3.3-4.1c-.5-.6-1.3-.9-2.1-.8l-4 .5c-.3 0-.6-.1-.8-.3L8.2 6.3c-.6-.8-1.7-1.1-2.6-.7L2 7.4v10.8c0 1.1.9 2 2 2h15.2c1.7 0 2.9-1.6 2.4-3.2l-.1-.4c-.1-.3-.1-.5.4-.8.4-.2.6-.6.6-1.1 0-.3-.2-.5-.6-.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full py-4 text-center font-bold text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  Log out from Account
                </button>
              </div>
            </div>

            {/* RIGHT: Menus */}
            <div className="col-span-7 space-y-4">

              {/* My Purchases */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500 font-semibold">My Purchases</p>
                  <Link href="/account/orders" className="text-sm text-orange-500 font-bold hover:underline">
                    Purchase History &gt;
                  </Link>
                </div>
                <div className="flex items-center justify-between px-8 py-6">
                  {PURCHASE_STATUS.map((item) => (
                    <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 group">
                      <div className="p-3 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors">
                        <item.icon className="w-7 h-7 text-gray-700 group-hover:text-orange-500" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="px-5 pb-2 border-t border-gray-50">
                  {ORDER_MENU.map((item) => (
                    <MenuItem key={item.label} item={item} />
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-2">
                <p className="text-sm text-gray-500 font-semibold py-3 border-b border-gray-100 mb-1">
                  Activity
                </p>
                <div className="grid grid-cols-2 gap-x-4">
                  {ACTIVITY_MENU.map((item) => (
                    <MenuItem key={item.label} item={item} />
                  ))}
                </div>
              </div>

              {/* Information and Help */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-2">
                <p className="text-sm text-gray-500 font-semibold py-3 border-b border-gray-100 mb-1">
                  Information and help
                </p>
                <div className="grid grid-cols-2 gap-x-4">
                  {HELP_MENU.map((item) => (
                    <MenuItem key={item.label} item={item} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function MenuItem({ item }: { item: { icon: LucideIcon, label: string, href: string } }) {
  return (
    <Link href={item.href} className="flex items-center gap-4 py-3 text-gray-700 hover:bg-gray-50 md:hover:pl-2 transition-all rounded-lg">
      <div className="p-2 rounded-lg bg-gray-50">
        <item.icon className="w-5 h-5 text-gray-800" strokeWidth={1.5} />
      </div>
      <span className="text-[12px] md:text-sm font-medium">{item.label}</span>
      <ChevronRight className="ml-auto w-4 h-4 text-gray-300 md:mr-2" />
    </Link>
  );
}