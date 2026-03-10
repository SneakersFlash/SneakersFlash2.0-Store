"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Trash2, Edit3, Zap } from "lucide-react";
import Image from "next/image";

// --- MOCK DATA ---
const INITIAL_CART = [
  {
    id: "1",
    name: "Nike Full Force Low Men'...",
    variant: "Black [EU 43]",
    price: 649500, // Menggunakan harga yang masuk akal sesuai subtotal di screenshot
    originalPrice: 1299000,
    points: 21500,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80", // Placeholder sepatu
    selected: true,
  },
  {
    id: "2",
    name: "Nike Full Force Low Men'...",
    variant: "Black [EU 42]",
    price: 649500,
    originalPrice: 1299000,
    points: 21500,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
    selected: false,
  },
  {
    id: "3",
    name: "Nike Full Force Low Men'...",
    variant: "White [EU 44]",
    price: 649500,
    originalPrice: 1299000,
    points: 21500,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
    selected: false,
  },
];

export function ShoppingCart() {
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  // --- LOGIC FUNCTIONS ---
  const toggleItemSelection = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllSelection = () => {
    const isAllSelected = cartItems.every((item) => item.selected);
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, selected: !isAllSelected }))
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // --- CALCULATIONS ---
  const selectedItems = cartItems.filter((item) => item.selected);
  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalPoints = selectedItems.reduce((acc, item) => acc + item.points * item.quantity, 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50 md:max-w-md md:mx-auto md:border-x md:shadow-lg">
      
      {/* --- HEADER --- */}
      <header className="flex items-center px-4 py-4 bg-white border-b border-gray-200 shrink-0 z-10 sticky top-0">
        <button className="p-1 -ml-1 text-zinc-900 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-3 font-bold text-lg text-zinc-900 tracking-tight">
          Shopping Cart
        </h1>
      </header>

      {/* --- SELECT ALL BAR --- */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0 z-10 sticky top-[65px]">
        <label className="flex items-center gap-3 cursor-pointer">
          <CustomCheckbox checked={isAllSelected} onChange={toggleAllSelection} />
          <span className="text-sm font-medium text-zinc-700">
            Selected ({selectedItems.length})
          </span>
        </label>
        {selectedItems.length > 0 && (
          <button className="text-sm font-semibold text-[#FF6B00]">
            Remove
          </button>
        )}
      </div>

      {/* --- CART ITEM LIST --- */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-4">
        <div className="flex flex-col gap-2 p-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-white rounded-lg">
              {/* Checkbox */}
              <div className="pt-1 shrink-0">
                <CustomCheckbox
                  checked={item.selected}
                  onChange={() => toggleItemSelection(item.id)}
                />
              </div>

              {/* Product Image */}
              <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                {/* Fallback menggunakan img tag biasa jika tidak ada next.config domains */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                      <span>{item.variant}</span>
                      <Edit3 size={12} className="cursor-pointer" />
                    </div>
                  </div>
                  {/* Action Icons */}
                  <div className="flex items-center gap-2 shrink-0 text-zinc-400">
                    <button className="hover:text-zinc-600">
                      <Heart size={18} />
                    </button>
                    <button className="hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Points */}
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="bg-black text-white p-0.5 rounded-full">
                    <Zap size={10} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-700">
                    Earn SF Points: <span className="font-bold">{item.points.toLocaleString("id-ID")}</span>
                  </span>
                </div>

                {/* Price & Quantity */}
                <div className="flex items-end justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900">
                      Rp{item.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-zinc-400 line-through">
                      Rp{item.originalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-200 rounded-md h-8">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 flex items-center justify-center text-zinc-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </motion.button>
                    <span className="w-8 text-center text-sm font-medium text-zinc-900">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 flex items-center justify-center text-zinc-600 hover:bg-gray-50"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- FOOTER (CHECKOUT BAR) --- */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0 pb-safe">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">Subtotal</span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              Rp{subtotal.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              You'll earn {totalPoints.toLocaleString("id-ID")} SF Points!
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className={`px-6 py-3.5 rounded-xl font-bold text-white transition-colors ${
              selectedItems.length > 0
                ? "bg-[#1C1C1C] hover:bg-black"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={selectedItems.length === 0}
          >
            Checkout ({selectedItems.length})
          </motion.button>
        </div>
      </div>

    </div>
  );
}

// --- KOMPONEN CUSTOM CHECKBOX ---
function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-5 h-5 flex items-center justify-center rounded border transition-colors cursor-pointer ${
        checked ? "bg-[#FF6B00] border-[#FF6B00]" : "bg-white border-gray-400"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}