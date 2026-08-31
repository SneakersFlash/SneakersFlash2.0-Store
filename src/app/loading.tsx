import ThunderLoader from "@/components/common/ThunderLoader";

/**
 * Jaring pengaman untuk route mana pun yang tidak punya loading.tsx lebih dekat.
 *
 * Diletakkan di level grup, bukan per halaman: Next.js memakai loading.tsx
 * terdekat ke atas, jadi satu berkas di sini otomatis berlaku untuk seluruh
 * route di bawahnya — dan itu yang bikin semua halaman kebagian loader yang
 * sama persis tanpa harus disalin 30 kali.
 */
export default function Loading() {
  return <ThunderLoader variant="fullscreen" />;
}
