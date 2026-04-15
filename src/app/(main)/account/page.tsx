"use client";

import Link from "next/link";
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
  const { data: profile, isLoading, error } = useMyProfile();

  if (isLoading) return <AccountSkeleton />;
  
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <p className="text-red-500 font-reguler">Failed to load profile data.</p>
        <p className="text-[12px] text-gray-500 mt-2">Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-8 lg:pb-16">
      {/* HEADER - Disesuaikan untuk Desktop */}
      <header className="flex lg:hidden bg-white px-4 py-4 lg:py-6 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <p className="text-[16px] lg:text-xl font-bold">My Account</p>
          {/* <button className="p-1 hover:text-orange-500 transition-colors" aria-label="Cart">
            <ShoppingBag className="w-6 h-6 lg:w-7 lg:h-7" />
          </button> */}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:px-4">
        
        {/* LEFT COLUMN: PROFILE & MEMBERSHIP */}
        <div className="lg:col-span-5 space-y-4">
          {/* PROFILE SECTION */}
          <div className="bg-white px-4 pt-4 pb-6 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100">
            <Link href="/account/edit" className="flex items-center justify-between mb-6 gap-2 group">
              <div className="flex items-center gap-4 flex-1">
                <UserCircle className="w-14 h-14 lg:w-16 lg:h-16 text-gray-800 shrink-0 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                <div className="w-full flex-1">
                  <p className="font-semibold text-base lg:text-lg">{profile.name || "User Name"}</p>
                  <div className="flex flex-col text-[12px] text-gray-600 mt-0.5">
                    <span className="truncate">{profile.email || "user@email.com"}</span>
                    <span className="mt-1">{profile.phone || "-"}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-400 w-6 h-6 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* MEMBERSHIP CARD */}
            <div className="bg-gradient-to-r from-orange-400 via-orange-600 to-amber-800 rounded-xl p-4 text-white relative overflow-hidden h-[80px] lg:h-[100px] flex flex-col justify-center shadow-lg shadow-orange-100">
              <div className="relative z-10 lg:ml-10">
                <p className="font-bold text-lg lg:text-xl">{"Bronze"}</p>
                <p className="text-[12px] lg:text-sm opacity-90">
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

          {/* LOGOUT BUTTON - Desktop: Pindah ke bawah profil di kiri */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <button 
              onClick={() => console.log('Handle logout')} 
              className="w-full py-4 text-center font-bold text-orange-500 hover:bg-orange-50 transition-colors"
            >
              Log out from Account
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MENUS */}
        <div className="lg:col-span-7 space-y-2 lg:space-y-4">
          {/* MY PURCHASES */}
          <div className="bg-white mt-2 lg:mt-0 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 lg:py-4 border-b border-gray-100">
              <p className="text-[12px] lg:text-sm text-gray-500 font-semibold">My Purchases</p>
              <Link href="/account/orders" className="text-[12px] lg:text-sm text-orange-500 font-bold hover:underline">
                Purchase History &gt;
              </Link>
            </div>
            
            <div className="flex items-center justify-between px-6 py-4 lg:py-8">
              {PURCHASE_STATUS.map((item) => (
                <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 group">
                  <div className="p-3 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors">
                    <item.icon className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700 group-hover:text-orange-500" strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] lg:text-xs text-gray-700 font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-gray-50">
              {ORDER_MENU.map((item) => (
                <MenuItem key={item.label} item={item} />
              ))}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="bg-white mt-2 lg:mt-0 px-4 py-2 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100">
            <p className="text-[12px] lg:text-sm text-gray-500 font-semibold py-2 border-b border-gray-100 mb-2">
              Activity
            </p>
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-4">
              {ACTIVITY_MENU.map((item) => (
                <MenuItem key={item.label} item={item} />
              ))}
            </div>
          </div>

          {/* INFORMATION AND HELP */}
          <div className="bg-white mt-2 lg:mt-0 px-4 py-2 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100">
            <p className="text-[12px] lg:text-sm text-gray-500 font-semibold py-2 border-b border-gray-100 mb-2">
              Information and help
            </p>
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-4">
              {HELP_MENU.map((item) => (
                <MenuItem key={item.label} item={item} />
              ))}
            </div>
          </div>

          {/* LOGOUT BUTTON - Mobile Only (Hidden on Desktop) */}
          <div className="lg:hidden bg-white mt-2">
            <button 
              onClick={() => console.log('Handle logout')} 
              className="w-full py-4 text-center font-bold text-orange-500"
            >
              Log out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function MenuItem({ item }: { item: { icon: LucideIcon, label: string, href: string } }) {
  return (
    <Link href={item.href} className="flex items-center gap-4 py-3 text-gray-700 hover:bg-gray-50 lg:hover:pl-2 transition-all rounded-lg">
      <div className="p-2 rounded-lg bg-gray-50">
        <item.icon className="w-5 h-5 text-gray-800" strokeWidth={1.5} />
      </div>
      <span className="text-[12px] lg:text-sm font-medium">{item.label}</span>
      <ChevronRight className="ml-auto w-4 h-4 text-gray-300 lg:mr-2" />
    </Link>
  );
}