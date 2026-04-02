"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Copy, CheckCircle2, ChevronDown, ChevronUp, 
  ArrowLeft, RefreshCw, AlertCircle 
} from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ordersService } from "@/lib/api/orders.service";

export default function OrderPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // States untuk UI
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  // Tambahan "order" agar tidak error di TypeScript saat menyalin Order No
  const [copiedField, setCopiedField] = useState<"va" | "amount" | "order" | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Order Data
  const fetchOrderDetails = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await ordersService.getOrderDetails(resolvedParams.id);
      setOrder(data);

      // Tambahkan logika redirect ke halaman success di sini
      if (data.status === "paid" || data.status === "processing") {
        router.push(`/orders/${resolvedParams.id}/success`);
        return; // Hentikan eksekusi kode di bawahnya agar tidak berkedip
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat detail pesanan.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [resolvedParams.id]);

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!order || order.status !== "waiting_payment" || order.status !== "pending") return;

    const expiryDate = order.expireTime 
      ? new Date(order.expireTime).getTime() 
      : new Date(order.createdAt).getTime() + (1 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  // 3. Copy Handler
  const handleCopy = (text: string, field: "va" | "amount" | "order") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderHighlightedPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('id-ID').format(price);
    
    if (formatted.length > 3) {
      const mainPart = formatted.slice(0, formatted.length - 3);
      const lastPart = formatted.slice(-3);
      return (
        <span className="font-bold text-[28px] text-gray-900 tracking-tight">
          Rp{mainPart}<span className="text-red-600">{lastPart}</span>
        </span>
      );
    }
    
    return <span className="font-bold text-[28px] text-gray-900">Rp{formatted}</span>;
  };

  // --- RENDERING STATES ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white sm:bg-gray-50">
        <RefreshCw className="w-8 h-8 animate-spin text-[#E05600]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white sm:bg-gray-50 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Gagal Memuat Pesanan</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => router.push('/orders')} className="mt-6 text-[#E05600] font-bold">Kembali ke Pesanan Saya</button>
      </div>
    );
  }

  const isQris = order.paymentMethod === 'qris';
  const paymentMethodName = order.paymentMethod.replace('_va', ' Bank Transfer').toUpperCase();

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 sm:py-10">
      <div className="w-full max-w-md mx-auto bg-white min-h-screen sm:min-h-fit sm:rounded-xl sm:shadow-lg sm:border sm:border-gray-200 flex flex-col">
        
        {/* HEADER */}
        <header className="px-4 py-4 flex items-center gap-4 bg-white sticky top-0 z-10">
          <button onClick={() => router.back()} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} className="text-black" />
          </button>
          <h1 className="text-[17px] font-bold text-black">Payment Status</h1>
        </header>

        <div className="flex-1 pb-10">
          {/* ORANGE BANNER TIMER */}
          <div className="bg-[#E05600] text-white px-4 py-3 flex justify-between items-center text-sm font-medium">
            <span>Let's complete your order</span>
            {timeLeft ? (
              <span className="font-bold">
                {timeLeft.hours > 0 ? `${timeLeft.hours} hrs ` : ''}
                {timeLeft.minutes} mins {timeLeft.seconds} secs
              </span>
            ) : (
              <span className="font-bold">Waktu Habis</span>
            )}
          </div>

          {/* PAYMENT METHOD INFO */}
          <div className="bg-white px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-white border border-blue-200 text-blue-800 font-black italic text-xs rounded">
                {isQris ? 'QRIS' : paymentMethodName.split(' ')[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">{paymentMethodName}</span>
                <button 
                  onClick={() => setIsInstructionOpen(!isInstructionOpen)}
                  className="text-[#E05600] text-xs text-left mt-0.5 hover:underline"
                >
                  View payment instruction
                </button>
              </div>
            </div>
          </div>

          {/* ACCORDION CARA PEMBAYARAN */}
          {isInstructionOpen && (
            <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600 border-b border-gray-100 shadow-inner">
              {isQris ? (
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Buka aplikasi m-Banking atau e-Wallet Anda.</li>
                  <li>Pilih menu <strong>Scan QR</strong>.</li>
                  <li>Scan QR Code yang tampil di layar ini.</li>
                  <li>Periksa detail pembayaran dan pastikan nominal sesuai.</li>
                  <li>Masukkan PIN Anda untuk menyelesaikan pembayaran.</li>
                </ol>
              ) : (
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Buka m-Banking, Internet Banking, atau ATM.</li>
                  <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
                  <li>Masukkan Nomor Virtual Account: <strong className="text-black">{order.vaNumber}</strong>.</li>
                  <li>Pastikan jumlah tagihan persis sebesar <strong className="text-black">{formatPrice(order.total)}</strong>.</li>
                  <li>Selesaikan pembayaran.</li>
                </ol>
              )}
            </div>
          )}

          {/* MAIN PAYMENT CARD */}
          <div className="p-4">
            <div className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col gap-5">
              
              {/* Order No */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order No:</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-900">{order.orderNumber || order.id || "-"}</span>
                  <button onClick={() => handleCopy(order.orderNumber || order.id || "", "order")} className="text-[#E05600] hover:opacity-70 transition">
                    {copiedField === "order" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Total Payment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Total payment</span>
                  <button onClick={() => handleCopy(order.total.toString(), "amount")} className="text-[#E05600] hover:opacity-70 transition">
                    {copiedField === "amount" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[28px] font-bold text-gray-900 mb-4 tracking-tight">
                  {formatPrice(order.total)}
                </p>
              </div>

              <hr className="border-gray-100" />

              {/* KONDISIONAL: QRIS / VA Section */}
              {isQris ? (
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-sm text-gray-600 mb-4">Scan QR Code below</p>
                  <div className="w-56 h-56 relative border border-gray-200 rounded-xl overflow-hidden p-2 bg-white">
                    {order.qrCodeUrl ? (
                      <Image src={order.qrCodeUrl} alt="QRIS Code" fill className="object-contain p-2" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm text-center px-4">QR Code tidak tersedia</div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Account number</span>
                    <button onClick={() => handleCopy(order.vaNumber || "", "va")} className="text-[#E05600] hover:opacity-70 transition">
                      {copiedField === "va" ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-[22px] font-bold text-gray-900 tracking-wide">{order.vaNumber || "-"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sneaker Flash</p>
                </div>
              )}

            </div>
          </div>
          
          {/* BOTTOM BUTTON */}
          <div className="px-4 mt-2">
            <button 
              onClick={() => { setIsRefreshing(true); fetchOrderDetails(false); }}
              disabled={isRefreshing}
              className="w-full bg-[#202020] text-white hover:bg-black font-medium py-3.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isRefreshing ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Check My Order"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}