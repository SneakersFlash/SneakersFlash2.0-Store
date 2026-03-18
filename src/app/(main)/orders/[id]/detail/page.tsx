"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, RefreshCw, AlertCircle, Copy, CheckCircle2, MapPin, CreditCard, Receipt, Box } from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await ordersService.getOrderDetails(resolvedParams.id);
        setOrder(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [resolvedParams.id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Failed to Load Order</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => router.back()} className="mt-6 text-[#FF6B00] font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Tentukan apakah user harus dialihkan ke halaman pembayaran
  const needsPayment = order.status === "pending";

  return (
    <div className="min-h-screen bg-[#F2F2F2] sm:py-10">
      <div className="w-full max-w-2xl mx-auto bg-white min-h-screen sm:min-h-fit sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-200 overflow-hidden flex flex-col pb-safe">
        
        {/* HEADER */}
        <header className="px-4 py-3 sm:py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
          <button 
            onClick={() => router.back()} 
            className="w-9 h-9 flex items-center justify-center -ml-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">Order Details</h1>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F2F2F2]">
          
          {/* SECTION 1: Status & Info Umum */}
          <div className="bg-white p-4 sm:p-5 mb-2 sm:mb-3">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs text-gray-500 font-medium">Invoice Number</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                  <button 
                    onClick={() => handleCopy(order.orderNumber)} 
                    className="text-[#FF6B00] hover:bg-orange-50 p-1 rounded transition-colors"
                  >
                    {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Purchase Date</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3.5 flex justify-between items-center border border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Order Status</span>
              <span className="text-sm font-black text-gray-900 uppercase tracking-wider">{order.status}</span>
            </div>
          </div>

          {/* SECTION 2: Daftar Produk */}
          <div className="bg-white p-4 sm:p-5 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
              <Box size={18} /> <h3>Product List</h3>
            </div>
            
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    ) : (
                      <Box className="w-8 h-8 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight mb-1">{item.productName}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.quantity} x {formatPrice(item.unitPrice)}</p>
                    <p className="text-sm sm:text-base font-black text-gray-900">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Info Pengiriman */}
          <div className="bg-white p-4 sm:p-5 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
              <MapPin size={18} /> <h3>Shipping Info</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-500 whitespace-nowrap">Courier</span>
                <span className="font-semibold text-gray-900 text-right">{order.courier.name || "-"} ({order.courier.service || "-"})</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-500 whitespace-nowrap">Tracking No.</span>
                <span className="font-semibold text-[#FF6B00] text-right">{order.courier.trackingNumber || "Not Available"}</span>
              </div>
              <div className="pt-3 mt-2 border-t border-gray-100">
                <p className="font-bold text-gray-900 mb-1">{order.address.recipientName || "Recipient"}</p>
                <p className="text-gray-600 leading-relaxed">
                  {order.address.phone}<br/>
                  {order.address.addressLine}<br/>
                  {order.address.city}, {order.address.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Rincian Pembayaran */}
          <div className="bg-white p-4 sm:p-5 sm:rounded-b-2xl">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
              <Receipt size={18} /> <h3>Payment Details</h3>
            </div>
            
            <div className="text-sm space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 items-start gap-4">
                <span className="whitespace-nowrap">Payment Method</span>
                <span className="font-semibold text-gray-900 uppercase text-right">{order.paymentMethod?.replace('_va', ' VA') || "-"}</span>
              </div>
              <div className="flex justify-between text-gray-600 items-center">
                <span>Subtotal</span>
                <span>{formatPrice(order.subTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 items-center">
                <span>Shipping Cost</span>
                <span>{formatPrice(order.shippingCost || 0)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-green-600 font-medium items-center">
                  <span>Total Discount</span>
                  <span>-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="text-lg font-black text-[#FF6B00]">{formatPrice(order.total || order.finalAmount || 0)}</span>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BUTTON (Hanya jika belum bayar) */}
        {needsPayment && (
          <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-20">
            <button 
              onClick={() => router.push(`/orders/${order.id}`)}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-white hover:bg-[#e66000] active:scale-[0.98] font-bold py-3.5 rounded-xl transition-all shadow-md"
            >
              <CreditCard size={18} />
              Pay Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}