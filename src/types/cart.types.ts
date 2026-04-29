// ─── Cart Types ───────────────────────────────────────────────────────────────

import type { Product, ProductVariant } from "./product.types";

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;          // ID item keranjang (contoh: "23")
  productName: string; // Nama produk
  variantSku: string;  // SKU varian (bisa dipakai sebagai pengganti Size sementara)
  price: number;       // Harga satuan
  quantity: number;    // Jumlah
  subtotal: number;    // Harga x Jumlah
  image: string[];     // Array URL gambar
  stock: number
  size?: string;       //
  weight?: number
  weightKilogram?: number
  originalPrice?: number;   // ← tambah ini
  isEventPrice?: boolean;   
}

export interface Cart {
  cartId: string;      // ID keranjang
  items: CartItem[];   // Array berisi CartItem di atas
  grandTotal: number;  // Total keseluruhan
}

export interface AddToCartDto {
  productVariantId: number; 
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

// ... (Bagian Order Types biarkan sama seperti sebelumnya) ...
// ─── Order Types ──────────────────────────────────────────────────────────────

// 👈 PENTING: Disesuaikan dengan enum OrderStatus di Prisma Backend
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  product: Pick<Product, "id" | "name" | "slug" | "images">;
  variant: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 👈 PENTING: Disesuaikan dengan create-order.dto.ts di Backend
export interface CreateOrderDto {
  cartItemIds: string[]; // ID barang keranjang yang dicentang
  address: {
    recipientName: string;
    phone: string;
    addressLine: string;
    subdistrictId: number;
    city: string;
    postalCode: string;
  };
  courier: {
    name: string;
    service: string;
    cost: number;
  };
  paymentMethod: string;
  voucherCode?: string;
}