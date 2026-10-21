import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { JrfVoucherPage } from "@/components/campaign/jrf/JrfVoucherPage";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-jrf-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Claim Voucher JRF 2026 — Sneakers Flash" },
  description: "Voucher eksklusif Sneakers Flash untuk peserta Jakarta Running Festival 2026.",
};

// Tanpa ini Next menandai halaman statis s-maxage setahun dan nginx menyimpannya
// selama itu; disamakan dengan halaman campaign lain.
export const revalidate = 60;

/**
 * Sengaja di luar route group (main): halaman ini punya navbar co-brand dan
 * footer sendiri sesuai brief, navbar situs akan membuatnya dobel.
 */
export default function Jrf2026Page() {
  return (
    <div className={display.variable}>
      <JrfVoucherPage />
    </div>
  );
}
