import { NextResponse } from 'next/server';

// Penerima beacon "tamu diblokir saat mau menambah ke keranjang".
//
// Kenapa perlu route sendiri padahal sudah ada GTM & Meta pixel: klik Add to
// Cart oleh tamu di-return lebih dulu di ProductDetailClient sebelum sempat
// memanggil API mana pun, jadi peristiwa itu TIDAK terekam di log server
// maupun di pixel. Akibatnya tidak ada yang tahu berapa tamu yang sebenarnya
// mau beli tapi kejegal tembok login.
//
// Route ini sengaja hanya membalas 204 tanpa menyimpan apa pun. Yang dihitung
// adalah barisnya di access log nginx ($uri = /api/track/guest-cart-block),
// karena log itu bisa dibaca langsung dari server tanpa buka dashboard pihak
// ketiga — dan tidak ikut tercampur data Thunder seperti GTM.
//
// Tidak menyimpan identitas apa pun: cukup jumlah kejadiannya.
export async function POST() {
  return new NextResponse(null, { status: 204 });
}

// Fallback untuk navigator.sendBeacon yang di sebagian browser lawas dikirim
// sebagai GET.
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
