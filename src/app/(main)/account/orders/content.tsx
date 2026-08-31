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
  Layers, 
  Zap
} from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { cn } from "@/lib/utils/cn";
import ProductOrderCard from "@/components/product/ProductOrderCard";
import ThunderLoader from "@/components/common/ThunderLoader";

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

    if (activeTab === "pending") return status === "pending" || status === "waiting_payment";
    if (activeTab === "processing") return status === "processing" || status === "paid";
    if (activeTab === "shipped") return status === "shipped" || status === "delivered";
    if (activeTab === "completed") return status === "completed";
    if (activeTab === "cancelled") return status === "cancelled" || status === "returned" || status === "expired";

    return status === activeTab;
  });

  if (isLoading) {
    return (
      <ThunderLoader variant="section" />
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-[#F8F9FA]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-900">Failed to Load Data</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-[#FF6B00] font-bold hover:underline">
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0 md:py-10">
      {/* CONTAINER: Mengikuti referensi Address */}
      <div className="w-full max-w-6xl mx-auto min-h-screen md:min-h-fit md:rounded-2xl md:border md:border-gray-200 flex flex-col md:overflow-hidden md:bg-white md:shadow-sm">
        
        {/* HEADER BLOCK: Sticky shadow di mobile, static di desktop */}
        <div className="bg-white sticky top-0 z-10 shadow-sm md:shadow-none md:static border-b border-gray-100">
          <header className="flex px-4 py-4 md:px-8 md:py-6 items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="flex md:hidden w-10 h-10 items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={22} className="text-gray-900" />
            </button>
            
            <div>
              <p className="text-lg md:text-2xl font-bold text-gray-900 leading-none">My Orders</p>
              <p className="text-sm text-gray-400 mt-2 hidden md:block">
                You have {filteredOrders.length} {activeTab !== "all" ? activeTab : ""} order{filteredOrders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </header>

          {/* FILTER TABS */}
          <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden px-2 md:px-6 bg-white">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-4 py-4 md:px-6 text-sm font-bold border-b-[3px] transition-all duration-200",
                    activeTab === tab.value
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50/50"
                  )}
                >
                  <Icon size={18} className={activeTab === tab.value ? "text-black" : "text-gray-300"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT AREA: Pad uniform untuk Desktop & Mobile */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
          {filteredOrders.length === 0 ? (
            /* EMPTY STATE: Card style di mobile, menyatu dengan container di desktop */
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm md:border-none md:shadow-none">
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
            /* LIST ORDERS: Flex col gap-4 mobile, Grid lg:grid-cols-2 desktop */
            <div className="flex flex-col gap-4 md:grid md:grid-cols-1 lg:grid-cols-2">
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