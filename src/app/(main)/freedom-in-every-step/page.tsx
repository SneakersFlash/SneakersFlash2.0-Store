import { redirect } from "next/navigation";

/**
 * Campaign "Freedom in Every Step" SUDAH DIMATIKAN (18 Agt 2026, atas permintaan
 * user). Event id 9 di backend `is_active=false`, voucher FREEDOM17 dinonaktifkan,
 * dan bonus registrasi kembali ke voucher First Step 100k.
 *
 * Rutenya tidak dihapus melainkan dialihkan: tautan lama masih beredar di
 * WhatsApp/IG/iklan, dan 404 di sana cuma membuang trafik. Halaman aslinya
 * (hero, voucher, grid kurasi) masih utuh di riwayat git pada commit sebelum
 * ini — kalau campaign-nya dihidupkan lagi, ambil file itu, jangan tulis ulang.
 * Modul pendukungnya (`FreedomHero`, `lib/campaign/freedom-in-every-step.ts`)
 * sengaja dibiarkan ada di repo.
 */
export default function FreedomCampaignPage() {
  redirect("/");
}
