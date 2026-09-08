"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { Pagination } from "@/components/common/Pagination"; 

export function EventGridClient({
  products,
  meta,
  sizeOptions = [],
  appliedSizes = [],
}: {
  products: any[];
  meta: any;
  sizeOptions?: string[];
  appliedSizes?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Ukuran boleh dipilih lebih dari satu; keadaannya hidup di URL supaya bisa
  // dibagikan, di-bookmark, dan tombol Back berperilaku seperti yang diharapkan.
  const terpilih = new Set(appliedSizes);

  // Lembar filter HP. Sengaja TIDAK ikut ke URL: itu murni tampilan.
  const [sheetTerbuka, setSheetTerbuka] = useState(false);

  // Pilihan di dalam lembar ditahan dulu, baru dikirim saat "Terapkan".
  // Kalau tiap ketukan langsung navigasi, membuka lembar untuk memilih tiga
  // ukuran berarti tiga kali muat ulang server di jaringan HP.
  const [pilihanSementara, setPilihanSementara] = useState<string[]>(appliedSizes);

  const bukaSheet = () => {
    setPilihanSementara(appliedSizes);
    setSheetTerbuka(true);
  };

  // Kunci scroll latar + tutup dengan Escape selama lembar terbuka.
  useEffect(() => {
    if (!sheetTerbuka) return;
    const scrollAsli = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetTerbuka(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = scrollAsli;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetTerbuka]);

  const toggleSementara = (ukuran: string) =>
    setPilihanSementara((sebelumnya) =>
      sebelumnya.includes(ukuran)
        ? sebelumnya.filter((u) => u !== ukuran)
        : [...sebelumnya, ukuran],
    );

  const terapkanSementara = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (pilihanSementara.length) params.set("size", pilihanSementara.join(","));
    else params.delete("size");
    params.delete("page");
    setSheetTerbuka(false);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const ubahUkuran = (ukuran: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const berikutnya = new Set(terpilih);
    berikutnya.has(ukuran) ? berikutnya.delete(ukuran) : berikutnya.add(ukuran);

    if (berikutnya.size) params.set("size", [...berikutnya].join(","));
    else params.delete("size");
    // Jumlah halaman menyusut saat difilter — bertahan di halaman 5 bakal
    // memunculkan grid kosong.
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const bersihkan = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("size");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full mt-4 md:mt-6">
      {/* ── Filter ukuran ──
          Pilihannya datang dari backend dan hanya memuat ukuran yang masih ada
          stoknya di event ini, jadi tidak ada chip yang berujung nol hasil. */}
      {sizeOptions.length > 0 && (
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-[#111111]">
              Pilih Ukuran
            </span>
            {terpilih.size > 0 && (
              <button
                type="button"
                onClick={bersihkan}
                className="text-[11px] md:text-xs font-semibold text-gray-500 underline underline-offset-2 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Hapus filter ({terpilih.size})
              </button>
            )}
          </div>

          {/* HP: pemicu lembar filter. Event ini punya 38 ukuran — membentangkan
              chip-nya inline mendorong grid produk keluar layar, dan melipatnya
              jadi panel inline cuma memindahkan masalah yang sama satu ketukan
              ke belakang. Lembar dari bawah menaruh daftarnya di atas konten,
              bisa ditutup dengan tap di luar, dan tidak menggeser apa pun. */}
          <button
            type="button"
            onClick={bukaSheet}
            aria-haspopup="dialog"
            aria-expanded={sheetTerbuka}
            className="sm:hidden flex w-full items-center justify-between gap-2 h-12 px-4 rounded-xl border border-gray-300 bg-white text-[13px] font-bold text-[#111111] active:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <span className="flex items-center gap-2">
              <span>Ukuran</span>
              {terpilih.size > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-bold text-white">
                  {terpilih.size}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
              {terpilih.size > 0 ? [...terpilih].join(", ") : "Semua"}
              <ChevronDown className="w-4 h-4 shrink-0" />
            </span>
          </button>

          {/* Layar lebar: chip tetap terbuka — ruangnya ada dan memilih ukuran
              cukup satu ketukan, tanpa perlu lembar. */}
          <div
            role="group"
            aria-label="Saring produk menurut ukuran"
            className="hidden sm:flex flex-wrap gap-2"
          >
            {sizeOptions.map((ukuran) => {
              const aktif = terpilih.has(ukuran);
              return (
                <button
                  key={ukuran}
                  type="button"
                  onClick={() => ubahUkuran(ukuran)}
                  aria-pressed={aktif}
                  // h-11 + min-w-11 = 44px, ambang target sentuh; gap-2 menjaga
                  // jarak antar tombol tetap 8px.
                  className={`h-11 min-w-11 px-3 rounded-lg border text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                    aktif
                      ? "bg-black text-white border-black"
                      : "bg-white text-[#111111] border-gray-300 hover:border-black"
                  }`}
                >
                  {ukuran}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Lembar filter ukuran (HP) ─────────────────────────────────────
          Muncul dari bawah, menutupi konten alih-alih mendorongnya. Ditutup
          lewat tap latar, tombol X, atau Escape. Pilihan ditahan lokal lalu
          dikirim sekali saat "Terapkan" — bukan satu navigasi per ketukan. */}
      {sheetTerbuka && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Tutup pilihan ukuran"
            onClick={() => setSheetTerbuka(false)}
            className="absolute inset-0 h-full w-full bg-black/50"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pilih ukuran"
            className="relative w-full rounded-t-2xl bg-white shadow-2xl animate-fadeInUp"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111]">
                Pilih Ukuran
              </h3>
              <button
                type="button"
                onClick={() => setSheetTerbuka(false)}
                aria-label="Tutup"
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* max-h + overflow: 38 ukuran tidak boleh mendorong tombol
                Terapkan keluar layar. */}
            <div className="max-h-[46vh] overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-4 gap-2">
                {sizeOptions.map((ukuran) => {
                  const aktif = pilihanSementara.includes(ukuran);
                  return (
                    <button
                      key={ukuran}
                      type="button"
                      onClick={() => toggleSementara(ukuran)}
                      aria-pressed={aktif}
                      className={`h-12 rounded-xl border text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                        aktif
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-[#111111] active:bg-gray-50"
                      }`}
                    >
                      {ukuran}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* pb tambahan menghindari home indicator iOS. */}
            <div className="flex items-center gap-3 border-t border-gray-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setPilihanSementara([])}
                disabled={pilihanSementara.length === 0}
                className="h-12 shrink-0 px-4 text-[13px] font-bold text-gray-600 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={terapkanSementara}
                className="h-12 flex-1 rounded-xl bg-black text-[14px] font-bold text-white active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {pilihanSementara.length > 0
                  ? `Terapkan (${pilihanSementara.length})`
                  : "Lihat semua ukuran"}
              </button>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          Tidak ada produk untuk ukuran yang dipilih.
        </p>
      )}

      {/* UBAHAN UTAMA: 
        1. gap-2 di mobile agar ada jarak antar kartu. 
        2. Hapus border aneh (border-t border-l)
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        
        {products.map((p) => (
          <Link 
            href={`/products/${p.slug}`} 
            key={p.productVariantId}
            className="group relative flex flex-col bg-white overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 shadow-sm sm:hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300 h-full"
          >
            {/* ── IMAGE AREA ── */}
            <div className="relative aspect-square w-full bg-[#F5F5F5] overflow-hidden">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl">👟</div>
              )}
              
              {/* Event Badge */}
              {p.isSoldOut ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                  <span className="bg-gray-900 text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded border border-gray-600 tracking-wider">HABIS</span>
                </div>
              ) : (
                p.discountPercent > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-red-600 text-white text-[10px] lg:text-[11px] font-bold px-2 py-1 rounded shadow-sm">
                      -{p.discountPercent}%
                    </span>
                  </div>
                )
              )}
            </div>

            {/* ── PRODUCT INFO AREA ── */}
            {/* Padding disesuaikan agar pas di layar kecil */}
            <div className="px-2.5 sm:px-4 md:px-5 flex flex-col flex-1 pb-3 sm:pb-4 pt-2.5 sm:pt-4">
              {/* Gunakan truncate untuk brand agar tidak turun baris */}
              <h3 className="text-[10px] sm:text-[12px] font-bold tracking-tight text-gray-500 uppercase mb-0.5 truncate">
                {p.brand}
              </h3>
              <p className="text-[11px] sm:text-[12px] leading-snug font-medium text-[#111111] line-clamp-2 mb-1.5 sm:mb-2">
                {p.name.toUpperCase()}
              </p>
              {p.availableSizes && p.availableSizes.length > 0 && (
                <p className="text-[10px] lg:text-[11px] text-[#888888] mb-2 lg:mb-3 line-clamp-1">
                  Size : {p.availableSizes.slice(0, 5).join(", ")}
                  {p.availableSizes.length > 5 && "..."}
                </p>
              )}
              <div className="flex flex-col mt-auto">
                <span className="text-[13px] sm:text-[14px] lg:text-[18px] font-bold leading-none tracking-tight mb-1 text-[#FF6B00]">
                  Rp {p.finalPrice?.toLocaleString('id-ID')}
                </span>
                
                {/* Harga Coret */}
                {p.originalPrice > p.finalPrice && (
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] lg:text-[13px] text-[#888888] line-through font-normal">
                      Rp {p.originalPrice?.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {/* ── BAR STOK EVENT KHUSUS ── */}
                {p.stockBar && p.stockBar.total > 0 && (
                  <div className="mt-1.5 w-full pt-1.5 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      {/* Teks sale disederhanakan jika terlalu panjang di mobile */}
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </span>
                        {p.isSoldOut ? "Habis" : "Sale"}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        Sisa {p.stockBar.total - p.stockBar.sold}
                      </span>
                    </div>
                    {/* Bar Gradasi Merah */}
                    <div className="w-full bg-red-100 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-red-600 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((p.stockBar.sold / p.stockBar.total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

      </div>

      {/* PAGINATION */}
      {meta.lastPage > 1 && (
        <div className="flex justify-center mt-8 pb-10">
          <Pagination 
            currentPage={meta.page} 
            totalPages={meta.lastPage} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}
    </div>
  );
}