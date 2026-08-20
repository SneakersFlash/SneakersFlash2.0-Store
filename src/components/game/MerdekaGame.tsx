"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import {
  gameService,
  type HasilRonde,
  type StatusGame,
} from "@/lib/api/game.service";
import {
  BATAS_WAKTU_DETIK,
  CLAIM_TOKEN_TTL_HOURS,
  TARGET_DUS,
} from "@/lib/game/merdeka-game";
import { fanfarHadiah, setSuara, suaraNyala } from "@/lib/game/suara";
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
  | "menang"
  | "roda"
  | "hadiah";

/**
 * Perekat game Kemerdekaan: gerbang login, jatah harian, kanvas, roda, popup.
 *
 * Yang perlu diingat saat membaca berkas ini: komponen ini TIDAK pernah memilih
 * hadiah. Ia meminta hasil ke server lewat `finish`, lalu menyuruh roda berhenti
 * di juring yang server sebutkan. Urutan itu sengaja - kalau dibalik, hadiahnya
 * jadi keputusan browser.
 *
 * Tampilannya mengikuti demo artifact: panggung bergaris emas, HUD monospace,
 * lapisan poster, roda dengan tombol putar di porosnya, dan konfeti yang lewat
 * di atas semuanya.
 */
export function MerdekaGame() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [fase, setFase] = useState<Fase>("memuat");
  const [status, setStatus] = useState<StatusGame | null>(null);
  const [dus, setDus] = useState(0);
  const [beruntun, setBeruntun] = useState(0);
  const [terbaik, setTerbaik] = useState(0);
  const [sisaWaktu, setSisaWaktu] = useState(BATAS_WAKTU_DETIK);
  const [alasanKalah, setAlasanKalah] = useState<"waktu" | "meleset">("waktu");
  const [slot, setSlot] = useState<number | null>(null);
  const [hasil, setHasil] = useState<HasilRonde | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [bunyi, setBunyi] = useState(true);

  const kendali = useRef<KendaliGame | null>(null);
  const nonce = useRef<string | null>(null);
  // Penjaga supaya satu ronde hanya dilaporkan sekali: kanvas bisa memanggil
  // onSelesai lebih dari sekali kalau waktu habis tepat saat dus mendarat.
  const sudahLapor = useRef(false);
  const jedaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBunyi(suaraNyala());
    return () => {
      if (jedaRef.current) clearTimeout(jedaRef.current);
    };
  }, []);

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
      setTerbaik(0);
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
      beruntunTerbaik: number;
      alasan: "waktu" | "meleset" | "puncak";
    }) => {
      if (sudahLapor.current || !nonce.current) return;
      sudahLapor.current = true;
      kendali.current?.hentikan();
      setTerbaik(info.beruntunTerbaik);

      // Layar akhir ditahan sebentar supaya potongan dus yang berjatuhan
      // sempat terlihat - kalau langsung tertutup, kegagalannya terasa patah.
      const tampilkan = (f: Fase) => {
        if (jedaRef.current) clearTimeout(jedaRef.current);
        jedaRef.current = setTimeout(() => setFase(f), 480);
      };

      try {
        const r = await gameService.finish({
          nonce: nonce.current,
          boxes: info.sampaiPuncak ? TARGET_DUS : info.dus,
          reachedTop: info.sampaiPuncak,
        });
        setHasil(r);

        if (r.outcome === "no_prize") {
          setAlasanKalah(info.alasan === "puncak" ? "waktu" : info.alasan);
          tampilkan("kalah");
          return;
        }

        // Sampai puncak: rayakan dulu, rodanya baru dibuka lewat tombol.
        tampilkan("menang");
      } catch (e: any) {
        const pesan = e?.response?.data?.message;
        setGalat(
          typeof pesan === "string"
            ? pesan
            : "Hasil ronde gagal dikirim. Cek koneksi kamu ya.",
        );
        setAlasanKalah(info.alasan === "puncak" ? "waktu" : info.alasan);
        tampilkan("kalah");
      }
    },
    [],
  );

  /** Buka roda, tapi belum diputar - pemain yang menekan porosnya. */
  const bukaRoda = () => {
    setSlot(null);
    setFase("roda");
  };

  /** Poros ditekan: baru sekarang roda diberi juring tujuan dari server. */
  const putarRoda = () => {
    // `no_prize` tidak punya juring sama sekali - jalurnya berakhir di layar
    // kalah, jadi kalau sampai ke sini berarti ada yang salah, bukan hasil sah.
    if (!hasil || hasil.outcome === "no_prize" || slot !== null) return;
    setSlot(hasil.slotIndex);
  };

  const rodaBerhenti = () => {
    kendali.current?.pesta();
    fanfarHadiah();
    setFase("hadiah");
  };

  /**
   * Kembali ke layar siap tanpa memuat ulang halaman. Hanya ditawarkan ke akun
   * penguji - pemain biasa memang cuma punya satu kesempatan sehari.
   *
   * `slot` dikembalikan ke null bukan sekadar kerapian: PrizeWheel memutar
   * rodanya lewat perubahan nilai `slot`, jadi kalau ronde berikutnya kebetulan
   * mendarat di juring yang sama, tanpa null di antaranya rodanya tidak akan
   * berputar sama sekali.
   */
  const mainLagi = () => {
    if (jedaRef.current) clearTimeout(jedaRef.current);
    setSlot(null);
    setHasil(null);
    setGalat(null);
    setDus(0);
    setBeruntun(0);
    setTerbaik(0);
    setSisaWaktu(BATAS_WAKTU_DETIK);
    setFase("siap");
  };

  const sedangMain = fase === "main";
  const mepet = sedangMain && sisaWaktu <= 10;
  const detikTerpakai = BATAS_WAKTU_DETIK - sisaWaktu;

  const petunjuk = sedangMain
    ? "Ketuk untuk menjatuhkan dus"
    : fase === "kalah"
      ? "Menara gagal"
      : fase === "menang" || fase === "roda" || fase === "hadiah"
        ? "Menara berdiri"
        : "Ketuk layar atau tekan SPACE";

  return (
    <div className="mx-auto w-full max-w-[428px]">
      {/* -- Panggung -------------------------------------------------------- */}
      <div
        className="relative flex flex-col gap-3 rounded-[22px] border border-[#2A3468] p-3.5"
        style={{
          background: "linear-gradient(180deg,#141C3E 0%,#0D1430 100%)",
          boxShadow:
            "0 30px 70px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.06)",
        }}
      >
        <TombolSuara
          nyala={bunyi}
          onKlik={() => {
            const n = !bunyi;
            setSuara(n);
            setBunyi(n);
          }}
        />

        {/* -- HUD ----------------------------------------------------------- */}
        <div className="flex items-center gap-3 pr-11">
          <div className="flex items-baseline gap-1 rounded-lg border border-[#2A3468] bg-[#1B2450] px-2.5 py-1.5 font-mono tabular-nums">
            <b className="text-xl font-bold text-[#FFF4E8]">{dus}</b>
            <span className="text-xs text-[#6E78A8]">/ {TARGET_DUS} dus</span>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6E78A8]">
                Sisa waktu
              </span>
              <span
                className={`font-mono text-[15px] font-bold tabular-nums ${
                  mepet ? "text-[#E23A3A]" : "text-[#F3F0FF]"
                }`}
              >
                {sisaWaktu.toFixed(1)}s
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#2A3468] bg-[#1B2450]">
              <div
                className="h-full origin-left transition-transform duration-100 ease-linear"
                style={{
                  transform: `scaleX(${Math.max(0, sisaWaktu / BATAS_WAKTU_DETIK)})`,
                  background: mepet
                    ? "linear-gradient(90deg,#F2B33D,#E23A3A)"
                    : "linear-gradient(90deg,#4FD1A0,#F2B33D)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          className={`min-h-[14px] font-mono text-[11px] uppercase tracking-[0.1em] text-[#F2B33D] transition-opacity duration-200 ${
            beruntun > 1 && sedangMain ? "opacity-100" : "opacity-0"
          }`}
        >
          Pas &times;{beruntun}
        </div>

        {/* -- Papan --------------------------------------------------------- */}
        <div className="relative overflow-hidden rounded-[14px] border border-[#2A3468] bg-[#0A0F26]">
          <BoxClimbCanvas
            kendaliRef={kendali}
            onProgres={(n, c) => {
              setDus(n);
              setBeruntun(c);
            }}
            onWaktu={setSisaWaktu}
            onSelesai={selesaikanRonde}
          />

          {fase === "memuat" && (
            <Lapisan>
              <Teks>Menyiapkan papan&hellip;</Teks>
            </Lapisan>
          )}

          {fase === "perlu-login" && (
            <Lapisan>
              <Judul>{"Masuk\nDulu Ya"}</Judul>
              <Teks>
                Merdeka Game cuma buat member Sneakers Flash. Login dulu, baru
                kamu bisa mulai menyusun.
              </Teks>
              <Tombol as="link" href="/login">
                Login / Daftar
              </Tombol>
            </Lapisan>
          )}

          {fase === "tutup" && (
            <Lapisan>
              <Judul>{galat ? "Ada\nKendala" : "Belum\nDibuka"}</Judul>
              <Teks>
                {galat ??
                  "Merdeka Game berlangsung 17-31 Agustus 2026. Balik lagi pas tanggalnya ya."}
              </Teks>
            </Lapisan>
          )}

          {fase === "jatah-habis" && (
            <Lapisan>
              <Judul>{"Sampai\nBesok"}</Judul>
              <Teks>
                1 akun mendapat 1 kesempatan bermain setiap hari, dan jatah kamu
                hari ini sudah terpakai.
                {status?.hasilTerakhir?.prizeLabel
                  ? ` Hasil terakhir: ${status.hasilTerakhir.prizeLabel}.`
                  : ""}
              </Teks>
              <Petunjuk>Jatah baru terbuka tengah malam WIB</Petunjuk>
            </Lapisan>
          )}

          {fase === "siap" && (
            <Lapisan>
              {/* Penanda kecil supaya penguji sadar dia sedang di jalur yang
                  dilonggarkan, dan tidak salah menyimpulkan gerbang jadwal atau
                  jatah harian sudah terbuka untuk semua orang. */}
              {status?.penguji && (
                <div className="rounded-full border border-[#2A3468] bg-[#1B2450] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#98A2CE]">
                  Mode penguji &middot; bebas jadwal &amp; jatah
                </div>
              )}
              <Judul>{"Ready to\nClimb?"}</Judul>
              <Teks>
                Sneaker box akan bergerak ke kanan dan kiri. Tap di waktu yang
                tepat untuk menyusunnya. Bagian yang meleset akan terpotong.
              </Teks>
              <Tombol onKlik={mulaiRonde}>Start the Climb</Tombol>
              <Petunjuk>Tap layar atau tekan SPACE untuk mulai</Petunjuk>
              <Petunjuk>
                1 akun mendapat 1 kesempatan bermain setiap hari
              </Petunjuk>
              {galat && <p className="m-0 text-xs text-[#E23A3A]">{galat}</p>}
            </Lapisan>
          )}

          {fase === "kalah" && (
            <Lapisan>
              <div className="rounded-full border border-[#A8232B] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#E23A3A]">
                {alasanKalah === "waktu" ? "Waktu habis" : "Blok meleset"}
              </div>
              <Judul>{"Belum\nSampai"}</Judul>
              <BarisStat
                data={[
                  ["Dus", String(dus)],
                  ["Pas beruntun", String(terbaik)],
                ]}
              />
              <Teks>
                {status?.penguji
                  ? "Mode penguji: jatah harian tidak berlaku."
                  : "Jatah main hari ini sudah terpakai. Coba lagi besok ya."}
              </Teks>
              {status?.penguji && <Tombol onKlik={mainLagi}>Coba Lagi</Tombol>}
              {galat && <p className="m-0 text-xs text-[#E23A3A]">{galat}</p>}
            </Lapisan>
          )}

          {fase === "menang" && (
            <Lapisan>
              <Judul>Merdeka!</Judul>
              <Teks>
                17 dus tersusun dalam{" "}
                {detikTerpakai.toFixed(1).replace(".", ",")} detik.
              </Teks>
              <BarisStat
                data={[
                  ["Dus", String(TARGET_DUS)],
                  ["Pas beruntun", String(terbaik)],
                ]}
              />
              <Tombol onKlik={bukaRoda}>Putar Roda</Tombol>
            </Lapisan>
          )}

          {(fase === "roda" || fase === "hadiah") && (
            <Lapisan padat>
              {fase === "roda" && (
                <>
                  <div className="relative grid place-items-center">
                    <PrizeWheel
                      ukuran={268}
                      slot={slot}
                      onBerhenti={rodaBerhenti}
                    />
                    {/* Poros roda: tombol putarnya sendiri. Ditaruh di tengah
                        piringan seperti di demo, jadi tidak ada tombol lain
                        yang bersaing dengan roda buat perhatian pemain. */}
                    <button
                      type="button"
                      onClick={putarRoda}
                      disabled={slot !== null}
                      aria-label="Putar roda hadiah"
                      className="absolute grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#F2B33D] font-display text-xl text-[#F2B33D] transition-transform hover:scale-105 disabled:cursor-default disabled:opacity-70 disabled:hover:scale-100"
                      style={{
                        background: "linear-gradient(180deg,#1B2450,#0D1430)",
                        // Poros digeser sedikit ke bawah karena segitiga jarum
                        // ikut memakan ruang di bagian atas PNG rodanya, jadi
                        // pusat piringan tidak persis di tengah gambar.
                        marginTop: "1.3%",
                      }}
                    >
                      17
                    </button>
                  </div>
                  <Petunjuk>
                    {slot === null
                      ? "Ketuk tombol tengah untuk memutar"
                      : "Memutar…"}
                  </Petunjuk>
                </>
              )}

              {fase === "hadiah" && hasil && <KartuHadiah hasil={hasil} />}
              {fase === "hadiah" && status?.penguji && (
                <TombolHantu onKlik={mainLagi}>Main lagi (penguji)</TombolHantu>
              )}
            </Lapisan>
          )}
        </div>

        <div className="min-h-[16px] text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[#6E78A8]">
          {petunjuk}
        </div>
      </div>
    </div>
  );
}

// -- Bagian kecil ------------------------------------------------------------

/**
 * Lapisan poster di atas papan.
 *
 * Latarnya radial, bukan hitam rata: di demo, pusat lapisan sedikit lebih
 * terang supaya menara di baliknya masih terbayang, dan itu yang bikin layar
 * akhir terasa menempel ke permainan, bukan dialog yang ditempel di atasnya.
 */
function Lapisan({
  children,
  padat,
}: {
  children: React.ReactNode;
  padat?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3.5 rounded-[14px] px-5 text-center ${
        padat ? "overflow-y-auto py-4" : "py-5"
      }`}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 40%, rgba(13,20,48,.86), rgba(8,13,34,.97))",
      }}
    >
      {children}
    </div>
  );
}

/** Judul poster: huruf padat, bayangan merah bertingkat seperti sablon. */
function Judul({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="m-0 font-display text-[clamp(30px,9vw,46px)] font-bold uppercase leading-[0.9] tracking-[0.02em] text-[#FFF4E8]"
      style={{
        textShadow: "2px 2px 0 #A8232B, 4px 4px 0 #56111A",
        whiteSpace: "pre-line",
      }}
    >
      {children}
    </h2>
  );
}

function Teks({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 max-w-[30ch] text-sm leading-relaxed text-[#98A2CE]">
      {children}
    </p>
  );
}

function Petunjuk({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6E78A8]">
      {children}
    </div>
  );
}

function BarisStat({ data }: { data: [string, string][] }) {
  return (
    <div className="flex gap-2.5 font-mono text-[11px] text-[#6E78A8]">
      {data.map(([label, nilai]) => (
        <div
          key={label}
          className="rounded-lg border border-[#2A3468] bg-[#1B2450] px-3 py-1.5"
        >
          {label}
          <b className="block text-base tabular-nums text-[#FFF4E8]">{nilai}</b>
        </div>
      ))}
    </div>
  );
}

/**
 * Tombol utama.
 *
 * Tepi bawahnya tebal lalu menipis saat ditekan - itu yang bikin tombolnya
 * terasa benar-benar tertekan, bukan sekadar berubah warna.
 */
function Tombol({
  children,
  onKlik,
  as,
  href,
}: {
  children: React.ReactNode;
  onKlik?: () => void;
  as?: "link";
  href?: string;
}) {
  const kelas =
    "inline-flex min-h-[48px] items-center justify-center rounded-[14px] border-2 border-b-[5px] border-[#7A5209] px-7 py-2.5 font-display text-[22px] uppercase leading-none tracking-[0.06em] text-[#2A0A0E] transition-[transform,filter] duration-100 hover:brightness-105 active:translate-y-[3px] active:border-b-2";
  const gaya = {
    background: "linear-gradient(180deg,#FFD97A,#F2B33D)",
    boxShadow: "0 10px 26px -12px rgba(242,179,61,.9)",
  } as React.CSSProperties;

  if (as === "link" && href) {
    return (
      <Link href={href} className={kelas} style={gaya}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onKlik} className={kelas} style={gaya}>
      {children}
    </button>
  );
}

function TombolHantu({
  children,
  onKlik,
}: {
  children: React.ReactNode;
  onKlik: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      className="inline-flex items-center justify-center rounded-[14px] border-2 border-[#2A3468] px-5 py-2 font-display text-base uppercase tracking-[0.06em] text-[#98A2CE] transition hover:border-[#6E78A8] hover:text-[#F3F0FF]"
    >
      {children}
    </button>
  );
}

function TombolSuara({
  nyala,
  onKlik,
}: {
  nyala: boolean;
  onKlik: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onKlik}
      aria-pressed={nyala}
      title={nyala ? "Suara aktif" : "Suara mati"}
      className="absolute right-3.5 top-3.5 z-30 grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-[#2A3468] text-[#98A2CE] transition-colors hover:text-[#F3F0FF]"
      style={{ background: "rgba(20,28,62,.82)" }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" opacity={nyala ? 1 : 0.15} />
        <path d="M19 5a10 10 0 0 1 0 14" opacity={nyala ? 1 : 0.15} />
      </svg>
      <span className="sr-only">{nyala ? "Suara aktif" : "Suara mati"}</span>
    </button>
  );
}

/**
 * Kartu hasil. Tiga kemungkinan, dan ketiganya sengaja dibedakan tegas supaya
 * pemain tidak salah paham soal apa yang benar-benar dia dapat.
 */
function KartuHadiah({ hasil }: { hasil: HasilRonde }) {
  if (hasil.outcome === "points") {
    return (
      <BingkaiHadiah>
        <Label>Kamu dapat</Label>
        <Nama>{hasil.pointsAwarded.toLocaleString("id-ID")} Poin</Nama>
        <p className="m-0 text-xs leading-relaxed text-[#98A2CE]">
          Flash Points sudah masuk ke saldo kamu dan langsung bisa dipakai di
          checkout.
        </p>
        <Tombol as="link" href="/products">
          Belanja
        </Tombol>
      </BingkaiHadiah>
    );
  }

  if (hasil.outcome === "apparel_won") {
    return (
      <BingkaiHadiah>
        <Label>Selamat, kamu menang</Label>
        <Nama>{hasil.prizeLabel}</Nama>
        <div className="w-full rounded-lg border border-dashed border-[#2A3468] bg-[#0D1430] px-3 py-2.5 text-left">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E78A8]">
            Langkah berikutnya
          </div>
          <ol className="mt-1.5 space-y-1 text-xs leading-relaxed text-[#98A2CE]">
            <li>
              1. Cek email kamu, kami baru saja mengirim tautan verifikasi.
            </li>
            <li>2. Klik tautan itu untuk memverifikasi email.</li>
            <li>3. Kamu langsung dapat link WhatsApp buat klaim hadiahnya.</li>
          </ol>
        </div>
        <Label>Kode klaim</Label>
        <div className="rounded-md border border-dashed border-[#2A3468] bg-[#0D1430] px-3 py-1.5 font-mono text-[13px] tracking-[0.12em] text-[#FFF4E8]">
          {hasil.claimCode}
        </div>
        <p className="m-0 text-[11px] leading-relaxed text-[#6E78A8]">
          Tautan verifikasinya berlaku {CLAIM_TOKEN_TTL_HOURS} jam. Simpan kode
          ini kalau-kalau kamu butuh menyebutkannya ke CS.
        </p>
      </BingkaiHadiah>
    );
  }

  if (hasil.outcome === "already_won") {
    return (
      <BingkaiHadiah>
        <Label>Nyaris!</Label>
        <Nama>{hasil.prizeLabel}</Nama>
        <p className="m-0 text-xs leading-relaxed text-[#98A2CE]">
          Rodanya berhenti di sini, tapi hadiah ini sudah dimenangkan pemain
          lain. Masih ada hadiah lain yang menunggu - balik lagi besok ya.
        </p>
        <Tombol as="link" href="/products">
          Belanja Sekarang
        </Tombol>
      </BingkaiHadiah>
    );
  }

  return null;
}

function BingkaiHadiah({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex w-full max-w-[320px] flex-col items-center gap-2 rounded-[14px] border border-[#B87F16] px-5 py-3.5"
      style={{
        background: "linear-gradient(180deg,#1B2450,#141C3E)",
        boxShadow:
          "0 0 0 1px rgba(242,179,61,.14), 0 20px 40px -24px rgba(242,179,61,.6)",
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E78A8]">
      {children}
    </div>
  );
}

function Nama({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-2xl font-bold uppercase leading-tight text-[#F2B33D]">
      {children}
    </div>
  );
}
