"use client";

import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import {
  BATAS_WAKTU_DETIK,
  BG_H_TAMPIL,
  BG_SRC,
  BONUS_PAS,
  GARIS_TANAH,
  KAMERA_MAKS,
  LEBAR_AWAL,
  PAPAN_H,
  PAPAN_W,
  TARGET_DUS,
  TINGGI_DUS,
  TOLERANSI_PAS,
  WARNA_DUS,
} from "@/lib/game/merdeka-game";

export interface KendaliGame {
  mulai: () => void;
  hentikan: () => void;
}

interface Props {
  /** Dipanggil tiap dus mendarat, buat memperbarui HUD di luar kanvas. */
  onProgres?: (dus: number, comboBeruntun: number) => void;
  onWaktu?: (sisaDetik: number) => void;
  /** Ronde berakhir. `sampaiPuncak` false berarti kalah (meleset / waktu habis). */
  onSelesai?: (hasil: {
    sampaiPuncak: boolean;
    dus: number;
    alasan: "waktu" | "meleset" | "puncak";
  }) => void;
  kendaliRef?: React.RefObject<KendaliGame | null>;
}

interface Dus {
  x: number;
  y: number;
  w: number;
  warna: number;
}

interface Potongan extends Dus {
  vy: number;
  vx: number;
  putar: number;
}

/**
 * Mesin permainan "susun dus".
 *
 * Seluruh keadaan permainan disimpan di useRef, bukan useState: loop-nya jalan
 * di requestAnimationFrame 60 kali per detik, dan memicu render React sesering
 * itu akan membuat halaman tersendat. React hanya diberi tahu lewat callback
 * saat ada kejadian yang memang perlu tampil di HUD.
 */
export function BoxClimbCanvas({
  onProgres,
  onWaktu,
  onSelesai,
  kendaliRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Callback disimpan di ref supaya loop animasi tidak perlu dibuat ulang tiap
  // kali induknya render - kalau tidak, animasinya putus-putus tiap setState.
  const cb = useRef({ onProgres, onWaktu, onSelesai });
  cb.current = { onProgres, onWaktu, onSelesai };

  const st = useRef({
    jalan: false,
    dus: [] as Dus[],
    gerak: null as (Dus & { arah: number; laju: number }) | null,
    potongan: [] as Potongan[],
    kamera: 0,
    kameraTarget: 0,
    sisaWaktu: BATAS_WAKTU_DETIK,
    beruntun: 0,
    terakhir: 0,
    persepuluhTerlapor: -1,
  });

  // -- Menggambar ------------------------------------------------------------

  const gambar = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = st.current;
    ctx.clearRect(0, 0, PAPAN_W, PAPAN_H);

    // Latar: kamera 0 memperlihatkan dasar gambar (rumput), kamera maksimum
    // memperlihatkan puncaknya (langit malam). Jadi satu ronde penuh persis
    // menyusuri seluruh tinggi gambar - itu sebabnya latarnya bergerak lebih
    // cepat dari menaranya, bukan lebih lambat seperti parallax biasa.
    const bg = bgRef.current;
    const jangkauan = BG_H_TAMPIL - PAPAN_H;
    const maju = Math.min(1, Math.max(0, s.kamera / KAMERA_MAKS));
    const bgTop = -jangkauan * (1 - maju);

    if (bg && bg.complete && bg.naturalWidth > 0) {
      ctx.drawImage(bg, 0, bgTop, PAPAN_W, BG_H_TAMPIL);
    } else {
      // Gambar belum termuat: isi warna langit malam supaya kanvasnya tidak
      // berkedip putih sebelum aset 1 MB itu selesai diunduh.
      ctx.fillStyle = "#020330";
      ctx.fillRect(0, 0, PAPAN_W, PAPAN_H);
    }

    // Semua yang di bawah ini digambar dalam koordinat dunia yang digeser kamera.
    ctx.save();
    ctx.translate(0, s.kamera);

    for (const p of s.potongan) gambarDus(ctx, p.x, p.y, p.w, p.warna, p.putar);
    for (const d of s.dus) gambarDus(ctx, d.x, d.y, d.w, d.warna, 0);

    if (s.gerak) {
      gambarDus(ctx, s.gerak.x, s.gerak.y, s.gerak.w, s.gerak.warna, 0);
      // Garis bantu vertikal ke dus tujuan: pemain butuh patokan sejajar,
      // bukan sekadar menebak dari ingatan posisi.
      const atas = s.dus[s.dus.length - 1];
      if (atas) {
        ctx.strokeStyle = "rgba(255,255,255,.35)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.gerak.x, s.gerak.y + TINGGI_DUS);
        ctx.lineTo(s.gerak.x, atas.y);
        ctx.moveTo(s.gerak.x + s.gerak.w, s.gerak.y + TINGGI_DUS);
        ctx.lineTo(s.gerak.x + s.gerak.w, atas.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, []);

  // -- Loop ------------------------------------------------------------------

  const langkah = useCallback(
    (waktu: number) => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;

      const s = st.current;
      const dt = Math.min(0.05, (waktu - s.terakhir) / 1000 || 0);
      s.terakhir = waktu;

      if (s.jalan) {
        s.sisaWaktu -= dt;

        // HUD waktu hanya diperbarui saat angka yang tampil benar-benar berubah.
        const persepuluh = Math.max(0, Math.ceil(s.sisaWaktu * 10));
        if (persepuluh !== s.persepuluhTerlapor) {
          s.persepuluhTerlapor = persepuluh;
          cb.current.onWaktu?.(Math.max(0, s.sisaWaktu));
        }

        if (s.sisaWaktu <= 0) {
          s.jalan = false;
          s.gerak = null;
          cb.current.onSelesai?.({
            sampaiPuncak: false,
            dus: s.dus.length - 1,
            alasan: "waktu",
          });
        }

        // Dus yang bergerak memantul di antara tepi papan.
        const g = s.gerak;
        if (g) {
          g.x += g.arah * g.laju * dt * 60;
          if (g.x <= 0) {
            g.x = 0;
            g.arah = 1;
          } else if (g.x + g.w >= PAPAN_W) {
            g.x = PAPAN_W - g.w;
            g.arah = -1;
          }
        }
      }

      // Potongan tetap jatuh walau ronde sudah berhenti - membekukannya
      // mendadak membuat layar akhir terasa patah.
      for (const p of s.potongan) {
        p.vy += 1400 * dt;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.putar += dt * 4 * Math.sign(p.vx || 1);
      }
      s.potongan = s.potongan.filter((p) => p.y + s.kamera < PAPAN_H + 200);

      // Kamera mengejar targetnya, tidak melompat: lompatan bikin mata
      // kehilangan puncak menara tepat saat pemain butuh melihatnya.
      s.kamera += (s.kameraTarget - s.kamera) * Math.min(1, dt * 8);

      gambar(ctx);
      rafRef.current = requestAnimationFrame(langkah);
    },
    [gambar],
  );

  // -- Aturan main -----------------------------------------------------------

  const lahirkanDus = useCallback(() => {
    const s = st.current;
    const atas = s.dus[s.dus.length - 1];
    const tingkat = s.dus.length - 1;
    // Makin tinggi makin cepat, tapi ada batasnya: di atas ~7 px per bingkai
    // dus bergeser lebih jauh dari toleransi "pas" dalam satu bingkai, jadi
    // berhasil-tidaknya jadi urusan nasib, bukan refleks.
    const laju = Math.min(7, 2.1 + tingkat * 0.28);

    s.gerak = {
      x: tingkat % 2 === 0 ? 0 : PAPAN_W - atas.w,
      y: atas.y - TINGGI_DUS,
      w: atas.w,
      warna: (atas.warna + 1) % WARNA_DUS.length,
      arah: tingkat % 2 === 0 ? 1 : -1,
      laju,
    };
  }, []);

  const jatuhkan = useCallback(() => {
    const s = st.current;
    if (!s.jalan || !s.gerak) return;

    const atas = s.dus[s.dus.length - 1];
    const g = s.gerak;
    const selisih = g.x - atas.x;
    const jarak = Math.abs(selisih);

    if (jarak >= atas.w) {
      // Meleset total: tidak ada bagian yang bertumpu.
      s.jalan = false;
      s.potongan.push({
        x: g.x,
        y: g.y,
        w: g.w,
        vy: 0,
        vx: selisih > 0 ? 160 : -160,
        putar: 0,
        warna: g.warna,
      });
      s.gerak = null;
      cb.current.onSelesai?.({
        sampaiPuncak: false,
        dus: s.dus.length - 1,
        alasan: "meleset",
      });
      return;
    }

    const pas = jarak <= TOLERANSI_PAS;
    let x: number;
    let w: number;

    if (pas) {
      // Hadiah ketepatan: dus disejajarkan sempurna dan justru melebar sedikit,
      // supaya pemain yang rapi tidak dihukum penyusutan yang tak terhindarkan.
      x = atas.x;
      w = Math.min(LEBAR_AWAL, atas.w + BONUS_PAS);
      s.beruntun += 1;
    } else {
      w = atas.w - jarak;
      x = selisih > 0 ? g.x : atas.x;
      s.beruntun = 0;

      // Sisa yang menggantung dipotong dan dijatuhkan.
      s.potongan.push({
        x: selisih > 0 ? atas.x + atas.w : g.x,
        y: g.y,
        w: jarak,
        vy: 0,
        vx: selisih > 0 ? 120 : -120,
        putar: 0,
        warna: g.warna,
      });
    }

    s.dus.push({ x, y: g.y, w, warna: g.warna });
    s.gerak = null;

    const tersusun = s.dus.length - 1;
    cb.current.onProgres?.(tersusun, s.beruntun);

    if (tersusun >= TARGET_DUS) {
      s.jalan = false;
      cb.current.onSelesai?.({
        sampaiPuncak: true,
        dus: tersusun,
        alasan: "puncak",
      });
      return;
    }

    s.kameraTarget = tersusun * TINGGI_DUS;
    lahirkanDus();
  }, [lahirkanDus]);

  const mulai = useCallback(() => {
    const s = st.current;
    s.dus = [
      {
        x: (PAPAN_W - LEBAR_AWAL) / 2,
        y: GARIS_TANAH - TINGGI_DUS,
        w: LEBAR_AWAL,
        warna: 0,
      },
    ];
    s.potongan = [];
    s.kamera = 0;
    s.kameraTarget = 0;
    s.sisaWaktu = BATAS_WAKTU_DETIK;
    s.beruntun = 0;
    s.persepuluhTerlapor = -1;
    s.jalan = true;
    lahirkanDus();
    cb.current.onProgres?.(0, 0);
    cb.current.onWaktu?.(BATAS_WAKTU_DETIK);
  }, [lahirkanDus]);

  const hentikan = useCallback(() => {
    st.current.jalan = false;
    st.current.gerak = null;
  }, []);

  useImperativeHandle(kendaliRef, () => ({ mulai, hentikan }), [
    mulai,
    hentikan,
  ]);

  // -- Pemasangan ------------------------------------------------------------

  useEffect(() => {
    const img = new Image();
    img.src = BG_SRC;
    bgRef.current = img;

    const c = canvasRef.current;
    if (c) {
      // Kanvas digambar pada resolusi layar, bukan resolusi logis: tanpa ini
      // garis dan tepinya kabur di layar ponsel ber-DPR tinggi.
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      c.width = PAPAN_W * dpr;
      c.height = PAPAN_H * dpr;
      c.getContext("2d")?.scale(dpr, dpr);
    }

    st.current.terakhir = performance.now();
    rafRef.current = requestAnimationFrame(langkah);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [langkah]);

  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        jatuhkan();
      }
    };
    window.addEventListener("keydown", tombol);
    return () => window.removeEventListener("keydown", tombol);
  }, [jatuhkan]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        e.preventDefault();
        jatuhkan();
      }}
      style={{ width: "100%", height: "auto", touchAction: "manipulation" }}
      className="block rounded-[18px] cursor-pointer select-none"
      role="img"
      aria-label="Menara dus sepatu yang sedang disusun"
    />
  );
}

/** Satu dus sepatu: badan, tepi, dan garis tutup di dekat atas. */
function gambarDus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  warnaIdx: number,
  putar: number,
) {
  const c = WARNA_DUS[warnaIdx % WARNA_DUS.length];
  ctx.save();
  if (putar) {
    ctx.translate(x + w / 2, y + TINGGI_DUS / 2);
    ctx.rotate(putar);
    ctx.translate(-w / 2, -TINGGI_DUS / 2);
  } else {
    ctx.translate(x, y);
  }

  ctx.fillStyle = c.badan;
  ctx.fillRect(0, 0, w, TINGGI_DUS);
  ctx.strokeStyle = c.tepi;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, TINGGI_DUS - 2);

  // Garis tutup dus, dilewati kalau dusnya sudah terlalu sempit untuk memuatnya.
  if (w > 26) {
    ctx.fillStyle = c.tepi;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(0, 6, w, 3);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
