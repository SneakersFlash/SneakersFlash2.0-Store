"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Star, ChevronRight, Zap, CreditCard, ShieldCheck,
  Loader2, Ruler, Check, BadgeCheck, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProduct } from "@/lib/hooks/useProducts";
import PageLoader from "@/components/common/PageLoader";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";
import { RelatedProducts } from "@/components/product/RelatedProduct";

interface ProductDetailClientProps {
  slug: string;
}

// ─── REVIEWS SHEET COMPONENT ──────────────────────────────────────────────────

function ReviewsSheet({ isOpen, onClose, productImages }: { isOpen: boolean; onClose: () => void; productImages: string[] }) {
  // Mock data tailored to match the screenshot UI
  const mockReviews = [
    {
      id: 1,
      name: "Budi Santoso",
      date: "Jan 19, 2026",
      rating: 5,
      text: "Pengiriman cepat sampai, packing rapih dan barang original 👍",
      highlights: "Authentic Product, Fast Delivery, Great Quality, True to Color / Size, Neat Packaging.",
      images: productImages.length > 0 ? [productImages[0], productImages[0], productImages[0], productImages[0]] : [],
      avatar: "https://i.pravatar.cc/150?u=1"
    },
    {
      id: 2,
      name: "Siti Aminah",
      date: "Jan 18, 2026",
      rating: 5,
      text: "Sepatunya keren banget! Nyaman dipakai buat lari maupun jalan-jalan.",
      highlights: "Comfortable, Great Design, Fast Delivery",
      images: productImages.length > 1 ? [productImages[1], productImages[1]] : [],
      avatar: "https://i.pravatar.cc/150?u=2"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center lg:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative bg-white w-full lg:w-[500px] lg:rounded-2xl rounded-t-2xl z-10 h-[85vh] lg:h-[80vh] flex flex-col"
          >
            {/* Handle for mobile swipe hint */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 lg:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-2 lg:pt-5 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-base text-gray-900">All Reviews</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Review List */}
            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              {mockReviews.map((review, idx) => (
                <div key={review.id} className={cn("pb-6", idx !== mockReviews.length - 1 && "border-b border-gray-100")}>
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-900">{review.name}</span>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < review.rating ? "fill-[#FF6B00] text-[#FF6B00]" : "fill-gray-200 text-gray-200"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">Reviewed on {review.date}</span>
                  </div>

                  {/* Images row */}
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                      {review.images.map((img, i) => (
                        <div key={i} className="relative w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                          <Image src={img} alt={`Review img ${i}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-[10px] text-gray-800 leading-relaxed mb-2">{review.text}</p>

                  {/* Highlights */}
                  {review.highlights && (
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Highlights: {review.highlights}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN INNER COMPONENT ─────────────────────────────────────────────────────

function ProductDetailClientInner({ slug }: ProductDetailClientProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const search      = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;

  // --- STATE & HOOKS ---
  const { data: product, isLoading: isProductLoading } = useProduct(slug);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { openCart, addItemToCart, setSelectedItemIds } = useCartStore();

  const [selectedSizeId,    setSelectedSizeId]    = useState<string | null>(null);
  const [activeImageIndex,  setActiveImageIndex]  = useState(0);
  const [quantity,          setQuantity]          = useState(1);
  const [isAdding,          setIsAdding]          = useState(false);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState(true);
  const [isReviewsOpen,     setIsReviewsOpen]     = useState(false);
  const [zoomProps,         setZoomProps]         = useState({ x: 0, y: 0, isHovered: false });
  

  const ZOOM_LEVEL = 1.8;

  useEffect(() => {
    if (product) {
      const variants = product.variants || [];
      // Auto-select jika varian cuma 1 DAN stoknya ada
      if (variants.length === 1 && variants[0].stock > 0 && !selectedSizeId) {
        setSelectedSizeId(variants[0].id);
        setQuantity(1); // Reset quantity ke 1
      }
    }
  }, [product, selectedSizeId]); // 👈 Pastikan selectedSizeId masuk dependency array

  // --- LOADING & ERROR STATE ---
  if (isProductLoading) {
    return <PageLoader />;
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
  const activeEvent = product.activeEvent;
  const isEventActive = activeEvent && (activeEvent.quotaLimit === 0 || activeEvent.quotaSold < activeEvent.quotaLimit);
  const eventPrice = isEventActive && activeEvent.specialPrice ? activeEvent.specialPrice : null;

  // Harga dasar sebelum diskon event
  const baseDisplayPrice = selectedVariant ? selectedVariant.price : (product.variants?.[0]?.price ?? product.basePrice);
  
  // Harga yang ditampilkan di layar utama (Event prioritas pertama)
  const displayPrice = eventPrice ? eventPrice : baseDisplayPrice;

  // Cek apakah ada diskon (Event Harga OR Variant Harga < Base Harga)
  const hasDiscount = Boolean(eventPrice || (product.variants?.[0]?.price && product.variants[0].price < product.basePrice));
  
  const saving = hasDiscount ? discountPercent(product.basePrice, displayPrice) : 0;
  const isSoldOut = product.variants?.length > 0 && product.variants.every((v: any) => v.stock === 0);
  // ================================================

  const rating       = parseFloat(product.ratingAvg?.d[0] ?? "4.8");
  const reviewCount  = product.reviewCount ?? 98;
  const earnedPoints = Math.floor(Number(displayPrice) * 0.001);

  // --- ACTIONS ---
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    if (!isAuthenticated) return router.push("/login");
    try {
      setIsAdding(true);
      await addItemToCart(Number(selectedVariant.id), quantity);
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
      
      // 1. Masukkan item ke cart database & refresh state global
      await addItemToCart(Number(selectedVariant.id), quantity);
      
      // 2. Ambil state cart terbaru langsung dari store tanpa menunggu re-render
      const currentItems = useCartStore.getState().items;
      
      // 3. Cari cart item yang baru saja ditambahkan
      // Kita cek berdasarkan variant ID (atau fallback menggunakan pencocokan nama & ukuran)
      const addedItem = currentItems.find(
        (item: any) => 
          item.productVariantId === Number(selectedVariant.id) || 
          item.variantId === Number(selectedVariant.id) ||
          (item.productName === product.name && item.size === selectedVariant.size)
      );

      // 4. Jika item ketemu, set item ini sebagai satu-satunya yang di-checkout
      if (addedItem) {
        setSelectedItemIds([addedItem.id]);
      }

      // 5. Eksekusi redirect ke checkout
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
              className="relative w-full bg-white aspect-[4/3] lg:aspect-square bg-[#F0F2F5] lg:rounded-3xl overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomProps((p) => ({ ...p, isHovered: true }))}
              onMouseLeave={() => setZoomProps({ x: 0, y: 0, isHovered: false })}
              style={{ cursor: zoomProps.isHovered ? "crosshair" : "zoom-in" }}
            >
              <Image
                src={images[activeImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
                priority
                style={{
                  transformOrigin: `${zoomProps.x}% ${zoomProps.y}%`,
                  transform: zoomProps.isHovered ? `scale(${ZOOM_LEVEL})` : "scale(1)",
                  transition: "transform 0.1s ease-out",
                }}
              />
              {/* Badge Promo */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-green-100 text-green-500 text-xs lg:text-sm font-bold px-1.5 py-0.5 rounded">
                  Save {saving}%
                </div>
              )}

              {/* Sold Out Overlay */}
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-[2px] px-6 py-2.5 rotate-[-12deg]">
                    <span className="text-white text-xl lg:text-2xl font-black uppercase tracking-[0.2em]">
                      Sold Out
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail strip - Dynamically scales depending on count */}
            {images.length > 1 && (
              <div 
                className={cn(
                  "px-4 lg:px-0 gap-2 no-scrollbar",
                  images.length <= 4 ? "grid" : "flex overflow-x-auto"
                )}
                style={{
                  gridTemplateColumns: images.length <= 4 ? `repeat(${images.length}, minmax(0, 1fr))` : undefined,
                }}
              >
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={cn(
                      "relative rounded-xl overflow-hidden border-2 transition-all aspect-square shrink-0 bg-[#F0F2F5]",
                      images.length > 4 ? "w-[22%]" : "w-full", // 22% implies scrolling on 5+ images
                      activeImageIndex === i
                        ? "border-[#FF6B00]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO */}
          <div className="w-full lg:flex-1 px-4 lg:px-0 flex flex-col gap-5">

            {/* Rating (Now clickable) */}
            {/* Brand & Name */}
            <div>
              <button 
                onClick={() => setIsReviewsOpen(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
              >
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
                <span className="text-[10px] font-bold text-gray-700">{rating}</span>
                <span className="text-xs text-gray-400 underline underline-offset-2">({reviewCount} reviews)</span>
              </button>
              <p className="text-[18px] lg:text-[20px] font-bold uppercase tracking-widest my-1">
                {product.brand?.name || "SneakersFlash"}
              </p>

              {/* {product.categories.map((item: any) =>  */}
              <p className="text-[10px] font-medium tracking-widest my-1 text-gray-400">
                {product?.categories
                  ?.map(category => category?.name)
                  ?.filter(Boolean)                 
                  ?.join(' / ')}
              </p>
              <p className="text-[18px] lg:text-[20px] font-semibold font-black text-gray-900 leading-tight">
                {product.name} {product.variants && product.variants.length === 1 ? `Size - ${product.variants[0].size}` : ''} 
              </p>
            </div>

            

            {/* Price */}
            <div className="hidden lg:flex items-baseline gap-3">
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
                  <p className="text-[10px] font-medium text-gray-900">Choose EUR Size</p>
                  <button className="flex items-center gap-1 text-xs text-gray-600 underline hover:text-gray-900 transition-colors">
                    Size Chart
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
                        "px-4 py-2.5 rounded-xl text-[10px] font-bold border-2 transition-all",
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

            {/* 👇 BLOK QUANTITY & VALIDASI STOK PER VARIAN 👇 */}
            {selectedVariant && (
              <div className="mb-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-medium text-gray-900">Atur Jumlah</p>
                  <p className="text-[10px] font-medium text-gray-500">
                    Sisa stok: <span className="text-[#FF6B00] font-bold">{selectedVariant.stock}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      // Validasi: Tidak boleh kurang dari 1
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      // Validasi: Tombol mati jika quantity sudah sama dengan batas stok varian
                      disabled={quantity >= selectedVariant.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Add to Cart / Buy Now */}
            <div className="hidden lg:flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-[10px] transition-all border-2",
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
                  "flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-[10px] transition-all shadow-lg",
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
                  <div className="bg-[#FF6B00] text-white w-5 h-5 rounded-full flex items-center justify-center">
                    <Zap size={12} fill="currentColor" className="ml-[1px]" />
                  </div>
                  <p className="text-[12px] text-[#1A1A1A]">
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
                  <CreditCard size={18} strokeWidth={1.5} className="text-black" />
                  <p className="text-[12px] text-[#1A1A1A]">
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
                      <p className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Simulasi Cicilan 0%
                      </p>
                      <div className="space-y-2.5 text-[12px] text-gray-800">
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
                  <BadgeCheck size={25} fill="black" stroke="white" strokeWidth={1.5} />
                  <p className="text-[12px] text-[#1A1A1A]">
                    100% <span className="font-bold">Authentic</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-2">
              <h3 className="text-[12px] font-bold text-gray-900 mb-3 uppercase tracking-wider">
                Product Details
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 bg-gray-50 inline-block px-3 py-1.5 rounded-md border border-gray-200">
                <span className="font-semibold">Weight:</span> {product.weightGrams ?? 900}g
              </div>
              <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description ||
                  "No specific description available for this product. Please refer to the images for design details."}
              </p>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h3 className="text-[20px] font-black text-gray-900 mb-8 px-4 lg:px-0 tracking-tight uppercase">
            You Might Also Like
          </h3>
          <div className="px-4 lg:px-0">
            <RelatedProducts
              categoryName={product.categories.length > 0 ? product.categories[0].name : ''}
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
              <span className="text-[21px] font-black text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="inline-flex items-center justify-center bg-green-100 text-green-500 text-[10px] lg:text-[11px] font-bold px-1.5 py-0.5 rounded">
                  Save {saving}%
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
              className="w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-[10px] transition-all shadow-md bg-[#FF6B00] text-white hover:bg-[#e66000] active:scale-[0.98]"
            >
              Login to Purchase
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={!selectedSizeId || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center py-3.5 rounded-xl font-bold text-[10px] transition-all",
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
                  "flex-1 flex items-center justify-center py-3.5 rounded-xl font-bold text-[10px] transition-all shadow-md",
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

      {/* RENDER THE REVIEWS SHEET */}
      <ReviewsSheet 
        isOpen={isReviewsOpen} 
        onClose={() => setIsReviewsOpen(false)} 
        productImages={images} 
      />
    </div>
  );
}

// ─── Public export: wraps inner component in Suspense ────────────────────────

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductDetailClientInner slug={slug} />
    </Suspense>
  );
}