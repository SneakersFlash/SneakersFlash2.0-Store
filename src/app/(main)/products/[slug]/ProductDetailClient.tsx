"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Star, ChevronRight, Zap, CreditCard, ShieldCheck,
  Loader2, Ruler, Check,
  BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProduct } from "@/lib/hooks/useProducts";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";
import { RelatedProducts } from "@/components/product/RelatedProduct";

interface ProductDetailClientProps {
  slug: string;
}

// ─── Inner component: everything that needs useSearchParams ───────────────────

function ProductDetailClientInner({ slug }: ProductDetailClientProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const search      = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;

  // --- STATE & HOOKS ---
  const { data: product, isLoading: isProductLoading } = useProduct(slug);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openCart, addItemToCart } = useCartStore();

  const [selectedSizeId,    setSelectedSizeId]    = useState<string | null>(null);
  const [activeImageIndex,  setActiveImageIndex]  = useState(0);
  const [isAdding,          setIsAdding]          = useState(false);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState(true);
  const [zoomProps,         setZoomProps]         = useState({ x: 0, y: 0, isHovered: false });

  const ZOOM_LEVEL = 1.8;

  useEffect(() => {
    if (product) {
      const variants = product.variants || [];
      if (variants.length === 1) {
        setSelectedSizeId(variants[0].id);
      }
    }
  }, [product]);

  // --- LOADING & ERROR STATE ---
  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 size={40} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h2 className="text-3xl font-black uppercase font-display text-gray-900">
          Product Not Found
        </h2>
        <p className="text-gray-500 mt-2">
          Sepatu yang kamu cari mungkin sudah ditarik atau URL salah.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="mt-6 bg-black text-white px-8 py-3 rounded-full font-bold"
        >
          Explore Other Sneakers
        </button>
      </div>
    );
  }

  // --- LOGIKA DATA ---
  const images =
    product.variants?.[0]?.imageUrl?.length > 0
      ? product.variants[0].imageUrl.map((url: string) => getProductImageUrl([url]))
      : [getProductImageUrl(product.images?.map((img: any) => img.url) || [])];

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedSizeId);
  const hasDiscount = Boolean(
    product.variants?.[0]?.price && product.variants[0].price < product.basePrice
  );
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : (product.variants?.[0]?.price ?? product.basePrice);
  const saving      = hasDiscount
    ? discountPercent(product.basePrice, product.variants?.[0]?.price!)
    : 0;
  const rating       = parseFloat(product.ratingAvg ?? "4.8");
  const reviewCount  = product.reviewCount ?? 98;
  const earnedPoints = Math.floor(Number(displayPrice) * 0.033);

  // --- ACTIONS ---
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    if (!isAuthenticated) return router.push("/login");
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
    if (!isAuthenticated) return router.push("/login");
    try {
      setIsAdding(true);
      await addItemToCart(Number(selectedVariant.id), 1);
      router.push("/checkout");
    } catch (error) {
      console.error("Gagal proses beli sekarang", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { left, top, width, height } = container.getBoundingClientRect();
    const mouseX   = e.pageX - left - window.scrollX;
    const mouseY   = e.pageY - top  - window.scrollY;
    const xPercent = (mouseX / width)  * 100;
    const yPercent = (mouseY / height) * 100;
    setZoomProps({ x: xPercent, y: yPercent, isHovered: true });
  };

  return (
    <div className="min-h-screen bg-white lg:bg-[#F8F9FB] pb-32 lg:pb-16 pt-4 lg:pt-8">
      <div className="container mx-auto max-w-7xl px-0 lg:px-4">

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 items-start">

          {/* LEFT COLUMN: IMAGE GALLERY (Sticky) */}
          <div className="w-full lg:w-[55%] lg:sticky lg:top-24 flex flex-col gap-4">

            {/* Main Image Container */}
            <div
              className="relative w-full aspect-[4/3] lg:aspect-square bg-[#F0F2F5] lg:rounded-3xl overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomProps((p) => ({ ...p, isHovered: true }))}
              onMouseLeave={() => setZoomProps({ x: 0, y: 0, isHovered: false })}
              style={{ cursor: zoomProps.isHovered ? "crosshair" : "zoom-in" }}
            >
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-8 lg:p-12"
                priority
                style={{
                  transformOrigin: `${zoomProps.x}% ${zoomProps.y}%`,
                  transform: zoomProps.isHovered ? `scale(${ZOOM_LEVEL})` : "scale(1)",
                  transition: "transform 0.1s ease-out",
                }}
              />
              {/* Badge Promo */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                  -{saving}%
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 px-4 lg:px-0 overflow-x-auto no-scrollbar">
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                      activeImageIndex === i
                        ? "border-[#FF6B00]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full bg-[#F0F2F5] p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO */}
          <div className="w-full lg:flex-1 px-4 lg:px-0 flex flex-col gap-5">

            {/* Brand & Name */}
            <div>
              <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest mb-1">
                {product.brand?.name || "SneakersFlash"}
              </p>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{rating}</span>
              <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-gray-400 line-through font-medium">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Size selector */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-900">Select Size</p>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                    <Ruler size={13} /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() =>
                        setSelectedSizeId(
                          selectedSizeId === variant.id ? null : variant.id
                        )
                      }
                      disabled={variant.stock === 0}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                        variant.stock === 0
                          ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through"
                          : selectedSizeId === variant.id
                          ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      )}
                    >
                      {variant.size}
                      {selectedSizeId === variant.id && (
                        <Check size={12} className="inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Add to Cart / Buy Now */}
            <div className="hidden lg:flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-sm transition-all border-2",
                  selectedSizeId
                    ? "border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-400"
                    : "border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed"
                )}
              >
                {isAdding ? <Loader2 size={18} className="animate-spin" /> : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-sm transition-all shadow-lg",
                  selectedSizeId
                    ? "bg-[#1C1C1C] text-white hover:bg-black hover:shadow-xl active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                )}
              >
                {isAdding ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  "Buy it Now"
                )}
              </button>
            </div>

            {/* Perks & Benefits */}
            <div className="flex flex-col border-t border-[#E5E5E5] mb-8 mt-2 lg:mt-4">

              {/* Earn Flash Points */}
              <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="bg-[#FF6B00] text-white w-7 h-7 rounded-full flex items-center justify-center">
                    <Zap size={15} fill="currentColor" className="ml-[1px]" />
                  </div>
                  <p className="text-[15px] text-[#1A1A1A]">
                    Earn Flash Points:{" "}
                    <span className="font-bold">
                      {earnedPoints.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Credit Card Installment (Accordion) */}
              <div
                className="flex items-center justify-between py-4 border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsInstallmentOpen(!isInstallmentOpen)}
              >
                <div className="flex items-center gap-3.5">
                  <CreditCard size={28} strokeWidth={1.5} className="text-black" />
                  <p className="text-[15px] text-[#1A1A1A]">
                    <span className="font-bold">0%</span> Interest Credit Card Installment*
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isInstallmentOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={24} strokeWidth={1.5} className="text-black" />
                </motion.div>
              </div>

              <AnimatePresence>
                {isInstallmentOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#F8F9FB] border-b border-[#E5E5E5]"
                  >
                    <div className="p-4 md:px-5">
                      <p className="text-[13px] font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Simulasi Cicilan 0%
                      </p>
                      <div className="space-y-2.5 text-[14px] text-gray-800">
                        {[3, 6, 12].map((months) => (
                          <div
                            key={months}
                            className={cn(
                              "flex justify-between items-center pb-2",
                              months !== 12 && "border-b border-gray-200 border-dashed"
                            )}
                          >
                            <span>{months} Bulan</span>
                            <span className="font-bold text-black">
                              {formatPrice(displayPrice / months)}{" "}
                              <span className="text-[12px] text-gray-500 font-normal">
                                / bln
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Authentic badge */}
              <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <BadgeCheck size={30} fill="black" stroke="white" strokeWidth={1.5} />
                  <p className="text-[15px] text-[#1A1A1A]">
                    100% <span className="font-bold">Authentic</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Product Details
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 bg-gray-50 inline-block px-3 py-1.5 rounded-md border border-gray-200">
                <span className="font-semibold">Weight:</span> {product.weightGrams ?? 900}g
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description ||
                  "No specific description available for this product. Please refer to the images for design details."}
              </p>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h3 className="text-2xl font-black text-gray-900 mb-8 px-4 lg:px-0 tracking-tight uppercase">
            You Might Also Like
          </h3>
          <div className="px-4 lg:px-0">
            <RelatedProducts
              categoryName={product.categories[0].name}
              currentProductId={product.id}
            />
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR (MOBILE ONLY) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Price</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] bg-red-100 text-[#E50000] px-1.5 py-0.5 rounded font-bold">
                  -{saving}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex px-4 pb-4 gap-3">
          {!isAuthenticated ? (
            <button
              onClick={() =>
                router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
              }
              className="w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-sm transition-all shadow-md bg-[#FF6B00] text-white hover:bg-[#e66000] active:scale-[0.98]"
            >
              Login to Purchase
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-3.5 rounded-xl font-bold text-sm transition-all",
                  selectedSizeId
                    ? "border-2 border-gray-200 text-gray-900 hover:bg-gray-50"
                    : "border-2 border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed"
                )}
              >
                {isAdding ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Add to Cart"
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-3.5 rounded-xl font-bold text-sm transition-all shadow-md",
                  selectedSizeId
                    ? "bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Public export: wraps inner component in Suspense ────────────────────────

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 size={40} className="animate-spin text-[#FF6B00]" />
        </div>
      }
    >
      <ProductDetailClientInner slug={slug} />
    </Suspense>
  );
}