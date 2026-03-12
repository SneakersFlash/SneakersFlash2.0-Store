"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, ChevronDown, ChevronUp, Ticket, 
  Zap, Wallet, Loader2, Circle, CheckCircle2,
  MapPin,
  Truck
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
  
  // Accordion States
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false); // 👈 State baru untuk Payment
  
  // Voucher & Address State
  const [tempVoucher, setTempVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState({
    recipientName: "Faizal Triasa",
    phone: "081234567890",
    addressLine: "Jl. Duri Kepa No. 1, RT 01/02",
    subdistrictId: 2095, 
    city: "Jakarta Barat",
    postalCode: "11510"
  });

  // Shipping State
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // --- PROTECTION ---
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (checkoutItems.length === 0) router.push("/");
  }, [isAuthenticated, checkoutItems.length, router]);

  // --- CALCULATIONS ---
  const subtotal = checkoutItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const totalWeight = checkoutItems.reduce((acc, item) => acc + (900 * item.quantity), 0);
  const pointsEarned = Math.floor(subtotal * 0.033);
  const grandTotal = subtotal + (selectedCourier?.cost || 0);

  // --- FETCH SHIPPING COST ---
  useEffect(() => {
    async function calculateShipping() {
      if (!selectedAddress.subdistrictId) return;
      
      setIsCalculatingShipping(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockShippingData = [
          { name: "J&T Express", service: "EZ", cost: 11000, etd: "1-2 Days" },
          { name: "JNE", service: "REG", cost: 10500, etd: "1-2 Days" },
          { name: "Sicepat", service: "HALU", cost: 9000, etd: "2-3 Days" },
        ];
        
        setShippingOptions(mockShippingData);
        if (!selectedCourier) setSelectedCourier(mockShippingData[0]);
      } catch (error) {
        console.error("Failed to calculate shipping", error);
      } finally {
        setIsCalculatingShipping(false);
      }
    }
    calculateShipping();
  }, [selectedAddress.subdistrictId, totalWeight]);

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
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      alert("Checkout Success! Ready to open Midtrans Snap.");
    } catch (error) {
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
      { id: "bank_transfer_bri", name: "Bank BRI", logo: "BRI" },
    ]},
    { category: "e-Wallet", options: [
      { id: "gopay", name: "GoPay", logo: "GoPay" },
      { id: "shopeepay", name: "ShopeePay", logo: "ShopeePay" },
    ]},
    { category: "Other methods", options: [
      { id: "qris", name: "QRIS", logo: "QRIS" },
    ]}
  ];

  // Helper function untuk mencari nama payment yang dipilih
  const getSelectedPaymentName = () => {
    if (!selectedPayment) return null;
    return paymentMethods.flatMap(g => g.options).find(o => o.id === selectedPayment)?.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* HEADER */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-200 shadow-sm">
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
      </header>

      {/* WRAPPER FOR DESKTOP */}
      <main className="max-w-3xl mx-auto w-full pt-2 lg:pt-6">
        
        {/* 1. SHIPPING ADDRESS */}
        <section className="bg-white p-4 mb-2 lg:rounded-xl lg:border lg:border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#FF6B00]" />
              Shipping Address
            </h2>
            <button className="text-xs font-bold text-[#FF6B00]">Change</button>
          </div>
          <div className="pl-6">
            <p className="text-sm font-bold text-gray-900">{selectedAddress.recipientName} | {selectedAddress.phone}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.postalCode}
            </p>
          </div>
        </section>

        {/* 2. ORDER ITEMS */}
        <section className="bg-white p-4 mb-2 lg:rounded-xl lg:border lg:border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {checkoutItems.map((item) => {
              const imageUrl = item.image?.length > 0 ? getProductImageUrl([item.image[0]]) : "/placeholder.jpg"; 
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-50 rounded-md border border-gray-100 shrink-0">
                    <Image src={imageUrl} alt={item.productName} fill className="object-cover p-1" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">{item.productName}</h3>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(Number(item.price))}</span>
                      <span className="text-xs text-gray-500">x {item.quantity} ({(900 * item.quantity / 1000).toFixed(1)} kg)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. SHIPPING METHOD (ACCORDION) */}
        <section className="bg-white mb-2 lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
             <h2 className="text-sm font-bold text-gray-900">Shipping Method</h2>
          </div>
          
          <button 
            onClick={() => setIsShippingOpen(!isShippingOpen)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-gray-900" />
              <div className="text-left">
                {isCalculatingShipping ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#FF6B00]" />
                    <span className="text-xs text-gray-500">Calculating shipping...</span>
                  </div>
                ) : selectedCourier ? (
                  <p className="text-sm font-medium text-gray-900">Shipping by {selectedCourier.name}</p>
                ) : (
                  <p className="text-sm font-medium text-gray-500">Select Shipping</p>
                )}
              </div>
            </div>
            {isShippingOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {isShippingOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50/50"
              >
                <div className="p-4 space-y-2 border-t border-gray-100">
                  {shippingOptions.map((opt, idx) => (
                    <label key={idx} className={cn(
                      "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedCourier?.name === opt.name && selectedCourier?.service === opt.service ? "border-[#FF6B00] bg-orange-50/30" : "border-gray-200 bg-white"
                    )} onClick={() => { setSelectedCourier(opt); setIsShippingOpen(false); }}>
                      <div className="flex items-center gap-3">
                        {selectedCourier?.name === opt.name && selectedCourier?.service === opt.service 
                          ? <CheckCircle2 size={18} className="text-[#FF6B00]" /> 
                          : <Circle size={18} className="text-gray-300" />
                        }
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{opt.name} - {opt.service}</h4>
                          <p className="text-xs text-gray-500">Est: {opt.etd}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{formatPrice(opt.cost)}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 4. DISCOUNTS & PAYMENT (WRAPPER) */}
        <section className="bg-white mb-2 lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden">
          
          {/* VOUCHER ACCORDION */}
          <button 
            onClick={() => setIsVoucherOpen(!isVoucherOpen)}
            className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Ticket size={20} className={appliedVoucher ? "text-[#FF6B00]" : "text-gray-900"} />
              <span className={cn("text-sm font-medium", appliedVoucher ? "text-[#FF6B00]" : "text-gray-700")}>
                {appliedVoucher ? `Voucher: ${appliedVoucher}` : "Check your voucher"}
              </span>
            </div>
            {isVoucherOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {isVoucherOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50/50"
              >
                <div className="p-4 border-b border-gray-100 flex gap-2">
                  <input type="text" placeholder="Enter promo code" value={tempVoucher} onChange={(e) => setTempVoucher(e.target.value.toUpperCase())} className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm font-bold uppercase tracking-wider" />
                  <button 
                    onClick={() => { setAppliedVoucher(tempVoucher); setIsVoucherOpen(false); }}
                    className="bg-black text-white font-bold px-5 rounded-lg text-sm"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* FLASH POINT TOGGLE */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-[#FF6B00]" fill="currentColor" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  Use <span className="font-bold">21.560</span> Flash Points
                </p>
                <p className="text-xs text-gray-500">of 156.700 SF Points</p>
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

          {/* PAYMENT METHOD ACCORDION */}
          <button 
            onClick={() => setIsPaymentOpen(!isPaymentOpen)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-gray-900" />
              <div className="text-left">
                {selectedPayment ? (
                  <p className="text-sm font-medium text-gray-900">{getSelectedPaymentName()}</p>
                ) : (
                  <p className="text-sm font-medium text-gray-700">Payment Methods</p>
                )}
              </div>
            </div>
            {isPaymentOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {isPaymentOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-gray-50/50"
              >
                <div className="p-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 italic mb-4">
                    Please note: your payment will be processed securely. Your statement will show in Payment Confirmation.
                  </p>

                  {paymentMethods.map((group, idx) => (
                    <div key={idx} className="mb-5 last:mb-0">
                      <h3 className="text-xs font-bold text-gray-900 mb-2">{group.category}</h3>
                      <div className="space-y-0 text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {group.options.map((option) => (
                          <label 
                            key={option.id} 
                            className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => { setSelectedPayment(option.id); setIsPaymentOpen(false); }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-blue-800 italic w-12 text-center bg-gray-100 py-1 rounded">{option.logo}</span>
                              <span className="text-sm font-medium text-gray-900">{option.name}</span>
                            </div>
                            {selectedPayment === option.id 
                              ? <CheckCircle2 size={20} className="text-[#FF6B00]" /> 
                              : <Circle size={20} className="text-gray-300" />
                            }
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

      {/* --- BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 p-4 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Payment</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
            <span className="text-[9px] text-gray-500 mt-0.5">
              Yeay you will earn {pointsEarned.toLocaleString('en-US')} Flash Points
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isLoading || !selectedPayment || isCalculatingShipping || !selectedCourier}
            className={cn(
              "flex items-center justify-center min-w-[140px] px-6 py-3.5 rounded-lg font-bold text-sm transition-all shadow-md",
              selectedPayment && !isLoading && !isCalculatingShipping && selectedCourier
                ? "bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            )}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin text-white" /> : "Pay Now"}
          </button>
        </div>
      </div>

    </div>
  );
}