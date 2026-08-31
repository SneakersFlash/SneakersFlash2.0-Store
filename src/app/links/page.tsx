import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { LinkInBio } from "@/components/links/LinkInBio";

/**
 * Halaman "link in bio" - satu tautan yang dipasang di bio Instagram/TikTok dan
 * di balik QR cetak. Sengaja diletakkan DI LUAR route group (main) supaya tidak
 * kebagian navbar, bottom nav, dan footer toko: halaman ini harus tampil polos
 * seperti Linktree, bukan seperti halaman katalog.
 */

const PAGE_URL = "https://sneakersflash.com/links";

/**
 * Font dimuat DI SINI, bukan di root layout, supaya hanya halaman ini yang
 * menanggung ongkos unduhnya - sisa toko tidak memakai Archivo.
 *
 * `axes: ["wdth"]` WAJIB. Lebar bukan sumbu bawaan Archivo, jadi tanpa baris ini
 * file yang terunduh cuma punya sumbu berat dan `font-variation-settings: "wdth"`
 * di komponen gagal diam-diam - huruf tetap render di lebar normal, dan justru
 * lebar itulah yang bikin teks nyambung dengan wordmark. Kegagalannya tidak
 * memunculkan error apa pun, cuma "kok fontnya kurang mirip".
 *
 * `style` memuat italic ASLI. Kalau italic tidak diminta di sini, browser
 * memiringkan huruf tegak secara sintetis dan hasilnya patah-patah di berat 800.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Links — SneakersFlash",
  description:
    "Semua kanal resmi SneakersFlash dalam satu halaman: WhatsApp, Instagram, dan TikTok.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Links — SneakersFlash",
    description:
      "Semua kanal resmi SneakersFlash dalam satu halaman: WhatsApp, Instagram, dan TikTok.",
    url: PAGE_URL,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function LinksPage() {
  // Pembungkus ini yang mendefinisikan --font-archivo; kelas `font-brand` di
  // dalam LinkInBio tidak berarti apa-apa di luar sini.
  return (
    <div className={archivo.variable}>
      <LinkInBio />
    </div>
  );
}
