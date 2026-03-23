"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, ChevronRight, RefreshCw, AlertCircle, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

// Helper for status badge colors and text
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return { text: "Awaiting Payment", color: "bg-orange-100 text-[#FF6B00]", icon: Clock };
    case "paid":
    case "processing":
      return { text: "Processing", color: "bg-blue-100 text-blue-700", icon: Package };
    case "shipped":
      return { text: "Shipped", color: "bg-purple-100 text-purple-700", icon: Truck };
    case "completed":
      return { text: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 };
    case "cancelled":
    case "expired":
      return { text: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle };
    default:
      return { text: status, color: "bg-gray-100 text-gray-700", icon: Package };
  }
};

export default function MyOrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getMyOrders();
        setOrders(Array.isArray(data) ? data : data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load order history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Failed to Load Data</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-[#FF6B00] font-bold hover:underline">
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] sm:py-10">
      <div className="w-full max-w-2xl mx-auto min-h-screen sm:min-h-fit sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-200 flex flex-col overflow-hidden bg-[#F2F2F2]">
        
        {/* HEADER */}
        <header className="px-4 py-3 sm:py-4 flex items-center gap-3 bg-white/95 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100 sm:rounded-t-2xl">
          <button 
            onClick={() => router.back()} 
            className="w-9 h-9 flex items-center justify-center -ml-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">My Orders</h1>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-100">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No orders yet</h3>
              <p className="text-sm text-gray-500 mt-2 mb-6">Let's start shopping and fill up your sneaker collection!</p>
              <button 
                onClick={() => router.push("/products")}
                className="bg-[#1C1C1C] text-white hover:bg-black transition-colors px-6 py-3 rounded-xl font-bold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const { text, color, icon: StatusIcon } = getStatusBadge(order.status);
              
              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Card Header (Status & Date) */}
                  <div className="px-4 sm:px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-500">{order.orderNumber}</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide", color)}>
                      <StatusIcon size={12} />
                      {text}
                    </div>
                  </div>

                  {/* Card Body (Main Item) */}
                  <div className="p-4 sm:p-5 flex gap-4">
                    {/* Placeholder image jika tidak ada gambar spesifik di API */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-100">
                      {order.orderItems?.[0]?.imageUrl ? (
                        <img src={order.orderItems[0].imageUrl} alt="Product" className="object-cover w-full h-full" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {order.orderItems?.[0]?.productName || "SneakerFlash Order"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {order.orderItems?.length > 1 ? `+${order.orderItems.length - 1} other products` : `${order.orderItems?.[0]?.quantity || 1} items`}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer (Total & Action) */}
                  <div className="px-4 sm:px-5 py-3.5 bg-gray-50 flex items-center justify-between border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                      <p className="text-sm sm:text-base font-black text-gray-900">{formatPrice(order.total || order.finalAmount || 0)}</p>
                    </div>
                    
                    <Link 
                      href={`/orders/${order.id}/detail`}
                      className="flex items-center gap-1 text-sm font-bold text-[#FF6B00] bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-[0.98] transition-all"
                    >
                      View Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}