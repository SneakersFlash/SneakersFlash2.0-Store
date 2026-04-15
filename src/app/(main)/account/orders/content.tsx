// app/orders/content.tsx (Sesuaikan dengan path Anda)
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Package, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Layers 
} from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { cn } from "@/lib/utils/cn";
import ProductOrderCard from "@/components/product/ProductOrderCard";

const FILTER_TABS = [
  { label: "All", value: "all", icon: Layers },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Processing", value: "processing", icon: Package },
  { label: "Shipped", value: "shipped", icon: Truck },
  { label: "Completed", value: "completed", icon: CheckCircle2 },
  { label: "Cancelled", value: "cancelled", icon: XCircle },
];

export default function MyOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getInitialTab = () => {
    const query = searchParams.get("status");
    if (query === "payment") return "pending";
    if (query === "process") return "processing";
    if (query === "shipping") return "shipped";
    if (query === "receive") return "completed";
    return "all";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

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

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    const status = order.status?.toLowerCase() || "";
    if (activeTab === "processing") return status === "processing" || status === "paid";
    if (activeTab === "cancelled") return status === "cancelled" || status === "expired";
    return status === activeTab;
  });

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
    <div className="min-h-screen bg-[#F2F2F2] sm:py-8 lg:py-12">
      <div className="w-full max-w-2xl lg:max-w-5xl mx-auto min-h-screen sm:min-h-fit sm:rounded-3xl sm:border sm:border-gray-200 flex flex-col overflow-hidden bg-[#F2F2F2]">
        
        {/* HEADER BLOCK */}
        <div className="bg-white sticky top-0 z-20 shadow-sm">
          <header className="flex lg:hidden px-4 py-4 lg:px-8 lg:py-6 items-center gap-4 border-b border-gray-100">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="text-gray-900" />
            </button>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">My Orders</p>
          </header>

          {/* FILTER TABS */}
          <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden px-2 lg:px-6 border-b border-gray-200 bg-white">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-4 py-4 lg:px-6 text-sm font-bold border-b-[3px] transition-all duration-200",
                    activeTab === tab.value
                      ? "border-[#FF6B00] text-[#FF6B00]"
                      : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/50"
                  )}
                >
                  <Icon size={18} className={activeTab === tab.value ? "text-[#FF6B00]" : "text-gray-300"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Package className="w-20 h-20 text-gray-200 mb-6" />
              <h3 className="text-xl font-bold text-gray-900">
                {activeTab === "all" ? "No orders yet" : `No ${activeTab} orders`}
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-8 max-w-xs mx-auto">
                {activeTab === "all" 
                  ? "Let's start shopping and fill up your sneaker collection!" 
                  : `You don't have any orders with '${tabTitle(activeTab)}' status.`}
              </p>
              {activeTab === "all" ? (
                <button 
                  onClick={() => router.push("/products")}
                  className="bg-[#1C1C1C] text-white hover:bg-black transition-all px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-gray-200 active:scale-95"
                >
                  Start Shopping
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab("all")}
                  className="text-[#FF6B00] font-bold hover:underline py-2"
                >
                  View All Orders
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Mapping Component yang sudah dipisah */}
              {filteredOrders.map((order) => (
                <ProductOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function tabTitle(value: string) {
  const tab = FILTER_TABS.find((t) => t.value === value);
  return tab ? tab.label : value;
}