"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, Zap, Check, Tag, ChevronRight, Ticket, Clock } from "lucide-react";

import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";
import { cartService } from "@/lib/api/cart.service";
import type { AppliedVoucher, ClaimableVoucher } from "@/types/voucher.types";
import ThunderLoader from "@/components/common/ThunderLoader";

// ─── Voucher Card (ticket design, konsisten dengan halaman voucher) ───────────

function VoucherTicket({
  voucher,
  subtotal,
  isApplied,
  onApply,
}: {
  voucher: ClaimableVoucher;
  subtotal: number;
  isApplied: boolean;
  onApply: (v: ClaimableVoucher) => void;
}) {
  const canUse = subtotal >= voucher.minPurchaseAmount;

  // Preview diskon
  let discountLabel = "";
  if (voucher.discountType === "percentage") {
    discountLabel = `Diskon ${voucher.discountValue}%`;
    if (voucher.maxDiscountAmount) discountLabel += ` maks. ${formatPrice(voucher.maxDiscountAmount)}`;
  } else if (voucher.discountType === "fixed_amount") {
    discountLabel = `Hemat ${formatPrice(voucher.discountValue)}`;
  } else {
    discountLabel = "Gratis Ongkir";
  }

  // Estimasi potongan aktual
  const discountAmount = cartService.computeDiscount(voucher, subtotal);

  return (
    <div
      className={cn(
        "w-full bg-white rounded-xl border flex relative overflow-hidden h-[90px] transition-shadow duration-300",
        isApplied
          ? "border-primary/40 shadow-md shadow-orange-100"
          : canUse
          ? "border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md"
          : "border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-60"
      )}
    >
      {/* Left strip */}
      <div className={cn("w-2 h-full shrink-0", isApplied ? "bg-primary" : "bg-primary/80")} />

      {/* Main info */}
      <div className="flex-1 px-3 py-2.5 flex flex-col justify-center border-r-2 border-dashed border-gray-200 relative min-w-0">
        {/* Notch top */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-50 rounded-full border-b border-l border-gray-100" />
        {/* Notch bottom */}
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gray-50 rounded-full border-t border-l border-gray-100" />

        <h4 className="font-bold text-[13px] text-gray-900 leading-tight truncate">{voucher.name}</h4>

        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
          {discountLabel}
        </p>

        {canUse && discountAmount > 0 && (
          <p className="text-[10px] font-bold text-[#F70000] mt-0.5">
            Hemat {formatPrice(discountAmount)}
          </p>
        )}

        {!canUse && (
          <p className="text-[10px] text-amber-500 font-medium mt-0.5">
            Min. belanja {formatPrice(voucher.minPurchaseAmount)}
          </p>
        )}

        <p className="text-[9px] text-gray-400 mt-auto flex items-center gap-1">
          <Clock size={9} />
          Berakhir{" "}
          {new Date(voucher.expiresAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>

      {/* Action */}
      <div className="w-[76px] shrink-0 flex flex-col items-center justify-center px-2">
        <motion.button
          whileTap={isApplied || !canUse ? {} : { scale: 0.9 }}
          onClick={() => canUse && !isApplied && onApply(voucher)}
          disabled={!canUse || isApplied}
          className={cn(
            "w-full py-1.5 rounded-full text-[10px] font-bold transition-all duration-200",
            isApplied
              ? "bg-primary text-gray-400 cursor-default"
              : !canUse
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-primary/90  hover:bg-primary shadow-sm shadow-orange-200 active:scale-95"
          )}
        >
          {isApplied ? "✓ Dipakai" : "Pakai"}
        </motion.button>
      </div>
    </div>
  );
}

// ─── CartSidebar ──────────────────────────────────────────────────────────────

export function CartSidebar() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    items, isOpen, selectedItemIds,
    closeCart, fetchCart, updateQuantity, removeItem,
    toggleSelectItem, selectAll, deselectAll,
  } = useCartStore();

  // ── Voucher state ────────────────────────────────────────────────────────────
  const [isVoucherModalOpen, setIsVoucherModalOpen]   = useState(false);
  const [vouchers, setVouchers]                       = useState<ClaimableVoucher[]>([]);
  const [voucherLoading, setVoucherLoading]           = useState(false);
  const [appliedVoucher, setAppliedVoucher]           = useState<AppliedVoucher | null>(null);

  // Baca applied voucher dari localStorage saat mount (sinkron dengan checkout)
  useEffect(() => {
    const saved = cartService.loadAppliedVoucher();
    if (saved) setAppliedVoucher(saved);
  }, []);

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

  // Fetch vouchers saat modal dibuka
  const handleOpenVoucherModal = useCallback(async () => {
    setIsVoucherModalOpen(true);
    if (vouchers.length > 0) return; // sudah di-cache
    setVoucherLoading(true);
    try {
      const data = await cartService.getClaimableVouchers();
      setVouchers(data);
    } catch {
      // silent fail — user bisa coba lagi
    } finally {
      setVoucherLoading(false);
    }
  }, [vouchers.length]);

  // ── Kalkulasi ────────────────────────────────────────────────────────────────
  const selectedItems  = items.filter((item) => selectedItemIds.includes(item.id));
  const isAllSelected  = items.length > 0 && selectedItemIds.length === items.length;

  const { totalItems, subtotal, totalPoints } = selectedItems.reduce(
    (acc, item) => {
      const price  = Number(item.price);
      const qty    = item.quantity;
      const points = Math.floor(price * 0.01);
      return {
        totalItems:  acc.totalItems + qty,
        subtotal:    acc.subtotal + price * qty,
        totalPoints: acc.totalPoints + points * qty,
      };
    },
    { totalItems: 0, subtotal: 0, totalPoints: 0 }
  );

  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const finalTotal     = Math.max(0, subtotal - discountAmount);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleToggleAll = () => (isAllSelected ? deselectAll() : selectAll());

  const handleApplyVoucher = (voucher: ClaimableVoucher) => {
    const discountAmount = cartService.computeDiscount(voucher, subtotal);
    const applied: AppliedVoucher = {
      code:           voucher.code,
      name:           voucher.name,
      discountType:   voucher.discountType,
      discountValue:  voucher.discountValue,
      discountAmount,
    };
    setAppliedVoucher(applied);
    cartService.saveAppliedVoucher(applied); // sync ke checkout
    setIsVoucherModalOpen(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    cartService.saveAppliedVoucher(null);
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
    // Applied voucher sudah tersimpan di localStorage, dibaca oleh checkout
  };

  const eventSavings = selectedItems.reduce((sum, item) => {
    if (!item.isEventPrice || !item.originalPrice) return sum;
    return sum + (Number(item.originalPrice) - Number(item.price)) * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && isAuthenticated && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
            onClick={closeCart}
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[100] flex flex-col shadow-2xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gray-900" />
                <span className="font-bold tracking-tight text-md text-gray-900">
                  Cart ({items.length})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* ITEMS LIST */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <div className="space-y-4">
                  {/* Select All */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      onClick={handleToggleAll}
                      className="flex items-center gap-3 cursor-pointer group bg-transparent border-none outline-none"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        isAllSelected
                          ? "bg-[#F70000] border-[#F70000]"
                          : "border-gray-300 bg-white group-hover:border-[#F70000]"
                      )}>
                        {isAllSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[12px] font-bold text-gray-700 select-none">Select All</span>
                    </button>
                  </div>

                  <ul className="space-y-3">
                    {items.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      const imageUrl =
                        item.image && item.image.length > 0
                          ? getProductImageUrl([item.image[0]])
                          : "/placeholder-image.jpg";
                      const price  = Number(item.price);
                      const points = Math.floor(price * 0.01);

                      return (
                        <li
                          key={item.id}
                          onClick={() => toggleSelectItem(item.id)}
                          className={cn(
                            "flex gap-3 bg-white rounded-xl p-3 border-2 cursor-pointer transition-all",
                            isSelected ? "border-[#F70000]/30" : "border-transparent"
                          )}
                        >
                          {/* Checkbox */}
                          <div className="flex items-start pt-1 shrink-0">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              isSelected ? "bg-[#F70000] border-[#F70000]" : "border-gray-300 bg-white"
                            )}>
                              {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Image */}
                          <div className="relative w-[70px] h-[70px] rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image src={imageUrl} alt={item.productName} fill className="object-cover" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-[12px] font-bold text-gray-900 leading-tight line-clamp-2">
                                {item.productName}
                              </p>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                className="text-gray-300 hover:text-red-400 transition-colors shrink-0 -mt-0.5"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Size badge */}
                            {item.size && (
                              <span className="self-start mt-1 text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                Size {item.size}
                              </span>
                            )}

                            <div className="flex items-center gap-1 mt-1.5">
                              <div className="bg-black text-white p-0.5 rounded-full">
                                <Zap size={10} fill="currentColor" />
                              </div>
                              <span className="text-[10px] font-medium text-gray-600">
                                Earn <span className="font-bold">{points}</span> pts
                              </span>
                            </div>

                            <div className="flex items-end justify-between mt-auto pt-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.isEventPrice && (
                                  <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    <Zap size={8} fill="currentColor" /> Flash
                                  </span>
                                )}
                                <span className="font-bold text-[12px] text-[#F70000]">{formatPrice(price)}</span>
                                {item.isEventPrice && item.originalPrice && (
                                  <span className="text-[10px] text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                                )}
                              </div>
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center border border-gray-200 rounded-md h-7 overflow-hidden"
                              >
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-full flex items-center justify-center hover:bg-gray-100"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold bg-gray-50 border-x border-gray-200">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-full flex items-center justify-center hover:bg-gray-100"
                                  disabled={item.quantity >= (item?.stock ?? 99)}
                                >
                                  <Plus size={12} />
                                </button>
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

            {/* FOOTER */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 bg-white p-5 shrink-0 pb-safe space-y-4">

                {/* Voucher trigger / applied */}
                <div className="flex flex-col gap-2">
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-primary/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-1.5 rounded-lg">
                          <Ticket size={16} className="" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-bold text-gray-900 truncate">
                            {appliedVoucher.name}
                          </span>
                          <span className="text-[10px] text-[#F70000] font-semibold">
                            Hemat {formatPrice(appliedVoucher.discountAmount || 0)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleOpenVoucherModal}
                      disabled={selectedItems.length === 0}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-2 text-gray-700 group-hover:text-black">
                        <Ticket size={18} className="text-[#F70000]" />
                        <span className="text-[12px] font-bold">Makin hemat pakai promo</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-700" />
                    </button>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-gray-500">Subtotal</span>
                    <span className="font-bold text-[13px] text-gray-900">{formatPrice(subtotal)}</span>
                  </div>

                  {eventSavings > 0 && (
                    <div className="flex items-center justify-between text-amber-600">
                      <span className="text-[12px] font-bold flex items-center gap-1">
                        <Zap size={12} fill="currentColor" /> Hemat Event
                      </span>
                      <span className="font-bold text-[13px]">-{formatPrice(eventSavings)}</span>
                    </div>
                  )}

                  {appliedVoucher && discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[#F70000]">
                      <span className="text-[12px] font-bold flex items-center gap-1">
                        <Tag size={12} /> Diskon Promo
                      </span>
                      <span className="font-bold text-[13px]">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-3 border-t border-gray-100 mt-2">
                    <span className="text-[13px] font-black text-gray-900 uppercase tracking-wider mb-1">
                      Total
                    </span>
                    <span className="font-black text-xl text-[#F70000] leading-none">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
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

          {/* VOUCHER MODAL */}
          <AnimatePresence>
            {isVoucherModalOpen && (
              <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setIsVoucherModalOpen(false)}
                />

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full sm:w-[420px] max-h-[80vh] bg-gray-50 rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
                >
                  {/* Modal header */}
                  <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Ticket size={18} className="" />
                      <h3 className="font-bold text-gray-900">Pilih Promo</h3>
                    </div>
                    <button
                      onClick={() => setIsVoucherModalOpen(false)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Applied info */}
                  {appliedVoucher && (
                    <div className="px-4 pt-3 shrink-0">
                      <div className="flex items-center justify-between p-3 bg-orange-50 border border-primary/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-primary shrink-0" />
                          <span className="text-[12px] font-bold text-gray-900">
                            {appliedVoucher.name} aktif — Hemat {formatPrice(appliedVoucher.discountAmount || 0)}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveVoucher}
                          className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Voucher list */}
                  <div className="p-4 overflow-y-auto space-y-3 flex-1">
                    {voucherLoading ? (
                      <ThunderLoader variant="inline" label={null} />
                    ) : vouchers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Ticket size={32} className="mb-3 opacity-30" />
                        <p className="text-[12px] font-medium">Belum ada promo tersedia</p>
                      </div>
                    ) : (
                      vouchers.map((voucher) => (
                        <VoucherTicket
                          key={voucher.id}
                          voucher={voucher}
                          subtotal={subtotal}
                          isApplied={appliedVoucher?.code === voucher.code}
                          onApply={handleApplyVoucher}
                        />
                      ))
                    )}
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
      <p className="text-[12px] text-gray-500 mb-8 max-w-[250px]">
        Looks like you haven't added any sneakers to your cart yet.
      </p>
      <button
        onClick={onClose}
        className="bg-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold text-[12px] transition-all active:scale-95"
      >
        Start Shopping
      </button>
    </div>
  );
}