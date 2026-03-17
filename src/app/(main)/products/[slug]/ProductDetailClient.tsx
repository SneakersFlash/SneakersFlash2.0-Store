"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  
  // --- STATE & HOOKS ---
  const { data: product, isLoading: isProductLoading } = useProduct(slug);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openCart, addItemToCart } = useCartStore(); 
  
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState(true);

  // ─── 1. STATE BARU UNTUK LOGIKA ZOOM MOUSE ─────────────────────────────────────
  const [zoomProps, setZoomProps] = useState({ x: 0, y: 0, isHovered: false });
  // Tentukan seberapa besar zoomnya (contoh: 1.8x atau 180%)
  const ZOOM_LEVEL = 1.8; 
  // ─────────────────────────────────────────────────────────────────────────────

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
        <h2 className="text-3xl font-black uppercase font-display text-gray-900">Product Not Found</h2>
        <p className="text-gray-500 mt-2">Sepatu yang kamu cari mungkin sudah ditarik atau URL salah.</p>
        <button onClick={() => router.push("/products")} className="mt-6 bg-black text-white px-8 py-3 rounded-full font-bold">
          Explore Other Sneakers
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

  // ─── 2. FUNGSI LOGIKA PERGERAKAN MOUSE UNTUK ZOOM ────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { left, top, width, height } = container.getBoundingClientRect();
    
    // Hitung posisi mouse relatif terhadap container (dalam pixel)
    const mouseX = e.pageX - left - window.scrollX;
    const mouseY = e.pageY - top - window.scrollY;

    // Konversi menjadi persentase posisi (0-100%) untuk transform-origin
    const xPercent = (mouseX / width) * 100;
    const yPercent = (mouseY / height) * 100;

    setZoomProps({ x: xPercent, y: yPercent, isHovered: true });
  };
    
  return (
    <div className="min-h-screen bg-white lg:bg-[#F8F9FB] pb-32 lg:pb-16 pt-4 lg:pt-8">
      <div className="container mx-auto max-w-7xl px-0 lg:px-4">
        
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16 items-start">
          
          {/* KOLOM KIRI: IMAGE GALLERY (Sticky) */}
          <div className="w-full lg:w-[55%] lg:sticky lg:top-24 flex flex-col gap-4">
            
            {/* ─── Main Image Container ─── */}
            <div 
              className="relative w-full aspect-[4/3] lg:aspect-square bg-[#F0F2F5] lg:rounded-3xl overflow-hidden"
              // ─── 3. PASANG EVENT HANDLER ZOOM DI SINI ───
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomProps(p => ({ ...p, isHovered: true }))}
              onMouseLeave={() => setZoomProps({ x: 0, y: 0, isHovered: false })}
              // Ganti kursor saat di-hover agar user tau ini bisa di-zoom
              style={{ cursor: zoomProps.isHovered ? 'crosshair' : 'zoom-in' }} 
            >
              <Image 
                src={images[activeImageIndex]} 
                alt={product.name} 
                fill 
                className="object-contain p-8 lg:p-12"
                priority 
                // ─── 4. APLIKASIKAN GAYA ZOOM CSS DI SINI ───
                style={{
                  // Titik pusat zoom mengikuti kursor mouse (persentase)
                  transformOrigin: `${zoomProps.x}% ${zoomProps.y}%`,
                  // Besar zoom ( scale ) hanya aktif saat mouse di atas gambar
                  transform: zoomProps.isHovered ? `scale(${ZOOM_LEVEL})` : 'scale(1)',
                  // Durasi transisi agar pergerakan zoom mengikuti kursor terasa mulus
                  transition: 'transform 0.1s ease-out', 
                }}
              />
              {/* Badge Promo */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded">
                  Sale {saving}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center justify-between gap-2 lg:gap-3 px-4 lg:px-0 w-full py-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      // Menggunakan flex-1 dan aspect-square agar terbagi rata dan tetap kotak di mobile
                      // lg:flex-none lg:w-20 lg:h-20 mengembalikan ukuran statis untuk desktop
                      "relative flex-1 aspect-square lg:flex-none lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all",
                      idx === activeImageIndex 
                        ? "border-black opacity-100" 
                        : "border-transparent bg-gray-50 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image 
                      src={img} 
                      alt={`Thumbnail ${idx}`} 
                      fill 
                      className="object-contain p-2" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KOLOM KANAN: PRODUCT INFO */}
          <div className="w-full lg:w-[45%] px-4 lg:px-0 flex flex-col pt-2 md:pt-0">
            {/* Breadcrumb & Brand */}
            <div className="mb-4">
              <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                {product.isFeatured ? "New Arrival / " : ""}
                {product.categories?.map(item => item.name).join(', ') || "Footwear"}
              </p>
              <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(rating) ? "text-[#FF6B00] fill-[#FF6B00]" : "text-gray-200 fill-gray-200"} />
                  ))}
              </div>
              <span className="text-sm font-medium text-gray-600 underline cursor-pointer hover:text-black">
                  {reviewCount} Reviews
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">
                {product.brand?.name ?? "BRAND"}
              </h2>
              <h1 className="text-2xl md:text-4xl font-display font-bold leading-[1.1] text-gray-900">
                {product.name}
              </h1>
            </div>

            {/* Rating & Price */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(rating) ? "text-[#FF6B00] fill-[#FF6B00]" : "text-gray-200 fill-gray-200"} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600 underline cursor-pointer hover:text-black">
                  {reviewCount} Reviews
                </span>
              </div>
              
              <div className="flex items-end gap-3 mt-2">
                <span className="text-3xl font-black text-gray-900">{formatPrice(displayPrice)}</span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through font-medium mb-1">{formatPrice(product.basePrice)}</span>
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">Select Size (EUR)</h3>
                <button className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1">
                  <Ruler size={14} /> Size Guide
                </button>
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5">
                {product.variants?.map((variant) => {
                  const isSelected = selectedSizeId === variant.id;
                  const isOutOfStock = variant.stock === 0;

                  return (
                    <button
                      key={variant.id}
                      disabled={isOutOfStock || isAdding}
                      onClick={() => setSelectedSizeId(variant.id)}
                      className={cn(
                        "relative h-12 rounded-xl border text-sm font-medium transition-all flex items-center justify-center",
                        isSelected
                          ? "border-black bg-black text-white ring-2 ring-black/20 ring-offset-2"
                          : isOutOfStock
                            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                      )}
                    >
                      {variant.size}
                      {isOutOfStock && (
                         <div className="absolute inset-0 w-full h-[1px] bg-gray-300 rotate-45 top-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
              {!selectedSizeId && <p className="text-xs text-red-500 mt-3 font-medium flex items-center gap-1">* Please select a size to continue</p>}
            </div>

            {/* 💻 ACTION BUTTONS (DESKTOP) */}
            <div className="hidden lg:flex gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-4 rounded-xl font-bold text-base transition-all",
                  selectedSizeId
                    ? "border-2 border-gray-200 text-gray-900 hover:border-black bg-white"
                    : "border-2 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                )}
              >
                {isAdding ? <Loader2 size={20} className="animate-spin" /> : "Add to Cart"}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-4 rounded-xl font-bold text-base transition-all shadow-lg",
                  selectedSizeId
                    ? "bg-[#1C1C1C] text-white hover:bg-black hover:shadow-xl active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                )}
              >
                {isAdding ? <Loader2 size={20} className="animate-spin text-white" /> : "Buy it Now"}
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
                    Earn Flash Points: <span className="font-bold">{earnedPoints.toLocaleString('id-ID')}</span>
                  </p>
                </div>
                {/* <ChevronRight size={24} strokeWidth={1.5} className="text-black" /> */}
              </div>

              {/* Credit Card Installment (Accordion Trigger) */}
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
                <motion.div animate={{ rotate: isInstallmentOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={24} strokeWidth={1.5} className="text-black" />
                </motion.div>
              </div>

              {/* Accordion Content Simulasi Cicilan */}
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
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
                          <span>3 Bulan</span>
                          <span className="font-bold text-black">
                            {formatPrice(displayPrice / 3)} <span className="text-[12px] text-gray-500 font-normal">/ bln</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
                          <span>6 Bulan</span>
                          <span className="font-bold text-black">
                            {formatPrice(displayPrice / 6)} <span className="text-[12px] text-gray-500 font-normal">/ bln</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>12 Bulan</span>
                          <span className="font-bold text-black">
                            {formatPrice(displayPrice / 12)} <span className="text-[12px] text-gray-500 font-normal">/ bln</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tukar Size */}
              <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Menggunakan fill hitam & stroke putih agar persis seperti badge verified di desain */}
                  <BadgeCheck size={30} fill="black" stroke="white" strokeWidth={1.5} />
                  <p className="text-[15px] text-[#1A1A1A]">
                    Bisa <span className="font-bold">Tukar Size*</span>
                  </p>
                </div>
                {/* <ChevronRight size={24} strokeWidth={1.5} className="text-black" /> */}
              </div>

            </div>

            {/* Deskripsi */}
            <div className="py-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Product Details</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 bg-gray-50 inline-block px-3 py-1.5 rounded-md border border-gray-200">
                <span className="font-semibold">Weight:</span> {product.weightGrams ?? 900}g
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description || "No specific description available for this product. Please refer to the images for design details."}
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
            <RelatedProducts categoryName={product.categories[0].name} currentProductId={product.id} />
          </div>
        </div>

      </div>

      {/* 📱 FLOATING ACTION BAR (KHUSUS MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Price</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-gray-900">{formatPrice(displayPrice)}</span>
              {hasDiscount && <span className="text-[10px] bg-red-100 text-[#E50000] px-1.5 py-0.5 rounded font-bold">-{saving}%</span>}
            </div>
          </div>
        </div>

        <div className="flex px-4 pb-4 gap-3">
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
            {isAdding ? <Loader2 size={18} className="animate-spin" /> : "Add to Cart"}
          </button>
          
          <button
            onClick={handleBuyNow}
            disabled={!selectedSizeId || isAdding}
            className={cn(
              "flex-1 flex items-center justify-center py-3.5 rounded-xl font-bold text-sm transition-all shadow-md",
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