type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window { fbq?: FbqFn; }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
}

/** ID event unik untuk dedup browser↔server (Meta mencocokkan event_name + event_id). */
export function newEventId(prefix: string): string {
  const rnd =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  return `${prefix}.${Date.now()}.${rnd}`;
}

/** Sidik isi keranjang yang stabil terhadap urutan: "id:qty|id:qty" → hash pendek. */
export function cartSignature(items: { id: string | number; quantity: number }[]): string {
  const raw = items
    .map((i) => `${i.id}:${i.quantity}`)
    .sort()
    .join('|');
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// Bentuk minimal dari GET /orders/:id yang dibutuhkan Purchase.
export interface PaidOrderLike {
  orderNumber: string;
  status: string;
  paidAt?: string | null;
  total?: number;
  shippingCost?: number;
  shippingSubsidy?: number;
  items?: { sku: string; quantity: number; unitPrice: number }[];
}

export const pixel = {
  viewContent(p: { content_ids: string[]; content_name: string; value: number; currency: string }) {
    fbq('track', 'ViewContent', { ...p, content_type: 'product' });
  },
  /**
   * AddToCart. Dipanggil dari "Tambah ke keranjang" DAN "Beli Sekarang" —
   * dua-duanya memasukkan barang ke keranjang. Mengembalikan eventID supaya
   * bisa ikut dikirim ke backend kalau nanti ada event server-nya.
   */
  addToCart(p: { content_ids: string[]; content_name: string; value: number; currency: string }, eventId = newEventId('atc')) {
    fbq('track', 'AddToCart', { ...p, content_type: 'product' }, { eventID: eventId });
    return eventId;
  },
  /**
   * InitiateCheckout, SEKALI per isi keranjang per tab. Kuncinya hash isi
   * checkout (id item + qty) di sessionStorage: reload, balik dari Snap, atau
   * balik dari login dengan keranjang yang sama tidak menembak lagi. Isi
   * keranjang berubah = checkout baru = boleh tembak lagi.
   * Mengembalikan eventID, atau null kalau dilewati.
   */
  initiateCheckout(
    p: { num_items: number; value: number; currency: string },
    cartItems: { id: string | number; quantity: number }[],
  ): string | null {
    const key = `fb_ic:${cartSignature(cartItems)}`;
    try {
      if (sessionStorage.getItem(key)) return null;
    } catch {
      // sessionStorage diblokir — tembak saja, lebih baik lebih dari hilang.
    }
    const eventId = newEventId('ic');
    fbq('track', 'InitiateCheckout', p, { eventID: eventId });
    try {
      sessionStorage.setItem(key, eventId);
    } catch {}
    return eventId;
  },
  /**
   * Purchase dari order yang SUDAH LUNAS (dipanggil halaman /orders/[id] saat
   * status paid/processing). Jangan dipanggil saat order baru dibuat — order
   * Snap bisa tidak pernah dibayar.
   *
   * - eventID = orderNumber, sama dengan CAPI server (webhook Midtrans) → dedup.
   * - Guard localStorage per orderNumber: buka ulang halaman tidak menembak lagi.
   * - Lewat 24 jam dari paidAt tidak ditembak: jendela dedup Meta 48 jam, dan
   *   server sudah mengirimnya saat webhook.
   * - value = total setelah diskon, sebelum ongkir — rumus sama dengan
   *   purchaseValue() di backend (meta-capi.payload.ts).
   */
  purchaseFromPaidOrder(order: PaidOrderLike) {
    if (typeof window === 'undefined' || !order?.orderNumber) return;
    if (order.status !== 'paid' && order.status !== 'processing') return;
    if (order.paidAt && Date.now() - new Date(order.paidAt).getTime() > 24 * 3600 * 1000) return;

    const key = `fb_purchase_sent:${order.orderNumber}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      // localStorage diblokir (mode privat) — tetap kirim, dedup eventID menjaga.
    }
    if (typeof window.fbq !== 'function') return; // pixel belum siap: biar server yang lapor

    const ongkirBersih = Math.max(0, Number(order.shippingCost ?? 0) - Number(order.shippingSubsidy ?? 0));
    const value = Math.max(0, Number(order.total ?? 0) - ongkirBersih);
    const items = (order.items ?? []).filter((i) => i.sku);

    fbq(
      'track',
      'Purchase',
      {
        currency: 'IDR',
        value,
        content_type: 'product',
        content_ids: items.map((i) => i.sku),
        contents: items.map((i) => ({ id: i.sku, quantity: i.quantity, item_price: Number(i.unitPrice) })),
        num_items: items.reduce((s, i) => s + i.quantity, 0),
      },
      { eventID: order.orderNumber },
    );
    try {
      localStorage.setItem(key, String(Date.now()));
    } catch {}
  },
};
