"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import {
  gameService,
  type HasilRonde,
  type StatusGame,
} from "@/lib/api/game.service";
import { BATAS_WAKTU_DETIK, TARGET_DUS } from "@/lib/game/merdeka-game";
import { BoxClimbCanvas, type KendaliGame } from "./BoxClimbCanvas";
import { PrizeWheel } from "./PrizeWheel";

type Fase =
  | "memuat"
  | "perlu-login"
  | "tutup"
  | "jatah-habis"
  | "siap"
  | "main"
  | "kalah"
  | "roda"
  | "hadiah";

/**
 * Perekat game Kemerdekaan: gerbang login, jatah harian, kanvas, roda, popup.
 *
 * Yang perlu diingat saat membaca berkas ini: komponen ini TIDAK pernah memilih
 * hadiah. Ia meminta hasil ke server lewat `finish`, lalu menyuruh roda berhenti
 * di juring yang server sebutkan. Urutan itu sengaja - kalau dibalik, hadiahnya
 * jadi keputusan browser.
 */
export function MerdekaGame() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [fase, setFase] = useState<Fase>("memuat");
  const [status, setStatus] = useState<StatusGame | null>(null);
  const [dus, setDus] = useState(0);
  const [beruntun, setBeruntun] = useState(0);
  const [sisaWaktu, setSisaWaktu] = useState(BATAS_WAKTU_DETIK);
  const [alasanKalah, setAlasanKalah] = useState<"waktu" | "meleset">("waktu");
  const [slot, setSlot] = useState<number | null>(null);
  const [hasil, setHasil] = useState<HasilRonde | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const kendali = useRef<KendaliGame | null>(null);
  const nonce = useRef<string | null>(null);
  // Penjaga supaya satu ronde hanya dilaporkan sekali: kanvas bisa memanggil
  // onSelesai lebih dari sekali kalau waktu habis tepat saat dus mendarat.
  const sudahLapor = useRef(false);

  // -- Status awal -----------------------------------------------------------

  const muatStatus = useCallback(async () => {
    try {
      const s = await gameService.status();
      setStatus(s);
      if (!s.open) setFase("tutup");
      else if (!s.canPlay) setFase("jatah-habis");
      else setFase("siap");
    } catch {
      setGalat("Gagal memuat status game. Coba muat ulang halaman ya.");
      setFase("tutup");
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      setFase("perlu-login");
      return;
    }
    muatStatus();
  }, [isHydrated, isAuthenticated, muatStatus]);

  // -- Jalannya ronde --------------------------------------------------------

  const mulaiRonde = async () => {
    setGalat(null);
    try {
      const r = await gameService.start();
      nonce.current = r.nonce;
      sudahLapor.current = false;
      setDus(0);
      setBeruntun(0);
      setSisaWaktu(BATAS_WAKTU_DETIK);
      setFase("main");
      kendali.current?.mulai();
    } catch (e: any) {
      // 409 dari backend berarti jatah harian sudah terpakai - itu jawaban yang
      // sah, bukan gangguan, jadi tampilkan layar jatah habis apa adanya.
      if (e?.response?.status === 409) {
        setFase("jatah-habis");
        muatStatus();
        return;
      }
      const pesan = e?.response?.data?.message;
      setGalat(
        typeof pesan === "string" ? pesan : "Gagal memulai ronde. Coba lagi ya.",
      );
    }
  };

  const selesaikanRonde = useCallback(
    async (info: {
      sampaiPuncak: boolean;
      dus: number;
      alasan: "waktu" | "meleset" | "puncak";
    }) => {
      if (sudahLapor.current || !nonce.current) return;
      sudahLapor.current = true;
      kendali.current?.hentikan();

      try {
        const r = await gameService.finish({
          nonce: nonce.current,
          boxes: info.sampaiPuncak ? TARGET_DUS : info.dus,
          reachedTop: info.sampaiPuncak,
        });
        setHasil(r);

        if (r.outcome === "no_prize") {
          setAlasanKalah(info.alasan === "puncak" ? "waktu" : info.alasan);
          setFase("kalah");
          return;
        }

        // Sampai puncak: buka roda, lalu putar ke juring yang server tentukan.
        setFase("roda");
        setSlot(r.slotIndex);
      } catch (e: any) {
        const pesan = e?.response?.data?.message;
        setGalat(
          typeof pesan === "string"
            ? pesan
            : "Hasil ronde gagal dikirim. Cek koneksi kamu ya.",
        );
        setAlasanKalah(info.alasan === "puncak" ? "waktu" : info.alasan);
        setFase("kalah");
      }
    },
    [],
  );

  const sedangMain = fase === "main";

  return (
    <div className="w-full max-w-[460px] mx-auto">
      {/* HUD: hanya berarti saat ronde berjalan, tapi tingginya dikunci supaya
          papan tidak melompat waktu ronde dimulai. */}
      <div className="mb-3 flex min-h-[46px] items-center justify-between gap-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-black tabular-nums text-white">
            {dus}
          </span>
          <span className="text-xs uppercase tracking-widest text-white/60">
            / {TARGET_DUS} boxes
          </span>
        </div>

        <div className="max-w-[190px] flex-1">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60">
            <span>Sisa waktu</span>
            <span className="font-bold tabular-nums text-white/90">
              {sisaWaktu.toFixed(1)}s
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-white transition-[width] duration-100 ease-linear"
              style={{
                width: `${Math.max(0, (sisaWaktu / BATAS_WAKTU_DETIK) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[18px] bg-[#020330]">
        <BoxClimbCanvas
          kendaliRef={kendali}
          onProgres={(n, c) => {
            setDus(n);
            setBeruntun(c);
          }}
          onWaktu={setSisaWaktu}
          onSelesai={selesaikanRonde}
        />

        {beruntun >= 2 && sedangMain && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
            Pas x{beruntun}
          </div>
        )}

        {/* Lapisan-lapisan di bawah ini menutupi papan sesuai fase. Hanya satu
            yang pernah tampil sekaligus. */}
        {fase === "memuat" && <Lapisan>Menyiapkan papan...</Lapisan>}

        {fase === "perlu-login" && (
          <Lapisan>
            <Judul>MASUK DULU YA</Judul>
            <Teks>
              Merdeka Game cuma buat member Sneakers Flash. Login dulu, baru kamu
              bisa mulai menyusun.
            </Teks>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center justify-center bg-white px-7 py-3 font-display text-sm uppercase tracking-widest text-black transition hover:bg-white/90 active:scale-95"
            >
              Login / Daftar
            </Link>
          </Lapisan>
        )}

        {fase === "tutup" && (
          <Lapisan>
            <Judul>{galat ? "ADA KENDALA" : "BELUM DIBUKA"}</Judul>
            <Teks>
              {galat ??
                "Merdeka Game berlangsung 17-31 Agustus 2026. Balik lagi pas tanggalnya ya."}
            </Teks>
          </Lapisan>
        )}

        {fase === "jatah-habis" && (
          <Lapisan>
            <Judul>SAMPAI BESOK</Judul>
            <Teks>
              1 akun dapat 1 kesempatan bermain setiap hari, dan jatah kamu hari
              ini sudah terpakai.
              {status?.hasilTerakhir?.prizeLabel
                ? ` Hasil terakhir: ${status.hasilTerakhir.prizeLabel}.`
                : ""}
            </Teks>
            <Teks kecil>Jatah baru terbuka tengah malam WIB.</Teks>
          </Lapisan>
        )}

        {fase === "siap" && (
          <Lapisan>
            <Judul>READY TO CLIMB?</Judul>
            <Teks>
              Sneaker box akan bergerak ke kanan dan kiri. Tap di waktu yang
              tepat untuk menyusunnya. Bagian yang meleset akan terpotong.
            </Teks>
            <button
              type="button"
              onClick={mulaiRonde}
              className="mt-5 inline-flex items-center justify-center bg-white px-8 py-3.5 font-display text-sm uppercase tracking-widest text-black transition hover:bg-white/90 active:scale-95"
            >
              Start the Climb
            </button>
            <Teks kecil>Tap layar atau tekan SPACE untuk mulai.</Teks>
            <Teks kecil>1 akun mendapat 1 kesempatan bermain setiap hari.</Teks>
            {galat && <p className="mt-3 text-xs text-red-300">{galat}</p>}
          </Lapisan>
        )}

        {fase === "kalah" && (
          <Lapisan>
            <Judul>
              {alasanKalah === "waktu" ? "WAKTU HABIS" : "MENARANYA RUNTUH"}
            </Judul>
            <Teks>
              Kamu berhasil menyusun <b className="text-white">{dus}</b> dari{" "}
              {TARGET_DUS} boxes. Belum sampai puncak, jadi rodanya belum
              terbuka.
            </Teks>
            <Teks kecil>
              Jatah main hari ini sudah terpakai. Coba lagi besok ya.
            </Teks>
            {galat && <p className="mt-3 text-xs text-red-300">{galat}</p>}
          </Lapisan>
        )}

        {(fase === "roda" || fase === "hadiah") && (
          <Lapisan padat>
            {fase === "roda" && (
              <>
                <Judul>PUNCAK TERCAPAI</Judul>
                <Teks kecil>Rodanya kebuka. Lihat kamu dapat apa...</Teks>
              </>
            )}
            <div className="my-3 w-full max-w-[300px]">
              <PrizeWheel
                ukuran={300}
                slot={slot}
                onBerhenti={() => setFase("hadiah")}
              />
            </div>
            {fase === "hadiah" && hasil && <KartuHadiah hasil={hasil} />}
          </Lapisan>
        )}
      </div>
    </div>
  );
}

// -- Bagian kecil ------------------------------------------------------------

function Lapisan({
  children,
  padat,
}: {
  children: React.ReactNode;
  padat?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 px-6 text-center backdrop-blur-[2px] ${
        padat ? "overflow-y-auto py-4" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Judul({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
      {children}
    </h2>
  );
}

function Teks({
  children,
  kecil,
}: {
  children: React.ReactNode;
  kecil?: boolean;
}) {
  return (
    <p
      className={
        kecil
          ? "mt-2 text-[11px] uppercase tracking-widest text-white/50"
          : "mt-2.5 max-w-[300px] text-sm leading-relaxed text-white/75"
      }
    >
      {children}
    </p>
  );
}

/**
 * Kartu hasil. Tiga kemungkinan, dan ketiganya sengaja dibedakan tegas supaya
 * pemain tidak salah paham soal apa yang benar-benar dia dapat.
 */
function KartuHadiah({ hasil }: { hasil: HasilRonde }) {
  if (hasil.outcome === "points") {
    return (
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-center text-black">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          Kamu dapat
        </div>
        <div className="mt-1 font-display text-3xl font-black">
          {hasil.pointsAwarded.toLocaleString("id-ID")}
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-black/60">
          Flash Points
        </div>
        <p className="mt-3 text-xs leading-relaxed text-black/60">
          Poinnya sudah masuk ke saldo kamu dan langsung bisa dipakai di
          checkout.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex w-full items-center justify-center bg-black px-6 py-3 font-display text-xs uppercase tracking-widest text-white transition active:scale-95"
        >
          Belanja Sekarang
        </Link>
      </div>
    );
  }

  if (hasil.outcome === "apparel_won") {
    return (
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-center text-black">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          Selamat, kamu menang
        </div>
        <div className="mt-1 font-display text-lg font-black leading-tight">
          {hasil.prizeLabel}
        </div>

        <div className="mt-4 rounded-xl bg-black/5 p-3 text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/50">
            Langkah berikutnya
          </div>
          <ol className="mt-1.5 space-y-1 text-xs leading-relaxed text-black/70">
            <li>1. Cek email kamu, kami baru saja mengirim tautan verifikasi.</li>
            <li>2. Klik tautan itu untuk memverifikasi email.</li>
            <li>3. Kamu langsung dapat link WhatsApp buat klaim hadiahnya.</li>
          </ol>
        </div>

        <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-black/50">
          Kode klaim
        </div>
        <div className="font-mono text-base font-bold tracking-wider">
          {hasil.claimCode}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-black/50">
          Tautan verifikasinya berlaku 48 jam. Simpan kode ini kalau-kalau kamu
          butuh menyebutkannya ke CS.
        </p>
      </div>
    );
  }

  if (hasil.outcome === "already_won") {
    return (
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-center text-black">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">
          Nyaris!
        </div>
        <div className="mt-1 font-display text-lg font-black leading-tight">
          {hasil.prizeLabel}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-black/60">
          Rodanya berhenti di sini, tapi hadiah ini sudah dimenangkan pemain
          lain. Masih ada hadiah lain yang menunggu - balik lagi besok ya.
        </p>
        <Link
          href="/freedom-in-every-step"
          className="mt-4 inline-flex w-full items-center justify-center bg-black px-6 py-3 font-display text-xs uppercase tracking-widest text-white transition active:scale-95"
        >
          Lihat Promo Merdeka
        </Link>
      </div>
    );
  }

  return null;
}
