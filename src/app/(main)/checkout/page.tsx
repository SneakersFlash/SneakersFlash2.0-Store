"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, ChevronDown, ChevronUp, Ticket, 
  Zap, Wallet, Loader2, Circle, CheckCircle2,
  MapPin, Truck, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";

import { logisticsService } from "@/lib/api/logistics.service";
import { ordersService } from "@/lib/api/orders.service";

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const { items, selectedItemIds } = useCartStore();
  const checkoutItems = items.filter(item => selectedItemIds.includes(item.id));

  // --- GENERAL STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  
  // --- ACCORDION & MODAL STATES ---
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Voucher
  const [tempVoucher, setTempVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  
  // --- ADDRESS STATE ---
  const [selectedAddress, setSelectedAddress] = useState({
    recipientName: "Faizal Triasa", // I see what you did there 😉
    phone: "081234567890",
    addressLine: "Jl. Cilenggang 1 Kepa No. 1, RT 01/02",
    subdistrictId: 73486, 
    city: "Tangerang Selatan",
    postalCode: "15310",
    pinPoint: "-6.3090026%2C%106.6643271,17z" 
  });

  // Location Hierarchy States (For Modal)
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);
  
  const [formAddress, setFormAddress] = useState(selectedAddress);
  const [selectedLocation, setSelectedLocation] = useState({ prov: "", city: "", dist: "", subdist: "" });

  // Shipping States
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // --- CALCULATIONS ---
  const subtotal = checkoutItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const totalWeight = checkoutItems.reduce((acc, item) => acc + (item.weightKilogram ?? 2 * item.quantity), 0);
  const pointsEarned = Math.floor(subtotal * 0.033);
  const grandTotal = subtotal + (selectedCourier?.cost || 0);

  // --- FETCH SHIPPING COST (POST /logistics/calculate) ---
  useEffect(() => {
    async function calculateShipping() {
      if (!selectedAddress.subdistrictId || checkoutItems.length === 0) return;
      
      setIsCalculatingShipping(true);
      try {
        const payload = {
          destinationSubdistrictId: Number(selectedAddress.subdistrictId),
          weightGrams: totalWeight,
          courier: "", // Kosongkan agar mengembalikan JNE, SICEPAT, dll sekaligus
          itemValue: grandTotal,
          isCod: 'no',
          originPinPoint: '-6.1752685%2C%106.7720772,17z',      // Format: "lat,long" (contoh: "-7.455, 109.287")
          destinationPinPoint: selectedAddress.pinPoint 
        };
        const data = await logisticsService.calculateShipping(payload);
        
        setShippingOptions(data);
        if (data && data.length > 0) {
          setSelectedCourier(data[0]); // Pilih yang pertama otomatis
        } else {
          setSelectedCourier(null);
        }
      } catch (error) {
        console.error("Gagal menghitung ongkir", error);
      } finally {
        setIsCalculatingShipping(false);
      }
    }
    calculateShipping();
  }, [selectedAddress.subdistrictId, totalWeight]);

  // --- FETCH LOCATIONS (For Modal) ---
  useEffect(() => {
    if (isAddressModalOpen && provinces.length === 0) {
      logisticsService.getProvinces().then(setProvinces).catch(console.error);
    }
  }, [isAddressModalOpen]);

  const handleProvChange = async (provId: string) => {
    setSelectedLocation({ prov: provId, city: "", dist: "", subdist: "" });
    setCities([]); setDistricts([]); setSubdistricts([]);
    if (provId) logisticsService.getCities(Number(provId)).then(setCities);
  };

  const handleCityChange = async (cityId: string, cityName: string) => {
    setSelectedLocation(prev => ({ ...prev, city: cityId, dist: "", subdist: "" }));
    setFormAddress(prev => ({ ...prev, city: cityName }));
    setDistricts([]); setSubdistricts([]);
    if (cityId) logisticsService.getDistricts(Number(cityId)).then(setDistricts);
  };

  const handleDistChange = async (distId: string) => {
    setSelectedLocation(prev => ({ ...prev, dist: distId, subdist: "" }));
    setSubdistricts([]);
    if (distId) logisticsService.getSubdistricts(Number(distId)).then(setSubdistricts);
  };

  const handleSubdistChange = (subdistId: string, postalCode?: string) => {
    setSelectedLocation(prev => ({ ...prev, subdist: subdistId }));
    setFormAddress(prev => ({ 
      ...prev, 
      subdistrictId: Number(subdistId),
      postalCode: postalCode || prev.postalCode
    }));
  };

  const saveAddress = () => {
    if (!formAddress.subdistrictId || !formAddress.recipientName || !formAddress.addressLine) {
      return alert("Mohon lengkapi semua data alamat termasuk Kelurahan/Kecamatan.");
    }
    setSelectedAddress(formAddress);
    setIsAddressModalOpen(false);
  };

  // --- PROTEKSI & RENDER CEK ---
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (checkoutItems.length === 0) router.push("/");
  }, [isAuthenticated, checkoutItems.length, router]);

  if (checkoutItems.length === 0) return null;

  // --- SUBMIT CHECKOUT ---
  const handleCheckout = async () => {
    if (!selectedPayment) return alert("Silakan pilih metode pembayaran.");
    if (!selectedCourier) return alert("Silakan pilih metode pengiriman.");

    setIsLoading(true);

    const orderPayload = {
      cartItemIds: selectedItemIds.map(id => id.toString()), 
      address: selectedAddress,
      courier: {
        name: selectedCourier.courier_name || selectedCourier.courier, 
        service: selectedCourier.service,
        cost: selectedCourier.cost,
      },
      paymentMethod: selectedPayment,
      voucherCode: appliedVoucher || undefined
    };

    try {
      const response = await ordersService.checkout(orderPayload);

      router.push(`/orders/${response.id}`); 
      
    } catch (error: any) {
      alert(error?.response?.data?.message || "Terjadi kesalahan saat memproses pesanan Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { category: "Bank Transfer", options: [
      { id: "bank_transfer", name: "Virtual Account (All Banks)", logo: "VA" },
      { id: "bca_va", name: "BCA Virtual Account", logo: "BCA" },
      { id: "bni_va", name: "BNI Virtual Account", logo: "BNI" },
      { id: "bri_va", name: "BRI Virtual Account", logo: "BRI" },
    ]},
    { category: "e-Wallet", options: [
      { id: "gopay", name: "GoPay", logo: "GoPay" },
      { id: "shopeepay", name: "ShopeePay", logo: "ShopeePay" },
    ]},
    { category: "Other methods", options: [
      { id: "qris", name: "QRIS", logo: "QRIS" },
    ]}
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* HEADER */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-200 shadow-sm">
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
      </header>

      <main className="max-w-3xl mx-auto w-full pt-2 lg:pt-6">
        
        {/* 1. SHIPPING ADDRESS */}
        <section className="bg-white p-4 mb-2 lg:rounded-xl lg:border lg:border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#FF6B00]" />
              Shipping Address
            </h2>
            <button onClick={() => setIsAddressModalOpen(true)} className="text-xs font-bold text-[#FF6B00] border border-[#FF6B00] px-3 py-1 rounded-full hover:bg-orange-50">
              Change
            </button>
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
                      <span className="text-xs text-gray-500">x {item.quantity} ({(item.weightKilogram ?? 0).toFixed(1)} kg)</span>
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
          
          <button onClick={() => setIsShippingOpen(!isShippingOpen)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-gray-900" />
              <div className="text-left">
                {isCalculatingShipping ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#FF6B00]" />
                    <span className="text-xs text-gray-500">Calculating shipping...</span>
                  </div>
                ) : selectedCourier ? (
                  <p className="text-sm font-medium text-gray-900">Shipping by {selectedCourier.courier_name || selectedCourier.courier}</p>
                ) : (
                  <p className="text-sm font-medium text-gray-500">Select Shipping</p>
                )}
              </div>
            </div>
            {isShippingOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {isShippingOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/50">
                <div className="p-4 space-y-2 border-t border-gray-100">
                  {shippingOptions.length === 0 && !isCalculatingShipping && (
                    <p className="text-xs text-gray-500 text-center py-2">Kurir tidak tersedia untuk alamat ini.</p>
                  )}
                  {shippingOptions.map((opt, idx) => (
                    <label key={idx} className={cn(
                      "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedCourier?.service === opt.service ? "border-[#FF6B00] bg-orange-50/30" : "border-gray-200 bg-white"
                    )} onClick={() => { setSelectedCourier(opt); setIsShippingOpen(false); }}>
                      <div className="flex items-center gap-3">
                        {selectedCourier?.service === opt.service ? <CheckCircle2 size={18} className="text-[#FF6B00]" /> : <Circle size={18} className="text-gray-300" />}
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{opt.courier_name || opt.courier} - {opt.service}</h4>
                          <p className="text-xs text-gray-500">Est: {opt.etd || 'Reguler'} {opt.is_cod_available && <span className="text-[#FF6B00] font-bold ml-1">COD</span>}</p>
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

        {/* 4. DISCOUNTS & PAYMENT (SAMA SEPERTI SEBELUMNYA) */}
        <section className="bg-white mb-2 lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden">
          <button onClick={() => setIsVoucherOpen(!isVoucherOpen)} className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/50">
                <div className="p-4 border-b border-gray-100 flex gap-2">
                  <input type="text" placeholder="Enter promo code" value={tempVoucher} onChange={(e) => setTempVoucher(e.target.value.toUpperCase())} className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm font-bold uppercase tracking-wider" />
                  <button onClick={() => { setAppliedVoucher(tempVoucher); setIsVoucherOpen(false); }} className="bg-black text-white font-bold px-5 rounded-lg text-sm">Apply</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button onClick={() => setIsPaymentOpen(!isPaymentOpen)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-gray-900" />
              <div className="text-left">
                {selectedPayment ? (
                  <p className="text-sm font-medium text-gray-900">{paymentMethods.flatMap(g => g.options).find(o => o.id === selectedPayment)?.name}</p>
                ) : (
                  <p className="text-sm font-medium text-gray-700">Payment Methods</p>
                )}
              </div>
            </div>
            {isPaymentOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {isPaymentOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/50">
                <div className="p-4 border-t border-gray-100">
                  {paymentMethods.map((group, idx) => (
                    <div key={idx} className="mb-5 last:mb-0">
                      <h3 className="text-xs font-bold text-gray-900 mb-2">{group.category}</h3>
                      <div className="space-y-0 text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {group.options.map((option) => (
                          <label key={option.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => { setSelectedPayment(option.id); setIsPaymentOpen(false); }}>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-blue-800 italic w-12 text-center bg-gray-100 py-1 rounded">{option.logo}</span>
                              <span className="text-sm font-medium text-gray-900">{option.name}</span>
                            </div>
                            {selectedPayment === option.id ? <CheckCircle2 size={20} className="text-[#FF6B00]" /> : <Circle size={20} className="text-gray-300" />}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 p-4 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total Payment</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
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

      {/* ==================================================== */}
      {/* MODAL GANTI ALAMAT DINAMIS */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddressModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-5 pb-safe z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg">Change Shipping Address</h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="p-1 text-gray-400 hover:text-black"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Recipient Name</label>
                    <input type="text" value={formAddress.recipientName} onChange={(e) => setFormAddress({...formAddress, recipientName: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Phone Number</label>
                    <input type="tel" value={formAddress.phone} onChange={(e) => setFormAddress({...formAddress, phone: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Province</label>
                  <select value={selectedLocation.prov} onChange={(e) => handleProvChange(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:border-black outline-none">
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">City / Regency</label>
                  <select value={selectedLocation.city} onChange={(e) => handleCityChange(e.target.value, e.target.options[e.target.selectedIndex].text)} disabled={!selectedLocation.prov} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 outline-none">
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">District</label>
                  <select value={selectedLocation.dist} onChange={(e) => handleDistChange(e.target.value)} disabled={!selectedLocation.city} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 outline-none">
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Subdistrict (Kelurahan)</label>
                  <select value={selectedLocation.subdist} onChange={(e) => handleSubdistChange(e.target.value, cities.find(c => c.id === Number(selectedLocation.city))?.postal_code)} disabled={!selectedLocation.dist} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 outline-none">
                    <option value="">Select Subdistrict</option>
                    {subdistricts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.zip_code || '-'})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Detailed Address (Street, House No, RT/RW)</label>
                  <textarea rows={3} value={formAddress.addressLine} onChange={(e) => setFormAddress({...formAddress, addressLine: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none" />
                </div>

                <button 
                  onClick={saveAddress}
                  className="w-full bg-[#1C1C1C] hover:bg-black text-white font-bold py-3.5 rounded-xl mt-4 transition-colors"
                >
                  Save Address & Calculate Shipping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}