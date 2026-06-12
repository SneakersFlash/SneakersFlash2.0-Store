"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, ChevronDown, ChevronUp,
  Zap, Wallet, Loader2, Circle, CheckCircle2,
  MapPin, Truck, X, Plus, Home, Briefcase,
  Building2, AlertTriangle, ChevronRight,
  Package, Tag, Star, Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useAddAddress, useMyAddresses } from "@/lib/hooks/useUsers";
import { formatPrice } from "@/lib/utils/formatPrice";
import { getProductImageUrl } from "@/lib/utils/imageUrl";
import { cn } from "@/lib/utils/cn";

import { logisticsService } from "@/lib/api/logistics.service";
import { ordersService } from "@/lib/api/orders.service";
import type { CreateUserAddressDto, UserAddress } from "@/types/user.types";

import VoucherSelector from "@/components/voucher/VoucherSelector";
import type { AppliedVoucher } from "@/types/voucher.types";
import { AddressForm } from "@/components/address/AddressForm";
import { useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/lib/api/cart.service";
import PageLoader from "@/components/common/PageLoader";
import { pixel } from "@/lib/utils/fbPixel";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ORIGIN_COORDS = { lat: -6.1690336, lng: 106.7755197 };
const ORIGIN_PIN = `${ORIGIN_COORDS.lat},${ORIGIN_COORDS.lng}`;
const INSTANT_DISTANCE_LIMIT_KM = 15;
const INSTANT_KEYWORDS = ["gosend","grabexpress","grab express","go-send","instant","same day"];

// ─────────────────────────────────────────────────────────────────────────────
// Payment methods — sesuai active methods di Midtrans dashboard
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    category: "Virtual Account",
    options: [
      { id: "bca_va",     name: "BCA Virtual Account",       logo: "/images/BCA.jpg.jpeg",     logoText: "BCA"     },
      { id: "bni_va",     name: "BNI Virtual Account",       logo: "/images/BNI.jpg.jpeg",     logoText: "BNI"     },
      { id: "bri_va",     name: "BRI Virtual Account",       logo: "/images/BRI.jpg.jpeg",     logoText: "BRI"     },
      { id: "mandiri_va", name: "Bank Mandiri",               logo: "/images/mandiri.jpg.jpeg", logoText: "MANDIRI" },
      { id: "permata_va", name: "PermataBank",                logo: "/images/permata.jpg.jpeg", logoText: "PERMATA" },
    ],
  },
  {
    category: "e-Wallet & QRIS",
    options: [
      { id: "gopay",     name: "GoPay",              logo: "/images/gopay.jpg.jpeg",     logoText: "GoPay"     },
      { id: "shopeepay", name: "ShopeePay",          logo: "/images/Spay.jpg.jpeg", logoText: "ShopeePay" },
      { id: "qris",      name: "GoPay Dynamic QRIS", logo: "/images/Gopay Qris.jpg.jpeg",      logoText: "QRIS"      },
    ],
  },
  {
    category: "Paylater & Card",
    options: [
      { id: "akulaku",     name: "Akulaku PayLater",    logo: "/images/akulaku paylater.jpg.jpeg", logoText: "Akulaku" },
      { id: "credit_card", name: "Kartu Kredit / Debit", logo: "/images/Visa.jpg.jpeg",   logoText: "CARD"    },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number):number{
  const R=6371,dLat=((lat2-lat1)*Math.PI)/180,dLng=((lng2-lng1)*Math.PI)/180;
  const a=Math.sin(dLat/2)**2+Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function isInstantCourier(opt:any):boolean{
  const label=`${opt.courier_name||opt.courier||""} ${opt.service||""}`.toLowerCase();
  return INSTANT_KEYWORDS.some(kw=>label.includes(kw));
}
function formatPin(lat:number,lng:number){return `${lat},${lng}`;}
function LabelIcon({label}:{label:string}){
  const l=label?.toLowerCase();
  if(l==="home")return <Home size={11}/>;
  if(l==="work")return <Briefcase size={11}/>;
  return <Building2 size={11}/>;
}
function formatCardNumber(v:string){return v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ");}
function formatExpiry(v:string){const d=v.replace(/\D/g,"").slice(0,4);return d.length>=3?`${d.slice(0,2)}/${d.slice(2)}`:d;}

// ─────────────────────────────────────────────────────────────────────────────
// Credit Card Form
// ─────────────────────────────────────────────────────────────────────────────

interface CardFormState{number:string;expiry:string;cvv:string;name:string;}

function CreditCardForm({value,onChange}:{value:CardFormState;onChange:(v:CardFormState)=>void;}){
  const cls="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[#E05600] transition-colors bg-white placeholder-gray-300";
  return(
    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Lock size={13} className="text-gray-400"/>
        <p className="text-[12px] text-gray-500">Data kartu dienkripsi via Midtrans</p>
      </div>
      <input inputMode="numeric" placeholder="Nomor Kartu (16 digit)" value={value.number}
        onChange={e=>onChange({...value,number:formatCardNumber(e.target.value)})} className={cls} maxLength={19}/>
      <input placeholder="Nama Pemegang Kartu" value={value.name}
        onChange={e=>onChange({...value,name:e.target.value.toUpperCase()})} className={cls}/>
      <div className="grid grid-cols-2 gap-3">
        <input inputMode="numeric" placeholder="MM/YY" value={value.expiry}
          onChange={e=>onChange({...value,expiry:formatExpiry(e.target.value)})} className={cls} maxLength={5}/>
        <input inputMode="numeric" placeholder="CVV" type="password" value={value.cvv}
          onChange={e=>onChange({...value,cvv:e.target.value.replace(/\D/g,"").slice(0,4)})} className={cls} maxLength={4}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Logo (fallback ke teks jika gambar error)
// ─────────────────────────────────────────────────────────────────────────────

function PaymentLogo({logo,logoText}:{logo:string;logoText:string;}){
  const [err,setErr]=useState(false);
  if(err)return(
    <span className="text-[10px] font-black text-blue-800 italic w-14 text-center bg-gray-100 rounded-lg flex items-center justify-center">{logoText}</span>
  );
  return(
    <div className="w-14 h-8 relative rounded-lg overflow-hidden shrink-0 bg-white border border-gray-100">
      <Image
        src={logo}
        alt={logoText}
        fill
        className="object-contain"   // ← tidak ada p-1, logo fill penuh
        sizes="56px"
        onError={() => setErr(true)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini Map
// ─────────────────────────────────────────────────────────────────────────────

function MiniMap({lat,lng}:{lat:number;lng:number;}){
  const ref=useRef<HTMLDivElement>(null);const mapRef=useRef<any>(null);
  useEffect(()=>{
    if(!document.getElementById("leaflet-css")){
      const l=document.createElement("link");l.id="leaflet-css";l.rel="stylesheet";
      l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(l);
    }
  },[]);
  useEffect(()=>{
    if(mapRef.current||!ref.current)return;
    import("leaflet").then(L=>{
      const map=L?.map(ref.current!,{center:[lat,lng],zoom:15,zoomControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false,attributionControl:false});
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
      L.marker([lat,lng],{icon:L.divIcon({className:"",html:`<div style="width:20px;height:20px;background:#f97316;border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 6px rgba(0,0,0,0.4);"></div>`,iconSize:[20,20],iconAnchor:[10,20]})}).addTo(map);
      mapRef.current=map;
    });
    return()=>{mapRef.current?.remove();mapRef.current=null;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{mapRef.current?.setView([lat,lng],15);},[lat,lng]);
  return <div ref={ref} className="w-full h-full" style={{zIndex:0}}/>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shipping Row
// ─────────────────────────────────────────────────────────────────────────────

function ShippingRow({opt,isSelected,onSelect,disabled}:{opt:any;isSelected:boolean;onSelect:()=>void;disabled:boolean;}){
  const subsidy=Math.min(Number(opt.cost),50000);
  const customerCost=Math.max(0,Number(opt.cost)-subsidy);
  return(
    <div onClick={disabled?undefined:onSelect}
      className={cn("flex items-center justify-between p-3.5 border rounded-xl transition-all",
        disabled?"border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed":
        isSelected?"border-emerald-400 bg-emerald-50 cursor-pointer":"border-gray-200 bg-white cursor-pointer hover:border-gray-300")}>
      <div className="flex items-center gap-3">
        {isSelected&&!disabled?<CheckCircle2 size={18} className="text-green-500 shrink-0"/>:<Circle size={18} className="text-gray-300 shrink-0"/>}
        <div>
          <p className="text-xs font-semibold text-gray-900">{opt.courier_name||opt.courier}<span className="font-normal text-gray-500 ml-1">· {opt.service}</span></p>
          <p className="text-xs text-gray-400">Est. {opt.etd||"varies"}</p>
        </div>
      </div>
      <span className="text-xs shrink-0 ml-2 flex flex-col items-end">
        <span className="font-bold text-emerald-600">{customerCost===0?"GRATIS":formatPrice(customerCost)}</span>
        <span className="line-through text-gray-400 text-[10px]">{formatPrice(opt.cost)}</span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Address Sheet
// ─────────────────────────────────────────────────────────────────────────────

function AddressSheet({isOpen,onClose,addresses,selectedId,onSelect,onAddNew,distanceMap}:{
  isOpen:boolean;onClose:()=>void;addresses:UserAddress[];selectedId:number|null;
  onSelect:(a:UserAddress)=>void;onAddNew:()=>void;distanceMap:Record<number,number>;
}){
  const [expandedId,setExpandedId]=useState<number|null>(null);
  return(
    <AnimatePresence>
      {isOpen&&(
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:220}}
            className="relative bg-white w-full sm:w-[440px] rounded-t-2xl z-10 max-h-[88vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 bg-gray-300 rounded-full"/></div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-base">Pilih Alamat Pengiriman</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {addresses.length===0&&(<div className="text-center py-12 text-gray-400"><MapPin size={32} className="mx-auto mb-3 opacity-25"/><p className="text-xs">Belum ada alamat.</p></div>)}
              {addresses.map(addr=>{
                const isSel=addr.id===selectedId,isExp=expandedId===addr.id,hasPins=!!(addr.latitude&&addr.longitude);
                const distKm=distanceMap[addr.id],tooFar=hasPins&&distKm>INSTANT_DISTANCE_LIMIT_KM;
                return(
                  <div key={addr.id} className={cn("rounded-xl border-2 overflow-hidden transition-all",isSel?"border-primary bg-orange-50/20":"border-gray-200 bg-white")}>
                    <button type="button" onClick={()=>{onSelect(addr);onClose();}} className="w-full text-left p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{isSel?<CheckCircle2 size={20} className="text-primary"/>:<Circle size={20} className="text-gray-300"/>}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",isSel?"bg-primary text-white":"bg-gray-100 text-gray-600")}><LabelIcon label={addr.label||""}/>{addr.label}</span>
                            {addr.isDefault&&<span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-xs font-bold text-gray-900 mt-1.5">{addr.recipientName}<span className="font-normal text-gray-500 ml-2 text-xs">{addr.phone}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{addr.addressLine}, {addr.postalCode}</p>
                          {hasPins&&distKm!==undefined&&(
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",tooFar?"bg-amber-50 text-amber-700 border border-amber-200":"bg-green-50 text-green-700 border border-green-200")}>{distKm.toFixed(1)} km</span>
                              {tooFar&&<span className="text-[10px] text-amber-600 flex items-center gap-0.5"><AlertTriangle size={10}/>Instant unavailable</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                    {hasPins&&(<>
                      <button type="button" onClick={()=>setExpandedId(isExp?null:addr.id)} className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-100 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                        <MapPin size={11}/>{isExp?"Sembunyikan":"Lihat pin"}{isExp?<ChevronUp size={11}/>:<ChevronDown size={11}/>}
                      </button>
                      <AnimatePresence>{isExp&&(<motion.div initial={{height:0}} animate={{height:140}} exit={{height:0}} className="overflow-hidden"><div className="h-[140px]"><MiniMap lat={addr.latitude!} lng={addr.longitude!}/></div></motion.div>)}</AnimatePresence>
                    </>)}
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0">
              <button onClick={onAddNew} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-500 hover:border-primary hover:text-primary hover:bg-orange-50/30 transition-colors">
                <Plus size={15}/>Tambah Alamat Baru
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Address Form Modal
// ─────────────────────────────────────────────────────────────────────────────

function AddressFormModal({isOpen,onClose,onSaved}:{isOpen:boolean;onClose:()=>void;onSaved:()=>void;}){
  const{mutate:addAddress,isPending}=useAddAddress();
  return(
    <AnimatePresence>
      {isOpen&&(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <motion.div initial={{y:"100%",opacity:0}} animate={{y:0,opacity:1}} exit={{y:"100%",opacity:0}} transition={{type:"spring",damping:30,stiffness:240}}
            className="relative bg-white w-full sm:w-[540px] sm:rounded-2xl rounded-t-2xl z-10 max-h-[92vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full"/></div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-base">Tambah Alamat Baru</h3>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5">
              <AddressForm onSubmit={data=>addAddress(data,{onSuccess:()=>{onSaved();onClose();},onError:()=>alert("Gagal menyimpan alamat.")})} isLoading={isPending} submitLabel="Simpan Alamat"/>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary Bar
// ─────────────────────────────────────────────────────────────────────────────

function SummaryBar({isOpen,onToggle,subtotal,actSubtotal,shippingCost,shippingSubsidy,voucherDiscount,pointsDiscount,grandTotal,pointsEarned,itemCount,canPay,isLoading,onPay}:{
  isOpen:boolean;onToggle:()=>void;subtotal:number;actSubtotal:number;shippingCost:number;shippingSubsidy:number;
  voucherDiscount:number;pointsDiscount:number;grandTotal:number;pointsEarned:number;itemCount:number;
  canPay:boolean;isLoading:boolean;onPay:()=>void;
}){
  return(<>
    <AnimatePresence>{isOpen&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onToggle} className="fixed inset-0 bg-black/10 z-30"/>)}</AnimatePresence>
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence>{isOpen&&(
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} className="bg-white border border-b-0 border-gray-200 rounded-t-2xl px-4 pt-4 pb-3 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ringkasan</h3>
              <button onClick={onToggle} className="text-gray-400"><ChevronDown size={16}/></button>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs text-gray-700"><span>Subtotal <span className="text-gray-400">({itemCount} item)</span></span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-xs text-gray-700"><span>Ongkir</span><span className="font-semibold line-through text-gray-400">{formatPrice(shippingCost+shippingSubsidy)}</span></div>
              {shippingSubsidy>0&&(<div className="flex justify-between text-xs text-emerald-600"><span className="flex items-center gap-1"><Truck size={13}/>Subsidi Ongkir</span><span className="font-semibold">−{formatPrice(shippingSubsidy)}</span></div>)}
              {voucherDiscount>0&&(<div className="flex justify-between text-xs text-emerald-600"><span className="flex items-center gap-1"><Tag size={13}/>Voucher</span><span className="font-semibold">−{formatPrice(voucherDiscount)}</span></div>)}
              {pointsDiscount>0&&(<div className="flex justify-between text-xs text-amber-600"><span className="flex items-center gap-1"><Zap size={13}/>Flash Points</span><span className="font-semibold">−{formatPrice(pointsDiscount)}</span></div>)}
            </div>
            <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between items-start">
            <span className="text-xs font-bold text-gray-900">
              Grand Total
            </span>

            <div className="flex flex-col items-end text-right">
              <span className="line-through text-gray-400 text-[10px] leading-none">
                {formatPrice(actSubtotal)}
              </span>

              <span className="text-xl font-extrabold text-gray-900 leading-tight">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
            {pointsEarned>0&&(<p className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-2"><Star size={11} className="fill-amber-400 text-amber-400"/>+{pointsEarned.toLocaleString()} Flash Points</p>)}
          </motion.div>
        )}</AnimatePresence>
        <div className="bg-white border-t border-gray-200 px-4 pt-3 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
          <div className="flex items-end justify-between gap-3">
            <button onClick={onToggle} className="flex flex-col items-start min-w-0">
              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">Total Pembayaran<ChevronUp size={12} className={cn("transition-transform text-gray-400",isOpen?"rotate-0":"rotate-180")}/></span>
              <span className="text-xl font-extrabold text-gray-900">{formatPrice(grandTotal)}</span>
              <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5 mt-0.5"><Star size={9} className="fill-amber-400 text-amber-400"/>+{pointsEarned.toLocaleString()} pts</span>
            </button>
            <button onClick={onPay} disabled={!canPay||isLoading}
              className={cn("shrink-0 flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg",
                canPay&&!isLoading?"bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98] shadow-black/20":"bg-gray-200 text-gray-400 cursor-not-allowed shadow-none")}>
              {isLoading?<Loader2 size={18} className="animate-spin"/>:"Bayar Sekarang →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Checkout
// ─────────────────────────────────────────────────────────────────────────────

function CheckoutContent(){
  const router=useRouter();const searchParams=useSearchParams();
  const buyNowVariantId=searchParams.get("buyNowVariantId"),buyNowQuantity=searchParams.get("buyNowQuantity");
  const isBuyNowFlow=!!buyNowVariantId&&!!buyNowQuantity;
  const isAuthenticated=useAuthStore(s=>s.isAuthenticated);
  const{items,selectedItemIds}=useCartStore();
  const checkoutItems=items.filter(i=>selectedItemIds.includes(i.id));
  const{data:savedAddresses=[],isLoading:loadingAddresses}=useMyAddresses();
  const queryClient=useQueryClient();

  const hasFiredInitCheckout=useRef(false);
  const[isLoading,setIsLoading]=useState(false);
  const[isTokenizing,setIsTokenizing]=useState(false);
  const[usePoints,setUsePoints]=useState(false);
  const[selectedPayment,setSelectedPayment]=useState<string|null>(null);
  const[isShippingOpen,setIsShippingOpen]=useState(false);
  const[isPaymentOpen,setIsPaymentOpen]=useState(false);
  const[isAddressSheetOpen,setIsAddressSheetOpen]=useState(false);
  const[isAddressFormOpen,setIsAddressFormOpen]=useState(false);
  const[isSummaryOpen,setIsSummaryOpen]=useState(false);
  const[cardForm,setCardForm]=useState<CardFormState>({number:"",expiry:"",cvv:"",name:""});
  const[selectedAddress,setSelectedAddress]=useState<any|null>(null);
  const[districtName,setDistrictName]=useState("");
  const[shippingOptions,setShippingOptions]=useState<any[]>([]);
  const[selectedCourier,setSelectedCourier]=useState<any|null>(null);
  const[isCalcShipping,setIsCalcShipping]=useState(false);
  const[destinationText,setDestinationText]=useState<string|null>(null);
  const[pointsBalance,setPointsBalance]=useState(0);
  const hasEventItem=checkoutItems.some(i=>i.isEventPrice);
  const hasNRItem=checkoutItems.some(i=>i.variantSku?.includes("/"));
  const[appliedVoucher,setAppliedVoucher]=useState<AppliedVoucher|null>(null);

  useEffect(()=>{if(savedAddresses.length>0&&!selectedAddress)setSelectedAddress(savedAddresses.find(a=>a.isDefault)??savedAddresses[0]);},[savedAddresses,selectedAddress]);
  useEffect(()=>{if(hasEventItem){setAppliedVoucher(null);cartService.saveAppliedVoucher(null);return;}const s=cartService.loadAppliedVoucher();if(s)setAppliedVoucher(s);},[hasEventItem]);
  useEffect(()=>{if(!isAuthenticated)router.push("/login");else if(checkoutItems.length===0)router.push("/");},[isAuthenticated,checkoutItems.length,router]);

  useEffect(()=>{
    if(checkoutItems.length===0||hasFiredInitCheckout.current)return;
    hasFiredInitCheckout.current=true;
    const subtotalNow=checkoutItems.reduce((s,i)=>s+Number(i.price)*i.quantity,0);
    pixel.initiateCheckout({num_items:checkoutItems.length,value:subtotalNow,currency:'IDR'});
  },[checkoutItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load Midtrans.js untuk credit card
  useEffect(()=>{
    if(selectedPayment!=="credit_card")return;
    if(document.getElementById("midtrans-js"))return;
    const isProd=process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION==="true";
    const key=process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY??"";
    const s=document.createElement("script");
    s.id="midtrans-js";
    s.src=isProd?"https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js":"https://api.sandbox.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js";
    s.setAttribute("data-environment",isProd?"production":"sandbox");
    s.setAttribute("data-client-key",key);
    document.head.appendChild(s);
  },[selectedPayment]);

  const getCardToken=():Promise<string>=>new Promise((resolve,reject)=>{
    const[expMonth,expYear]=cardForm.expiry.split("/");
    (window as any).MidtransNew3ds?.getCardToken(
      {card_number:cardForm.number.replace(/\s/g,""),card_exp_month:expMonth,card_exp_year:`20${expYear}`,card_cvv:cardForm.cvv},
      {onSuccess:(r:any)=>resolve(r.token_id),onFailure:(r:any)=>reject(new Error(r.status_message??"Tokenisasi kartu gagal"))},
    );
  });

  const distanceMap:Record<number,number>={};
  savedAddresses.forEach(a=>{if(a.latitude&&a.longitude)distanceMap[a.id]=haversineKm(ORIGIN_COORDS.lat,ORIGIN_COORDS.lng,a.latitude,a.longitude);});
  const selectedDistKm=selectedAddress?.latitude&&selectedAddress?.longitude?haversineKm(ORIGIN_COORDS.lat,ORIGIN_COORDS.lng,selectedAddress.latitude,selectedAddress.longitude):null;
  const instantBlocked=hasNRItem||(selectedDistKm!==null&&selectedDistKm>INSTANT_DISTANCE_LIMIT_KM);

  const subtotal=checkoutItems.reduce((s,i)=>s+Number(i.price)*i.quantity,0);
  const actSubtotal=checkoutItems.reduce((s,i)=>s+Number(i.originalPrice)*i.quantity,0);
  const totalWeight=checkoutItems.reduce((s,i)=>s+(i.weightKilogram??2)*i.quantity,0);
  const voucherDiscount=appliedVoucher?.discountAmount??0,pointsEarned=Math.floor(subtotal*0.01);
  const SHIPPING_SUBSIDY_MAX=50000,realShippingCost=selectedCourier?Number(selectedCourier.cost):0;
  const shippingSubsidy=Math.min(realShippingCost,SHIPPING_SUBSIDY_MAX),customerShippingCost=Math.max(0,realShippingCost-shippingSubsidy);
  const baseForPoints=subtotal+customerShippingCost-voucherDiscount;
  const maxRedeemablePoints=Math.max(0,baseForPoints-1000);
  const pointsDiscount=usePoints?Math.min(pointsBalance,maxRedeemablePoints):0;
  const grandTotal=Math.max(0,subtotal+customerShippingCost-voucherDiscount-pointsDiscount);

  useEffect(()=>{
    if(!selectedAddress?.districtId||!selectedAddress?.cityId){setDestinationText(null);return;}
    (async()=>{
      try{
        const districts=await logisticsService.getDistricts(Number(selectedAddress.cityId));
        const d=(districts as any[]).find(x=>Number(x.id)===Number(selectedAddress.districtId));
        const dName=d?.name??"";
        let city=selectedAddress.city??selectedAddress.cityName??"";
        if(!city&&selectedAddress.provinceId&&selectedAddress.cityId){const cities=await logisticsService.getCities(Number(selectedAddress.provinceId));city=(cities as any[]).find(c=>Number(c.id)===Number(selectedAddress.cityId))?.name??"";}
        if(dName&&city){setDistrictName(dName);setDestinationText(`${dName.toUpperCase()}, ${city.toUpperCase()}`);}else setDestinationText(null);
      }catch{setDestinationText(null);}
    })();
  },[selectedAddress?.districtId,selectedAddress?.cityId]);


  useEffect(()=>{
    if(!selectedAddress?.subdistrictId||checkoutItems.length===0)return;
    setIsCalcShipping(true);setSelectedCourier(null);
    const destPin=selectedAddress.latitude&&selectedAddress.longitude?formatPin(selectedAddress.latitude,selectedAddress.longitude):undefined;
    logisticsService.calculateShipping({destinationSubdistrictId:Number(selectedAddress.subdistrictId),weightGrams:totalWeight,courier:"",itemValue:subtotal,isCod:"no",originPinPoint:ORIGIN_PIN,...(destPin?{destinationPinPoint:destPin}:{}),...(destinationText?{destinationText}:{})})
      .then(data=>{if(typeof data?.pointsBalance==="number")setPointsBalance(data.pointsBalance);const opts:any[]=data?.options??(Array.isArray(data)?data:[]);setShippingOptions(opts);const el=opts.filter(o=>instantBlocked?!isInstantCourier(o):true);setSelectedCourier(el[0]??null);})
      .catch(console.error).finally(()=>setIsCalcShipping(false));
  },[selectedAddress?.subdistrictId,totalWeight,destinationText]);

  if(checkoutItems.length===0)return null;

  const handleCheckout=async()=>{
    if(!selectedPayment)return alert("Pilih metode pembayaran.");
    if(!selectedCourier)return alert("Pilih metode pengiriman.");
    if(!selectedAddress)return alert("Pilih alamat pengiriman.");
    const isInstant=INSTANT_KEYWORDS.some(kw=>`${selectedCourier.courier_name||selectedCourier.courier} ${selectedCourier.service}`.toLowerCase().includes(kw));
    if(isInstant&&(!selectedAddress.latitude||!selectedAddress.longitude))return alert("Pengiriman instan butuh pin lokasi. Edit alamat untuk tambahkan pin.");
    if(selectedPayment==="credit_card"){
      const num=cardForm.number.replace(/\s/g,"");
      if(num.length<16||!cardForm.expiry||cardForm.cvv.length<3||!cardForm.name)return alert("Lengkapi data kartu kredit.");
    }
    let cityName=selectedAddress.city||selectedAddress.cityName;
    if(!cityName&&selectedAddress.provinceId&&selectedAddress.cityId){const cities=await logisticsService.getCities(selectedAddress.provinceId);cityName=(cities as any[]).find((c:any)=>c.id===selectedAddress.cityId)?.name;}
    const enrichedAddress={...selectedAddress,city:cityName||"Unknown City",district:districtName||"",latitude:selectedAddress.latitude?Number(selectedAddress.latitude):undefined,longitude:selectedAddress.longitude?Number(selectedAddress.longitude):undefined};
    setIsLoading(true);
    try{
      let cardToken:string|undefined;
      if(selectedPayment==="credit_card"){
        setIsTokenizing(true);
        try{cardToken=await getCardToken();}catch(e:any){alert(e.message??"Gagal validasi kartu.");return;}finally{setIsTokenizing(false);}
      }
      const basePayload={address:enrichedAddress,courier:{name:selectedCourier.courier_name||selectedCourier.courier,service:selectedCourier.service,cost:selectedCourier.cost,cashback:selectedCourier.cashback??0},paymentMethod:selectedPayment,voucherCode:appliedVoucher?.code||undefined,usePoints,pointsToRedeem:usePoints?pointsDiscount:undefined,...(cardToken?{cardToken}:{})};
      const finalPayload=isBuyNowFlow?{...basePayload,cartItemIds:[],buyNowVariantId:buyNowVariantId as string,buyNowQuantity:Number(buyNowQuantity)}:{...basePayload,cartItemIds:selectedItemIds.map(id=>id.toString())};
      const res=await ordersService.checkout(finalPayload);
      pixel.purchase({
        value: grandTotal,
        currency: 'IDR',
        num_items: checkoutItems.length,
        content_ids: checkoutItems.map(i=>i.variantSku||i.id),
        event_id: res.id,  // deduplikasi dengan CAPI server-side
      });
      router.push(`/orders/${res.id}`);
    }catch(err:any){alert(err?.response?.data?.message||"Terjadi kesalahan. Coba lagi.");}
    finally{setIsLoading(false);}
  };

  const regularOptions=shippingOptions.filter(o=>!isInstantCourier(o));
  const instantOptions=shippingOptions.filter(o=>isInstantCourier(o));
  const canPay=!!(selectedPayment&&selectedCourier&&selectedAddress&&!isCalcShipping);
  const allOpts=PAYMENT_METHODS.flatMap(g=>g.options);

  
  return(
    <div className="min-h-screen bg-gray-50 pb-40">
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center gap-4 border-b border-gray-200 shadow-sm">
        <button onClick={()=>router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full"><ArrowLeft size={24}/></button>
        <h1 className="text-lg font-bold">Secure Checkout</h1>
      </header>

      <main className="max-w-3xl mx-auto w-full pt-2 lg:pt-6 space-y-2">

        {/* 1. ADDRESS */}
        <section className="bg-white p-4 lg:rounded-xl lg:border lg:border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold flex items-center gap-2"><MapPin size={16}/>Alamat Pengiriman</p>
            <button onClick={()=>setIsAddressSheetOpen(true)} className="text-xs font-bold text-black border px-3 py-1 rounded-full hover:bg-orange-50 flex items-center gap-1">
              {selectedAddress?"Ganti":"Pilih"}<ChevronRight size={11}/>
            </button>
          </div>
          {loadingAddresses?(
            <div className="pl-6 animate-pulse space-y-2"><div className="h-4 w-40 bg-gray-200 rounded"/><div className="h-3 w-64 bg-gray-200 rounded"/></div>
          ):selectedAddress?(
            <div className="pl-6">
              <div className="flex flex-wrap gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full"><LabelIcon label={selectedAddress.label||""}/>{selectedAddress.label}</span>
                {selectedAddress.isDefault&&<span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Default</span>}
              </div>
              <p className="text-xs font-bold text-gray-900">{selectedAddress.recipientName}<span className="font-normal text-gray-500 ml-2">{selectedAddress.phone}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{selectedAddress.addressLine}, {selectedAddress.postalCode}</p>
              {selectedDistKm!==null&&(
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",instantBlocked?"bg-amber-50 text-amber-700 border border-amber-200":"bg-green-50 text-green-700 border border-green-200")}>{selectedDistKm.toFixed(1)} km from store</span>
                  {instantBlocked&&<span className="text-[10px] text-amber-600 flex items-center gap-0.5 font-medium"><AlertTriangle size={11}/>Instant tidak tersedia ({hasNRItem?"barang NR":`>${INSTANT_DISTANCE_LIMIT_KM} km`})</span>}
                </div>
              )}
              {selectedAddress.latitude&&selectedAddress.longitude&&(<div className="mt-3 h-28 rounded-xl overflow-hidden border border-gray-200"><MiniMap lat={selectedAddress.latitude} lng={selectedAddress.longitude}/></div>)}
            </div>
          ):(
            <button onClick={()=>setIsAddressSheetOpen(true)} className="ml-6 flex items-center gap-2 text-xs text-primary font-semibold"><Plus size={15}/>Pilih alamat pengiriman</button>
          )}
        </section>

        {/* 2. ITEMS */}
        <section className="bg-white p-4 lg:rounded-xl lg:border lg:border-gray-200">
          <p className="text-xs font-bold flex items-center gap-2 mb-4"><Package size={16} className="text-gray-500"/>Item Pesanan</p>
          <div className="space-y-4">
            {checkoutItems.map(item=>{
              const imageUrl=item.image?.length>0?getProductImageUrl([item.image[0]]):"/placeholder.jpg";
              return(
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 shrink-0"><Image src={imageUrl} alt={item.productName} fill className="object-cover p-1 rounded-lg"/></div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                    <div className="flex items-end justify-between mt-1.5">
                      <span className="text-xs font-bold text-gray-900">{formatPrice(Number(item.price))}</span>
                      <span className="text-xs text-gray-400">×{item.quantity} · {(item.weightKilogram??0).toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. SHIPPING */}
        <section className="bg-white lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2"><Truck size={15} className="text-gray-500"/><p className="text-xs font-bold">Metode Pengiriman</p></div>
          <button onClick={()=>setIsShippingOpen(!isShippingOpen)} className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 hover:bg-gray-50">
            <div className="text-left">
              {isCalcShipping?(<span className="flex items-center gap-2 text-xs text-gray-400"><Loader2 size={13} className="animate-spin text-primary"/>Menghitung tarif…</span>)
              :selectedCourier?(<><p className="text-xs font-semibold text-gray-900">{selectedCourier.courier_name||selectedCourier.courier} · {selectedCourier.service}</p><p className="text-xs text-gray-400">Est. {selectedCourier.etd||"varies"}</p></>)
              :(<p className="text-xs text-gray-400">Pilih metode pengiriman</p>)}
            </div>
            {isShippingOpen?<ChevronUp size={18} className="text-gray-400"/>:<ChevronDown size={18} className="text-gray-400"/>}
          </button>
          <AnimatePresence>{isShippingOpen&&(
            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
              <div className="px-4 pb-4 pt-3 space-y-5 border-t border-gray-100 bg-gray-50/60">
                {shippingOptions.length===0&&!isCalcShipping&&<p className="text-xs text-gray-400 text-center py-4">Tidak ada kurir tersedia.</p>}
                {regularOptions.length>0&&(<div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Reguler & Hari Berikutnya</p><div className="space-y-2">{regularOptions.map((opt,i)=><ShippingRow key={i} opt={opt} isSelected={selectedCourier?.service===opt.service&&selectedCourier?.courier===opt.courier} onSelect={()=>setSelectedCourier(opt)} disabled={false}/>)}</div></div>)}
                {instantOptions.length>0&&(<div><div className="flex items-center gap-2 mb-2.5"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Instant & Same Day</p>{instantBlocked&&<span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={10}/>{hasNRItem?"Barang NR":`>${INSTANT_DISTANCE_LIMIT_KM} km`}</span>}</div><div className="space-y-2">{instantOptions.map((opt,i)=><ShippingRow key={i} opt={opt} isSelected={!instantBlocked&&selectedCourier?.service===opt.service&&selectedCourier?.courier===opt.courier} onSelect={()=>setSelectedCourier(opt)} disabled={instantBlocked}/>)}</div></div>)}
              </div>
            </motion.div>
          )}</AnimatePresence>
        </section>

        {/* 4. VOUCHER + POINTS + PAYMENT */}
        <section className="bg-white lg:rounded-xl lg:border lg:border-gray-200 overflow-hidden divide-y divide-gray-100">
          <VoucherSelector subtotal={subtotal} appliedVoucher={appliedVoucher} disabled={hasEventItem}
            onApply={v=>{setAppliedVoucher(v);cartService.saveAppliedVoucher(v);}}
            onRemove={()=>{setAppliedVoucher(null);cartService.saveAppliedVoucher(null);}}/>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="border border-primary rounded-full p-1"><Zap size={18} className="text-amber-400"/></div>
              <div><p className="text-xs font-medium text-gray-800">Gunakan Flash Points</p><p className="text-xs text-gray-400">{pointsBalance.toLocaleString()} pts · {formatPrice(Math.floor(pointsBalance))}</p></div>
            </div>
            <button onClick={()=>setUsePoints(!usePoints)} className={cn("w-11 h-6 rounded-full transition-colors relative shrink-0",usePoints?"bg-primary":"bg-gray-200")}>
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",usePoints?"left-5":"left-0.5")}/>
            </button>
          </div>

          {/* Payment selector */}
          <button onClick={()=>setIsPaymentOpen(!isPaymentOpen)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Wallet size={18} className="text-gray-500"/>
              <div className="text-left">
                {selectedPayment
                  ?<p className="text-xs font-semibold text-gray-900">{allOpts.find(o=>o.id===selectedPayment)?.name}</p>
                  :<p className="text-xs font-medium text-gray-700">Metode Pembayaran</p>}
              </div>
            </div>
            {isPaymentOpen?<ChevronUp size={18} className="text-gray-400"/>:<ChevronDown size={18} className="text-gray-400"/>}
          </button>

          <AnimatePresence>{isPaymentOpen&&(
            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
              <div className="p-4 space-y-4">
                <p className="text-xs text-gray-400">Pembayaran diproses secara aman oleh Midtrans.</p>
                {PAYMENT_METHODS.map(group=>(
                  <div key={group.category}>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{group.category}</h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {group.options.map(option=>{
                        const isSel=selectedPayment===option.id;
                        return(
                          <div key={option.id}>
                            <div onClick={()=>{setSelectedPayment(option.id);}}
                              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex items-center">
                                <PaymentLogo logo={option.logo} logoText={option.logoText}/>
                                <span className="text-xs font-medium text-gray-900">{option.name}</span>
                              </div>
                              {isSel?<CheckCircle2 size={20} className="text-primary shrink-0"/>:<Circle size={20} className="text-gray-300 shrink-0"/>}
                            </div>
                            {/* Credit card form inline */}
                            {option.id==="credit_card"&&isSel&&(
                              <div className="px-4 pb-4">
                                <CreditCardForm value={cardForm} onChange={setCardForm}/>
                                {isTokenizing&&<p className="text-[12px] text-gray-400 flex items-center gap-2 mt-3"><Loader2 size={13} className="animate-spin"/>Memvalidasi kartu…</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}</AnimatePresence>
        </section>

      </main>

      <AddressSheet isOpen={isAddressSheetOpen} onClose={()=>setIsAddressSheetOpen(false)} addresses={savedAddresses} selectedId={selectedAddress?.id??null}
        onSelect={addr=>{setSelectedAddress(addr);setSelectedCourier(null);setShippingOptions([]);}} onAddNew={()=>{setIsAddressSheetOpen(false);setIsAddressFormOpen(true);}} distanceMap={distanceMap}/>
      <AddressFormModal isOpen={isAddressFormOpen} onClose={()=>setIsAddressFormOpen(false)} onSaved={()=>queryClient.invalidateQueries({queryKey:["myAddresses"]})}/>
      <SummaryBar isOpen={isSummaryOpen} onToggle={()=>setIsSummaryOpen(!isSummaryOpen)}
        subtotal={subtotal} shippingSubsidy={shippingSubsidy} shippingCost={realShippingCost}
        voucherDiscount={voucherDiscount} pointsDiscount={pointsDiscount}
        actSubtotal={actSubtotal}
        grandTotal={grandTotal} pointsEarned={pointsEarned} itemCount={checkoutItems.length}
        canPay={canPay} isLoading={isLoading||isTokenizing} onPay={handleCheckout}/>
    </div>
  );
}

export default function CheckoutPage(){
  return(<Suspense fallback={<PageLoader/>}><CheckoutContent/></Suspense>);
}