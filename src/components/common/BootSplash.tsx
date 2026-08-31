import { ThunderBolt } from "./ThunderBolt";
import { BootSplashReady } from "./BootSplashReady";

/**
 * Loading untuk render paling pertama.
 *
 * Dirender di server dan diletakkan di awal <body>, jadi petirnya sudah terlihat
 * pada cat pertama — sebelum satu byte JavaScript pun dieksekusi. loading.tsx
 * milik Next.js tidak bisa menutupi momen ini: ia baru bekerja untuk navigasi
 * berikutnya, bukan untuk kunjungan pertama.
 *
 * Cara menghilangkannya ada di globals.css (#boot-splash), termasuk failsafe
 * 8 detik kalau bundle-nya gagal dimuat.
 */
export function BootSplash() {
  return (
    <>
      <div id="boot-splash" aria-hidden="true">
        <span className="relative flex items-center justify-center">
          <span className="tl-halo absolute h-[220%] w-[220%] rounded-full" />
          <ThunderBolt className="relative h-16 w-16" />
        </span>
        <span className="font-display text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          SneakersFlash
        </span>
      </div>
      <BootSplashReady />
    </>
  );
}

export default BootSplash;
