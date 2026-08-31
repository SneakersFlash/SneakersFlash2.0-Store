import { ThunderBolt, type BoltTone } from "./ThunderBolt";

/**
 * Versi kecil dari petir, buat indikator sibuk di dalam tombol / baris teks.
 *
 * Ritmenya sengaja lebih cepat dan lebih rapat dari ThunderLoader (kelas
 * .tl-zap): pada ukuran 14-20px, sambaran lambat terbaca seperti ikon yang
 * ngedip rusak, bukan sebagai proses yang sedang berjalan.
 *
 * tone="mono" wajib dipakai di atas tombol kuning — petir kuning di latar
 * kuning praktis tidak terlihat.
 */
interface ThunderSpinnerProps {
  /** Ukuran sisi dalam piksel. Default 16 — pas untuk tombol setinggi 40-48px. */
  size?: number;
  tone?: BoltTone;
  className?: string;
}

export function ThunderSpinner({
  size = 16,
  tone = "brand",
  className,
}: ThunderSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={`tl-zap inline-flex shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <ThunderBolt tone={tone} className="h-full w-full" />
    </span>
  );
}

export default ThunderSpinner;
