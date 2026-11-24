"use client";

/**
 * Halaman ONE MORE THING (/one-more-thing). Port dari
 * docs/one-more-thing/design/reference.dc.html — jangan diredesain.
 *
 * Kemiringan dunia hero: mouse di desktop, deviceorientation di HP. iOS 13+
 * butuh izin dari gestur pengguna, jadi diminta saat tombol pertama ditekan.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import "./one-more-thing.css";
import { HeroWorld3D, LogoPlaque3D } from "./Objects3D";
import { ClosingBand, Footer, Header, RewardGrid, StepsSlabs, Terms } from "./Sections";
import { WheelCard } from "./WheelCard";
import { getCampaign } from "@/lib/api/spin.service";

const CHECK = (
  <span
    aria-hidden="true"
    style={{
      flex: "0 0 32px",
      height: 32,
      borderRadius: 10,
      background: "#ffffff",
      boxShadow: "0 3px 0 #e2e2dd",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#085229",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </span>
);

const POINTS = ["Setiap spin valid pasti dapat reward", "1 kode unik = 1 kali spin", "Reward bisa diklaim saat belanja di website"];

export function OneMoreThing({ fontClass }: { fontClass: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const pending = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const tiltRef = useRef(tilt);
  tiltRef.current = tilt;
  const askedOrientation = useRef(false);
  const [testMode, setTestMode] = useState(false);

  // Badge "Mode testing" selama backend belum menyimpan hasil (lihat SpinService).
  useEffect(() => {
    getCampaign().then((c) => setTestMode(!!c?.testMode));
  }, []);

  const queueTilt = useCallback((x: number, y: number) => {
    pending.current = { x, y };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const p = pending.current;
      const cur = tiltRef.current;
      if (Math.abs(p.x - cur.x) > 0.4 || Math.abs(p.y - cur.y) > 0.4) setTilt({ x: p.x, y: p.y });
    });
  }, []);

  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      const ty = Math.max(-12, Math.min(12, e.gamma / 3));
      const tx = Math.max(-8, Math.min(8, (45 - (e.beta ?? 45)) / 5));
      queueTilt(tx, ty);
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [queueTilt]);

  // iOS 13+: izin sensor wajib dari gestur. Ditolak = jalan terus tanpa tilt.
  const onGesture = useCallback(() => {
    if (askedOrientation.current) return;
    askedOrientation.current = true;
    const DOE = (typeof window !== "undefined" ? (window as any).DeviceOrientationEvent : undefined) as
      | { requestPermission?: () => Promise<string> }
      | undefined;
    if (DOE && typeof DOE.requestPermission === "function") {
      DOE.requestPermission().catch(() => {});
    }
  }, []);

  return (
    <div
      className={`omt-root ${fontClass}`}
      style={{
        width: "100%",
        minHeight: "100%",
        background: "#f5f5f3",
        color: "#111213",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif",
        fontVariantNumeric: "tabular-nums",
        overflowX: "clip",
      }}
    >
      <Header />

      <section
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          queueTilt(-ny * 14, nx * 20);
        }}
        onMouseLeave={() => queueTilt(0, 0)}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <HeroWorld3D worldX={tilt.x * 0.7} worldY={tilt.y * 0.9} />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1120,
            margin: "0 auto",
            padding: "40px 16px 88px",
            boxSizing: "border-box",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 56,
          }}
        >
          <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
            <LogoPlaque3D />
            <h1
              className="sf-anim"
              style={{
                margin: 0,
                fontSize: "clamp(34px, 8vw, 54px)",
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                maxWidth: 560,
                transformOrigin: "50% 100%",
                animation: "sf-rise 1s cubic-bezier(.2,.8,.2,1) .15s both",
              }}
            >
              ONE MORE THING.
            </h1>
            <div
              className="sf-anim"
              style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480, animation: "sf-rise 1s cubic-bezier(.2,.8,.2,1) .28s both" }}
            >
              <p style={{ margin: 0, fontSize: 20, lineHeight: "26px", fontWeight: 600, letterSpacing: "-0.015em", color: "#111213" }}>
                Your pair is here. Now unlock the extra.
              </p>
              <p style={{ margin: 0, fontSize: 17, lineHeight: "26px", fontWeight: 500, color: "#4f4f4a" }}>
                Scan QR di kartu, masuk dengan Google, masukkan kode unik, lalu spin untuk reward yang bisa dipakai saat belanja berikutnya di
                sneakersflash.com.
              </p>
            </div>
            <ul
              className="sf-anim"
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                animation: "sf-rise 1s cubic-bezier(.2,.8,.2,1) .4s both",
              }}
            >
              {POINTS.map((p) => (
                <li key={p} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, lineHeight: "24px", fontWeight: 500 }}>
                  {CHECK}
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <WheelCard tiltX={tilt.x} tiltY={tilt.y} onGesture={onGesture} freeSpinMode={testMode} />
        </div>
      </section>

      <StepsSlabs />
      <RewardGrid />
      <Terms />
      <ClosingBand />
      <Footer />

      {testMode && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: 12,
            bottom: 12,
            zIndex: 40,
            padding: "8px 12px",
            borderRadius: 999,
            background: "#111213",
            color: "#f6e70a",
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 700,
            boxShadow: "0 6px 16px rgba(17, 18, 19, 0.25)",
          }}
        >
          MODE TESTING · free spin, hasil tidak disimpan
        </div>
      )}
    </div>
  );
}
