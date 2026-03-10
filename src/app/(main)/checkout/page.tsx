"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, MapPin, ChevronRight, Truck, Ticket, 
  Zap, Wallet, CheckCircle2, Loader2, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const { items, selectedItemIds } = useCartStore();
  const checkoutItems = items.filter(item => selectedItemIds.includes(item.id));

  // --- STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  // Address State
  const [selectedAddress, setSelectedAddress] = useState({
    recipientName: "Faizal Triasa",
    phone: "081234567890",
    addressLine: "Jl. Duri Kepa No. 1, RT 01/02",
    subdistrictId: 2095, // Default dari Postman (Jakarta Barat)
    city: "Jakarta Barat",
    postalCode: "11510"
  });

  // Shipping State
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Modals Visibility State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Form Temp States (For Modals)
  const [tempAddress, setTempAddress] = useState(selectedAddress);
  const [tempVoucher, setTempVoucher] = useState("");

  // --- PROTECTION & REDIRECT ---
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (checkoutItems.length === 0) router.push("/");
  }, [isAuthenticated, checkoutItems.length, router]);

  // --- KALKULASI BERAT & HARGA ---
  const subtotal = checkoutItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const totalWeight = checkoutItems.reduce((acc, item) => acc + (900 * item.quantity), 0); // Asumsi 900g per barang
  const pointsEarned = Math.floor(subtotal * 0.033);
  
  const grandTotal = subtotal + (selectedCourier?.cost || 0);

  // --- FETCH SHIPPING COST (API Komerce / RajaOngkir) ---
  useEffect(() => {
    async function calculateShipping() {
      if (!selectedAddress.subdistrictId) return;
      
      setIsCalculatingShipping(true);
      try {
        // TODO: Ganti dengan API Endpoint sungguhan Anda
        // const res = await apiClient.get(`/shipping/cost?subdistrictId=${selectedAddress.subdistrictId}&weight=${totalWeight}&courier=jne`);
        // const data = res.data;

        // Simulasi Response API (seperti di Postman Anda)
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockShippingData = [
          { name: "JNE", service: "REG", cost: 10500, etd: "1-2 Days" },
          { name: "J&T Express", service: "EZ", cost: 11000, etd: "1-2 Days" },
          { name: "Sicepat", service: "HALU", cost: 9000, etd: "2-3 Days" },
        ];
        
        setShippingOptions(mockShippingData);
        // Otomatis pilih yang pertama jika belum ada yang dipilih
        if (!selectedCourier) setSelectedCourier(mockShippingData[0]);

      } catch (error) {
        console.error("Failed to calculate shipping", error);
      } finally {
        setIsCalculatingShipping(false);
      }
    }

    calculateShipping();
  }, [selectedAddress.subdistrictId, totalWeight]); // Akan terpanggil ulang jika alamat/berat berubah

  if (checkoutItems.length === 0) return null;

  // --- ACTIONS ---
  const handleCheckout = async () => {
    if (!selectedPayment) return alert("Please select a payment method.");
    if (!selectedCourier) return alert("Please select a shipping method.");

    setIsLoading(true);

    const orderPayload = {
      cartItemIds: selectedItemIds,
      address: selectedAddress,
      courier: {
        name: selectedCourier.name,
        service: selectedCourier.service,
        cost: selectedCourier.cost,
      },
      paymentMethod: selectedPayment,
      voucherCode: appliedVoucher || undefined
    };

    console.log("PAYLOAD TO BACKEND:", orderPayload);

    try {
      // TODO: Panggil API checkout
      // const response = await ordersService.checkout(orderPayload);
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      alert("Checkout Success! Ready to open Midtrans Snap.");
    } catch (error) {
      console.error("Checkout failed", error);
      alert("An error occurred while processing your order.");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { category: "Bank Transfer", options: [
      { id: "bank_transfer_bca", name: "Bank BCA", logo: "BCA" },
      { id: "bank_transfer_mandiri", name: "Bank Mandiri", logo: "MANDIRI" },
      { id: "bank_transfer_bni", name: "Bank BNI", logo: "BNI" },
    ]},
    { category: "e-Wallet", options: [
      { id: "gopay", name: "GoPay", logo: "GoPay" },
      { id: "shopeepay", name: "ShopeePay", logo: "ShopeePay" },
    ]}
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-36 relative">
      {/* --- HEADER --- */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-200">
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
      </header>

      {/* --- SHIPPING ADDRESS --- */}
      <section className="bg-white p-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={18} className="text-[#FF6B00]" />
            Shipping Address
          </h2>
          <button onClick={() => setIsAddressModalOpen(true)} className="text-xs font-bold text-[#FF6B00]">
            Change Address
          </button>
        </div>
        <div className="pl-6">
          <p className="text-sm font-bold text-gray-900">{selectedAddress.recipientName} | {selectedAddress.phone}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.postalCode}
          </p>
        </div>
      </section>

      {/* --- ORDER ITEMS --- */}
      <section className="bg-white p-4 mb-2">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Order Items ({checkoutItems.length})</h2>
        <div className="space-y-4">
          {checkoutItems.map((item) => {
            const imageUrl = item.image?.length > 0 ? getProductImageUrl([item.image[0]]) : "/placeholder.jpg"; 
            return (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 bg-gray-50 rounded-md border border-gray-100 shrink-0">
                  <Image src={imageUrl} alt={item.productName} fill className="object-cover p-1" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{item.productName}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">SKU: {item.variantSku}</p>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(Number(item.price))}</span>
                    <span className="text-xs text-gray-500">x {item.quantity} ({(900 * item.quantity / 1000).toFixed(1)} kg)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- SHIPPING METHOD --- */}
      <section className="bg-white p-4 mb-2">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Shipping Method</h2>
        <button 
          onClick={() => setIsShippingModalOpen(true)}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#FF6B00] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Truck size={20} className="text-gray-600" />
            <div className="text-left">
              {isCalculatingShipping ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#FF6B00]" />
                  <span className="text-xs text-gray-500">Calculating shipping...</span>
                </div>
              ) : selectedCourier ? (
                <>
                  <p className="text-sm font-bold text-gray-900">{selectedCourier.name} - {selectedCourier.service}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatPrice(selectedCourier.cost)} • {selectedCourier.etd}</p>
                </>
              ) : (
                <p className="text-sm font-bold text-[#FF6B00]">Select Shipping Method</p>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </section>

      {/* --- VOUCHER & POINTS --- */}
      <section className="bg-white mb-2">
        <button 
          onClick={() => setIsVoucherModalOpen(true)}
          className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Ticket size={20} className={appliedVoucher ? "text-[#FF6B00]" : "text-gray-900"} />
            <span className={cn("text-sm font-medium", appliedVoucher ? "text-[#FF6B00] font-bold" : "text-gray-700")}>
              {appliedVoucher ? `Voucher applied: ${appliedVoucher}` : "Check your voucher"}
            </span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
        
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-[#FF6B00]" fill="currentColor" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                Use <span className="font-bold text-[#FF6B00]">21.560</span> Flash Points
              </p>
              <p className="text-xs text-gray-500 mt-0.5">from total 156.700 SF Point</p>
            </div>
          </div>
          <button 
            onClick={() => setUsePoints(!usePoints)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative",
              usePoints ? "bg-[#FF6B00]" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
              usePoints ? "translate-x-5" : "translate-x-0.5"
            )} />
          </button>
        </div>
      </section>

      {/* --- PAYMENT METHODS --- */}
      <section className="bg-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={20} className="text-gray-900" />
          <h2 className="text-sm font-bold text-gray-900">Payment Methods</h2>
        </div>

        {paymentMethods.map((group, idx) => (
          <div key={idx} className="mb-4 last:mb-0">
            <h3 className="text-xs font-bold text-gray-900 mb-2">{group.category}</h3>
            <div className="space-y-2">
              {group.options.map((option) => (
                <label 
                  key={option.id} 
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedPayment === option.id ? "border-[#FF6B00] bg-orange-50/30" : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setSelectedPayment(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-blue-800 italic w-12 text-center bg-gray-50 py-1 rounded">{option.logo}</span>
                    <span className="text-sm font-medium text-gray-700">{option.name}</span>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    selectedPayment === option.id ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300"
                  )}>
                    {selectedPayment === option.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* --- BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 p-4 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Payment</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
            <span className="text-[9px] text-gray-500 mt-0.5">
              Yeay you will earn <span className="font-bold text-black">{pointsEarned.toLocaleString('en-US')}</span> Points
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isLoading || !selectedPayment || isCalculatingShipping || !selectedCourier}
            className={cn(
              "flex items-center justify-center min-w-[140px] px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md",
              selectedPayment && !isLoading && !isCalculatingShipping && selectedCourier
                ? "bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            )}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin text-white" /> : "Pay Now"}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODALS SECTION */}
      {/* ========================================== */}

      {/* 1. Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddressModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-5 pb-safe z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Shipping Address</h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="p-1"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="Recipient Name" value={tempAddress.recipientName} onChange={(e) => setTempAddress({...tempAddress, recipientName: e.target.value})} className="w-full p-3 border rounded-lg text-sm" />
                <input type="text" placeholder="Phone Number" value={tempAddress.phone} onChange={(e) => setTempAddress({...tempAddress, phone: e.target.value})} className="w-full p-3 border rounded-lg text-sm" />
                <textarea placeholder="Full Address" value={tempAddress.addressLine} onChange={(e) => setTempAddress({...tempAddress, addressLine: e.target.value})} className="w-full p-3 border rounded-lg text-sm h-20" />
                <input type="number" placeholder="Subdistrict ID (Komerce)" value={tempAddress.subdistrictId || ""} onChange={(e) => setTempAddress({...tempAddress, subdistrictId: Number(e.target.value)})} className="w-full p-3 border rounded-lg text-sm" />
                <div className="flex gap-3">
                  <input type="text" placeholder="City" value={tempAddress.city} onChange={(e) => setTempAddress({...tempAddress, city: e.target.value})} className="w-1/2 p-3 border rounded-lg text-sm" />
                  <input type="text" placeholder="Postal Code" value={tempAddress.postalCode} onChange={(e) => setTempAddress({...tempAddress, postalCode: e.target.value})} className="w-1/2 p-3 border rounded-lg text-sm" />
                </div>
                <button 
                  onClick={() => { setSelectedAddress(tempAddress); setIsAddressModalOpen(false); }}
                  className="w-full bg-black text-white font-bold py-3.5 rounded-xl mt-2"
                >
                  Save Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Shipping Options Modal */}
      <AnimatePresence>
        {isShippingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShippingModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-5 pb-safe z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Select Courier</h3>
                <button onClick={() => setIsShippingModalOpen(false)} className="p-1"><X size={20}/></button>
              </div>
              <div className="space-y-3">
                {shippingOptions.map((opt, idx) => (
                  <label key={idx} className={cn("flex items-center justify-between p-4 border rounded-xl cursor-pointer", selectedCourier?.name === opt.name && selectedCourier?.service === opt.service ? "border-[#FF6B00] bg-orange-50" : "border-gray-200")} onClick={() => { setSelectedCourier(opt); setIsShippingModalOpen(false); }}>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{opt.name} - {opt.service}</h4>
                      <p className="text-xs text-gray-500 mt-1">Est. Delivery: {opt.etd}</p>
                    </div>
                    <span className="font-bold text-[#FF6B00] text-sm">{formatPrice(opt.cost)}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Voucher Modal */}
      <AnimatePresence>
        {isVoucherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVoucherModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-5 pb-safe z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Input Voucher Code</h3>
                <button onClick={() => setIsVoucherModalOpen(false)} className="p-1"><X size={20}/></button>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. DISKON50" value={tempVoucher} onChange={(e) => setTempVoucher(e.target.value.toUpperCase())} className="flex-1 p-3 border rounded-xl text-sm font-bold uppercase tracking-wider" />
                <button 
                  onClick={() => { setAppliedVoucher(tempVoucher); setIsVoucherModalOpen(false); }}
                  className="bg-black text-white font-bold px-6 rounded-xl text-sm"
                >
                  Apply
                </button>
              </div>
              {appliedVoucher && (
                <button onClick={() => { setAppliedVoucher(null); setTempVoucher(""); setIsVoucherModalOpen(false); }} className="w-full mt-4 text-xs font-bold text-red-500 hover:underline">
                  Remove Voucher
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}