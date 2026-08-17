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
  MEREK_DUS,
  PAPAN_H,
  PAPAN_W,
  TARGET_DUS,
  TINGGI_DUS,
  TINGGI_GANTUNGAN,
  TOLERANSI_PAS,
  WARNA,
  lajuDus,
  type MerekDus,
} from "@/lib/game/merdeka-game";
import { blip, fanfarMenang } from "@/lib/game/suara";

export interface KendaliGame {
  mulai: () => void;
  hentikan: () => void;
  /** Hambur konfeti. Dipakai juga saat roda berhenti di hadiah. */
  pesta: () => void;
}

interface Props {
  /** Dipanggil tiap dus mendarat, buat memperbarui HUD di luar kanvas. */
  onProgres?: (dus: number, comboBeruntun: number) => void;
  onWaktu?: (sisaDetik: number) => void;
  /** Ronde berakhir. `sampaiPuncak` false berarti kalah (meleset / waktu habis). */
  onSelesai?: (hasil: {
    sampaiPuncak: boolean;
    dus: number;
    beruntunTerbaik: number;
    alasan: "waktu" | "meleset" | "puncak";
  }) => void;
  kendaliRef?: React.RefObject<KendaliGame | null>;
}

/**
 * Satu dus di menara.
 *
 * `y` diukur dari GARIS TANAH ke ATAS, bukan dari puncak kanvas ke bawah -
 * konvensi ini disalin dari demo artifact dan sengaja dipertahankan supaya
 * seluruh kode gambarnya bisa dipindah apa adanya. Layar dihitung belakangan:
 * `sy = garisTanahLayar - y - TINGGI_DUS`.
 */
interface Dus {
  x: number;
  y: number;
  w: number;
  merek: number;
  pas: boolean;
  /** Sisa jarak jatuh dari gantungan ke slotnya, dihabiskan tiap bingkai. */
  dy: number;
}

interface Potongan {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  merek: number;
}

interface Teks {
  x: number;
  y: number;
  t: string;
  umur: number;
}

interface Konfeti {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  c: string;
}

/**
 * Mesin permainan "The 17-Box Climb", dipindahkan dari demo artifact.
 *
 * Seluruh keadaan permainan disimpan di useRef, bukan useState: loop-nya jalan
 * di requestAnimationFrame 60 kali per detik, dan memicu render React sesering
 * itu akan membuat halaman tersendat. React hanya diberi tahu lewat callback
 * saat ada kejadian yang memang perlu tampil di HUD.
 *
 * Demo aslinya menghitung gerak per BINGKAI (mengandaikan 60 fps). Di sini tiap
 * pertambahan dikali `f = dt * 60`, jadi angkanya persis sama di 60 Hz tapi
 * tidak jadi dua kali lipat cepat di layar 120 Hz.
 */
export function BoxClimbCanvas({
  onProgres,
  onWaktu,
  onSelesai,
  kendaliRef,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Callback disimpan di ref supaya loop animasi tidak perlu dibuat ulang tiap
  // kali induknya render - kalau tidak, animasinya putus-putus tiap setState.
  const cb = useRef({ onProgres, onWaktu, onSelesai });
  cb.current = { onProgres, onWaktu, onSelesai };

  const st = useRef({
    jalan: false,
    dus: [] as Dus[],
    gerak: null as {
      x: number;
      y: number;
      w: number;
      arah: number;
      laju: number;
      merek: number;
    } | null,
    potongan: [] as Potongan[],
    teks: [] as Teks[],
    konfeti: [] as Konfeti[],
    kamera: 0,
    sisaWaktu: BATAS_WAKTU_DETIK,
    beruntun: 0,
    terbaik: 0,
    terakhir: 0,
    persepuluhTerlapor: -1,
  });

  const puncak = () => st.current.dus[st.current.dus.length - 1];
  const tersusun = () => st.current.dus.length - 1;

  // -- Konfeti ---------------------------------------------------------------

  const pesta = useCallback(() => {
    st.current.konfeti = Array.from({ length: 90 }, () => ({
      x: Math.random() * PAPAN_W,
      y: -Math.random() * 200,
      w: Math.random() * 7 + 4,
      h: Math.random() * 5 + 4,
      vy: Math.random() * 2.4 + 1.6,
      vx: (Math.random() - 0.5) * 1.6,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3,
      c: [WARNA.merah, WARNA.putih, WARNA.emas][(Math.random() * 3) | 0],
    }));
  }, []);

  // -- Menggambar ------------------------------------------------------------

  const gambar = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = st.current;

    // Latar: kamera 0 memperlihatkan dasar gambar (rumput + panjat pinang),
    // kamera maksimum memperlihatkan puncaknya (langit malam berbintang).
    // Gambarnya sudah dipotong setinggi pendakian, jadi pemetaannya 1:1 -
    // garis rumput di gambar menempel di dasar menara sepanjang ronde.
    const bg = bgRef.current;
    const kam = Math.max(0, Math.min(KAMERA_MAKS, s.kamera));
    if (bg && bg.complete && bg.naturalWidth > 0) {
      ctx.drawImage(bg, 0, kam - (BG_H_TAMPIL - PAPAN_H), PAPAN_W, BG_H_TAMPIL);
    } else {
      // Gambar belum termuat: isi warna langit malam supaya kanvasnya tidak
      // berkedip putih sebelum asetnya selesai diunduh.
      ctx.fillStyle = "#020330";
      ctx.fillRect(0, 0, PAPAN_W, PAPAN_H);
    }

    const gy = GARIS_TANAH + s.kamera; // garis tanah, dalam koordinat layar

    // Menara. `dy` dihabiskan di loop supaya dus terlihat jatuh dari gantungan
    // ke slotnya, bukan tiba-tiba nempel.
    for (const d of s.dus) {
      const sy = gy - d.y - TINGGI_DUS - d.dy;
      if (sy > PAPAN_H + 40 || sy < -60) continue;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      gambarDus(ctx, d.x, sy, d.w, TINGGI_DUS, d.merek, d.pas, 0);
      ctx.restore();
    }

    // Serpihan yang terpotong, berjatuhan sambil berputar.
    s.potongan = s.potongan.filter((p) => {
      const sy = gy - p.y - TINGGI_DUS;
      if (sy > PAPAN_H + 80) return false;
      ctx.globalAlpha = 0.95;
      gambarDus(ctx, p.x, sy, p.w, p.h, p.merek, false, p.rot);
      ctx.globalAlpha = 1;
      return true;
    });

    // Dus yang sedang digantung crane.
    const g = s.gerak;
    if (g && s.jalan) {
      const sy = gy - g.y - TINGGI_DUS;
      const cx = g.x + g.w / 2;
      const simpul = Math.max(sy - 46, 8);

      ctx.strokeStyle = "rgba(255,244,232,.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, sy);
      ctx.lineTo(cx, simpul);
      ctx.stroke();
      ctx.fillStyle = WARNA.emas;
      ctx.beginPath();
      ctx.arc(cx, simpul, 4.5, 0, 7);
      ctx.fill();

      // Bayangan tumpang tindih di atas dus puncak: satu-satunya petunjuk
      // seberapa lurus bidikannya, dan lebih terbaca daripada garis putus-putus.
      const t = puncak();
      const kiri = Math.max(g.x, t.x);
      const kanan = Math.min(g.x + g.w, t.x + t.w);
      if (kanan > kiri) {
        ctx.fillStyle = "rgba(8,13,34,.32)";
        ctx.fillRect(kiri, gy - t.y - TINGGI_DUS - 3, kanan - kiri, 3);
      }

      gambarDus(ctx, g.x, sy, g.w, TINGGI_DUS, g.merek, false, 0);
    }

    // Tulisan "PAS!" yang mengambang naik lalu memudar.
    s.teks = s.teks.filter((t) => {
      if (t.umur <= 0) return false;
      ctx.globalAlpha = Math.min(1, t.umur * 1.8);
      ctx.font = "700 19px ui-monospace, Menlo, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.lineWidth = 4;
      ctx.strokeStyle = WARNA.garis;
      ctx.strokeText(t.t, t.x, gy - t.y);
      ctx.fillStyle = WARNA.emas;
      ctx.fillText(t.t, t.x, gy - t.y);
      ctx.globalAlpha = 1;
      return true;
    });

    umbulUmbul(ctx);

    // Vignette: menekan sudut-sudut supaya mata jatuh ke menara di tengah.
    const vg = ctx.createRadialGradient(
      PAPAN_W / 2,
      PAPAN_H / 2,
      PAPAN_H * 0.35,
      PAPAN_W / 2,
      PAPAN_H / 2,
      PAPAN_H * 0.78,
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(4,7,20,.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, PAPAN_W, PAPAN_H);
  }, []);

  const gambarFx = useCallback((fx: CanvasRenderingContext2D) => {
    const s = st.current;
    fx.clearRect(0, 0, PAPAN_W, PAPAN_H);
    if (!s.konfeti.length) return;
    s.konfeti = s.konfeti.filter((p) => {
      if (p.y > PAPAN_H + 20) return false;
      fx.save();
      fx.translate(p.x, p.y);
      fx.rotate(p.rot);
      fx.fillStyle = p.c;
      fx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      fx.restore();
      return true;
    });
  }, []);

  // -- Loop ------------------------------------------------------------------

  const langkah = useCallback(
    (waktu: number) => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      const fx = fxRef.current?.getContext("2d");
      if (!c || !ctx) return;

      const s = st.current;
      const dt = Math.min(0.05, (waktu - s.terakhir) / 1000 || 0);
      s.terakhir = waktu;
      const f = dt * 60; // pengali "berapa bingkai 60 Hz yang lewat"

      if (s.jalan) {
        s.sisaWaktu -= dt;

        // HUD waktu hanya diperbarui saat angka yang tampil benar-benar berubah.
        const persepuluh = Math.max(0, Math.ceil(s.sisaWaktu * 10));
        if (persepuluh !== s.persepuluhTerlapor) {
          s.persepuluhTerlapor = persepuluh;
          cb.current.onWaktu?.(Math.max(0, s.sisaWaktu));
        }

        if (s.sisaWaktu <= 0) {
          s.sisaWaktu = 0;
          s.jalan = false;
          s.gerak = null;
          blip(150, 0.3, "sawtooth", 0.09);
          cb.current.onSelesai?.({
            sampaiPuncak: false,
            dus: tersusun(),
            beruntunTerbaik: s.terbaik,
            alasan: "waktu",
          });
        }

        // Dus yang digantung memantul di antara tepi papan, dan selalu
        // menggantung setinggi TINGGI_GANTUNGAN di atas puncak menara.
        const g = s.gerak;
        if (g) {
          g.x += g.arah * g.laju * f;
          if (g.x <= 4) {
            g.x = 4;
            g.arah = 1;
          } else if (g.x + g.w >= PAPAN_W - 4) {
            g.x = PAPAN_W - 4 - g.w;
            g.arah = -1;
          }
          g.y = puncak().y + TINGGI_DUS + TINGGI_GANTUNGAN;
        }
      }

      // Dus yang baru mendarat menyusul turun ke slotnya.
      for (const d of s.dus) {
        if (d.dy > 0) d.dy = Math.max(0, d.dy - 34 * f);
      }

      // Potongan tetap jatuh walau ronde sudah berhenti - membekukannya
      // mendadak membuat layar akhir terasa patah.
      for (const p of s.potongan) {
        p.vy += 0.5 * f;
        p.y -= p.vy * f;
        p.x += p.vx * f;
        p.rot += p.vr * f;
      }

      for (const t of s.teks) {
        t.umur -= 0.018 * f;
        t.y += 0.7 * f;
      }

      for (const p of s.konfeti) {
        p.y += p.vy * f;
        p.x += (p.vx + Math.sin(p.y / 34) * 0.6) * f;
        p.rot += p.vr * f;
      }

      // Kamera mengejar targetnya, tidak melompat: lompatan bikin mata
      // kehilangan puncak menara tepat saat pemain butuh melihatnya.
      const target = Math.max(0, puncak().y + TINGGI_DUS - PAPAN_H * 0.4);
      s.kamera += (target - s.kamera) * Math.min(1, 7.2 * dt);

      gambar(ctx);
      if (fx) gambarFx(fx);
      rafRef.current = requestAnimationFrame(langkah);
    },
    [gambar, gambarFx],
  );

  // -- Aturan main -----------------------------------------------------------

  const lahirkanDus = useCallback(() => {
    const s = st.current;
    const t = puncak();
    const tingkat = tersusun();
    s.gerak = {
      x: tingkat % 2 === 0 ? 6 : PAPAN_W - t.w - 6,
      y: t.y + TINGGI_DUS + TINGGI_GANTUNGAN,
      w: t.w,
      arah: tingkat % 2 === 0 ? 1 : -1,
      laju: lajuDus(tingkat),
      merek: (tingkat + 1) % MEREK_DUS.length,
    };
  }, []);

  const jatuhkan = useCallback(() => {
    const s = st.current;
    if (!s.jalan || !s.gerak) return;

    const t = puncak();
    const g = s.gerak;
    const selisih = g.x - t.x;
    const jarak = Math.abs(selisih);

    // Meleset total: tidak ada bagian yang bertumpu.
    if (jarak >= t.w) {
      s.jalan = false;
      s.potongan.push({
        x: g.x,
        y: g.y,
        w: g.w,
        h: TINGGI_DUS,
        vx: g.arah * 1.4,
        vy: 2,
        rot: 0,
        vr: 0.12,
        merek: g.merek,
      });
      s.gerak = null;
      blip(150, 0.3, "sawtooth", 0.09);
      cb.current.onSelesai?.({
        sampaiPuncak: false,
        dus: tersusun(),
        beruntunTerbaik: s.terbaik,
        alasan: "meleset",
      });
      return;
    }

    const pas = jarak <= TOLERANSI_PAS;
    let x: number;
    let w: number;

    if (pas) {
      // Hadiah ketepatan: dusnya justru melebar sedikit dan dapat pita emas,
      // supaya pemain yang rapi tidak dihukum penyusutan yang tak terhindarkan.
      w = Math.min(t.w + BONUS_PAS, LEBAR_AWAL);
      x = t.x - (w - t.w) / 2;
      s.beruntun += 1;
      s.terbaik = Math.max(s.terbaik, s.beruntun);
      s.teks.push({
        x: x + w / 2,
        y: t.y + TINGGI_DUS + 16,
        t: s.beruntun > 1 ? "PAS x" + s.beruntun : "PAS!",
        umur: 1,
      });
      blip(760 + Math.min(s.beruntun, 8) * 70, 0.12, "triangle", 0.07);
    } else {
      w = t.w - jarak;
      x = selisih > 0 ? g.x : t.x;
      s.beruntun = 0;
      // Sisa yang menggantung dipotong dan dijatuhkan.
      s.potongan.push({
        x: selisih > 0 ? t.x + t.w : g.x,
        y: t.y + TINGGI_DUS,
        w: jarak,
        h: TINGGI_DUS,
        vx: selisih > 0 ? 1.6 : -1.6,
        vy: 1,
        rot: 0,
        vr: selisih > 0 ? 0.1 : -0.1,
        merek: g.merek,
      });
      blip(330, 0.09, "square", 0.05);
    }

    s.dus.push({
      x,
      w,
      y: t.y + TINGGI_DUS,
      merek: g.merek,
      pas,
      dy: g.y - (t.y + TINGGI_DUS),
    });
    s.gerak = null;

    const n = tersusun();
    cb.current.onProgres?.(n, s.beruntun);

    if (n >= TARGET_DUS) {
      s.jalan = false;
      pesta();
      fanfarMenang();
      cb.current.onSelesai?.({
        sampaiPuncak: true,
        dus: n,
        beruntunTerbaik: s.terbaik,
        alasan: "puncak",
      });
      return;
    }

    lahirkanDus();
  }, [lahirkanDus, pesta]);

  /** Menara dasar: satu dus di tengah, berdiri di garis rumput. */
  const dusDasar = (): Dus => ({
    x: (PAPAN_W - LEBAR_AWAL) / 2,
    y: 0,
    w: LEBAR_AWAL,
    merek: 0,
    pas: false,
    dy: 0,
  });

  const mulai = useCallback(() => {
    const s = st.current;
    s.dus = [dusDasar()];
    s.potongan = [];
    s.teks = [];
    s.konfeti = [];
    s.kamera = 0;
    s.sisaWaktu = BATAS_WAKTU_DETIK;
    s.beruntun = 0;
    s.terbaik = 0;
    s.persepuluhTerlapor = -1;
    s.jalan = true;
    lahirkanDus();
    blip(520, 0.1);
    cb.current.onProgres?.(0, 0);
    cb.current.onWaktu?.(BATAS_WAKTU_DETIK);
  }, [lahirkanDus]);

  const hentikan = useCallback(() => {
    st.current.jalan = false;
    st.current.gerak = null;
  }, []);

  useImperativeHandle(kendaliRef, () => ({ mulai, hentikan, pesta }), [
    mulai,
    hentikan,
    pesta,
  ]);

  // -- Pemasangan ------------------------------------------------------------

  useEffect(() => {
    const img = new Image();
    img.src = BG_SRC;
    bgRef.current = img;

    // Kanvas digambar pada resolusi layar, bukan resolusi logis: tanpa ini
    // garis dan tepinya kabur di layar ponsel ber-DPR tinggi.
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    for (const c of [canvasRef.current, fxRef.current]) {
      if (!c) continue;
      c.width = PAPAN_W * dpr;
      c.height = PAPAN_H * dpr;
      c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Menara dasar sudah berdiri sebelum ronde dimulai, jadi layar "siap" tidak
    // memperlihatkan papan kosong di balik lapisannya.
    const s = st.current;
    if (!s.dus.length) s.dus = [dusDasar()];

    s.terakhir = performance.now();
    rafRef.current = requestAnimationFrame(langkah);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langkah]);

  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      if (!st.current.jalan) return;
      e.preventDefault();
      jatuhkan();
    };
    window.addEventListener("keydown", tombol);
    return () => window.removeEventListener("keydown", tombol);
  }, [jatuhkan]);

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault();
          jatuhkan();
        }}
        style={{ width: "100%", height: "auto", touchAction: "manipulation" }}
        className="block cursor-pointer select-none"
        role="img"
        aria-label="Menara dus sepatu yang sedang disusun"
      />
      {/* Konfeti sengaja di lapisan paling atas: dia juga dipakai saat roda
          berhenti, jadi harus terlihat menimpa layar hadiah. */}
      <canvas
        ref={fxRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      />
    </>
  );
}

// -- Menggambar dus sepatu ---------------------------------------------------
//
// Semua yang di bawah ini dipindahkan dari demo artifact tanpa diubah bentuknya:
// dus digambar sebagai kemasan ritel (badan + tutup + label ukuran + logo),
// bukan balok warna. Logonya digambar sebagai bentuk kanvas, bukan berkas aset,
// supaya tetap tajam di ukuran berapa pun dan tidak menambah unduhan.

function rrect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rr, y);
  g.arcTo(x + w, y, x + w, y + h, rr);
  g.arcTo(x + w, y + h, x, y + h, rr);
  g.arcTo(x, y + h, x, y, rr);
  g.arcTo(x, y, x + w, y, rr);
  g.closePath();
}

/** Swoosh Nike: satu bentuk tertutup, lancip ke kanan atas. */
function tandaSwoosh(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  tinta: string,
) {
  g.fillStyle = tinta;
  g.beginPath();
  g.moveTo(cx - s * 0.5, cy + s * 0.17);
  g.bezierCurveTo(
    cx - s * 0.3,
    cy + s * 0.34,
    cx + s * 0.06,
    cy + s * 0.13,
    cx + s * 0.5,
    cy - s * 0.3,
  );
  g.lineTo(cx + s * 0.13, cy + s * 0.31);
  g.bezierCurveTo(
    cx - s * 0.04,
    cy + s * 0.38,
    cx - s * 0.26,
    cy + s * 0.36,
    cx - s * 0.5,
    cy + s * 0.17,
  );
  g.closePath();
  g.fill();
}

/** Tiga garis miring adidas, tinggi menaik ke kanan. */
function tandaStripes(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  tinta: string,
) {
  g.fillStyle = tinta;
  for (let i = 0; i < 3; i++) {
    const h = s * (0.34 + i * 0.17);
    const bw = s * 0.13;
    const x = cx - s * 0.34 + i * s * 0.26;
    g.beginPath();
    g.moveTo(x, cy + s * 0.28);
    g.lineTo(x + bw, cy + s * 0.28);
    g.lineTo(x + bw + s * 0.11, cy + s * 0.28 - h);
    g.lineTo(x + s * 0.11, cy + s * 0.28 - h);
    g.closePath();
    g.fill();
  }
}

/** Sapuan spiral ASICS: tiga garis melengkung menyilang. */
function tandaSpiral(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  tinta: string,
) {
  g.strokeStyle = tinta;
  g.lineWidth = Math.max(1.4, s * 0.09);
  g.lineCap = "round";
  for (let i = -1; i <= 1; i++) {
    g.beginPath();
    g.moveTo(cx - s * 0.42, cy + s * 0.26 + i * s * 0.12);
    g.quadraticCurveTo(
      cx,
      cy - s * 0.3 + i * s * 0.12,
      cx + s * 0.42,
      cy + s * 0.04 + i * s * 0.1,
    );
    g.stroke();
  }
}

function tandaNB(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  tinta: string,
) {
  g.fillStyle = tinta;
  g.font =
    "700 italic " +
    Math.round(s * 0.78) +
    "px ui-sans-serif, system-ui, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("NB", cx, cy + s * 0.02);
}

/** Salomon: huruf S dalam kotak miring. */
function tandaSalomon(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  tinta: string,
) {
  g.save();
  g.translate(cx, cy);
  g.rotate(-0.18);
  g.fillStyle = tinta;
  rrect(g, -s * 0.26, -s * 0.26, s * 0.52, s * 0.52, s * 0.1);
  g.fill();
  g.fillStyle = "#14161A";
  g.font =
    "700 " +
    Math.round(s * 0.4) +
    "px ui-sans-serif, system-ui, Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("S", 0, s * 0.01);
  g.restore();
}

const TANDA: Record<
  MerekDus["tanda"],
  (
    g: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number,
    tinta: string,
  ) => void
> = {
  swoosh: tandaSwoosh,
  stripes: tandaStripes,
  spiral: tandaSpiral,
  nb: tandaNB,
  salomon: tandaSalomon,
};

/**
 * Satu dus sepatu.
 *
 * Isinya menyusut bertahap seiring dusnya menyempit: di bawah 108 px wordmark
 * dibuang dan cuma logo yang tersisa, di bawah 34 px logonya ikut dibuang.
 * Tanpa penjenjangan itu, dus tipis di puncak menara jadi gumpalan tak terbaca.
 */
function gambarDus(
  g: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  h: number,
  merekIdx: number,
  pas: boolean,
  putar: number,
) {
  const b = MEREK_DUS[merekIdx % MEREK_DUS.length];
  const lh = Math.round(h * 0.54); // tinggi tutup dus
  let x = x0;
  let y = y0;

  g.save();
  if (putar) {
    g.translate(x + w / 2, y + h / 2);
    g.rotate(putar);
    x = -w / 2;
    y = -h / 2;
  }

  // Badan dus: sedikit lebih sempit, duduk di bawah tutup.
  rrect(g, x + 3, y + lh - 4, w - 6, h - lh + 4, 3);
  g.fillStyle = b.badan;
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = WARNA.garis;
  g.stroke();

  // Tutup dus.
  rrect(g, x, y, w, lh, 4);
  g.fillStyle = b.tutup;
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = WARNA.garis;
  g.stroke();

  // Kilau tipis di bibir tutup.
  g.globalAlpha = 0.18;
  g.fillStyle = "#FFFFFF";
  rrect(g, x + 3, y + 2, w - 6, 2.5, 1.2);
  g.fill();
  g.globalAlpha = 1;

  // Label ukuran di ujung kanan badan dus.
  if (w > 76) {
    g.globalAlpha = 0.9;
    g.fillStyle = b.label;
    rrect(g, x + w - 24, y + lh + 1, 18, h - lh - 6, 1.5);
    g.fill();
    g.globalAlpha = 0.45;
    g.fillStyle = WARNA.garis;
    g.fillRect(x + w - 21, y + lh + 4, 12, 1.2);
    g.fillRect(x + w - 21, y + lh + 7, 8, 1.2);
    g.globalAlpha = 1;
  }

  // Logo + wordmark di tutup.
  const cx = x + w / 2;
  const cy = y + lh / 2;
  const s = Math.min(lh * 0.92, 20);
  if (w >= 108) {
    TANDA[b.tanda](g, cx - w * 0.22, cy, s, b.tinta);
    g.fillStyle = b.tinta;
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.font =
      "700 " +
      Math.max(9, Math.min(12, Math.round(w * 0.085))) +
      "px ui-sans-serif, system-ui, Arial, sans-serif";
    g.fillText(b.nama, cx - w * 0.22 + s * 0.62, cy + 1);
  } else if (w >= 34) {
    TANDA[b.tanda](g, cx, cy, s, b.tinta);
  }

  // Pita emas: penanda dus yang jatuh pas.
  if (pas) {
    g.strokeStyle = WARNA.emas;
    g.lineWidth = 2;
    rrect(g, x + 1.5, y + 1.5, w - 3, lh - 3, 3);
    g.stroke();
    g.fillStyle = WARNA.emas;
    g.fillRect(x + 5, y + lh - 4, w - 10, 2.5);
  }

  g.restore();
}

/** Umbul-umbul melintang di pucuk layar - bingkai tujuh-belasan. */
function umbulUmbul(ctx: CanvasRenderingContext2D) {
  const lendut = 22;
  const y0 = 6;
  ctx.strokeStyle = "rgba(255,244,232,.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= PAPAN_W; x += 6) {
    const y = y0 + Math.sin((x / PAPAN_W) * Math.PI) * lendut;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const x = 14 + i * ((PAPAN_W - 28) / 12);
    const y = y0 + Math.sin((x / PAPAN_W) * Math.PI) * lendut;
    ctx.fillStyle = i % 2 ? WARNA.putih : WARNA.merah;
    ctx.beginPath();
    ctx.moveTo(x - 7, y);
    ctx.lineTo(x + 7, y);
    ctx.lineTo(x, y + 16);
    ctx.closePath();
    ctx.fill();
  }
}
