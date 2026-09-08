import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product.types";

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
export function EventFooterBadge({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  if (!isKurasiClearance(product)) return null;

  return (
    <div
      className={cn(
        // `shrink-0`: kartu itu flex kolom — tanpa ini pita bisa terpencet tipis
        // saat isi kartu lebih tinggi dari ruang yang ada.
        "w-full shrink-0 bg-black px-2 py-1 text-center sm:py-1.5",
        className,
      )}
    >
      <span className="block truncate text-[9px] font-bold uppercase leading-tight tracking-[0.12em] text-white sm:text-[11px]">
        {product.activeEvent?.eventName}
      </span>
    </div>
  );
}
