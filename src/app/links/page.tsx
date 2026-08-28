import type { Metadata } from "next";
import { LinkInBio } from "@/components/links/LinkInBio";

/**
 * Halaman "link in bio" - satu tautan yang dipasang di bio Instagram/TikTok dan
 * di balik QR cetak. Sengaja diletakkan DI LUAR route group (main) supaya tidak
 * kebagian navbar, bottom nav, dan footer toko: halaman ini harus tampil polos
 * seperti Linktree, bukan seperti halaman katalog.
 */

const PAGE_URL = "https://sneakersflash.com/links";

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
  return <LinkInBio />;
}
