import { redirect } from "next/navigation";

/**
 * Campaign "Freedom in Every Step" SUDAH DICABUT (18 Agt 2026, permintaan user).
 *
 * Di backend: event id 9 `is_active=false`, voucher FREEDOM17 nonaktif, banner
 * beranda "81.000 Flash Point" nonaktif, dan hadiah member baru kembali ke
 * voucher First Step 100k. Di storefront seluruh komponennya sudah dihapus
 * (`FreedomHero`, tombol mengambang, `lib/campaign/freedom-in-every-step.ts`,
 * kartu voucher bocoran, gerbang jam belanja di checkout) — semuanya ada di
 * commit `ed11286` dan sebelumnya kalau campaign-nya mau dihidupkan lagi.
 *
 * Yang tersisa cuma pengalihan ini: tautan lamanya masih beredar di IG/WA/iklan
 * dan game Merdeka, jadi 404 di sini cuma membuang trafik.
 */
export default function FreedomCampaignPage() {
  redirect("/");
}
