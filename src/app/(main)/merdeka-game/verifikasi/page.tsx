"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { gameService, type HasilVerifikasi } from "@/lib/api/game.service";

/**
 * Langkah kedua klaim hadiah: pemenang mendarat di sini dari tautan email.
 *
 * Halaman ini SENGAJA tidak butuh sesi login. Langkah pertama sudah membuktikan
 * pemain punya akun; yang dibuktikan di sini adalah dia benar-benar memegang
 * kotak masuk email yang terdaftar. Kalau halaman ini ikut diberi gerbang login,
 * langkah keduanya tidak menguji apa pun yang baru.
 */
export default function VerifikasiKlaimPage() {
  return (
    <div
      className="min-h-screen bg-[#080D22] font-helvetica-88"
      style={
        {
          "--primary": "39.1 87.4% 59.4%",
          "--primary-foreground": "222 47% 8%",
          backgroundImage:
            "radial-gradient(1100px 620px at 50% -8%, #242C63 0%, rgba(36,44,99,0) 62%)",
        } as React.CSSProperties
      }
    >
      <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16">
        {/* useSearchParams butuh Suspense di App Router - tanpa ini build-nya
            gagal dengan keluhan halaman tidak bisa di-prerender. */}
        <Suspense fallback={<Kartu>Menyiapkan halaman verifikasi...</Kartu>}>
          <IsiVerifikasi />
        </Suspense>
      </div>
    </div>
  );
}

function IsiVerifikasi() {
  const token = useSearchParams().get("token");
  const [hasil, setHasil] = useState<HasilVerifikasi | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setGalat("Tautan verifikasinya tidak lengkap. Buka lagi dari email ya.");
      return;
    }

    let batal = false;
    gameService
      .verifikasiKlaim(token)
      .then((r) => {
        if (!batal) setHasil(r);
      })
      .catch((e) => {
        if (batal) return;
        const pesan = e?.response?.data?.message;
        setGalat(
          typeof pesan === "string"
            ? pesan
            : "Verifikasi gagal. Coba buka ulang tautannya dari email.",
        );
      });

    return () => {
      batal = true;
    };
  }, [token]);

  if (galat) {
    return (
      <Kartu>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#98A2CE]">
          Verifikasi gagal
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#C7CCEA]">{galat}</p>
        <Link
          href="/merdeka-game"
          className="mt-5 inline-flex w-full items-center justify-center bg-[#F2B33D] px-6 py-3 font-display text-xs uppercase tracking-widest text-[#0D1430] transition hover:brightness-110 active:scale-95"
        >
          Kembali ke Game
        </Link>
      </Kartu>
    );
  }

  if (!hasil) return <Kartu>Memverifikasi email kamu...</Kartu>;

  return (
    <Kartu>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#98A2CE]">
        Email terverifikasi
      </div>
      <h1 className="mt-1 font-display text-2xl font-black uppercase leading-tight">
        {hasil.nama ? `Sip, ${hasil.nama.split(" ")[0]}!` : "Sip!"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#C7CCEA]">
        Hadiah kamu: <b className="text-[#FFF4E8]">{hasil.prizeLabel}</b>
      </p>

      <div className="mt-4 rounded-xl bg-[#0D1430] p-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#98A2CE]">
          Kode klaim
        </div>
        <div className="font-mono text-lg font-bold tracking-wider">
          {hasil.code}
        </div>
      </div>

      <a
        href={hasil.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#25D366] px-6 py-3.5 font-display text-sm uppercase tracking-widest text-white transition hover:brightness-95 active:scale-95"
      >
        Klaim lewat WhatsApp
      </a>

      <p className="mt-3 text-[11px] leading-relaxed text-[#98A2CE]">
        Tombol di atas membuka chat ke CS Sneakers Flash dengan kode klaim kamu
        sudah terisi. CS akan mencocokkan kodenya sebelum hadiah diserahkan.
      </p>

      <Link
        href="/merdeka-game"
        className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#98A2CE] underline"
      >
        Kembali ke game
      </Link>
    </Kartu>
  );
}

function Kartu({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-[#2A3468] bg-[#141C3E] p-6 text-center text-[#F3F0FF] shadow-lg">
      {children}
    </div>
  );
}
