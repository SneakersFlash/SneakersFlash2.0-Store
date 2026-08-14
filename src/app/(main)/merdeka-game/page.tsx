import type { Metadata } from "next";
import { MerdekaGame } from "@/components/game/MerdekaGame";

export const metadata: Metadata = {
  title: "The 17-Box Climb - Merdeka Game | SneakersFlash",
  description:
    "Susun 17 sneaker boxes dalam 45 detik, capai puncak, dan putar roda hadiah Kemerdekaan. 17-31 Agustus 2026, khusus member Sneakers Flash.",
};

/**
 * Isi halaman ini sepenuhnya statis - papannya digambar di browser - jadi
 * sebenarnya tidak ada yang perlu divalidasi ulang.
 *
 * Tetap dipasang karena tanpanya Next menandai halaman ini
 * `s-maxage=31536000`, dan nginx di depan storefront menyimpannya SATU TAHUN.
 * Akibatnya perubahan copy atau tema tidak pernah sampai ke pengunjung sampai
 * cache-nya dibersihkan manual. Angkanya disamakan dengan halaman campaign lain.
 */
export const revalidate = 60;

/**
 * Halaman game Kemerdekaan.
 *
 * Temanya langit malam tujuh-belasan - navy pekat, teks krem, aksen emas -
 * mengikuti demo game yang jadi acuan. Latar gelap dipilih bukan cuma karena
 * selera: kanvas permainannya sendiri berakhir di langit malam (#020330), jadi
 * bingkai gelap membuat papannya menyatu, sementara halaman terang akan
 * membuat kanvas itu terlihat seperti kotak asing yang ditempel.
 *
 * --primary ditimpa DI SINI lewat style inline, bukan di globals.css: variabel
 * itu dipakai seluruh toko (kuning), jadi mengubahnya di sana akan mewarnai
 * ulang semua halaman. Nilainya diwarisi turun ke seluruh isi halaman ini dan
 * berhenti begitu keluar dari pembungkus - sama persis dengan cara halaman
 * /freedom-in-every-step. 39.1 87.4% 59.4% == #F2B33D (emas).
 */
export default function MerdekaGamePage() {
  return (
    <div
      className="min-h-screen bg-[#080D22] font-helvetica-88"
      style={
        {
          "--primary": "39.1 87.4% 59.4%",
          "--primary-foreground": "222 47% 8%",
          // Cahaya langit di puncak halaman, meneruskan gradasi yang sama
          // seperti di demo. radial-gradient dipasang sebagai background image
          // supaya warna dasar di atas tetap jadi cadangan.
          backgroundImage:
            "radial-gradient(1100px 620px at 50% -8%, #242C63 0%, rgba(36,44,99,0) 62%)",
        } as React.CSSProperties
      }
    >
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* -- Kepala -- */}
        <header className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#F2B33D]">
            Freedom in Step
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#98A2CE]">
            Merdeka Game &middot; 17&ndash;31 Agustus 2026
          </div>

          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-none tracking-tight text-[#FFF4E8] md:text-6xl">
            The 17-Box Climb
          </h1>

          <p className="mt-3 font-display text-base font-bold uppercase tracking-[0.15em] text-[#F2B33D] md:text-lg">
            Stack 17. Beat 45. Break Free.
          </p>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#98A2CE] md:text-base">
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
          <div className="rounded-2xl border border-[#2A3468] bg-[#141C3E] p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#FFF4E8]">
              Cara Main
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#98A2CE]">
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
