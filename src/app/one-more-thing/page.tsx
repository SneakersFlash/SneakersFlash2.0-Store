import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { OneMoreThing } from "@/components/campaign/one-more-thing/OneMoreThing";

/**
 * Landing ONE MORE THING — dibuka dari QR di folded card paket marketplace.
 * Sengaja di luar grup (main): halaman ini punya header & footer sendiri
 * sesuai desain, tanpa navbar toko.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ONE MORE THING — Spin hadiah SneakersFlash",
  description:
    "Scan QR di kartu, masuk dengan Google, masukkan kode unik, lalu spin untuk reward yang bisa dipakai saat belanja berikutnya di sneakersflash.com.",
  // Belum diumumkan & backend masih tiruan: jangan diindeks dulu.
  robots: { index: false, follow: false },
};

// Sama dengan halaman campaign lain: tanpa ini nginx menyimpan halaman 1 tahun.
export const revalidate = 60;

export default function OneMoreThingPage() {
  return <OneMoreThing fontClass={jakarta.variable} />;
}
