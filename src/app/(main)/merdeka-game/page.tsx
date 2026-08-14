import type { Metadata } from "next";
import { MerdekaGame } from "@/components/game/MerdekaGame";

export const metadata: Metadata = {
  title: "The 17-Box Climb - Merdeka Game | SneakersFlash",
  description:
    "Susun 17 sneaker boxes dalam 45 detik, capai puncak, dan putar roda hadiah Kemerdekaan. 17-31 Agustus 2026, khusus member Sneakers Flash.",
};

/**
 * Halaman game Kemerdekaan.
 *
 * Warna merah kampanye ditimpa DI SINI lewat style inline, bukan di globals.css:
 * --primary dipakai seluruh toko (kuning), jadi mengubahnya di sana akan
 * mewarnai ulang semua halaman. Nilainya diwarisi turun ke seluruh isi halaman
 * ini dan berhenti begitu keluar dari pembungkus - sama persis dengan cara
 * halaman /freedom-in-every-step.
 */
export default function MerdekaGamePage() {
  return (
    <div
      className="min-h-screen bg-[#9E0107] font-helvetica-88"
      style={
        {
          "--primary": "357.7 98.7% 31.2%",
          "--primary-foreground": "0 0% 100%",
        } as React.CSSProperties
      }
    >
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* -- Kepala -- */}
        <header className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
            Freedom in Step
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            Merdeka Game &middot; 17&ndash;31 Agustus 2026
          </div>

          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl">
            The 17-Box Climb
          </h1>

          <p className="mt-3 font-display text-base font-bold uppercase tracking-[0.15em] text-white/80 md:text-lg">
            Stack 17. Beat 45. Break Free.
          </p>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
            Susun 17 sneaker boxes dalam 45 detik. Capai puncak, unlock the
            wheel, dan menangkan reward spesial Kemerdekaan.
          </p>
        </header>

        {/* -- Papan -- */}
        <section className="mt-8 md:mt-10">
          <MerdekaGame />
        </section>

        {/* -- Aturan singkat -- */}
        <section className="mx-auto mt-10 max-w-[460px]">
          <div className="rounded-2xl border border-white/15 bg-black/15 p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white">
              Cara Main
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/70">
              <li>
                Sneaker box akan bergerak ke kanan dan kiri. Tap di waktu yang
                tepat untuk menyusunnya. Bagian yang meleset akan terpotong.
              </li>
              <li>
                Susun sampai 17 boxes sebelum 45 detik habis untuk membuka roda
                hadiah.
              </li>
              <li>1 akun mendapat 1 kesempatan bermain setiap hari.</li>
              <li>
                Hadiah barang diverifikasi lewat email dulu, lalu diklaim ke CS
                lewat WhatsApp.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
