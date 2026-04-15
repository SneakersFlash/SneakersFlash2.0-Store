// components/OrderCard.tsx
import React from 'react';
import { Copy, Truck } from 'lucide-react';

// Helper untuk format Rupiah (tanpa spasi setelah Rp agar mirip desain)
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price).replace(/\s/g, ''); 
};

// Helper untuk format tanggal "27 March 2026 | 09:46"
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
  // Ambil item pertama sebagai perwakilan produk
  const item = order?.orderItems?.[0];
  // Konversi gram ke kilogram
  const weightKg = order?.totalWeightGrams ? (order.totalWeightGrams / 1000).toFixed(1) : '0';
  
  // Deteksi status untuk menentukan tampilan Badge
  const status = order?.status?.toLowerCase() || 'pending';
  const isCompleted = status === 'completed';
  const isShipped = status === 'shipped';

  return (
    <div className="bg-white font-sans text-gray-800 w-full mb-4 p-2 rounded-lg">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start pt-2 pb-3">
        <div>
          <p className="text-gray-400 text-[10px] mb-1">{formatDate(order.createdAt)}</p>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-gray-800">
              No. Order: {order.orderNumber}
            </span>
            <button className="text-[#FFB020] hover:text-orange-500 transition-colors">
              <Copy size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-medium capitalize tracking-wide ${
          isCompleted 
            ? 'bg-[#1C1C1C] text-white' 
            : 'bg-[#FAEBE0] text-gray-900' // Warna krem Processing
        }`}>
          {order.status}
        </div>
      </div>

      {/* --- COURIER INFO --- */}
      <div className="flex items-center gap-2 mb-4">
        <Truck className="text-[#FFC107]" size={22} />
        <span className="font-medium text-[12px] text-gray-900">
          {order.courierName} {order.courierService}
        </span>
      </div>

      {/* --- PRODUCT LINE --- */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-4 flex-1">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
            <img 
              src={item?.imageUrl || 'https://via.placeholder.com/150'} 
              alt="Product" 
              className="w-full h-full object-contain mix-blend-multiply" 
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150' }} 
            />
          </div>
          
          {/* Product Title */}
          <div className="pr-2 max-w-[240px]">
            <h3 className="text-gray-800 text-[12px] font-normal leading-snug line-clamp-2">
              {item?.productName || "Product Name Not Available"}
            </h3>
          </div>
        </div>

        {/* Price & Quantity Info */}
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
          {/* Sesuai gambar, tulisannya "Total Amout:" */}
          <span className="font-bold text-gray-900 text-[12px]">Total Amount:</span>
          <span className="text-[15px] font-black text-gray-900">
            {formatPrice(order.finalAmount || 0)}
          </span>
        </div>
        
        {/* ACTION BUTTONS (Dinamis berdasarkan status) */}
        {isCompleted ? (
          // Tombol untuk Completed (Rata kanan)
          <div className="flex justify-end gap-3 w-full">
            <button className="px-8 py-2.5 bg-white border border-gray-300 text-gray-800 text-[10px] rounded-lg hover:bg-gray-50 transition-colors">
              Rate
            </button>
            <button className="px-6 py-2.5 bg-[#FF7500] text-white font-semibold text-[10px] rounded-lg hover:bg-[#e66a00] transition-colors shadow-sm">
              Buy Again
            </button>
          </div>
        ) : isShipped ? ( 
            <div className="flex gap-3 w-full">
            <button className="flex-[2] py-2.5 bg-[#FF7500] text-white font-bold text-[12px] rounded-lg hover:bg-[#e66a00] transition-colors shadow-sm">
              Track My Order
            </button>
          </div>
        ) : (
          // Tombol untuk Processing / Pending (Penuh kiri ke kanan)
          <div className="flex gap-3 w-full">
            <button className="flex-1 max-w-[180px] py-2.5 bg-white border border-gray-300 text-gray-800 text-[10px] rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              Change payment
            </button>
            <button className="flex-[2] py-2.5 bg-[#FF7500] text-white font-bold text-[12px] rounded-lg hover:bg-[#e66a00] transition-colors shadow-sm">
              Pay Now
            </button>
          </div>
        )}
      </div>

    </div>
  );
}