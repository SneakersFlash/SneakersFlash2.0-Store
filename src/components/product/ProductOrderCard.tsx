"use client";

// components/product/ProductOrderCard.tsx
import React, { useState } from 'react';
import { Copy, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TrackOrderSheet from '@/components/order/TrackOrderSheet';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price).replace(/\s/g, '');
};

const formatDate = (isoString: string) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} | ${hours}:${minutes}`;
};

export default function OrderCard({ order }: { order: any }) {
  const router = useRouter();
  const [isTrackSheetOpen, setIsTrackSheetOpen] = useState(false);

  const item = order?.orderItems?.[0];
  const weightKg = order?.totalWeightGrams ? (order.totalWeightGrams / 1000).toFixed(1) : '0';

  const status = order?.status?.toLowerCase() || 'pending';
  const isPending           = status === 'pending' || status === 'waiting_payment';
  const isPaidOrProcessing  = status === 'paid'    || status === 'processing';
  const isShippedOrDelivered = status === 'shipped' || status === 'delivered';
  const isCompleted         = status === 'completed';
  const isCancelled         = status === 'cancelled' || status === 'returned';

  const handleToDetail = () => {
    if (order?.id) router.push(`/orders/${order.id}/detail`);
  };

  const handleToPayment = () => {
    if (order?.id) router.push(`/orders/${order.id}`);
  };

  return (
    <>
      <div className="bg-white font-sans text-gray-800 w-full mb-4 p-2 rounded-lg">

        {/* --- HEADER --- */}
        <div className="flex justify-between items-start pt-2 pb-3">
          <div>
            <p className="text-gray-400 text-[10px] mb-1">{formatDate(order.createdAt)}</p>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-gray-800">
                No. Order: {order.orderNumber}
              </span>
              <button className="text-gray-500 hover:text-orange-500 transition-colors">
                <Copy size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-4 py-1 rounded-full text-[10px] font-medium capitalize tracking-wide ${
            isPending || isCancelled
              ? 'bg-red-200 text-white'
              : order.status === 'paid'
              ? 'bg-green-200 text-white'
              : 'bg-[#FAEBE0] text-gray-900'
          }`}>
            {isPending ? 'Waiting Payment' : order.status.replace('_', ' ')}
          </div>
        </div>

        {/* --- COURIER INFO --- */}
        <div className="flex items-center gap-2 mb-4">
          <Truck className="text-gray-500" size={22} />
          <span className="font-medium text-[12px] text-gray-900">
            {order.courierName} {order.courierService}
          </span>
        </div>

        {/* --- PRODUCT LINE --- */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex gap-4 flex-1">
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
              <img
                src={item?.imageUrl || 'https://via.placeholder.com/150'}
                alt="Product"
                className="w-full h-full object-contain mix-blend-multiply"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
              />
            </div>
            <div className="pr-2 max-w-[240px]">
              <h3 className="text-gray-800 text-[12px] font-normal leading-snug line-clamp-2">
                {item?.productName || "Product Name Not Available"}
              </h3>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900 text-[12px] mb-1">
              {formatPrice(item?.price || 0)}
            </p>
            <p className="text-[10px] text-gray-600">
              x {item?.quantity || 1} ({weightKg} kg)
            </p>
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* --- FOOTER (TOTAL & ACTIONS) --- */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-900 text-[12px]">Total Amount:</span>
            <span className="text-[15px] font-black text-gray-900">
              {formatPrice(order.finalAmount || 0)}
            </span>
          </div>

          {/* BUTTON ACTIONS BERDASARKAN STATUS */}
          <div className="flex gap-2 w-full">
            {isCompleted ? (
              <div className="flex justify-end gap-2 w-full">
                <button
                  onClick={handleToDetail}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold text-[10px] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Detail
                </button>
                <button className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold text-[10px] rounded-lg hover:bg-gray-50 transition-colors">
                  Rate
                </button>
                <button className="px-6 py-2.5 border border-[#F70000] text-[#F70000] font-semibold text-[10px] rounded-lg hover:bg-[#e66a00] transition-colors shadow-sm">
                  Buy Again
                </button>
              </div>

            ) : isShippedOrDelivered ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleToDetail}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-800 font-bold text-[12px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Detail Order
                </button>
                {/* ✅ Track My Order — opens TrackOrderSheet */}
                <button
                  onClick={() => setIsTrackSheetOpen(true)}
                  className="flex-[2] py-2.5 border border-[#F70000] text-[#F70000] font-bold text-[12px] rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  Track My Order
                </button>
              </div>

            ) : isPaidOrProcessing ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleToDetail}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-800 font-bold text-[12px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Detail Order
                </button>
                <button disabled className="flex-[2] py-2.5 bg-gray-100 text-gray-400 font-bold text-[12px] rounded-lg cursor-not-allowed">
                  Order is being processed
                </button>
              </div>

            ) : isPending ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleToDetail}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold text-[10px] rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Detail
                </button>
                <button className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 font-semibold text-[10px] rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Cancel
                </button>
                <button
                  onClick={handleToPayment}
                  className="flex-1 py-2.5 bg-[#F70000] text-white font-bold text-[12px] rounded-lg hover:bg-[#e66a00] transition-colors shadow-sm"
                >
                  Pay Now
                </button>
              </div>

            ) : isCancelled ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleToDetail}
                  className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-800 font-bold text-[12px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Detail Order
                </button>
                <button
                  disabled
                  className="flex-[2] py-2.5 bg-gray-50 text-gray-400 font-bold text-[12px] rounded-lg border border-gray-200"
                >
                  Order Cancelled
                </button>
              </div>

            ) : null}
          </div>
        </div>
      </div>

      {/* ✅ Tracking bottom sheet — rendered outside card to avoid z-index issues */}
      <TrackOrderSheet
        order={order}
        isOpen={isTrackSheetOpen}
        onClose={() => setIsTrackSheetOpen(false)}
      />
    </>
  );
}