/**
 * Petir SneakersFlash sebagai SVG inline.
 *
 * Sengaja TIDAK memakai <Image src="/images/petir.svg">: sebagai <img> browser
 * memperlakukan SVG-nya sebagai gambar buram, jadi tiap sudutnya tidak bisa
 * dianimasikan sendiri-sendiri. Yang bikin animasi terasa "petir" justru itu —
 * inti kuning berkedip lain waktu dengan garis arc yang menjalar di tepinya.
 *
 * Geometri persis menyalin public/images/petir.svg supaya loader, favicon, dan
 * wordmark tetap satu bentuk.
 */

export type BoltTone = "brand" | "mono";

interface ThunderBoltProps {
  /** "brand" = kuning/oranye asli. "mono" = ikut currentColor (buat di dalam tombol). */
  tone?: BoltTone;
  className?: string;
  /** Matikan animasi — dipakai kalau petirnya cuma jadi ornamen statis. */
  still?: boolean;
}

export function ThunderBolt({
  tone = "brand",
  className,
  still = false,
}: ThunderBoltProps) {
  const core = tone === "brand" ? "#F9E500" : "currentColor";
  const facet = tone === "brand" ? "#FAA61A" : "currentColor";
  const facetOpacity = tone === "brand" ? 1 : 0.45;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <g className={still ? undefined : "tl-bolt"}>
        <polygon
          fill={core}
          points="1.1 18.02 16.75 18.02 11.8 29.88 30.9 13.11 16.05 13.11 23.48 2.12"
        />
        <g fill={facet} opacity={facetOpacity}>
          <polygon points="23.48 2.12 9.66 15.16 1.1 18.02" />
          <polygon points="21.49 15.71 9.66 15.16 16.05 13.11 30.9 13.11" />
          <polygon points="11.8 29.88 21.49 15.71 16.75 18.02" />
        </g>
      </g>

      {/* Arc listrik yang menjalar menyusuri siluet petir. Panjang keliling
          jalur ini ~110 unit — angka itu yang dipakai stroke-dasharray di CSS.
          Sengaja TANPA vectorEffect="non-scaling-stroke": efek itu memaksa
          stroke-dasharray ikut dihitung dalam piksel layar, sementara 110 di
          CSS adalah satuan viewBox. Begitu petirnya dirender lebih besar dari
          32px, pola garisnya jadi tidak sepanjang jalurnya dan arc-nya
          berhenti di tengah. */}
      {!still && (
        <path
          className="tl-arc"
          d="M23.48 2.12 L1.1 18.02 L16.75 18.02 L11.8 29.88 L30.9 13.11 L16.05 13.11 Z"
          fill="none"
          stroke={tone === "brand" ? "#FFFDF0" : "currentColor"}
          strokeWidth="0.9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default ThunderBolt;
