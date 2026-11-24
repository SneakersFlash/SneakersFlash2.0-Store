/**
 * Benda-benda 3D CSS murni (tanpa Three.js) dari reference.dc.html:
 * koin bertumpuk, kubus, kotak hadiah, kotak sepatu, plakat logo.
 * Ketebalan = tumpukan lapisan dengan translateZ berbeda.
 */
import type { CSSProperties } from "react";

export const LOGO_SRC = "/images/one-more-thing/sf-logo.png";

export function lerpHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => {
    const x = (pa >> s) & 255;
    const y = (pb >> s) & 255;
    return Math.round(x + (y - x) * t);
  };
  return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

export const range = <T,>(n: number, fn: (i: number) => T) => Array.from({ length: n }, (_, i) => fn(i));

export const WHEEL_LAYERS = range(12, (i) => ({ z: -2 * (i + 1), color: lerpHex("#f0a015", "#a86b05", i / 11) }));
export const PODIUM_LAYERS = range(14, (i) => ({ y: 1.5 * (i + 1), color: lerpHex("#2a2d2f", "#0b0c0d", i / 13) }));
export const PLAQUE_LAYERS = range(8, (i) => ({ z: -1.5 * (i + 1), color: lerpHex("#e7e7e3", "#c9c9c3", i / 7) }));
export const L7 = range(7, (i) => i - 3);
export const L9 = range(9, (i) => i - 4);
export const L11 = range(11, (i) => i - 5);

const p3d: CSSProperties = { transformStyle: "preserve-3d" };
const fill: CSSProperties = { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" };

/** Anchor yang memosisikan benda di dunia 3D. */
function Anchor({ style, size, z, children, className }: { style: CSSProperties; size: number; z: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ position: "absolute", width: size, height: size, ...p3d, transform: `translateZ(${z}px)`, ...style }}>
      {children}
    </div>
  );
}

/**
 * Koin berputar sumbu Y. `variant` yellow = kuning + tepi #c9bd00 (9 lapis),
 * orange = oranye + tepi #c47e08 (7 lapis). `ring` = ukuran cincin dalam.
 */
export function Coin({
  size,
  variant,
  ring,
  label,
  bob,
  spin,
}: {
  size: number;
  variant: "yellow" | "orange";
  ring?: number;
  label?: string;
  bob?: string;
  spin: string;
}) {
  const yellow = variant === "yellow";
  const layers = yellow ? L9 : L7;
  const edge = yellow ? "#c9bd00" : "#c47e08";
  const face = yellow ? "#f6e70a" : "#faa61a";
  const ringColor = yellow ? "#d4c600" : "#c47e08";
  const depth = yellow ? 5 : 4;
  const faceEl = (back: boolean) => (
    <div
      style={{
        ...fill,
        width: size,
        height: size,
        borderRadius: "50%",
        background: face,
        transform: `${back ? "rotateY(180deg) " : ""}translateZ(${depth}px)`,
        ...(label ? { display: "flex", alignItems: "center", justifyContent: "center" } : {}),
      }}
    >
      {ring != null &&
        (label ? (
          <div
            style={{
              width: ring,
              height: ring,
              borderRadius: "50%",
              border: `2px solid ${ringColor}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 700,
              color: "#040707",
            }}
          >
            {label}
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: (size - ring) / 2,
              top: (size - ring) / 2,
              width: ring,
              height: ring,
              borderRadius: "50%",
              border: `2px solid ${ringColor}`,
              boxSizing: "border-box",
            }}
          />
        ))}
    </div>
  );
  const inner = (
    <div className="sf-anim" style={{ position: "relative", width: size, height: size, ...p3d, animation: spin }}>
      {layers.map((z) => (
        <div key={z} style={{ ...fill, borderRadius: "50%", background: edge, transform: `translateZ(${z}px)` }} />
      ))}
      {faceEl(false)}
      {faceEl(true)}
    </div>
  );
  if (!bob) return inner;
  return (
    <div className="sf-anim" style={{ width: size, height: size, ...p3d, animation: bob }}>
      {inner}
    </div>
  );
}

/** Kubus 6 sisi kuning/oranye. */
export function Cube({ size, anim }: { size: number; anim: string }) {
  const h = size / 2;
  const faces: [string, string][] = [
    ["#f6e70a", `translateZ(${h}px)`],
    ["#f6e70a", `rotateY(180deg) translateZ(${h}px)`],
    ["#d4c600", `rotateY(90deg) translateZ(${h}px)`],
    ["#d4c600", `rotateY(-90deg) translateZ(${h}px)`],
    ["#faa61a", `rotateX(90deg) translateZ(${h}px)`],
    ["#faa61a", `rotateX(-90deg) translateZ(${h}px)`],
  ];
  return (
    <div className="sf-anim" style={{ position: "relative", width: size, height: size, ...p3d, animation: anim }}>
      {faces.map(([bg, t], i) => (
        <div key={i} style={{ ...fill, width: size, height: size, background: bg, transform: t }} />
      ))}
    </div>
  );
}

/** Kotak hadiah putih berpita kuning (92px). */
function GiftBox() {
  const s = 92;
  const side = (bg: string, ribbon: string, t: string) => (
    <div style={{ ...fill, width: s, height: s, background: bg, transform: t, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 16, background: ribbon }} />
    </div>
  );
  return (
    <div className="sf-anim" style={{ width: s, height: s, ...p3d, animation: "sf-bob 4.4s ease-in-out .6s infinite alternate" }}>
      <div className="sf-anim" style={{ position: "relative", width: s, height: s, ...p3d, animation: "sf-tumble 26s linear infinite" }}>
        {side("#ffffff", "#f6e70a", "translateZ(46px)")}
        {side("#ffffff", "#f6e70a", "rotateY(180deg) translateZ(46px)")}
        {side("#ecece8", "#e0d200", "rotateY(90deg) translateZ(46px)")}
        {side("#ecece8", "#e0d200", "rotateY(-90deg) translateZ(46px)")}
        <div
          style={{
            ...fill,
            width: s,
            height: s,
            background: "#f5f5f3",
            transform: "rotateX(90deg) translateZ(46px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", left: 38, top: 0, width: 16, height: 92, background: "#f6e70a" }} />
          <div style={{ position: "absolute", left: 0, top: 38, width: 92, height: 16, background: "#f6e70a" }} />
        </div>
        <div style={{ ...fill, width: s, height: s, background: "#dcdcd7", transform: "rotateX(-90deg) translateZ(46px)" }} />
      </div>
    </div>
  );
}

/** Dunia 3D di belakang hero. Miring ikut mouse / deviceorientation. */
export function HeroWorld3D({ worldX, worldY }: { worldX: number; worldY: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, perspective: 1400, perspectiveOrigin: "50% 40%", pointerEvents: "none", zIndex: 0 }}
    >
      <div
        style={{
          ...fill,
          ...p3d,
          transform: `rotateX(${worldX.toFixed(2)}deg) rotateY(${worldY.toFixed(2)}deg)`,
          transition: "transform .7s cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <Anchor className="omt-o-gift" style={{ right: "3%", top: "80%" }} size={92} z={-60}>
          <GiftBox />
        </Anchor>
        <Anchor className="omt-o-cube" style={{ right: "6%", top: "5%" }} size={48} z={-260}>
          <Cube size={48} anim="sf-tumble 18s linear infinite reverse" />
        </Anchor>
        <Anchor className="omt-o-fp" style={{ left: "46%", top: "5%" }} size={72} z={-340}>
          <Coin size={72} variant="yellow" ring={52} label="FP" bob="sf-bob 3.8s ease-in-out infinite alternate" spin="sf-spin-y 6s linear infinite" />
        </Anchor>
        <Anchor className="omt-o-orange" style={{ right: "24%", top: "3%" }} size={44} z={40}>
          <Coin size={44} variant="orange" ring={24} bob="sf-bob 3.2s ease-in-out .3s infinite alternate" spin="sf-spin-y 4.2s linear infinite reverse" />
        </Anchor>
        <Anchor className="omt-o-yellow" style={{ left: "38%", top: "90%" }} size={54} z={80}>
          <Coin size={54} variant="yellow" ring={36} bob="sf-bob 3.6s ease-in-out 1s infinite alternate" spin="sf-spin-y 5s linear infinite" />
        </Anchor>
      </div>
    </div>
  );
}

/** Dunia 3D di pita penutup gelap. */
export function ClosingWorld3D() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, perspective: 1000, pointerEvents: "none" }}>
      <div style={{ ...fill, ...p3d }}>
        <Anchor style={{ left: "6%", top: "18%" }} size={64} z={-80}>
          <Coin size={64} variant="yellow" ring={42} bob="sf-bob 3.4s ease-in-out infinite alternate" spin="sf-spin-y 5.5s linear infinite" />
        </Anchor>
        <Anchor style={{ right: "8%", top: "58%" }} size={42} z={40}>
          <Coin size={42} variant="orange" bob="sf-bob 3s ease-in-out .5s infinite alternate" spin="sf-spin-y 4s linear infinite reverse" />
        </Anchor>
        <Anchor style={{ right: "16%", top: "12%" }} size={50} z={-160}>
          <Cube size={50} anim="sf-tumble 16s linear infinite" />
        </Anchor>
      </div>
    </div>
  );
}

/** Plakat logo 3D bergoyang + bayangan. */
export function LogoPlaque3D() {
  return (
    <div
      className="sf-anim"
      style={{
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "sf-rise 1s cubic-bezier(.2,.8,.2,1) .05s both",
      }}
    >
      <div style={{ width: 210, height: 112, perspective: 800 }}>
        <div className="sf-anim" style={{ position: "relative", width: 210, height: 112, ...p3d, animation: "sf-plaque 7s ease-in-out infinite alternate" }}>
          {PLAQUE_LAYERS.map((l) => (
            <div key={l.z} style={{ ...fill, borderRadius: 20, background: l.color, transform: `translateZ(${l.z}px)` }} />
          ))}
          <div
            style={{
              ...fill,
              borderRadius: 20,
              background: "#ffffff",
              transform: "translateZ(1px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="SNKRS FLASH" style={{ width: 156, height: "auto", display: "block" }} />
          </div>
        </div>
      </div>
      <div
        className="sf-anim"
        style={{
          width: 170,
          height: 18,
          marginTop: 14,
          borderRadius: "50%",
          background: "rgba(17, 18, 19, 0.14)",
          filter: "blur(7px)",
          animation: "sf-shadow 3.5s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}

/** Kotak sepatu hitam kecil di pojok kanan bawah kartu roda. */
export function ShoeBox3D() {
  const s = 60;
  const face = (bg: string, lid: string, t: string, stripe: boolean) => (
    <div style={{ ...fill, width: s, height: s, background: bg, transform: t, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 13, background: lid }} />
      {stripe && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 26, height: 6, borderRadius: 3, background: "#f6e70a" }} />
        </div>
      )}
    </div>
  );
  return (
    <div
      aria-hidden="true"
      className="sf-anim"
      style={{
        position: "absolute",
        bottom: -40,
        right: 12,
        width: s,
        height: s,
        perspective: 500,
        zIndex: 3,
        pointerEvents: "none",
        animation: "sf-bob 4.2s ease-in-out infinite alternate",
      }}
    >
      <div style={{ width: s, height: s, ...p3d, transform: "rotateX(-22deg)" }}>
        <div className="sf-anim" style={{ position: "relative", width: s, height: s, ...p3d, animation: "sf-spin-y 12s linear infinite" }}>
          {face("#111213", "#2a2d2f", "translateZ(30px)", true)}
          {face("#111213", "#2a2d2f", "rotateY(180deg) translateZ(30px)", true)}
          {face("#1c1e20", "#34373a", "rotateY(90deg) translateZ(30px)", false)}
          {face("#1c1e20", "#34373a", "rotateY(-90deg) translateZ(30px)", false)}
          <div
            style={{
              ...fill,
              width: s,
              height: s,
              background: "#3a3d40",
              transform: "rotateX(90deg) translateZ(30px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 4, background: "#faa61a" }} />
          </div>
          <div style={{ ...fill, width: s, height: s, background: "#040707", transform: "rotateX(-90deg) translateZ(30px)" }} />
        </div>
      </div>
    </div>
  );
}
