import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product.types";
import {
  CAMPAIGN_99_BERAKHIR,
  CAMPAIGN_99_MULAI,
  CAMPAIGN_99_NAMA,
} from "@/lib/campaign/next-in-rotation-99";

/**
 * Apakah produk ini bagian dari kurasi Clearance Sale / 9.9 Next In Rotation?
 *
 * Penandanya prefiks `LC-` pada kode artikel, bukan daftar SKU yang ditempel di
 * kode. Alasannya sudah dicek ke datanya (8 Sep 2026): sheet "All Footwear" di
 * list 9.9 berisi 231 kode artikel dan itu SAMA PERSIS dengan katalog Clearance
 * Sale — nol selisih di kedua arah — sedangkan "Website Hero Display" (24 kode)
 * adalah bagian dari 231 itu. Jadi "barang di list" dan "salinan clearance"
 * menunjuk himpunan yang sama, dan prefiks tidak perlu diperbarui tiap kurasi
 * berubah.
 *
 * `activeEvent` tetap diwajibkan supaya pita ikut hilang sendiri begitu
 * eventnya tutup — salinan `LC-` tidak dinonaktifkan otomatis saat itu terjadi.
 */
export function isKurasiClearance(product: Product): boolean {
  const kodeArtikel = product.skuParent ?? "";
  return (
    Boolean(product.activeEvent?.eventName) &&
    kodeArtikel.toUpperCase().startsWith("LC-")
  );
}

/**
 * Pita nama event tepat DI BAWAH gambar produk, selebar kartu.
 *
 * Sebelumnya badge ini pil mungil di pojok kiri atas foto. Di sana ia bersaing
 * dengan isi foto: ukurannya sempat harus dikecilkan sampai 7px supaya tidak
 * menutupi logo SneakersFlash di produk, dan jadi nyaris tak terbaca.
 *
 * Dirender sebagai blok biasa SESUDAH wadah gambar, bukan overlay di atasnya —
 * jadi tidak ada bagian sepatu yang tertutup, berapa pun crop-nya di layar
 * kecil. Lebarnya mengikuti kartu dengan sendirinya karena ia anak langsung
 * <Link> yang tidak berpadding horizontal; sisi kirinya rata dengan tepi kartu
 * (kartu sudah `overflow-hidden`).
 */
/**
 * Apakah campaign 9.9 sedang berjalan?
 *
 * Dihitung dari jam pembaca, bukan dipatok saat build. Beda dari
 * Campaign99FloatingButton yang memutuskannya sesudah mount: tombol itu memang
 * muncul telat 600ms jadi post-mount gratis, sedangkan pita ada di SETIAP kartu
 * — menunda keputusannya bikin semua kartu berkedip hitam→kuning tiap halaman
 * dibuka. Halaman kurasi ini ISR 60 detik, jadi penanda di server pun ikut
 * segar dalam semenit setelah campaign tutup.
 */
function sedangKampanye99(sekarang = Date.now()): boolean {
  return (
    sekarang >= Date.parse(CAMPAIGN_99_MULAI) &&
    sekarang < Date.parse(CAMPAIGN_99_BERAKHIR)
  );
}

export function EventFooterBadge({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  if (!isKurasiClearance(product)) return null;

  // Selama 9.9 berjalan, barang kurasi tampil sebagai campaign — bukan sebagai
  // "Clearance Sale". Sesudah 9 Sep 23:59 WIB pita balik sendiri ke nama event
  // (clearance-nya sendiri jalan sampai 30 Sep), tanpa perlu deploy pencabutan.
  const kampanye = sedangKampanye99();
  const label = kampanye ? CAMPAIGN_99_NAMA : product.activeEvent?.eventName;

  return (
    <div
      className={cn(
        // `shrink-0`: kartu itu flex kolom — tanpa ini pita bisa terpencet tipis
        // saat isi kartu lebih tinggi dari ruang yang ada.
        "w-full shrink-0 px-2 py-1 text-center sm:py-1.5",
        // Kuning brand + teks near-black: token toko, BUKAN hex lepas — brief
        // 9.9 memakai kuning sebagai jembatan sosmed ↔ website, dan pita hero
        // di halaman campaign persis memakai pasangan token yang sama.
        // Kontras terukur 15,4:1, jauh di atas ambang WCAG 4.5:1. Kuning
        // MENUNTUT teks gelap: putih di atas kuning cuma 1,28:1 — tak terbaca.
        kampanye ? "bg-primary text-primary-foreground" : "bg-black text-white",
        className,
      )}
    >
      <span
        className={cn(
          "block truncate text-[9px] font-bold uppercase leading-tight sm:text-[11px]",
          // "9.9 NEXT IN ROTATION" jauh lebih panjang dari "Clearance Sale";
          // tracking dirapatkan supaya tetap utuh di kartu rail yang cuma 160px.
          kampanye ? "tracking-[0.06em]" : "tracking-[0.12em]",
        )}
      >
        {label}
      </span>
    </div>
  );
}
