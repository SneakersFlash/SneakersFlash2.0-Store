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
 * Temanya langit malam tujuh-belasan - navy pekat, teks krem, aksen emas,
 * bayangan sablon merah - disalin dari demo artifact yang jadi acuan. Latar
 * gelap bukan cuma selera: kanvas permainannya sendiri berakhir di langit malam,
 * jadi bingkai gelap membuat papannya menyatu, sementara halaman terang akan
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
      className="min-h-screen bg-[#080D22]"
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
      <div className="mx-auto flex max-w-[1080px] flex-col gap-7 px-4 pb-16 pt-7">
        {/* -- Kepala poster ------------------------------------------------- */}
        <header className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#F2B33D]">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#B87F16]" />
            Freedom in Step
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#B87F16]" />
          </div>

          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#98A2CE]">
            Merdeka Game &middot; 17&ndash;31 Agustus 2026
          </div>

          <h1
            className="m-0 font-display text-[clamp(48px,12vw,92px)] font-bold uppercase leading-[0.86] tracking-[0.01em] text-[#FFF4E8]"
            style={{
              textShadow:
                "2px 2px 0 #A8232B, 4px 4px 0 #6E1520, 0 10px 34px rgba(226,58,58,.35)",
            }}
          >
            The{" "}
            <em
              className="not-italic text-[#E23A3A]"
              style={{ textShadow: "2px 2px 0 #5C0F16, 4px 4px 0 #2C0810" }}
            >
              17
            </em>
            -Box Climb
          </h1>

          <p className="m-0 font-display text-base font-bold uppercase tracking-[0.15em] text-[#F2B33D] md:text-lg">
            Stack 17. Beat 45. Break Free.
          </p>

          <p className="m-0 max-w-[44ch] text-[15px] leading-relaxed text-[#98A2CE]">
            Susun 17 sneaker boxes dalam 45 detik. Capai puncak, unlock the
            wheel, dan menangkan reward spesial Kemerdekaan.
          </p>
        </header>

        {/* -- Panggung ------------------------------------------------------ */}
        <MerdekaGame />

        {/* -- Keterangan ---------------------------------------------------- */}
        <section className="mx-auto grid w-full max-w-[920px] gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(238px,1fr))]">
          <Kartu judul="Cara main">
            <Poin>
              Sneaker box digantung crane, bergerak <B>kiri-kanan</B> dan makin
              cepat tiap tingkat.
            </Poin>
            <Poin>
              Tap untuk menjatuhkan. Sisi yang <B>meleset terpotong</B>, box
              berikutnya jadi lebih sempit.
            </Poin>
            <Poin>
              Jatuh <B>pas</B> tidak memotong - malah menambah lebar dan boxnya
              dapat pita emas.
            </Poin>
            <Poin>Meleset total, menaranya runtuh dan rondenya selesai.</Poin>
          </Kartu>

          <Kartu judul="Box yang dipakai">
            <div className="flex flex-col gap-1.5">
              <Merek warna="#F4692A">Nike</Merek>
              <Merek warna="#16305E">adidas</Merek>
              <Merek warna="#EFF2F7" tepi="#1B4CA1">
                ASICS
              </Merek>
              <Merek warna="#C9CDD4">New Balance</Merek>
              <Merek warna="#14161A">Salomon</Merek>
            </div>
            <p className="m-0 text-[13px] text-[#6E78A8]">
              Warna dan tata letak boxnya digambar ulang di canvas, urutannya
              berputar tiap tingkat.
            </p>
          </Kartu>

          <Kartu judul="Parameter">
            <Baris k="Target box" v="17" />
            <Baris k="Batas waktu" v="45 detik" />
            <Baris k="Lebar box awal" v="150 px" />
            <Baris k="Toleransi pas" v="6 px" />
            <Baris k="Bonus lebar saat pas" v="+6 px" />
            <Baris k="Kesempatan / akun" v="1x per hari" />
          </Kartu>

          <Kartu judul="Isi roda">
            <Poin>
              Sembilan juring: <B>Flash Points</B>, apparel, dan sneaker.
            </Poin>
            <Poin>
              Pemenang ditentukan di <B>server</B>; animasi roda hanya mengikuti
              hasilnya.
            </Poin>
            <Poin>
              Hadiah barang stoknya <B>satu</B> - begitu diklaim, juringnya
              memberi tahu kalau sudah dimenangkan orang lain.
            </Poin>
            <Poin>
              Klaim apparel lewat <B>verifikasi email</B> dulu, baru dapat link
              WhatsApp ke CS.
            </Poin>
          </Kartu>
        </section>

        <p className="mx-auto w-full max-w-[920px] border-l-[3px] border-[#E23A3A] py-0.5 pl-4 text-[13px] text-[#6E78A8]">
          <b className="text-[#98A2CE]">Syarat singkat.</b> Khusus member
          Sneakers Flash yang sudah login. Satu akun satu kesempatan per hari,
          reset tengah malam WIB. Periode 17-31 Agustus 2026. Hadiah barang
          tidak bisa ditukar uang dan wajib diklaim lewat kontak yang terdaftar
          di akun.
        </p>
      </div>
    </div>
  );
}

// -- Bagian kecil ------------------------------------------------------------

function Kartu({
  judul,
  children,
}: {
  judul: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#2A3468] bg-[#141C3E] px-4 py-4">
      <h3 className="m-0 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F2B33D]">
        {judul}
      </h3>
      {children}
    </div>
  );
}

function Poin({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm leading-relaxed text-[#98A2CE]">
      <span aria-hidden="true" className="text-[#6E78A8]">
        &bull;
      </span>
      <p className="m-0">{children}</p>
    </div>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return <b className="font-semibold text-[#F3F0FF]">{children}</b>;
}

function Baris({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2.5 border-b border-[#2A3468] py-1.5 text-sm last:border-b-0">
      <span className="text-[#98A2CE]">{k}</span>
      <b className="font-mono font-semibold tabular-nums text-[#F3F0FF]">{v}</b>
    </div>
  );
}

function Merek({
  warna,
  tepi,
  children,
}: {
  warna: string;
  tepi?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-[#F3F0FF]">
      <i
        className="h-[15px] w-[22px] flex-none rounded-[3px] border"
        style={{
          background: warna,
          borderColor: tepi ?? "rgba(255,255,255,.28)",
          boxShadow: "0 1px 0 rgba(0,0,0,.5)",
        }}
      />
      {children}
    </div>
  );
}
