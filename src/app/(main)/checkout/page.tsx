"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, ChevronDown, ChevronUp, Ticket,
  Zap, Wallet, Loader2, Circle, CheckCircle2,
  MapPin, Truck, X, Plus, Home, Briefcase,
  Building2, AlertTriangle, ChevronRight,
  Package, Tag, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useMyAddresses } from "@/lib/hooks/useUsers";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";

import { logisticsService } from "@/lib/api/logistics.service";
import { ordersService } from "@/lib/api/orders.service";
import type { UserAddress } from "@/types/user.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORIGIN_COORDS = { lat: -6.1752685, lng: 106.7720772 };
const ORIGIN_PIN = `${ORIGIN_COORDS.lat},${ORIGIN_COORDS.lng}`;
const INSTANT_DISTANCE_LIMIT_KM = 15;
const INSTANT_KEYWORDS = ["gosend", "grabexpress", "grab express", "go-send", "instant", "same day"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInstantCourier(opt: any): boolean {
  const label = `${opt.courier_name || opt.courier || ""} ${opt.service || ""}`.toLowerCase();
  return INSTANT_KEYWORDS.some((kw) => label.includes(kw));
}

function formatPin(lat: number, lng: number) {
  return `${lat},${lng}`;
}

function LabelIcon({ label }: { label: string }) {
  const l = label?.toLowerCase();
  if (l === "home") return <Home size={11} />;
  if (l === "work") return <Briefcase size={11} />;
  return <Building2 size={11} />;
}

// ─── Mini Map (read-only Leaflet) ─────────────────────────────────────────────

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current || !ref.current) return;
    import("leaflet").then((L) => {
      const map = L.map(ref.current!, {
        center: [lat, lng], zoom: 15,
        zoomControl: false, dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false, attributionControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:20px;height:20px;background:#f97316;border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [20, 20], iconAnchor: [10, 20],
        }),
      }).addTo(map);
      mapRef.current = map;
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { mapRef.current?.setView([lat, lng], 15); }, [lat, lng]);

  return <div ref={ref} className="w-full h-full" style={{ zIndex: 0 }} />;
}

// ─── Shipping Option Row ──────────────────────────────────────────────────────

function ShippingRow({ opt, isSelected, onSelect, disabled }: {
  opt: any; isSelected: boolean; onSelect: () => void; disabled: boolean;
}) {
  return (
    <div
      onClick={disabled ? undefined : onSelect}
      className={cn(
        "flex items-center justify-between p-3.5 border rounded-xl transition-all",
        disabled
          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
          : isSelected
            ? "border-[#FF6B00] bg-orange-50/40 cursor-pointer"
            : "border-gray-200 bg-white cursor-pointer hover:border-gray-300",
      )}
    >
      <div className="flex items-center gap-3">
        {isSelected && !disabled
          ? <CheckCircle2 size={18} className="text-[#FF6B00] shrink-0" />
          : <Circle      size={18} className="text-gray-300 shrink-0" />}
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {opt.courier_name || opt.courier}
            <span className="font-normal text-gray-500 ml-1">· {opt.service}</span>
          </p>
          <p className="text-xs text-gray-400">
            Est. {opt.etd || "varies"}
            {opt.is_cod_available && <span className="ml-2 text-[#FF6B00] font-bold">COD</span>}
          </p>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">{formatPrice(opt.cost)}</span>
    </div>
  );
}

// ─── Address Selector Sheet ───────────────────────────────────────────────────

function AddressSheet({
  isOpen, onClose, addresses, selectedId, onSelect, onAddNew, distanceMap,
}: {
  isOpen: boolean; onClose: () => void;
  addresses: UserAddress[]; selectedId: number | null;
  onSelect: (a: UserAddress) => void; onAddNew: () => void;
  distanceMap: Record<number, number>;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative bg-white w-full sm:w-[440px] rounded-t-2xl z-10 max-h-[88vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-base">Select Delivery Address</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {addresses.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MapPin size={32} className="mx-auto mb-3 opacity-25" />
                  <p className="text-sm">No saved addresses yet.</p>
                </div>
              )}

              {addresses.map((addr) => {
                const isSel   = addr.id === selectedId;
                const isExp   = expandedId === addr.id;
                const hasPins = !!(addr.latitude && addr.longitude);
                const distKm  = distanceMap[addr.id];
                const tooFar  = hasPins && distKm > INSTANT_DISTANCE_LIMIT_KM;

                return (
                  <div key={addr.id} className={cn(
                    "rounded-xl border-2 overflow-hidden transition-all",
                    isSel ? "border-[#FF6B00] bg-orange-50/20" : "border-gray-200 bg-white",
                  )}>
                    {/* Tap to select */}
                    <button type="button" onClick={() => { onSelect(addr); onClose(); }} className="w-full text-left p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {isSel
                            ? <CheckCircle2 size={20} className="text-[#FF6B00]" />
                            : <Circle      size={20} className="text-gray-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                              isSel ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-600",
                            )}>
                              <LabelIcon label={addr.label || ''} />
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-1.5">
                            {addr.recipientName}
                            <span className="font-normal text-gray-500 ml-2 text-xs">{addr.phone}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                            {addr.addressLine}, {addr.postalCode}
                          </p>
                          {hasPins && distKm !== undefined && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                tooFar
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-green-50 text-green-700 border border-green-200",
                              )}>
                                {distKm.toFixed(1)} km from store
                              </span>
                              {tooFar && (
                                <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> Instant unavailable
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Map expand toggle */}
                    {hasPins && (
                      <>
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExp ? null : addr.id)}
                          className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-100 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <MapPin size={11} />
                          {isExp ? "Hide map" : "View pin location"}
                          {isExp ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>
                        <AnimatePresence>
                          {isExp && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 140 }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="h-[140px]">
                                <MiniMap lat={addr.latitude!} lng={addr.longitude!} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new */}
            <div className="p-4 border-t border-gray-100 shrink-0">
              <button
                onClick={onAddNew}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-orange-50/30 transition-colors"
              >
                <Plus size={15} /> Add New Address
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Checkout Summary Bar ─────────────────────────────────────────────────────

function SummaryBar({
  isOpen, onToggle,
  subtotal, shippingCost, voucherDiscount, pointsDiscount,
  grandTotal, pointsEarned, itemCount,
  canPay, isLoading, onPay,
}: {
  isOpen: boolean; onToggle: () => void;
  subtotal: number; shippingCost: number;
  voucherDiscount: number; pointsDiscount: number;
  grandTotal: number; pointsEarned: number; itemCount: number;
  canPay: boolean; isLoading: boolean; onPay: () => void;
}) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onToggle} className="fixed inset-0 bg-black/10 z-30" />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-3xl mx-auto">
          {/* Expandable detail panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="bg-white border border-b-0 border-gray-200 rounded-t-2xl px-4 pt-4 pb-3 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Summary</h3>
                  <button onClick={onToggle} className="text-gray-400 hover:text-gray-700">
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal <span className="text-gray-400">({itemCount} item{itemCount > 1 ? "s" : ""})</span></span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Shipping</span>
                    <span className={cn("font-semibold", !shippingCost ? "text-gray-300 italic text-xs mt-0.5" : "")}>
                      {shippingCost ? formatPrice(shippingCost) : "—"}
                    </span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span className="flex items-center gap-1"><Tag size={13} /> Voucher</span>
                      <span className="font-semibold">−{formatPrice(voucherDiscount)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span className="flex items-center gap-1"><Zap size={13} /> Flash Points</span>
                      <span className="font-semibold">−{formatPrice(pointsDiscount)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Grand Total</span>
                  <span className="text-xl font-extrabold text-gray-900">{formatPrice(grandTotal)}</span>
                </div>
                {pointsEarned > 0 && (
                  <p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-2">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    You'll earn {pointsEarned.toLocaleString()} Flash Points
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always-visible strip */}
          <div className="bg-white border-t border-gray-200 px-4 pt-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
            <div className="flex items-end justify-between gap-3">
              {/* Left: total + tap hint */}
              <button onClick={onToggle} className="flex flex-col items-start min-w-0">
                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                  Total Payment
                  <ChevronUp size={12} className={cn("transition-transform text-gray-400", isOpen ? "rotate-0" : "rotate-180")} />
                </span>
                <span className="text-xl font-extrabold text-gray-900">{formatPrice(grandTotal)}</span>
                <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5 mt-0.5">
                  <Star size={9} className="fill-amber-400 text-amber-400" />
                  +{pointsEarned.toLocaleString()} pts
                </span>
              </button>

              {/* Right: pay button */}
              <button
                onClick={onPay}
                disabled={!canPay || isLoading}
                className={cn(
                  "shrink-0 flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg",
                  canPay && !isLoading
                    ? "bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98] shadow-black/20"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
                )}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Pay Now →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router          = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { items, selectedItemIds } = useCartStore();
  const checkoutItems = items.filter((item) => selectedItemIds.includes(item.id));

  const { data: savedAddresses = [], isLoading: loadingAddresses } = useMyAddresses();

  // ── UI ────────────────────────────────────────────────────────────────────
  const [isLoading,          setIsLoading]          = useState(false);
  const [usePoints,          setUsePoints]          = useState(false);
  const [selectedPayment,    setSelectedPayment]    = useState<string | null>(null);
  const [isShippingOpen,     setIsShippingOpen]     = useState(false);
  const [isVoucherOpen,      setIsVoucherOpen]      = useState(false);
  const [isPaymentOpen,      setIsPaymentOpen]      = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [isSummaryOpen,      setIsSummaryOpen]      = useState(false);

  // ── Address ───────────────────────────────────────────────────────────────
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddress) {
      setSelectedAddress(savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]);
    }
  }, [savedAddresses, selectedAddress]);

  // Pre-compute distances
  const distanceMap: Record<number, number> = {};
  savedAddresses.forEach((addr) => {
    if (addr.latitude && addr.longitude)
      distanceMap[addr.id] = haversineKm(ORIGIN_COORDS.lat, ORIGIN_COORDS.lng, addr.latitude, addr.longitude);
  });

  const selectedDistKm = selectedAddress?.latitude && selectedAddress?.longitude
    ? haversineKm(ORIGIN_COORDS.lat, ORIGIN_COORDS.lng, selectedAddress.latitude, selectedAddress.longitude)
    : null;
  const instantBlocked = selectedDistKm !== null && selectedDistKm > INSTANT_DISTANCE_LIMIT_KM;

  // ── Voucher ───────────────────────────────────────────────────────────────
  const [tempVoucher,    setTempVoucher]    = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const voucherDiscount = 0; // wire to real discount API

  // ── Shipping ──────────────────────────────────────────────────────────────
  const [shippingOptions,  setShippingOptions]  = useState<any[]>([]);
  const [selectedCourier,  setSelectedCourier]  = useState<any | null>(null);
  const [isCalcShipping,   setIsCalcShipping]   = useState(false);

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal      = checkoutItems.reduce((s, i) => s + (Number(i.price) * i.quantity), 0);
  const totalWeight   = checkoutItems.reduce((s, i) => s + ((i.weightKilogram ?? 2) * i.quantity), 0);
  const pointsBalance = 21560; // replace with auth store / profile
  const pointsDiscount = usePoints ? Math.min(pointsBalance, Math.floor(subtotal * 0.1)) : 0;
  const pointsEarned  = Math.floor(subtotal * 0.033);
  const shippingCost  = selectedCourier?.cost ?? 0;
  const grandTotal    = subtotal + shippingCost - voucherDiscount - pointsDiscount;

  // ── Fetch shipping ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedAddress?.subdistrictId || checkoutItems.length === 0) return;

    setIsCalcShipping(true);
    setSelectedCourier(null);

    const destPin = selectedAddress.latitude && selectedAddress.longitude
      ? formatPin(selectedAddress.latitude, selectedAddress.longitude)
      : undefined;

    const payload = {
      destinationSubdistrictId: Number(selectedAddress.subdistrictId || ''),
      weightGrams:  totalWeight,
      courier:      "",
      itemValue:    subtotal,
      isCod:        "no",
      originPinPoint: ORIGIN_PIN,
      ...(destPin ? { destinationPinPoint: destPin } : {}),
    }

    logisticsService.calculateShipping(payload)
    .then((data) => {
      setShippingOptions(data ?? []);
      const eligible = (data ?? []).filter((o: any) => instantBlocked ? !isInstantCourier(o) : true);
      setSelectedCourier(eligible[0] ?? null);
    })
    .catch(console.error)
    .finally(() => setIsCalcShipping(false));
  }, [selectedAddress?.subdistrictId, totalWeight]);

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (checkoutItems.length === 0) router.push("/");
  }, [isAuthenticated, checkoutItems.length, router]);

  if (checkoutItems.length === 0) return null;

  const handleCheckout = async () => {
    if (!selectedPayment) return alert("Please select a payment method.");
    if (!selectedCourier) return alert("Please select a shipping method.");
    if (!selectedAddress) return alert("Please select a delivery address.");

    // 1. Validate coordinates for Instant Couriers
    const isInstant = ["gosend", "grabexpress", "grab express", "go-send", "instant", "same day"].some((kw) => 
      `${selectedCourier.courier_name || selectedCourier.courier} ${selectedCourier.service}`.toLowerCase().includes(kw)
    );

    if (isInstant && (!selectedAddress.latitude || !selectedAddress.longitude)) {
      return alert("Instant delivery requires a pinpoint location. Please edit your address to add a map pin.");
    }

    // 2. Resolve City Name
    let cityName = selectedAddress.city || selectedAddress.cityName; 
      
    if (!cityName && selectedAddress.provinceId && selectedAddress.cityId) {
      const cities = await logisticsService.getCities(selectedAddress.provinceId);
      
      const foundCity = cities.find((c: any) => c.id === selectedAddress.cityId); 
      if (foundCity) {
        cityName = foundCity.name;
      }
    }

    // 3. Prepare the enriched address payload
    const enrichedAddress = {
      ...selectedAddress,
      city: cityName || "Unknown City",
      // Explicitly cast to numbers to satisfy NestJS DTOs and Prisma Floats
      latitude: selectedAddress.latitude ? Number(selectedAddress.latitude) : undefined,
      longitude: selectedAddress.longitude ? Number(selectedAddress.longitude) : undefined,
    };

    setIsLoading(true);
    try {
      const res = await ordersService.checkout({
        cartItemIds:   selectedItemIds.map((id) => id.toString()),
        address:       enrichedAddress,
        courier: { 
          name: selectedCourier.courier_name || selectedCourier.courier, 
          service: selectedCourier.service, 
          cost: selectedCourier.cost 
        },
        paymentMethod: selectedPayment,
        voucherCode:   appliedVoucher || undefined,
      });
      router.push(`/orders/${res.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { category: "Bank Transfer", options: [
      { id: "bank_transfer", name: "Virtual Account (All Banks)", logo: "VA"       },
      { id: "bca_va",        name: "BCA Virtual Account",         logo: "BCA"      },
      { id: "bni_va",        name: "BNI Virtual Account",         logo: "BNI"      },
      { id: "bri_va",        name: "BRI Virtual Account",         logo: "BRI"      },
    ]},
    { category: "e-Wallet", options: [
      { id: "gopay",     name: "GoPay",     logo: "GoPay"     },
      { id: "shopeepay", name: "ShopeePay", logo: "ShopeePay" },
    ]},
    { category: "Other methods", options: [
      { id: "qris", name: "QRIS", logo: "QRIS" },
    ]},
  ];

  const regularOptions = shippingOptions.filter((o) => !isInstantCourier(o));
  const instantOptions = shippingOptions.filter((o) =>  isInstantCourier(o));

  const canPay = !!(selectedPayment && selectedCourier && selectedAddress && !isCalcShipping);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pb-40">

      {/* HEADER */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-200 shadow-sm">
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Secure Checkout</h1>
      </header>

      <main className="max-w-3xl mx-auto w-full pt-2 lg:pt-6 space-y-2">

        {/* ── 1. DELIVERY ADDRESS ───────────────────────────────────────────── */}
        <section className="bg-white p-4 lg:rounded-xl lg:border lg:border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <MapPin size={16} className="text-[#FF6B00]" />
              Delivery Address
            </h2>
            <button
              onClick={() => setIsAddressSheetOpen(true)}
              className="text-xs font-bold text-[#FF6B00] border border-[#FF6B00] px-3 py-1 rounded-full hover:bg-orange-50 flex items-center gap-1 transition-colors"
            >
              {selectedAddress ? "Change" : "Select"} <ChevronRight size={11} />
            </button>
          </div>

          {loadingAddresses ? (
            <div className="pl-6 animate-pulse space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-64 bg-gray-200 rounded" />
            </div>
          ) : selectedAddress ? (
            <div className="pl-6">
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FF6B00] text-white px-2 py-0.5 rounded-full">
                  <LabelIcon label={selectedAddress.label || ''} /> {selectedAddress.label}
                </span>
                {selectedAddress.isDefault && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-900">
                {selectedAddress.recipientName}
                <span className="font-normal text-gray-500 ml-2 text-xs">{selectedAddress.phone}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {selectedAddress.addressLine}, {selectedAddress.postalCode}
              </p>

              {selectedDistKm !== null && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    instantBlocked
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-green-50 text-green-700 border border-green-200",
                  )}>
                    {selectedDistKm.toFixed(1)} km from store
                  </span>
                  {instantBlocked && (
                    <span className="text-[10px] text-amber-600 flex items-center gap-0.5 font-medium">
                      <AlertTriangle size={11} /> Instant delivery unavailable (&gt;{INSTANT_DISTANCE_LIMIT_KM} km)
                    </span>
                  )}
                </div>
              )}

              {selectedAddress.latitude && selectedAddress.longitude && (
                <div className="mt-3 h-28 rounded-xl overflow-hidden border border-gray-200">
                  <MiniMap lat={selectedAddress.latitude} lng={selectedAddress.longitude} />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAddressSheetOpen(true)}
              className="ml-6 flex items-center gap-2 text-sm text-[#FF6B00] font-semibold"
            >
              <Plus size={15} /> Select a delivery address
            </button>
          )}
        </section>

        {/* ── 2. ORDER ITEMS ────────────────────────────────────────────────── */}
        <section className="bg-white p-4 lg:rounded-xl lg:border lg:border-gray-200">
          <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
            <Package size={16} className="text-gray-500" /> Order Items
          </h2>
          <div className="space-y-4">
            {checkoutItems.map((item) => {
              const imageUrl = item.image?.length > 0 ? getProductImageUrl([item.image[0]]) : "/placeholder.jpg";
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                    <Image src={imageUrl} alt={item.productName} fill className="object-cover p-1 rounded-lg" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">{item.productName}</p>
                    <div className="flex items-end justify-between mt-1.5">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(Number(item.price))}</span>
                      <span className="text-xs text-gray-400">×{item.quantity} · {(item.weightKilogram ?? 0).toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. SHIPPING METHOD ────────────────────────────────────────────── */}
        <section className="bg-white lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Truck size={15} className="text-gray-500" />
            <h2 className="text-sm font-bold">Shipping Method</h2>
          </div>

          <button
            onClick={() => setIsShippingOpen(!isShippingOpen)}
            className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="text-left">
              {isCalcShipping ? (
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={13} className="animate-spin text-[#FF6B00]" /> Calculating rates…
                </span>
              ) : selectedCourier ? (
                <>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCourier.courier_name || selectedCourier.courier} · {selectedCourier.service}
                  </p>
                  <p className="text-xs text-gray-400">Est. {selectedCourier.etd || "varies"} · <span className="font-semibold text-gray-700">{formatPrice(selectedCourier.cost)}</span></p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Select shipping method</p>
              )}
            </div>
            {isShippingOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {isShippingOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 pt-3 space-y-5 border-t border-gray-100 bg-gray-50/60">
                  {shippingOptions.length === 0 && !isCalcShipping && (
                    <p className="text-xs text-gray-400 text-center py-4">No couriers available for this address.</p>
                  )}

                  {regularOptions.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Regular & Next Day</p>
                      <div className="space-y-2">
                        {regularOptions.map((opt, i) => (
                          <ShippingRow key={i} opt={opt}
                            isSelected={selectedCourier?.service === opt.service && selectedCourier?.courier === opt.courier}
                            onSelect={() => setSelectedCourier(opt)} disabled={false} />
                        ))}
                      </div>
                    </div>
                  )}

                  {instantOptions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Instant & Same Day</p>
                        {instantBlocked && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle size={10} /> &gt;{INSTANT_DISTANCE_LIMIT_KM} km
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {instantOptions.map((opt, i) => (
                          <ShippingRow key={i} opt={opt}
                            isSelected={!instantBlocked && selectedCourier?.service === opt.service && selectedCourier?.courier === opt.courier}
                            onSelect={() => setSelectedCourier(opt)} disabled={instantBlocked} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── 4. VOUCHER + POINTS + PAYMENT ─────────────────────────────────── */}
        <section className="bg-white lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden divide-y divide-gray-100">

          {/* Voucher */}
          <button onClick={() => setIsVoucherOpen(!isVoucherOpen)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Ticket size={18} className={appliedVoucher ? "text-[#FF6B00]" : "text-gray-500"} />
              <span className={cn("text-sm font-medium", appliedVoucher ? "text-[#FF6B00] font-semibold" : "text-gray-700")}>
                {appliedVoucher ? `Voucher: ${appliedVoucher}` : "Enter voucher code"}
              </span>
            </div>
            {isVoucherOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          <AnimatePresence>
            {isVoucherOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-4 flex gap-2">
                  <input type="text" placeholder="PROMO CODE" value={tempVoucher}
                    onChange={(e) => setTempVoucher(e.target.value.toUpperCase())}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm font-bold uppercase tracking-widest focus:border-[#FF6B00] outline-none"
                  />
                  <button onClick={() => { setAppliedVoucher(tempVoucher); setIsVoucherOpen(false); }}
                    className="bg-gray-900 text-white font-bold px-5 rounded-lg text-sm hover:bg-black transition-colors">
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash Points */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-amber-400" />
              <div>
                <p className="text-sm font-medium text-gray-800">Use Flash Points</p>
                <p className="text-xs text-gray-400">{pointsBalance.toLocaleString()} pts · worth {formatPrice(Math.floor(pointsBalance))}</p>
              </div>
            </div>
            <button
              onClick={() => setUsePoints(!usePoints)}
              className={cn("w-11 h-6 rounded-full transition-colors relative shrink-0", usePoints ? "bg-[#FF6B00]" : "bg-gray-200")}
            >
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all", usePoints ? "left-5" : "left-0.5")} />
            </button>
          </div>

          {/* Payment Method */}
          <button onClick={() => setIsPaymentOpen(!isPaymentOpen)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Wallet size={18} className="text-gray-500" />
              <div className="text-left">
                {selectedPayment
                  ? <p className="text-sm font-semibold text-gray-900">{paymentMethods.flatMap(g => g.options).find(o => o.id === selectedPayment)?.name}</p>
                  : <p className="text-sm font-medium text-gray-700">Payment Method</p>}
              </div>
            </div>
            {isPaymentOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          <AnimatePresence>
            {isPaymentOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="p-4 space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed">Payment is processed securely. Receipt available after confirmation.</p>
                  {paymentMethods.map((group, idx) => (
                    <div key={idx}>
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{group.category}</h3>
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                        {group.options.map((option) => (
                          <div key={option.id} onClick={() => { setSelectedPayment(option.id); setIsPaymentOpen(false); }}
                            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-blue-800 italic w-14 text-center bg-gray-100 py-1.5 rounded-lg">{option.logo}</span>
                              <span className="text-sm font-medium text-gray-900">{option.name}</span>
                            </div>
                            {selectedPayment === option.id
                              ? <CheckCircle2 size={20} className="text-[#FF6B00]" />
                              : <Circle      size={20} className="text-gray-300" />}
                          </div>
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

      {/* ── ADDRESS SHEET ─────────────────────────────────────────────────── */}
      <AddressSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        addresses={savedAddresses}
        selectedId={selectedAddress?.id ?? null}
        onSelect={(addr) => { setSelectedAddress(addr); setSelectedCourier(null); setShippingOptions([]); }}
        onAddNew={() => { setIsAddressSheetOpen(false); router.push("/account/addresses/add"); }}
        distanceMap={distanceMap}
      />

      {/* ── SUMMARY BAR ───────────────────────────────────────────────────── */}
      <SummaryBar
        isOpen={isSummaryOpen} onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
        subtotal={subtotal} shippingCost={shippingCost}
        voucherDiscount={voucherDiscount} pointsDiscount={pointsDiscount}
        grandTotal={grandTotal} pointsEarned={pointsEarned}
        itemCount={checkoutItems.length}
        canPay={canPay} isLoading={isLoading} onPay={handleCheckout}
      />
    </div>
  );
}