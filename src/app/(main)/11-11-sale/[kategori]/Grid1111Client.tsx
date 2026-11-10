"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { ProductCard } from "@/components/product/ProductCard";
import { teaser1111, PER_HALAMAN_1111 } from "@/lib/campaign/year-end-1111";
import type { Product } from "@/types/product.types";


/** Urut ukuran: angka naik dulu (38, 38.5, 39 …), sisanya alfabet. */
function urutUkuran(a: string, b: string) {
  const na = parseFloat(a.replace(",", "."));
  const nb = parseFloat(b.replace(",", "."));
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  if (!Number.isNaN(na)) return -1;
  if (!Number.isNaN(nb)) return 1;
  return a.localeCompare(b);
}

/**
 * Grid "See All Pairs" 11.11 dengan filter ukuran + pagination, meniru
 * halaman event biasa (EventGridClient: UI filter & lembar HP disalin dari
 * sana, keadaan di URL `?size=40,41&page=2`). Bedanya: datanya sudah lengkap
 * dari server (≤170 produk per section), jadi penyaringan & pemotongan
 * halaman dilakukan di sini — halaman tetap ISR, tanpa panggilan API per klik.
 * Kartunya ProductCard biasa supaya pita event + countdown "End in" ikut.
 */
export function Grid1111Client({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const atasGrid = useRef<HTMLDivElement>(null);

  const sizeOptions = useMemo(() => {
    const semua = new Set<string>();
    products.forEach((p) => (p.availableSizes ?? []).forEach((u) => semua.add(String(u))));
    return [...semua].sort(urutUkuran);
  }, [products]);

  const appliedSizes = (searchParams.get("size") ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u && sizeOptions.includes(u));
  const terpilih = new Set(appliedSizes);

  const tersaring = terpilih.size
    ? products.filter((p) => (p.availableSizes ?? []).some((u) => terpilih.has(String(u))))
    : products;

  const totalHalaman = Math.max(1, Math.ceil(tersaring.length / PER_HALAMAN_1111));
  const halaman = Math.min(
    totalHalaman,
    Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
  );
  const tampil = tersaring.slice((halaman - 1) * PER_HALAMAN_1111, halaman * PER_HALAMAN_1111);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // Pindah halaman = mulai dari kartu pertama, bukan tetap di bawah.
    atasGrid.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [sheetTerbuka, setSheetTerbuka] = useState(false);
  const [pilihanSementara, setPilihanSementara] = useState<string[]>(appliedSizes);

  const bukaSheet = () => {
    setPilihanSementara(appliedSizes);
    setSheetTerbuka(true);
  };

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
    <div className="w-full">
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

      <div ref={atasGrid} className="scroll-mt-24 mb-3 text-xs text-gray-500">
        {tersaring.length} pairs
        {terpilih.size > 0 && ` untuk ukuran ${[...terpilih].join(", ")}`}
      </div>

      {tampil.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Tidak ada produk untuk ukuran yang dipilih.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tampil.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={Math.min(i, 8)}
              priority={halaman === 1 && i < 4}
              hargaTeaser={teaser1111(product.skuParent)}
            />
          ))}
        </div>
      )}

      {totalHalaman > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={halaman}
            totalPages={totalHalaman}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
