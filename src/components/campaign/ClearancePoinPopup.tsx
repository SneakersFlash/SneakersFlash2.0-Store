'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { usersService } from '@/lib/api/users.service';
import {
  CLEARANCE_POIN_HREF,
  CLEARANCE_POIN_LABEL,
  klaimPoinClearanceAktif,
} from '@/lib/campaign/clearance-poin';

/**
 * Pop-up klaim 100K FlashPoint di /events/clearance-sale.
 *
 * - Tamu: ajakan daftar/login. Keduanya membawa `callbackUrl` balik ke halaman
 *   ini, jadi sesudah login pop-up muncul lagi dalam mode klaim.
 * - Member login yang belum klaim: tombol klaim → POST, lalu pesan berhasil.
 * - Member yang sudah klaim: tidak tampil sama sekali.
 *
 * Beda dari pop-up promo beranda, yang ini TIDAK menutup sendiri — isinya
 * tindakan, bukan pengumuman. Berhenti tampil sendiri sesudah 11 Okt 23:59 WIB.
 *
 * Copy mode tamu & berhasil dari user (5 Okt 2026), dipakai apa adanya.
 */

const JEDA_MUNCUL_MS = 700;

/**
 * Sekali per sesi per keadaan. Kuncinya dibedakan tamu vs member supaya tamu
 * yang baru login lalu dibawa balik ke halaman ini tetap melihat tombol klaim.
 */
const kunciSesi = (mode: 'tamu' | 'member') => `popup-clearance-poin-${mode}`;

type Mode = 'tamu' | 'klaim' | 'berhasil';

export function ClearancePoinPopup() {
  const pathname = usePathname();
  const kurangiGerak = useReducedMotion();
  const queryClient = useQueryClient();

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Pendaftar baru dapat pop-up voucher selamat datang di halaman mana pun;
  // tunggu itu ditutup dulu supaya dua dialog tidak bertumpuk.
  const adaWelcomeVoucher = useAuthStore((s) => !!s.welcomeVoucher);

  const [mode, setMode] = useState<Mode | null>(null);
  const [mengklaim, setMengklaim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const tutup = useCallback(() => setMode(null), []);

  // Mode ditentukan sesudah mount & hidrasi auth: status login baru pasti
  // setelah authStore membaca localStorage, dan jam yang dipakai harus jam
  // pembeli, bukan jam render server.
  useEffect(() => {
    setMode(null);
    if (pathname !== CLEARANCE_POIN_HREF) return;
    if (!isHydrated || adaWelcomeVoucher || !klaimPoinClearanceAktif()) return;

    const kunci = kunciSesi(isAuthenticated ? 'member' : 'tamu');
    try {
      if (sessionStorage.getItem(kunci) === '1') return;
    } catch {
      // Mode privat / storage diblokir: biarkan tampil.
    }

    let batal = false;
    const t = setTimeout(async () => {
      let berikutnya: Mode = 'tamu';
      if (isAuthenticated) {
        try {
          const status = await usersService.getPointsClaim();
          if (!status.active || status.claimed) return;
          berikutnya = 'klaim';
        } catch {
          // Gagal cek status: jangan tawarkan klaim yang belum tentu bisa.
          return;
        }
      }
      if (batal) return;
      // Ditandai DI SINI, bukan saat efek jalan — mode ketat React memasang
      // efek dua kali dan pemasangan kedua akan membaca tandanya sendiri.
      try {
        sessionStorage.setItem(kunci, '1');
      } catch {
        /* bukan alasan untuk gagal */
      }
      setGalat(null);
      setMode(berikutnya);
    }, JEDA_MUNCUL_MS);

    return () => {
      batal = true;
      clearTimeout(t);
    };
  }, [pathname, isHydrated, isAuthenticated, adaWelcomeVoucher]);

  // Esc menutup, seperti dialog lain di toko.
  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tutup();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, tutup]);

  const klaim = async () => {
    setMengklaim(true);
    setGalat(null);
    try {
      await usersService.claimPoints();
      setMode('berhasil');
      // Saldo poin di akun & checkout ikut segar.
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err: any) {
      // 409 = sudah pernah klaim (mis. dari tab lain) — poinnya memang sudah ada.
      if (err?.response?.status === 409) {
        setMode('berhasil');
      } else {
        setGalat(
          err?.response?.data?.message ||
            'Klaim gagal, coba lagi sebentar lagi.',
        );
      }
    } finally {
      setMengklaim(false);
    }
  };

  const callback = encodeURIComponent(CLEARANCE_POIN_HREF);

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center px-5"
          role="dialog"
          aria-modal="true"
          aria-label="Klaim 100K FlashPoint"
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={tutup}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={kurangiGerak ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={kurangiGerak ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative w-full max-w-[340px] overflow-hidden rounded-[20px] bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={tutup}
              aria-label="Tutup pop-up FlashPoint"
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 shadow">
                <X className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
            </button>

            {/* ── Kepala hitam: angka poin sebagai pusat perhatian ── */}
            <div className="flex flex-col items-center gap-2 bg-[#0D0D0D] px-5 pb-6 pt-7 text-center text-white">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                Clearance Sale Bonus
              </span>
              <span className="text-[56px] font-black leading-none tracking-tight text-[#F6E70A]">
                {CLEARANCE_POIN_LABEL}
              </span>
              <span className="text-[18px] font-black uppercase tracking-tight">
                FlashPoint
              </span>
            </div>

            {/* ── Badan ── */}
            <div className="flex flex-col items-center gap-4 bg-white bg-[radial-gradient(rgba(0,0,0,0.07)_1px,transparent_1px)] [background-size:14px_14px] px-5 pb-5 pt-5 text-center">
              <Image
                src="/images/logo_basic.png"
                alt="Sneakers Flash"
                width={140}
                height={36}
                className="h-5 w-auto object-contain"
              />

              {mode === 'tamu' && (
                <>
                  <div className="flex flex-col items-center gap-1.5">
                    <h2 className="text-[19px] font-black uppercase leading-tight tracking-tight text-[#0D0D0D]">
                      Your 100K Flash Point is waiting.
                    </h2>
                    <p className="text-[14px] font-semibold leading-snug text-[#0D0D0D]/80">
                      Register sekarang dan dapatkan 100K Flash Point untuk
                      dipakai selama 10.10 LOWTOBER.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <Link
                      href={`/register?callbackUrl=${callback}`}
                      onClick={tutup}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-[#F6E70A] text-[14px] font-black uppercase tracking-wide text-[#0D0D0D] transition-transform active:scale-[0.98]"
                    >
                      Register &amp; Get 100K
                    </Link>
                    <Link
                      href={`/login?callbackUrl=${callback}`}
                      onClick={tutup}
                      className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-[#0D0D0D] text-[14px] font-black uppercase tracking-wide text-[#0D0D0D] transition-transform active:scale-[0.98]"
                    >
                      Sudah punya akun? Login
                    </Link>
                  </div>
                </>
              )}

              {mode === 'klaim' && (
                <>
                  <p className="text-[14px] font-semibold leading-snug text-[#0D0D0D]">
                    Ada <span className="font-black">100.000 FlashPoint</span>{' '}
                    buat kamu. Klaim sekarang dan pakai langsung untuk potong
                    harga di checkout.
                  </p>
                  <button
                    type="button"
                    onClick={klaim}
                    disabled={mengklaim}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F6E70A] text-[14px] font-black uppercase tracking-wide text-[#0D0D0D] transition-transform active:scale-[0.98] disabled:opacity-70"
                  >
                    {mengklaim && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mengklaim ? 'Mengklaim…' : 'Klaim 100K FlashPoint'}
                  </button>
                  {galat && (
                    <p role="alert" className="text-[12px] font-semibold text-red-600">
                      {galat}
                    </p>
                  )}
                </>
              )}

              {mode === 'berhasil' && (
                <>
                  <div className="flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="h-9 w-9 text-green-600" />
                    <h2 className="text-[19px] font-black uppercase leading-tight tracking-tight text-[#0D0D0D]">
                      100K Flash Point is yours!
                    </h2>
                    <p className="text-[14px] font-semibold leading-snug text-[#0D0D0D]/80">
                      Congrats! 100K Flash Point udah masuk ke akun kamu.
                      Pakai buat belanja selama 10.10 LOWTOBER dan bikin The
                      Big Drop makin worth it.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={tutup}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0D0D0D] text-[14px] font-black uppercase tracking-wide text-white transition-transform active:scale-[0.98]"
                  >
                    Shop The Drop
                  </button>
                </>
              )}

              <p className="text-[11px] font-medium text-[#0D0D0D]/60">
                {mode === 'berhasil'
                  ? 'Valid during LOWTOBER. T&C apply.'
                  : 'Berlaku s/d 11 Oktober 2026 · sisa poin ditarik setelahnya'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
