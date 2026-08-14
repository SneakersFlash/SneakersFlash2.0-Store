"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  RODA_CX,
  RODA_CY,
  RODA_JARUM,
  RODA_R,
  RODA_SRC,
  sudutUntukSlot,
} from "@/lib/game/merdeka-game";

interface Props {
  /** Sisi kanvas dalam piksel logis. */
  ukuran?: number;
  /**
   * Juring pemenang dari server. null = roda diam menunggu.
   * Begitu berisi angka, roda berputar dan berhenti tepat di juring itu.
   */
  slot: number | null;
  /** Dipanggil sekali setelah roda benar-benar berhenti. */
  onBerhenti?: () => void;
  durasiMs?: number;
}

/**
 * Roda hadiah, digambar dari SPINWHEEL.png.
 *
 * Jarumnya ikut tergambar di dalam PNG yang sama, jadi gambarnya tidak bisa
 * sekadar diputar pakai CSS transform - jarumnya akan ikut berputar dan tidak
 * menunjuk apa-apa. Di sini piringan diputar terkurung lingkarannya, lalu jarum
 * digambar ulang di atasnya dalam keadaan diam.
 */
export function PrizeWheel({
  ukuran = 320,
  slot,
  onBerhenti,
  durasiMs = 4600,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const sudutRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const selesaiRef = useRef(onBerhenti);
  selesaiRef.current = onBerhenti;

  /** Menggambar satu bingkai pada sudut tertentu. */
  const gambar = useCallback(
    (derajat: number) => {
      const c = canvasRef.current;
      const img = imgRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx || !img || !img.complete || img.naturalWidth === 0) return;

      const S = ukuran;
      const cx = RODA_CX * S;
      const cy = RODA_CY * S;
      const r = RODA_R * S;

      ctx.clearRect(0, 0, S, S);

      // Piringan: dikurung lingkaran supaya segitiga jarum di bagian atas
      // gambar tidak ikut terbawa berputar.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(cx, cy);
      ctx.rotate((derajat * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      ctx.drawImage(img, 0, 0, S, S);
      ctx.restore();

      // Jarum, diam di tempat.
      const j = RODA_JARUM;
      const n = img.naturalWidth;
      ctx.drawImage(
        img,
        j.x * n,
        j.y * n,
        j.w * n,
        j.h * n,
        j.x * S,
        j.y * S,
        j.w * S,
        j.h * S,
      );
    },
    [ukuran],
  );

  // Muat gambar sekali, lalu gambar keadaan diamnya.
  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      c.width = ukuran * dpr;
      c.height = ukuran * dpr;
      c.getContext("2d")?.scale(dpr, dpr);
    }

    const img = new Image();
    img.onload = () => gambar(sudutRef.current);
    img.src = RODA_SRC;
    imgRef.current = img;
  }, [ukuran, gambar]);

  // Putar begitu server memberi tahu juring pemenangnya.
  useEffect(() => {
    if (slot === null) return;

    const mulai = sudutRef.current;
    const target = mulai + sudutUntukSlot(slot);
    const t0 = performance.now();

    const langkah = (t: number) => {
      const p = Math.min(1, (t - t0) / durasiMs);
      // Ease-out kuartik: putaran awal terasa deras lalu melambat panjang di
      // ujung. Itu yang bikin detik terakhirnya menegangkan.
      const e = 1 - Math.pow(1 - p, 4);
      sudutRef.current = mulai + (target - mulai) * e;
      gambar(sudutRef.current);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(langkah);
      } else {
        selesaiRef.current?.();
      }
    };

    rafRef.current = requestAnimationFrame(langkah);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [slot, durasiMs, gambar]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: ukuran, height: ukuran, maxWidth: "100%" }}
      className="block mx-auto"
      role="img"
      aria-label="Roda hadiah Merdeka Game dengan sembilan bagian"
    />
  );
}
