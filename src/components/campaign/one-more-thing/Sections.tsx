/**
 * Bagian statis halaman ONE MORE THING: header, cara dapat hadiah, grid
 * reward, S&K, pita penutup, footer. Copy disalin verbatim dari
 * reference.dc.html — jangan diubah tanpa persetujuan (PDF copy 19 Nov 2026).
 */
import type { CSSProperties } from "react";
import { OMT_PENDING } from "@/lib/campaign/one-more-thing";
import { ClosingWorld3D, LOGO_SRC } from "./Objects3D";

const container: CSSProperties = { maxWidth: 1120, margin: "0 auto", boxSizing: "border-box" };
const h2: CSSProperties = { margin: 0, fontSize: 28, lineHeight: "34px", fontWeight: 700, letterSpacing: "-0.025em" };
const pill: CSSProperties = {
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  borderRadius: 999,
  background: "#efefec",
  color: "#111213",
  textDecoration: "none",
  fontWeight: 600,
};

const Arrow = ({ size = 16 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={size > 16 ? 2.2 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export function Header() {
  return (
    <header style={{ position: "relative", zIndex: 5, background: "#ffffff", borderBottom: "1px solid #e7e7e3" }}>
      <div style={{ ...container, padding: "0 16px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", minHeight: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="SNKRS FLASH" style={{ height: 38, width: "auto", display: "block" }} />
        </a>
        <a href="/" style={{ ...pill, padding: "0 16px", fontSize: 15, gap: 6 }}>
          Ke toko
          <Arrow />
        </a>
      </div>
    </header>
  );
}

const STEPS = [
  { n: "1", title: "Scan QR di kartu", body: "Buka folded card di paketmu, lalu scan QR untuk masuk ke halaman ONE MORE THING." },
  { n: "2", title: "Masuk dengan Google", body: "Login atau daftar dengan Google, lalu masukkan kode unik dari stiker di dalam kartu." },
  {
    n: "3",
    title: "Spin & unlock reward",
    body: "Setiap spin valid mendapatkan reward. Gunakan saat belanja berikutnya di sneakersflash.com sesuai ketentuan.",
  },
];

export function StepsSlabs() {
  return (
    <section style={{ ...container, padding: "24px 16px 96px", display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={h2}>Cara dapat hadiahnya</h2>
      <div className="sf-reveal" style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="sf-slab"
            style={{
              position: "relative",
              flex: "1 1 280px",
              minWidth: 0,
              background: "#ffffff",
              borderRadius: 16,
              padding: 24,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow: "0 24px 40px rgba(17, 18, 19, 0.06)",
            }}
          >
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: 10, right: 10, bottom: "100%", height: 16, background: "#f0f0ec", transformOrigin: "50% 100%", transform: "rotateX(90deg)" }}
            />
            <div
              aria-hidden="true"
              style={{ position: "absolute", top: 10, bottom: 10, left: "100%", width: 16, background: "#dcdcd7", transformOrigin: "0 50%", transform: "rotateY(90deg)" }}
            />
            <div
              aria-hidden="true"
              style={{
                fontSize: 72,
                lineHeight: "72px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#111213",
                textShadow:
                  "1px 1px 0 #f6e70a, 2px 2px 0 #f6e70a, 3px 3px 0 #f6e70a, 4px 4px 0 #faa61a, 5px 5px 0 #faa61a, 6px 6px 0 #faa61a",
              }}
            >
              {s.n}
            </div>
            <div style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600, letterSpacing: "-0.015em" }}>{s.title}</div>
            <div style={{ fontSize: 16, lineHeight: "24px", color: "#4f4f4a" }}>{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const CoinsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);
const BoxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
    <path d="m7.5 4.27 9 5.15" />
  </svg>
);
const SockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h7v9l3.5 3.5a3.5 3.5 0 0 1-5 5L8.6 14.6A2 2 0 0 1 8 13.2z" />
    <path d="M8 6h7" />
  </svg>
);

const REWARD_CARDS = [
  { title: "Flash Point 50K", desc: "Poin belanja senilai Rp 50.000", fp: true, delay: "0.00s", Icon: CoinsIcon },
  { title: "Flash Point 100K", desc: "Poin belanja senilai Rp 100.000", fp: true, delay: "0.25s", Icon: CoinsIcon },
  { title: "Flash Point 150K", desc: "Poin belanja senilai Rp 150.000", fp: true, delay: "0.50s", Icon: CoinsIcon },
  { title: "Double box", desc: "Bonus double box untuk pesanan website berikutnya.", fp: false, delay: "1.25s", Icon: BoxIcon },
  { title: "Kaos kaki", desc: "Bonus kaos kaki untuk pesanan website berikutnya.", fp: false, delay: "1.75s", Icon: SockIcon },
];

export function RewardGrid() {
  return (
    <section style={{ borderTop: "1px solid #e7e7e3" }}>
      <div style={{ ...container, padding: "72px 16px 80px", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <h2 style={h2}>Ada 5 jenis reward</h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: "26px", fontWeight: 500, color: "#4f4f4a", maxWidth: 440 }}>
            Setiap spin valid pasti mendapatkan satu reward.
          </p>
        </div>
        <div style={{ width: "100%", maxWidth: 920, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {REWARD_CARDS.map(({ title, desc, fp, delay, Icon }) => (
            <div key={title} className="sf-pop-in">
              <div
                className="sf-prize"
                style={{
                  height: "100%",
                  boxSizing: "border-box",
                  background: "#ffffff",
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  boxShadow: "0 1px 3px rgba(17, 18, 19, 0.06)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="sf-anim sf-prize-token"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: fp ? "#f6e70a" : "#efefec",
                    color: fp ? "#040707" : "#111213",
                    boxShadow: `0 4px 0 ${fp ? "#d4c600" : "#dcdcd7"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: `sf-bob-sm 2.6s ease-in-out ${delay} infinite alternate`,
                  }}
                >
                  <Icon />
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 17, lineHeight: "22px", fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500, color: "#4f4f4a" }}>{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TERMS = [
  "Program berlaku bagi pemegang kode unik pada folded card Sneakers Flash yang disertakan dalam paket marketplace.",
  "QR digunakan untuk membuka halaman aktivasi. Setiap kode unik hanya berlaku untuk satu kali spin.",
  "Flash Point tercatat di akun yang digunakan untuk spin dan dapat dipakai pada pembelian berikutnya di sneakersflash.com, dengan minimum belanja serta masa berlaku sesuai ketentuan.",
  "Setiap spin dengan kode valid menghasilkan satu reward, mengikuti alokasi dan ketersediaan program.",
  "Kaos kaki dan double box dapat diklaim bersama pesanan berikutnya di sneakersflash.com sesuai ketentuan.",
  "Hadiah tidak dapat diuangkan. Penggunaan reward mengikuti ketentuan program dan akun penerima.",
  "Voucher pengguna baru Rp100.000 merupakan benefit terpisah dan mengikuti syarat promo yang berlaku.",
];

export function Terms() {
  return (
    <section style={{ ...container, padding: "24px 16px 88px", display: "flex", flexWrap: "wrap", gap: 32 }}>
      <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={h2}>Syarat dan ketentuan</h2>
        <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "#4f4f4a" }}>
          Periode program {OMT_PENDING.startDate} sampai {OMT_PENDING.endDate}.
        </p>
      </div>
      <ol
        className="sf-reveal"
        style={{
          flex: "2 1 480px",
          minWidth: 0,
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(17, 18, 19, 0.06)",
        }}
      >
        {TERMS.map((t, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "16px 20px",
              borderBottom: i < TERMS.length - 1 ? "1px solid #e7e7e3" : undefined,
              fontSize: 16,
              lineHeight: "24px",
            }}
          >
            <span style={{ flex: "0 0 24px", fontWeight: 700, color: "#6b6b66" }}>{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ClosingBand() {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "#111213", color: "#f4f4f2" }}>
      <ClosingWorld3D />
      <div
        className="sf-reveal"
        style={{ ...container, position: "relative", padding: "96px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}
      >
        <h2 style={{ margin: 0, fontSize: "clamp(30px, 6vw, 44px)", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.03em", color: "#f4f4f2", maxWidth: 560 }}>
          Satu kode. Satu kesempatan.
        </h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: "26px", fontWeight: 500, color: "#b8bcbf", maxWidth: 440 }}>
          Punya kode unik? Masuk dengan Google, aktifkan kode, lalu spin untuk mendapatkan reward.
        </p>
        <a
          href="#roda"
          className="sf-round"
          style={{
            marginTop: 8,
            minHeight: 56,
            padding: "0 24px",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111213",
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 5px 0 #7d8286",
          }}
        >
          Kembali ke roda
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "#ffffff" }}>
      <div style={{ ...container, padding: "28px 16px 36px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="SNKRS FLASH" style={{ height: 30, width: "auto", display: "block" }} />
          <div style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500, color: "#6b6b66" }}>
            © 2026 SneakersFlash. Ada kendala? Chat CS di {OMT_PENDING.csWhatsapp}.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/" style={{ ...pill, padding: "0 14px", fontSize: 13 }}>
            sneakersflash.com
          </a>
          <a href={OMT_PENDING.instagramUrl} style={{ ...pill, padding: "0 14px", fontSize: 13 }}>
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
