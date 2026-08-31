import ThunderLoader from "./ThunderLoader";

/**
 * Alias historis. Banyak halaman sudah meng-import PageLoader sebagai fallback
 * <Suspense>, jadi nama ini dipertahankan — isinya sekarang ThunderLoader,
 * supaya semua titik loading di toko memakai animasi petir yang sama.
 *
 * Catatan: dulu komponen ini memaksa bg-white. Tema default toko gelap, jadi
 * setiap kali ia muncul layar berkedip putih. Sekarang ikut bg-background.
 */
export default function PageLoader() {
  return <ThunderLoader variant="section" />;
}
