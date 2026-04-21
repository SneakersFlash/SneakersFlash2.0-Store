"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, Zap, Check, Tag, ChevronRight, Ticket } from "lucide-react";

import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";

// --- DUMMY DATA VOUCHER ---
const DUMMY_VOUCHERS = [
  { 
    id: "v1", 
    code: "SNEAKER10", 
    title: "Diskon 10% Sepatu Baru", 
    desc: "Berlaku untuk semua item tanpa minimal belanja.", 
    discountPercentage: 0.1 
  },
  { 
    id: "v2", 
    code: "WEEKEND15", 
    title: "Spesial Weekend 15%", 
    desc: "Diskon ekstra untuk menemanimu akhir pekan ini.", 
    discountPercentage: 0.15 
  },
  { 
    id: "v3", 
    code: "HOKI5", 
    title: "Diskon Tipis 5%", 
    desc: "Lumayan buat potong harga total belanjaanmu.", 
    discountPercentage: 0.05 
  },
];

export function CartSidebar() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const {
    items,
    isOpen,
    selectedItemIds,
    closeCart,
    fetchCart,
    updateQuantity,
    removeItem,
    toggleSelectItem, 
    selectAll,
    deselectAll,
  } = useCartStore();

  // State untuk fitur Voucher
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; title: string; discountPercentage: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        closeCart();
        router.push("/login");
      } else {
        fetchCart();
      }
    }
  }, [isOpen, isAuthenticated, fetchCart, closeCart, router]);

  // Kalkulasi hanya untuk barang yang dicentang
  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;

  const { totalItems, subtotal, totalPoints } = selectedItems.reduce(
    (acc, item) => {
      const price = Number(item.price);
      const qty = item.quantity;
      const points = Math.floor(price * 0.033); 

      return {
        totalItems: acc.totalItems + qty,
        subtotal: acc.subtotal + price * qty,
        totalPoints: acc.totalPoints + points * qty,
      };
    },
    { totalItems: 0, subtotal: 0, totalPoints: 0 }
  );

  // Kalkulasi Diskon & Total Akhir
  const discountAmount = appliedVoucher ? subtotal * appliedVoucher.discountPercentage : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleToggleAll = () => {
    if (isAllSelected) deselectAll();
    else selectAll();
  };

  const handleApplyVoucher = (voucher: typeof DUMMY_VOUCHERS[0]) => {
    setAppliedVoucher({
      code: voucher.code,
      title: voucher.title,
      discountPercentage: voucher.discountPercentage,
    });
    setIsVoucherModalOpen(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
  };

  return (
    <AnimatePresence>
      {isOpen && isAuthenticated && (
        <>
          {/* Overlay Cart Sidebar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[100] flex flex-col shadow-2xl"
          >
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gray-900" />
                <span className="font-bold tracking-tight text-md text-gray-900">
                  Cart ({items.length})
                </span>
              </div>
              <button onClick={closeCart} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* --- ITEMS LIST --- */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <div className="space-y-4">
                  {/* Select All Button */}
                  <div className="flex items-center justify-between px-1">
                    <button 
                      onClick={handleToggleAll}
                      className="flex items-center gap-3 cursor-pointer group bg-transparent border-none outline-none"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        isAllSelected ? "bg-[#F70000] border-[#F70000]" : "border-gray-300 bg-white group-hover:border-[#F70000]"
                      )}>
                        {isAllSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[12px] font-bold text-gray-700 select-none">Select All</span>
                    </button>
                  </div>

                  <ul className="space-y-3">
                    {items.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      
                      const imageUrl = item.image && item.image.length > 0
                        ? getProductImageUrl([item.image[0]])
                        : "/placeholder-image.jpg"; 

                      const price = Number(item.price);
                      const points = Math.floor(price * 0.033);

                      return (
                        <li key={item.id} className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center transition-all">
                          
                          <button 
                            onClick={() => toggleSelectItem(item.id)}
                            className={cn(
                              "w-5 h-5 rounded border shrink-0 flex items-center justify-center cursor-pointer transition-colors outline-none",
                              isSelected ? "bg-[#F70000] border-[#F70000]" : "border-gray-300 bg-white hover:border-[#F70000]"
                            )}
                          >
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </button>

                          <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                            <Image src={imageUrl} alt={item.productName || "Product"} fill className="object-cover" />
                          </div>

                          <div className="flex flex-col flex-1 min-w-0 py-0.5">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 cursor-pointer" onClick={() => toggleSelectItem(item.id)}>
                                <h3 className="text-[12px] font-bold text-gray-900 leading-snug truncate">
                                  {item.productName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">SKU: {item.variantSku}</p>
                              </div>
                              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-1 mt-1.5">
                              <div className="bg-black text-white p-0.5 rounded-full"><Zap size={10} fill="currentColor" /></div>
                              <span className="text-[10px] font-medium text-gray-600">Earn <span className="font-bold">{points}</span> pts</span>
                            </div>

                            <div className="flex items-end justify-between mt-auto pt-2">
                              <span className="font-bold text-[12px] text-[#F70000]">{formatPrice(price)}</span>
                              <div className="flex items-center border border-gray-200 rounded-md h-7 overflow-hidden">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100" disabled={item.quantity <= 1}><Minus size={12} /></button>
                                <span className="w-8 text-center text-xs font-bold bg-gray-50 border-x border-gray-200">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100" disabled={item.quantity >= item?.stock}><Plus size={12} /></button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* --- FOOTER & SUBTOTAL --- */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-5 shrink-0 pb-safe space-y-5">
                
                {/* Voucher Trigger Area */}
                <div className="flex flex-col gap-2">
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-1.5 rounded-md">
                          <Tag size={16} className="text-green-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-green-800">{appliedVoucher.title}</span>
                          <span className="text-[10px] text-green-600 font-medium">Diskon {appliedVoucher.discountPercentage * 100}% Diterapkan</span>
                        </div>
                      </div>
                      <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsVoucherModalOpen(true)}
                      disabled={selectedItems.length === 0}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-2 text-gray-700 group-hover:text-black">
                        <Ticket size={18} className="text-[#F70000]" />
                        <span className="text-[12px] font-bold">Makin hemat pakai promo</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-700" />
                    </button>
                  )}
                </div>

                {/* Subtotal & Total Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-gray-500">Subtotal</span>
                    <span className="font-bold text-[13px] text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {appliedVoucher && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="text-[12px] font-bold">Diskon Promo</span>
                      <span className="font-bold text-[13px]">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-3 border-t border-gray-100 mt-2">
                    <span className="text-[13px] font-black text-gray-900 uppercase tracking-wider mb-1">Total</span>
                    <span className="font-black text-xl text-[#F70000] leading-none">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  disabled={selectedItems.length === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-[12px] transition-all",
                    selectedItems.length > 0 
                      ? "bg-[#F70000] hover:bg-black active:scale-[0.98] text-white shadow-lg" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Checkout ({totalItems} {totalItems > 1 ? "Items" : "Item"})
                </button>
              </div>
            )}
          </motion.div>

          {/* --- VOUCHER POP-UP MODAL --- */}
          <AnimatePresence>
            {isVoucherModalOpen && (
              <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
                {/* Backdrop for Voucher Modal */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setIsVoucherModalOpen(false)}
                />
                
                {/* Voucher Modal Content */}
                <motion.div
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full sm:w-[400px] max-h-[80vh] bg-gray-50 rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
                >
                  <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-900">Pilih Promo</h3>
                    <button onClick={() => setIsVoucherModalOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto space-y-3">
                    {DUMMY_VOUCHERS.map((voucher) => (
                      <div key={voucher.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 shadow-sm hover:border-[#F70000] transition-colors">
                        <div className="w-10 h-10 bg-[#F70000]/10 rounded-full flex items-center justify-center shrink-0">
                          <Ticket size={20} className="text-[#F70000]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[13px] text-gray-900 leading-tight mb-1">{voucher.title}</h4>
                          <p className="text-[11px] text-gray-500 mb-3">{voucher.desc}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase tracking-wide">
                              {voucher.code}
                            </span>
                            <button
                              onClick={() => handleApplyVoucher(voucher)}
                              className="text-[11px] font-bold bg-black text-white px-4 py-1.5 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
                            >
                              Pakai
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <ShoppingBag size={32} className="text-gray-300" />
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-2">Your Cart is Empty</h3>
      <p className="text-[12px] text-gray-500 mb-8 max-w-[250px]">Looks like you haven't added any sneakers to your cart yet.</p>
      <button onClick={onClose} className="bg-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold text-[12px] transition-all active:scale-95">
        Start Shopping
      </button>
    </div>
  );
}