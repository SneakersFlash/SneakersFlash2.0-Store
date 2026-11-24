"use client";

/**
 * Kartu roda ONE MORE THING: roda 3D, panel aksi (guest → kode → spin) dan
 * kartu hasil. Port dari reference.dc.html; urutan animasi spin mengikuti
 * HANDOFF §1 & §4. Reward SELALU dari server — roda cuma berhenti di
 * slotIndex yang dikembalikan playSpin().
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthStore } from "@/lib/store/authStore";
import { activateCode, playSpin, SpinApiError, type PlayResult } from "@/lib/api/spin.service";
import {
  OMT_COPY,
  OMT_REWARDS,
  OMT_SEGMENTS,
  OMT_SLOT_DEG,
  rewardDescription,
  spinTarget,
} from "@/lib/campaign/one-more-thing";
import { L11, PODIUM_LAYERS, ShoeBox3D, WHEEL_LAYERS, range } from "./Objects3D";

type Phase = "idle" | "wind" | "spin" | "win" | "done";
type CodeError = "" | "invalid" | "used" | "generic";

const CODE_KEY = "omt-code"; // ketikan kode, bertahan lewat popup login
const ACTIVE_KEY = "omt-active"; // kode yang sudah RESERVED

const MEDAL = {
  FLASH_POINT: { face: "#f6e70a", edge: "#c9bd00", fg: "#040707", ring: "#d4c600" },
  PHYSICAL: { face: "#ffffff", edge: "#d9d9d4", fg: "#111213", ring: "#e7e7e3" },
};

const SEGS = OMT_SEGMENTS.map((s, i) => ({ ...s, angle: i * OMT_SLOT_DEG + OMT_SLOT_DEG / 2 }));

const yellowShadow = "0 6px 0 #d4c600, 0 12px 20px rgba(17, 18, 19, 0.12)";
const primaryBtn = (enabled: boolean): CSSProperties => ({
  width: "100%",
  height: 64,
  border: 0,
  borderRadius: 10,
  fontFamily: "inherit",
  fontSize: 18,
  lineHeight: "24px",
  fontWeight: 700,
  cursor: enabled ? "pointer" : "default",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  background: enabled ? "#f6e70a" : "#efefec",
  color: enabled ? "#040707" : "#6b6b66",
  boxShadow: enabled ? yellowShadow : "none",
});
const linkBtn = (size: number): CSSProperties => ({
  minHeight: 44,
  padding: "0 6px",
  border: 0,
  background: "transparent",
  fontFamily: "inherit",
  fontWeight: 700,
  color: "#111213",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  cursor: "pointer",
  fontSize: size,
});

interface Piece {
  x: number;
  y: number;
  t: string;
  dur: string;
  delay: string;
  w: number;
  h: number;
  radius: string;
  color: string;
  border: string;
}

function makePieces(): Piece[] {
  const colors = ["#f6e70a", "#faa61a", "#111213", "#ffffff", "#f6e70a", "#faa61a"];
  return range(44, (i) => {
    const ang = -Math.PI * (0.05 + Math.random() * 0.9);
    const dist = 90 + Math.random() * 190;
    const round = Math.random() < 0.3;
    const color = colors[i % colors.length];
    return {
      x: Math.round(Math.cos(ang) * dist * 1.25),
      y: Math.round(Math.sin(ang) * dist),
      t: (0.7 + Math.random() * 0.4).toFixed(2),
      dur: (1.6 + Math.random() * 1.2).toFixed(2),
      delay: (0.45 + Math.random() * 0.35).toFixed(2),
      w: round ? 9 : 8,
      h: round ? 9 : 14,
      radius: round ? "50%" : "2px",
      color,
      border: color === "#ffffff" ? "1px solid #d9d9d4" : "0",
    };
  });
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function WheelCard({ tiltX, tiltY, onGesture }: { tiltX: number; tiltY: number; onGesture: () => void }) {
  const { loginWithGoogle } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const loggedIn = isHydrated && isAuthenticated;

  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<CodeError>("");
  const [codeActive, setCodeActive] = useState("");
  const [activating, setActivating] = useState(false);

  const [rot, setRot] = useState(-22.5);
  const [discT, setDiscT] = useState("none");
  const [phase, setPhase] = useState<Phase>("idle");
  const [tickDur, setTickDur] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinError, setSpinError] = useState(false);
  const [result, setResult] = useState<PlayResult | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [burst, setBurst] = useState(false);
  const [pieces, setPieces] = useState<Piece[]>([]);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Pulihkan kode yang diketik / sudah aktif setelah popup login atau refresh.
  useEffect(() => {
    try {
      setCodeInput(sessionStorage.getItem(CODE_KEY) || "");
      setCodeActive(sessionStorage.getItem(ACTIVE_KEY) || "");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(CODE_KEY, codeInput);
      if (codeActive) sessionStorage.setItem(ACTIVE_KEY, codeActive);
      else sessionStorage.removeItem(ACTIVE_KEY);
    } catch {}
  }, [codeInput, codeActive]);

  const done = !!result && (phase === "win" || phase === "done");
  const showSpin = loggedIn && !!codeActive && !done;
  const hasInput = codeInput.trim().length > 0;

  const login = async () => {
    onGesture();
    await loginWithGoogle();
  };

  const logout = () => {
    onGesture();
    clearAuth();
    setCodeInput("");
    setCodeError("");
    setCodeActive("");
  };

  const activate = async () => {
    onGesture();
    if (!hasInput || activating) return;
    setActivating(true);
    try {
      const res = await activateCode(codeInput);
      setCodeError("");
      setCodeActive(res.code);
    } catch (e) {
      const code = e instanceof SpinApiError ? e.code : "UNKNOWN";
      setCodeError(code === "CODE_INVALID" ? "invalid" : code === "CODE_USED" ? "used" : "generic");
    } finally {
      setActivating(false);
    }
  };

  const spin = async () => {
    onGesture();
    if (!codeActive || spinning || done) return;
    const reduced = prefersReducedMotion();
    const wind = rot - 20;
    setSpinError(false);
    setSpinning(true);
    setTickDur(0);
    // Wind-up dimulai BERSAMAAN dengan request ke server (HANDOFF §4).
    if (!reduced) {
      setPhase("wind");
      setDiscT("transform 0.4s cubic-bezier(0.5, 0, 0.75, 0)");
      setRot(wind);
    }
    const started = Date.now();
    let res: PlayResult;
    try {
      res = await playSpin(codeActive);
    } catch {
      // Hentikan roda, jangan tampilkan reward apa pun.
      setDiscT("transform .4s ease-out");
      setRot(wind + 20);
      setPhase("idle");
      setSpinning(false);
      setSpinError(true);
      return;
    }
    if (reduced) {
      setDiscT("none");
      setRot(360 - (res.slotIndex * OMT_SLOT_DEG + OMT_SLOT_DEG / 2));
      setResult(res);
      setSpinning(false);
      setPhase("done");
      setCodeActive("");
      return;
    }
    const wait = Math.max(0, 420 - (Date.now() - started));
    later(() => {
      setPhase("spin");
      setDiscT("transform 5.4s cubic-bezier(0.1, 0.75, 0.1, 1)");
      setRot(spinTarget(wind, res.slotIndex));
      setTickDur(0.08);
    }, wait);
    later(() => setTickDur(0.14), wait + 2000);
    later(() => setTickDur(0.26), wait + 3400);
    later(() => setTickDur(0.5), wait + 4400);
    later(() => {
      setResult(res);
      setSpinning(false);
      setPhase("win");
      setTickDur(0);
      setCodeActive("");
      setPieces(makePieces());
      setBurst(false);
      setConfetti(true);
    }, wait + 5500);
    later(() => setBurst(true), wait + 5560);
    later(() => {
      setConfetti(false);
      setPhase("done");
    }, wait + 8980);
  };

  const again = () => {
    onGesture();
    setResult(null);
    setPhase("idle");
    setCodeActive("");
    setCodeInput("");
    setCodeError("");
  };

  // ── Turunan tampilan ────────────────────────────────────────────────────
  const fast = phase === "wind" || phase === "spin";
  const win = phase === "win";
  let chip: [string, string, string, string];
  if (done) chip = ["Reward unlocked", "#e8f5ec", "#0a5a2b", "#2f9a5a"];
  else if (showSpin) chip = ["Kode aktif", "#e8f5ec", "#0a5a2b", "#2f9a5a"];
  else if (loggedIn) chip = ["Sudah masuk", "#eaf1ff", "#0b3d91", "#4b7fe0"];
  else chip = ["Belum masuk", "#efefec", "#4f4f4a", "#a5a5a0"];

  const reward = result ? OMT_REWARDS[result.rewardKey] : null;
  const medal = reward ? MEDAL[reward.type] : MEDAL.FLASH_POINT;
  const errorText =
    codeError === "invalid" ? OMT_COPY.codeInvalid : codeError === "used" ? OMT_COPY.codeUsed : codeError ? OMT_COPY.genericError : "";

  const fill: CSSProperties = { position: "absolute", left: 0, top: 0, width: 330, height: 330, borderRadius: "50%" };

  return (
    <div
      id="roda"
      className="sf-anim"
      style={{ flex: "1 1 400px", maxWidth: 480, minWidth: 0, position: "relative", animation: "sf-card-in 1.3s cubic-bezier(.2,.8,.2,1) .2s both" }}
    >
      <ShoeBox3D />
      <div
        style={{
          position: "relative",
          background: "#ffffff",
          borderRadius: 20,
          padding: 14,
          boxSizing: "border-box",
          boxShadow: "0 1px 3px rgba(17, 18, 19, 0.06), 0 30px 60px rgba(17, 18, 19, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 6px 0" }}>
          <div style={{ fontSize: 17, lineHeight: "22px", fontWeight: 600, letterSpacing: "-0.01em" }}>Roda hadiah</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: chip[1],
              color: chip[2],
              fontSize: 13,
              lineHeight: "16px",
              fontWeight: 600,
            }}
          >
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: chip[3] }} />
            {chip[0]}
          </div>
        </div>

        {/* ── Panggung 3D ── */}
        <div className="omt-stage-wrap" style={{ perspective: 1100, perspectiveOrigin: "50% 30%" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 330,
              height: 440,
              transformStyle: "preserve-3d",
              transform: `rotateX(${(tiltX + (spinning ? 6 : 0)).toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(${spinning ? 1.03 : 1})`,
              transition: "transform .5s cubic-bezier(.2,.7,.2,1)",
            }}
          >
            {/* podium */}
            <div aria-hidden="true" style={{ position: "absolute", left: 165, top: 396, width: 0, height: 0, transformStyle: "preserve-3d" }}>
              {PODIUM_LAYERS.map((l) => (
                <div
                  key={l.y}
                  style={{
                    position: "absolute",
                    left: -120,
                    top: -120,
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    background: l.color,
                    transform: `translateY(${l.y}px) rotateX(90deg)`,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  left: -120,
                  top: -120,
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: "#111213",
                  transform: "rotateX(90deg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="sf-anim"
                  style={{
                    position: "absolute",
                    left: 20,
                    top: 20,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    border: "2px solid #f6e70a",
                    boxSizing: "border-box",
                    animation: "sf-ring 2.6s ease-out infinite",
                  }}
                />
                <div
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    border: "3px solid #f6e70a",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="sf-anim"
                    style={{
                      width: 210,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(0, 0, 0, 0.7)",
                      filter: "blur(8px)",
                      animation: "sf-shadow 3.2s ease-in-out infinite alternate",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* roda */}
            <div
              className="sf-anim"
              style={{ position: "absolute", left: 0, top: 18, width: 330, height: 330, transformStyle: "preserve-3d", animation: "sf-float 3.2s ease-in-out infinite alternate" }}
            >
              <div
                className="sf-anim"
                style={{ position: "absolute", left: 0, top: 0, width: 330, height: 330, transformStyle: "preserve-3d", animation: "sf-sway 8s ease-in-out infinite alternate" }}
              >
                <div aria-hidden="true" style={{ ...fill, background: "#8f5a05", transform: "translateZ(-26px)" }} />
                {WHEEL_LAYERS.map((l) => (
                  <div key={l.z} aria-hidden="true" style={{ ...fill, background: l.color, transform: `translateZ(${l.z}px)` }} />
                ))}
                <div
                  aria-hidden="true"
                  style={{ ...fill, background: "#f6e70a", boxShadow: "inset 0 0 0 2px rgba(4, 7, 7, 0.06), inset 0 -6px 12px rgba(4, 7, 7, 0.1)" }}
                />

                <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, width: 330, height: 330, transform: "translateZ(1px)" }}>
                  {range(20, (i) => (
                    <div
                      key={i}
                      className="sf-anim"
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 8,
                        height: 8,
                        margin: "-4px 0 0 -4px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        transform: `rotate(${i * 18}deg) translateY(-159px)`,
                        animation: win
                          ? "sf-flash .5s ease-in-out 0s infinite"
                          : fast
                            ? `sf-bulb .45s ease-in-out ${(i * 0.0225).toFixed(3)}s infinite`
                            : `sf-bulb 1.6s ease-in-out ${(i * 0.08).toFixed(2)}s infinite`,
                      }}
                    />
                  ))}
                </div>

                <div
                  role="img"
                  aria-label="Roda hadiah berisi 8 hadiah"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 12,
                    width: 306,
                    height: 306,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background:
                      "conic-gradient(#f6e70a 0deg 45deg, #f5f5f3 45deg 90deg, #111213 90deg 135deg, #f5f5f3 135deg 180deg, #f6e70a 180deg 225deg, #f5f5f3 225deg 270deg, #111213 270deg 315deg, #f5f5f3 315deg 360deg)",
                    boxShadow: "inset 0 0 0 2px rgba(17, 18, 19, 0.08)",
                    transform: `translateZ(2px) rotate(${rot}deg)`,
                    transition: discT,
                  }}
                >
                  {SEGS.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 84,
                        height: 48,
                        margin: "-24px 0 0 -42px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        color: s.fg,
                        transform: `rotate(${s.angle}deg) translateY(-100px)`,
                      }}
                    >
                      <div style={{ fontSize: 20, lineHeight: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>{s.top}</div>
                      <div style={{ fontSize: 13, lineHeight: "16px", fontWeight: 600, letterSpacing: "-0.01em" }}>{s.cap}</div>
                    </div>
                  ))}
                </div>

                {done && (
                  <div
                    aria-hidden="true"
                    className="sf-anim"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 12,
                      width: 306,
                      height: 306,
                      borderRadius: "50%",
                      background: "conic-gradient(from -22.5deg, rgba(255, 255, 255, 0.6) 0deg 45deg, rgba(255, 255, 255, 0) 45deg 360deg)",
                      transform: "translateZ(3px)",
                      animation: "sf-glow .7s ease-in-out infinite alternate",
                    }}
                  />
                )}

                {/* hub */}
                <div aria-hidden="true" style={{ position: "absolute", left: 129, top: 129, width: 72, height: 72, transformStyle: "preserve-3d" }}>
                  {[
                    ["#b8ad00", 6],
                    ["#c9bd00", 10],
                    ["#d4c600", 14],
                  ].map(([c, z]) => (
                    <div
                      key={z}
                      style={{ position: "absolute", left: 0, top: 0, width: 72, height: 72, borderRadius: "50%", background: c as string, transform: `translateZ(${z}px)` }}
                    />
                  ))}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#f6e70a",
                      border: "4px solid #ffffff",
                      boxSizing: "border-box",
                      transform: "translateZ(18px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#040707",
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                    </svg>
                  </div>
                </div>

                {/* pointer */}
                <div aria-hidden="true" style={{ position: "absolute", left: 149, top: -18, width: 32, height: 52, transformStyle: "preserve-3d", transform: "translateZ(22px)" }}>
                  <div
                    className="sf-anim"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: 32,
                      height: 52,
                      transformStyle: "preserve-3d",
                      transformOrigin: "16px 16px",
                      animation: tickDur > 0 ? `sf-tick ${tickDur}s ease-in-out infinite` : "none",
                    }}
                  >
                    {[-5, -2.5].map((z) => (
                      <div key={z} style={{ position: "absolute", left: 0, top: 0, width: 32, height: 52, transform: `translateZ(${z}px)` }}>
                        <div style={{ position: "absolute", left: 0, top: 0, width: 32, height: 32, borderRadius: "50%", background: "#040707" }} />
                        <div
                          style={{
                            position: "absolute",
                            left: 4,
                            top: 24,
                            width: 0,
                            height: 0,
                            borderLeft: "12px solid transparent",
                            borderRight: "12px solid transparent",
                            borderTop: "26px solid #040707",
                          }}
                        />
                      </div>
                    ))}
                    <div style={{ position: "absolute", left: 0, top: 0, width: 32, height: 52 }}>
                      <div
                        style={{
                          position: "absolute",
                          left: 4,
                          top: 24,
                          width: 0,
                          height: 0,
                          borderLeft: "12px solid transparent",
                          borderRight: "12px solid transparent",
                          borderTop: "26px solid #111213",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "#111213",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f6e70a" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {confetti && (
            <div aria-hidden="true" style={{ position: "absolute", left: 165, top: 190, width: 0, height: 0, zIndex: 6, pointerEvents: "none" }}>
              {pieces.map((c, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: -5,
                    top: -7,
                    width: c.w,
                    height: c.h,
                    perspective: 300,
                    transform: `translate(${burst ? c.x : 0}px, ${burst ? c.y : 0}px)`,
                    transition: `transform ${c.t}s cubic-bezier(0.1, 0.8, 0.25, 1)`,
                  }}
                >
                  <div
                    className="sf-anim"
                    style={{
                      width: "100%",
                      height: "100%",
                      boxSizing: "border-box",
                      borderRadius: c.radius,
                      border: c.border,
                      background: c.color,
                      animation: `sf-fall ${c.dur}s cubic-bezier(0.45, 0, 0.75, 0.5) ${c.delay}s forwards`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Panel aksi ── */}
        {!done && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 6px 4px" }}>
            {!loggedIn && <GuestPanel onLogin={login} />}

            {loggedIn && !codeActive && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="sf-code" style={{ fontSize: 15, lineHeight: "20px", fontWeight: 600 }}>
                    Masukkan kode unik
                  </label>
                  <input
                    id="sf-code"
                    className="omt-code-input"
                    type="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="Kode dari stiker di kartu"
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") activate();
                    }}
                    aria-invalid={codeError ? "true" : "false"}
                    aria-describedby="sf-code-error"
                    style={{
                      width: "100%",
                      height: 56,
                      padding: "0 16px",
                      boxSizing: "border-box",
                      border: codeError ? "2px solid #d94141" : "1px solid #8a8a84",
                      borderRadius: 10,
                      background: "#efefec",
                      fontFamily: "inherit",
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#111213",
                    }}
                  />
                  {errorText && <ErrorAlert id="sf-code-error">{errorText}</ErrorAlert>}
                </div>
                <button type="button" className="sf-press" onClick={activate} disabled={!hasInput || activating} style={primaryBtn(hasInput && !activating)}>
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                    <path d="m21 2-9.6 9.6" />
                    <circle cx="7.5" cy="15.5" r="5.5" />
                  </svg>
                  Aktifkan kode
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 4,
                    fontSize: 13,
                    lineHeight: "18px",
                    fontWeight: 500,
                    color: "#6b6b66",
                  }}
                >
                  Sudah masuk dengan Google.
                  <button type="button" onClick={logout} style={linkBtn(13)}>
                    Ganti akun
                  </button>
                </div>
              </div>
            )}

            {showSpin && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: "#e8f5ec", color: "#0a5a2b" }}>
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "0 0 22px" }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 15, lineHeight: "20px", fontWeight: 700 }}>Kode aktif</div>
                    <div style={{ fontSize: 13, lineHeight: "18px", fontWeight: 600, letterSpacing: "0.04em" }}>{codeActive}</div>
                  </div>
                </div>
                <button type="button" className="sf-press" onClick={spin} disabled={spinning} style={primaryBtn(!spinning)}>
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  {spinning ? "Spinning…" : "SPIN NOW"}
                </button>
                {spinError && <ErrorAlert>{OMT_COPY.genericError}</ErrorAlert>}
              </div>
            )}
          </div>
        )}

        {/* ── Hasil ── */}
        {done && result && reward && (
          <div style={{ perspective: 1000, padding: "0 6px 4px" }}>
            <div
              aria-live="polite"
              className="sf-anim"
              style={{ display: "flex", flexDirection: "column", gap: 16, transformOrigin: "50% 0", animation: "sf-flip-in .9s cubic-bezier(.2,.8,.2,1) .15s both" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div aria-hidden="true" style={{ flex: "0 0 96px", height: 96, perspective: 500 }}>
                  <div className="sf-anim" style={{ position: "relative", width: 96, height: 96, transformStyle: "preserve-3d", animation: "sf-spin-y 4.5s linear infinite" }}>
                    {L11.map((z) => (
                      <div
                        key={z}
                        style={{ position: "absolute", left: 0, top: 0, width: 96, height: 96, borderRadius: "50%", background: medal.edge, transform: `translateZ(${z}px)` }}
                      />
                    ))}
                    {[false, true].map((back) => (
                      <div
                        key={String(back)}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          background: medal.face,
                          color: medal.fg,
                          border: `3px solid ${medal.ring}`,
                          boxSizing: "border-box",
                          transform: `${back ? "rotateY(180deg) " : ""}translateZ(6px)`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 22, lineHeight: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>{reward.top}</div>
                        <div style={{ fontSize: 13, lineHeight: "16px", fontWeight: 600 }}>{reward.cap}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                  <div
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "#e8f5ec",
                      color: "#0a5a2b",
                      fontSize: 13,
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Sukses
                  </div>
                  <div style={{ fontSize: 26, lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.02em" }}>REWARD UNLOCKED!</div>
                </div>
              </div>
              <div style={{ fontSize: 16, lineHeight: "24px", color: "#4f4f4a" }}>{rewardDescription(result.rewardKey)}</div>
              <a
                href="/"
                className="sf-press"
                style={{
                  height: 64,
                  borderRadius: 10,
                  background: "#f6e70a",
                  color: "#040707",
                  textDecoration: "none",
                  fontSize: 18,
                  lineHeight: "24px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: yellowShadow,
                }}
              >
                Belanja di sneakersflash.com
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <button
                type="button"
                onClick={again}
                style={{
                  height: 56,
                  marginBottom: 6,
                  border: 0,
                  borderRadius: 10,
                  background: "#efefec",
                  color: "#111213",
                  fontFamily: "inherit",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Aktifkan kode lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorAlert({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "12px 14px",
        borderRadius: 10,
        background: "#fdecec",
        color: "#931212",
        fontSize: 15,
        lineHeight: "20px",
        fontWeight: 600,
      }}
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flex: "0 0 20px" }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      {children}
    </div>
  );
}

function GuestPanel({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderRadius: 14, background: "#efefec" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span
            aria-hidden="true"
            style={{
              flex: "0 0 40px",
              height: 40,
              borderRadius: 10,
              background: "#ffffff",
              boxShadow: "0 3px 0 #dcdcd7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#111213",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </span>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ fontSize: 15, lineHeight: "20px", fontWeight: 600 }}>Kesempatan dari kode unik</div>
            <div style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500, color: "#4f4f4a" }}>Masuk dengan Google, lalu aktifkan kode unik</div>
          </div>
        </div>
        <div style={{ fontSize: 24, lineHeight: "30px", fontWeight: 700, letterSpacing: "-0.02em" }}>1x</div>
      </div>
      <button type="button" className="sf-press" onClick={onLogin} style={primaryBtn(true)}>
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="m10 17 5-5-5-5" />
          <path d="M15 12H3" />
        </svg>
        Masuk dengan Google
      </button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 4, fontSize: 15, lineHeight: "20px", color: "#4f4f4a" }}>
        Belum punya akun?
        <button type="button" onClick={onLogin} style={linkBtn(15)}>
          Daftar dengan Google
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 14, background: "#ffffff", boxShadow: "inset 0 0 0 1px #e7e7e3" }}>
        <span
          aria-hidden="true"
          style={{
            flex: "0 0 32px",
            height: 32,
            borderRadius: 10,
            background: "#f6e70a",
            boxShadow: "0 3px 0 #d4c600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#040707",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
          </svg>
        </span>
        <div style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500, color: "#4f4f4a" }}>
          <span style={{ fontWeight: 700, color: "#111213" }}>Baru pertama kali daftar?</span> Dapatkan voucher Rp100.000 untuk pengguna baru. Syarat dan
          ketentuan berlaku.
        </div>
      </div>
    </div>
  );
}
