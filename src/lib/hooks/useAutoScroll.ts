"use client";

import { useEffect, useRef } from "react";

interface AutoScrollOptions {
  /** Jeda antar geseran, ms. */
  intervalMs?: number;
  /** Matikan tanpa melanggar aturan hooks (mis. section kosong). */
  enabled?: boolean;
}

/**
 * Auto-scroll horizontal untuk container ber-`overflow-x-auto`.
 * Kembalikan ref-nya, pasang ke elemen yang men-scroll.
 *
 * Home page memuat banyak carousel sekaligus (brand + 5 section produk + tiap
 * campaign event), jadi hook ini sengaja konservatif — geseran otomatis yang
 * jalan terus di semua section bikin halaman gelisah dan menghabiskan CPU
 * untuk barisan yang tidak sedang dilihat siapa pun:
 *
 * - berhenti kalau container-nya sedang di luar viewport;
 * - berhenti kalau tab-nya tidak aktif;
 * - berhenti selama pengunjung menyentuh/hover/fokus di dalamnya, dan setelah
 *   ia scroll sendiri — geseran otomatis yang merebut kontrol saat orang lagi
 *   melihat-lihat lebih menyebalkan daripada berguna;
 * - tidak jalan sama sekali kalau `prefers-reduced-motion` menyala, atau kalau
 *   isinya memang tidak melebihi lebar container (tidak ada yang bisa digeser).
 *
 * Langkah geser dihitung dari lebar kartu pertama + gap, jadi ikut `snap-start`
 * yang sudah dipakai section-section itu dan berhenti rapi di batas kartu.
 */
export function useAutoScroll<T extends HTMLElement>({
  intervalMs = 3500,
  enabled = true,
}: AutoScrollOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let inView = false;
    let heldByUser = false;
    // Ditahan sesaat setelah pengunjung scroll manual, supaya tidak langsung
    // direbut balik begitu jarinya lepas.
    let resumeAt = 0;

    const hold = () => {
      heldByUser = true;
    };
    const release = () => {
      heldByUser = false;
      resumeAt = Date.now() + 4000;
    };
    const onUserScroll = () => {
      resumeAt = Date.now() + 4000;
    };

    const stepWidth = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return Math.round(el.clientWidth * 0.8);
      const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
      return Math.round(first.getBoundingClientRect().width + gap);
    };

    const tick = () => {
      if (!inView || heldByUser || document.hidden) return;
      if (Date.now() < resumeAt) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Tidak ada yang melimpah — diam saja.
      if (scrollWidth - clientWidth < 8) return;

      if (scrollLeft + clientWidth >= scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: stepWidth(), behavior: "smooth" });
      }
    };

    const timer = window.setInterval(tick, intervalMs);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.2 },
    );
    observer.observe(el);

    // pointerenter menangkap mouse dan pena; touchstart menangkap jari, yang
    // tidak selalu mengirim pointerenter sebelum orang mulai menggeser.
    el.addEventListener("pointerenter", hold);
    el.addEventListener("pointerleave", release);
    el.addEventListener("touchstart", hold, { passive: true });
    el.addEventListener("touchend", release, { passive: true });
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", release);
    el.addEventListener("scroll", onUserScroll, { passive: true });

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      el.removeEventListener("pointerenter", hold);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("touchend", release);
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", release);
      el.removeEventListener("scroll", onUserScroll);
    };
  }, [intervalMs, enabled]);

  return ref;
}
