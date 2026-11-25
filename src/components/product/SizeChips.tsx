// Size tersedia di kartu produk, tiap ukuran dalam kotak ber-border.
// Satu baris saja supaya tinggi kartu seragam: HP maks 4 kotak (kartu cuma
// ±160px, 5 size berdesimal kepotong), layar sm+ maks 5. Sisanya jadi "+N".
const MAX_MOBILE = 4;
const MAX_DESKTOP = 5;

const chipCls =
  "shrink-0 min-w-[24px] sm:min-w-[28px] px-1 py-[1px] border border-[#D9D9D9] rounded-lg text-center text-[9px] sm:text-[11px] leading-[14px] sm:leading-4 text-[#555555]";
const moreCls = "shrink-0 text-[9px] sm:text-[11px] text-[#888888]";

const soldOutCls = "line-through text-[#BBBBBB] border-[#EEEEEE]";

export default function SizeChips({
  sizes: allSizes,
  soldOut,
  className = "",
}: {
  sizes?: (string | number)[] | null;
  /** Ukuran stok 0: dicoret dan ditaruh di belakang ukuran yang masih ada. */
  soldOut?: (string | number)[] | null;
  className?: string;
}) {
  if (!allSizes || allSizes.length === 0) return null;
  const habis = new Set((soldOut ?? []).map(String));
  const sizes = [
    ...allSizes.filter((s) => !habis.has(String(s))),
    ...allSizes.filter((s) => habis.has(String(s))),
  ];
  const restMobile = sizes.length - MAX_MOBILE;
  const restDesktop = sizes.length - MAX_DESKTOP;
  return (
    <div
      className={`flex items-center gap-1 overflow-hidden mb-1.5 sm:mb-2 ${className}`}
      aria-label={`Size: ${sizes.map((s) => (habis.has(String(s)) ? `${s} (habis)` : s)).join(", ")}`}
    >
      {sizes.slice(0, MAX_DESKTOP).map((s, i) => (
        <span
          key={String(s)}
          className={`${chipCls} ${habis.has(String(s)) ? soldOutCls : ""} ${i >= MAX_MOBILE ? "hidden sm:inline-block" : ""}`}
          aria-label={habis.has(String(s)) ? `${s} habis` : undefined}
        >
          {s}
        </span>
      ))}
      {restMobile > 0 && (
        <span className={`${moreCls} sm:hidden`}>+{restMobile}</span>
      )}
      {restDesktop > 0 && (
        <span className={`${moreCls} hidden sm:inline`}>+{restDesktop}</span>
      )}
    </div>
  );
}
