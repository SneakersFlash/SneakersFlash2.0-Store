"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Star, 
  ChevronRight, 
  Zap, 
  CreditCard, 
  ShieldCheck,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProduct } from "@/lib/hooks/useProducts";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore"; // 👈 Tambahkan authStore
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";
import { RelatedProducts } from "@/components/product/RelatedProduct";

interface ProductDetailClientProps {
  slug: string;
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  
  // --- STATE & HOOKS ---
  const { data: product, isLoading: isProductLoading } = useProduct(slug);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // 👈 Gunakan items untuk hitung cartCount, dan gunakan fungsi API addItemToCart
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const { openCart, addItemToCart } = useCartStore(); 
  
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false); // 👈 State loading saat add to cart

  // --- LOADING & ERROR STATE ---
  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-2xl font-black uppercase font-display">Product Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#FF6B00] hover:underline font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // --- LOGIKA DATA ---
  const images = product.variants?.[0]?.imageUrl?.length > 0 
    ? product.variants[0].imageUrl.map(url => getProductImageUrl([url]))
    : [getProductImageUrl(product.images?.map(img => img.url) || [])];

  const selectedVariant = product.variants?.find((v) => v.id === selectedSizeId);
  const hasDiscount = Boolean(product.variants?.[0]?.price && product.variants[0].price < product.basePrice);
  const displayPrice = selectedVariant ? selectedVariant.price : (product.variants?.[0]?.price ?? product.basePrice);
  const saving = hasDiscount ? discountPercent(product.basePrice, product.variants?.[0]?.price!) : 0;

  const rating = parseFloat(product.ratingAvg ?? '4.8');
  const reviewCount = product.reviewCount ?? 98;

  // --- ACTIONS ---
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    // 1. Cek Login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // 2. Panggil API ke Backend melalui Zustand
    try {
      setIsAdding(true);
      await addItemToCart(Number(selectedVariant.id), 1);
      openCart();
    } catch (error) {
      console.error("Gagal menambahkan ke keranjang", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setIsAdding(true);
      await addItemToCart(Number(selectedVariant.id), 1);
      // Untuk amannya, kita buka cart dulu biar user memastikan barangnya dicentang 
      // sebelum ke halaman checkout
      openCart(); 
    } catch (error) {
      console.error("Gagal proses beli sekarang", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="pb-36 bg-white min-h-screen">
      {/* --- IMAGE GALLERY --- */}
      <div className="relative w-full aspect-[4/3] bg-white mt-14">
        <Image src={images[activeImageIndex]} alt={product.name} fill className="object-contain p-4" priority />
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar mt-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                idx === activeImageIndex ? "border-black" : "border-transparent bg-gray-50"
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* --- PRODUCT INFO --- */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < Math.floor(rating) ? "text-[#FF6B00] fill-[#FF6B00]" : "text-gray-300 fill-gray-300"} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount} review)</span>
        </div>

        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-1">
          {product.brand?.name ?? "BRAND"}
        </h2>
        <p className="text-xs text-gray-400 font-medium mb-2">
          {product.isFeatured ? "New Arrival / " : ""}{product.category?.name ?? "Shoes"} / {product.name}
        </p>

        <h1 className="text-[17px] font-medium leading-snug text-gray-900 mb-6">
          {product.name}
        </h1>

        <hr className="border-gray-100" />

        {/* --- SIZE SELECTOR --- */}
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-900">Choose EUR Size</h3>
            <button className="text-xs font-bold text-[#FF6B00] hover:underline">Size chart</button>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {product.variants?.map((variant) => {
              const isSelected = selectedSizeId === variant.id;
              const isOutOfStock = variant.stock === 0;

              return (
                <button
                  key={variant.id}
                  disabled={isOutOfStock || isAdding}
                  onClick={() => setSelectedSizeId(variant.id)}
                  className={cn(
                    "min-w-[48px] h-[40px] px-3 rounded-md border text-sm transition-all flex items-center justify-center",
                    isSelected
                      ? "border-black border-2 font-bold text-black"
                      : isOutOfStock
                        ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        : "border-gray-300 bg-white text-gray-700 hover:border-black font-medium"
                  )}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
          {!selectedSizeId && <p className="text-[11px] text-red-500 mt-2 font-medium">* Please select a size first</p>}
        </div>

        <hr className="border-gray-100" />

        {/* --- PERKS / BENEFITS --- */}
        <div className="py-2 flex flex-col">
          <div className="flex items-center justify-between py-3 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B00] text-white p-1 rounded-full"><Zap size={14} fill="currentColor" /></div>
              <span className="text-xs font-bold text-gray-700">Earn Flash Points: <span className="text-black">21.500</span></span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
          <hr className="border-gray-50 ml-8" />
          <div className="flex items-center justify-between py-3 cursor-pointer group">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-gray-900" />
              <span className="text-xs font-bold text-gray-700"><span className="text-black">0%</span> Interest Credit Card Installment*</span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
          <hr className="border-gray-50 ml-8" />
          <div className="flex items-center justify-between py-3 cursor-pointer group">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-gray-900" />
              <span className="text-xs font-bold text-gray-700">Bisa <span className="text-black">Tukar Size*</span></span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* --- DESKRIPSI --- */}
        <div className="py-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Deskripsi</h3>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <span>Berat item:</span>
            <span>{product.weightGrams ?? 900}g</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description || "No description available for this product."}
          </p>
        </div>
      </div>

      <div className="py-6">
        <h3 className="text-lg font-black text-gray-900 mb-4 px-4 tracking-tight">
          You Might Also Like
        </h3>
        <div className="px-4">
          <RelatedProducts categoryName={product.category?.name} currentProductId={product.id} />
        </div>
      </div>

      {/* --- BOTTOM FLOATING ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="px-4 py-2.5 flex items-center gap-2">
          <span className="text-xl font-bold text-[#E50000]">{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-xs text-gray-500 line-through font-medium">{formatPrice(product.basePrice)}</span>
              <span className="text-[10px] bg-red-100 text-[#E50000] px-1.5 py-0.5 rounded font-bold">-{saving}%</span>
            </>
          )}
        </div>

        <div className="flex px-4 pb-4 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSizeId || isAdding}
            className={cn(
              "flex-1 flex items-center justify-center py-3 rounded-md font-bold text-sm transition-all",
              selectedSizeId
                ? "border border-gray-400 text-gray-900 hover:border-black hover:bg-gray-50"
                : "border border-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {isAdding ? <Loader2 size={18} className="animate-spin" /> : "+ Cart"}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={!selectedSizeId || isAdding}
            className={cn(
              "flex-1 flex items-center justify-center py-3 rounded-md font-bold text-sm transition-all shadow-md",
              selectedSizeId
                ? "bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            )}
          >
            {isAdding ? <Loader2 size={18} className="animate-spin text-white" /> : "Buy Now"}
          </button>
        </div>
      </div>

    </div>
  );
}