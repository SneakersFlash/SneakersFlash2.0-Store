"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product.types";

interface Campaign88GridProps {
  /** Sudah terurut & tersaring di server (lihat app/(main)/8-8-sale/page.tsx). */
  products: Product[];
}

const SEMUA = "Semua";

/**
 * Grid produk campaign + saringan merek.
 *
 * Daftar merek dibangun dari produk yang benar-benar ada, bukan dari daftar
 * tetap: kalau kurasinya diganti dan satu merek hilang dari katalog, chip-nya
 * ikut hilang sendiri — bukan jadi tombol yang menghasilkan nol hasil.
 */
export function Campaign88Grid({ products }: Campaign88GridProps) {
  const [merekAktif, setMerekAktif] = useState<string>(SEMUA);

  const daftarMerek = useMemo(() => {
    const unik = new Set<string>();
    products.forEach((p) => {
      const nama = p.brand?.name?.trim();
      if (nama) unik.add(nama);
    });
    return [SEMUA, ...Array.from(unik).sort()];
  }, [products]);

  const tampil = useMemo(
    () =>
      merekAktif === SEMUA
        ? products
        : products.filter((p) => p.brand?.name === merekAktif),
    [products, merekAktif],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ── Chip saringan merek ── */}
      {daftarMerek.length > 2 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Saring berdasarkan merek">
          {daftarMerek.map((merek) => {
            const aktif = merek === merekAktif;
            return (
              <button
                key={merek}
                type="button"
                onClick={() => setMerekAktif(merek)}
                aria-pressed={aktif}
                className={cn(
                  "min-h-[40px] inline-flex items-center px-4 rounded-full border text-sm transition-all duration-200",
                  aktif
                    ? "bg-primary text-primary-foreground border-primary font-bold"
                    : "bg-transparent text-foreground border-border font-medium hover:border-primary hover:text-primary",
                )}
              >
                {merek}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Grid ── */}
      {tampil.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">
          Belum ada produk {merekAktif} di pilihan 08.08 ini.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tampil.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              priority={i < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
