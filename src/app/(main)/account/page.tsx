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

// --- Menu Data Structures ---
const PURCHASE_STATUS = [
  { icon: Wallet, label: "Payment", href: "/account/orders?status=payment" },
  { icon: Package, label: "Process", href: "/account/orders?status=process" },
  { icon: Truck, label: "Shipping", href: "/account/orders?status=shipping" },
  { icon: ShoppingBag, label: "Receive", href: "/account/orders?status=receive" },
];

const ORDER_MENU = [
  { icon: Ticket, label: "Voucher", href: "/account/vouchers" },
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
        <p className="text-red-500 font-medium">Failed to load profile data.</p>
        <p className="text-sm text-gray-500 mt-2">Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-8">
      {/* HEADER */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">My Account</h1>
        <button className="p-1" aria-label="Cart">
          <ShoppingBag className="w-6 h-6" />
        </button>
      </header>

      {/* PROFILE SECTION */}
      <div className="bg-white px-4 pt-4 pb-6">
        <Link href="/account/edit" className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <UserCircle className="w-14 h-14 text-gray-800" strokeWidth={1.5} />
            <div>
              <h2 className="font-semibold text-base">{profile.name || "User Name"}</h2>
              <p className="text-sm text-gray-600">{profile.email || "user@email.com"}</p>
              <p className="text-sm text-gray-600">{profile.phone || "-"}</p>
            </div>
          </div>
          <ChevronRight className="text-gray-400 w-6 h-6" />
        </Link>

        {/* MEMBERSHIP CARD */}
        <div className="bg-gradient-to-r from-orange-400 via-orange-600 to-amber-800 rounded-xl p-4 text-white relative overflow-hidden h-24 flex flex-col justify-center">
          <div className="relative z-10">
            <h3 className="font-bold text-lg">{profile.customerTier || "Bronze"}</h3>
            <p className="text-sm opacity-90">
              Flash Poin {Number(profile.pointsBalance.d[0] || 0).toLocaleString('id-ID')}
            </p>
          </div>
          {/* Decorative Sneaker Shape (CSS placeholder for the graphic) */}
          <div className="absolute right-[-10px] bottom-[-20px] opacity-30 pointer-events-none">
            <svg width="150" height="100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.9 14.2l-3.3-4.1c-.5-.6-1.3-.9-2.1-.8l-4 .5c-.3 0-.6-.1-.8-.3L8.2 6.3c-.6-.8-1.7-1.1-2.6-.7L2 7.4v10.8c0 1.1.9 2 2 2h15.2c1.7 0 2.9-1.6 2.4-3.2l-.1-.4c-.1-.3-.1-.5.4-.8.4-.2.6-.6.6-1.1 0-.3-.2-.5-.6-.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* MY PURCHASES */}
      <div className="bg-white mt-2">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm text-gray-500 font-medium">My Purchases</h3>
          <Link href="/account/orders" className="text-sm text-orange-500 font-medium">
            Purchase History &gt;
          </Link>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4">
          {PURCHASE_STATUS.map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2">
              <item.icon className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
              <span className="text-[11px] text-gray-700 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="px-4 py-2">
          {ORDER_MENU.map((item) => (
            <MenuItem key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="bg-white mt-2 px-4 py-2">
        <h3 className="text-sm text-gray-500 font-medium py-2 border-b border-gray-100 mb-2">
          Activity
        </h3>
        {ACTIVITY_MENU.map((item) => (
          <MenuItem key={item.label} item={item} />
        ))}
      </div>

      {/* INFORMATION AND HELP */}
      <div className="bg-white mt-2 px-4 py-2">
        <h3 className="text-sm text-gray-500 font-medium py-2 border-b border-gray-100 mb-2">
          Information and help
        </h3>
        {HELP_MENU.map((item) => (
          <MenuItem key={item.label} item={item} />
        ))}
      </div>

      {/* LOGOUT BUTTON */}
      <div className="bg-white mt-2">
        <button 
          onClick={() => console.log('Handle logout')} 
          className="w-full py-4 text-center font-bold text-orange-500"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

// --- Helper Component for Menu Items ---
function MenuItem({ item }: { item: { icon: LucideIcon, label: string, href: string } }) {
  return (
    <Link href={item.href} className="flex items-center gap-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
      <item.icon className="w-5 h-5 text-gray-800" strokeWidth={1.5} />
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );
}