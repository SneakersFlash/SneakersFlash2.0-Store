import { ThunderBolt } from "./ThunderBolt";

/**
 * Satu-satunya tampilan "sedang memuat" untuk seluruh toko.
 *
 * - fullscreen : menutup seluruh viewport (boot pertama, overlay blocking)
 * - section    : mengisi area konten di bawah navbar (loading.tsx tiap route)
 * - inline     : sekadar blok di tengah list/panel (sidebar keranjang, dsb.)
 *
 * Komponen server — tidak ada state, tidak ada hook. Aman dipakai sebagai
 * fallback <Suspense> maupun di dalam file loading.tsx.
 */

type LoaderVariant = "fullscreen" | "section" | "inline";

interface ThunderLoaderProps {
  variant?: LoaderVariant;
  /** Teks di bawah petir. Kirim null kalau tidak mau ada teks sama sekali. */
  label?: string | null;
  className?: string;
}

const SHELL: Record<LoaderVariant, string> = {
  fullscreen: "fixed inset-0 z-[70] min-h-screen overflow-hidden bg-background",
  section: "relative min-h-[70vh] w-full overflow-hidden bg-background",
  inline: "relative w-full py-12",
};

const BOLT_SIZE: Record<LoaderVariant, string> = {
  fullscreen: "w-16 h-16",
  section: "w-14 h-14",
  inline: "w-9 h-9",
};

export function ThunderLoader({
  variant = "section",
  label = "Memuat",
  className,
}: ThunderLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center gap-5 ${SHELL[variant]} ${className ?? ""}`}
    >
      {/* Kilat yang menerangi latar. Hanya di varian yang memang menutup layar —
          di dalam list, flash seluas ini malah bikin silau. */}
      {variant !== "inline" && (
        <span aria-hidden="true" className="tl-flash pointer-events-none absolute inset-0" />
      )}

      <span className="relative flex items-center justify-center">
        {/* Halo yang ikut berdenyut mengikuti sambaran */}
        <span aria-hidden="true" className="tl-halo absolute h-[220%] w-[220%] rounded-full" />
        <ThunderBolt className={`relative ${BOLT_SIZE[variant]}`} />
      </span>

      {label && (
        <span className="font-display text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          {label}
        </span>
      )}

      <span className="sr-only">Konten sedang dimuat</span>
    </div>
  );
}

export default ThunderLoader;
