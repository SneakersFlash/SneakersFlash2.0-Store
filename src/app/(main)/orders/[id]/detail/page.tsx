// app/orders/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Copy, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Box, 
  Loader2, 
  XCircle,
  Wallet
} from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { formatPrice } from "@/lib/utils/formatPrice";

// Helper for Exact Formatting
const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} | ${hours}:${minutes}`;
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [resolvedParams.id]);

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

    const handleCancelOrder = async () => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    
    setIsCancelling(true);
    try {
      await ordersService.cancelOrder(resolvedParams.id);
      alert("Pesanan berhasil dibatalkan.");
      await fetchOrderDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal membatalkan pesanan.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
              <div className="relative w-[50px] h-[50px]">
              <Image
                  src="/images/petir.svg"
                  alt="Loading"
                  fill
                  className="object-contain animate-bounce text-yellow-300"
              />
              </div>
          </div>
      );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Failed to Load Order</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => router.back()} className="mt-6 text-[#FF6B00] font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const needsPayment = order.status === "waiting_payment" || order.status === "pending";

  // Hitung total nilai barang (Subtotal tanpa ongkir & diskon) khusus untuk section produk
  const productTotalAmount = order.items?.reduce((acc: number, item: any) => acc + (item.unitPrice * item.quantity), 0) || 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24 lg:pb-12 text-gray-900">
      
      {/* HEADER (Sticky) */}
      <header className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <button 
          onClick={() => router.back()} 
          className="flex items-center justify-center transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-black" />
        </button>
        <p className="text-[18px] font-bold text-black">Order Details</p>
      </header>

      {/* MAIN CONTAINER (Responsive Layout) */}
      <main className="max-w-6xl mx-auto w-full p-0 sm:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-8 mt-2 lg:mt-4">
        
        {/* LEFT COLUMN: Order Info, Products, Shipping */}
        <div className="flex-1 space-y-3 sm:space-y-4 px-3 sm:px-0">
          
          {/* SECTION 1: Order Info */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <p className="text-[12px] text-gray-500 mb-1">
                Purchase Date: {formatDateTime(order.createdAt)}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-black">
                  No. Order: {order.orderNumber}
                </p>
                <button 
                  onClick={() => handleCopy(order.orderNumber, 'orderNumber')} 
                  className="text-[#FFC107] hover:text-orange-500 transition-colors"
                  aria-label="Copy Order Number"
                >
                  {copiedItem === 'orderNumber' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-[14px] text-gray-700">Order Status</span>
              <div className="bg-[#1C1C1C] text-white px-6 py-2 rounded-lg text-[13px] font-semibold capitalize tracking-wide shadow-sm">
                {order.status.replace('_', ' ')}
              </div>
            </div>
          </section>

          {/* SECTION 2: Product List */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 font-bold text-[13px] text-black uppercase tracking-wide">
              <Box size={18} /> <span>Product List</span>
            </div>
            
            <div className="space-y-5">
              {order.items?.map((item: any, idx: number) => {
                const estWeightKg = order.totalWeightGrams ? ((order.totalWeightGrams / order.items.length) / 1000).toFixed(1) : '0.7';
                
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image 
                          src={item.imageUrl} 
                          alt={item.productName} 
                          fill 
                          className="object-contain p-1 mix-blend-multiply" 
                        />
                      ) : (
                        <Box className="w-6 h-6 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    
                    {/* Detail Product Kiri, Harga Kanan */}
                    <div className="flex flex-1 justify-between items-start">
                      <div className="pr-2 max-w-[200px] sm:max-w-xs">
                        <h4 className="text-[13px] sm:text-[14px] text-gray-800 leading-snug">
                          {item.productName} {item.size && item.size !== '-' ? `[Size ${item.size}]` : ''}
                        </h4>
                        {/* Menampilkan SKU Varian */}
                        {item.variantSku && (
                          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                            SKU: {item.variantSku}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[13px] sm:text-[14px] font-semibold text-black mb-0.5">
                          {formatPrice(item.unitPrice)}
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-gray-500">
                          x {item.quantity} ({estWeightKg} kg)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-[13px] font-bold text-gray-900">Total Amount:</span>
              <span className="text-[15px] font-bold text-black">{formatPrice(productTotalAmount)}</span>
            </div>
          </section>

          {/* SECTION 3: Shipping Info */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 font-bold text-[13px] text-black uppercase tracking-wide">
              <MapPin size={18} /> <span>Shipping Info</span>
            </div>
            
            <div className="text-[13px] space-y-3">
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-400">Courier</span>
                <span className="font-semibold text-black uppercase">{order.courier?.name} {order.courier?.service}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-400">Tracking No.</span>
                <span className="font-bold text-[#FF6B00]">
                  {order.courier?.trackingNumber || "-"}
                </span>
              </div>
              
              <div className="pt-4 mt-2 border-t border-gray-100">
                <p className="font-bold text-black mb-1">{order.address?.recipientName}</p>
                <p className="text-gray-500 mb-1">{order.address?.phone}</p>
                <p className="text-gray-500 leading-relaxed">
                  {order.address?.street}<br/>
                  {order.address?.city}, {order.address?.postalCode}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Payment Details & Actions */}
        <div className="lg:w-[380px] px-3 sm:px-0 flex flex-col gap-3 sm:gap-4">
          
          {/* SECTION 4: Payment Details */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 font-bold text-[13px] text-black uppercase tracking-wide">
              <Wallet size={18} /> <span>Payment Details</span>
            </div>
            
            <div className="text-[13px] space-y-3 mb-4">
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-400">Payment Method</span>
                <span className="font-semibold text-black capitalize">
                  {/* Format "bank_transfer" jadi "Bank Transfer", dll */}
                  {order.paymentMethod?.replace(/_/g, ' ') || "-"}
                </span>
              </div>
              
              {/* Menampilkan VA Number jika ada */}
              {order.vaNumber && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-400">VA Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">{order.vaNumber}</span>
                    <button 
                      onClick={() => handleCopy(order.vaNumber, 'vaNumber')} 
                      className="text-[#FFC107] hover:text-orange-500 transition-colors"
                      aria-label="Copy VA Number"
                    >
                      {copiedItem === 'vaNumber' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Menampilkan Waktu Lunas jika sudah dibayar */}
              {order.paidAt && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-gray-400">Payment Date</span>
                  <span className="font-medium text-black text-right">
                    {formatDateTime(order.paidAt)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-500">{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Shipping Cost</span>
                <span className="text-gray-500">{formatPrice(order.shippingCost || 0)}</span>
              </div>
              
              {/* Menampilkan Diskon & Kode Voucher (jika ada) */}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium items-center">
                  <span>
                    Total Discount 
                    {order.voucherCode && <span className="text-xs ml-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">{order.voucherCode}</span>}
                  </span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-[15px] text-black">Total Amount</span>
              <span className="text-[16px] font-black text-[#FF6B00]">
                {formatPrice(order.total || order.finalAmount || 0)}
              </span>
            </div>
          </section>

          {/* ACTIONS / FLOATING MOBILE BUTTONS */}
          {needsPayment && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:static lg:p-0 lg:border-none lg:bg-transparent z-40 space-y-3">
              <button 
                onClick={() => router.push(`/orders/${order.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-white hover:bg-[#e66000] active:scale-[0.98] font-bold py-3.5 rounded-xl transition-all shadow-sm"
              >
                <CreditCard size={18} />
                Pay Now
              </button>

              <button 
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 hover:bg-red-50 active:scale-[0.98] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <XCircle size={18} />
                )}
                {isCancelling ? "Membatalkan..." : "Cancel Order"}
              </button>
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}