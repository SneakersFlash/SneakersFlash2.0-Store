'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './LowtoberSection.module.css';

export type LowtoberProduct = {
  id: string | number;
  name: string;
  href: string;          // contoh: `/product/${slug}`
  image: string;
  price: number;         // harga promo
  originalPrice: number; // harga coret
  stock: number;
};

type Props = {
  products: LowtoberProduct[];
  endsAt: string | Date;   // contoh: '2026-10-31T23:59:59+07:00'
  seeAllHref?: string;
  speedSeconds?: number;   // durasi 1 putaran baris produk
};

const rupiah = (n: number) => new Intl.NumberFormat('id-ID').format(n);
const pad = (n: number) => String(n).padStart(2, '0');

function useCountdown(endsAt: string | Date) {
  const end = useMemo(() => new Date(endsAt).getTime(), [endsAt]);
  const [now, setNow] = useState<number | null>(null); // null di server → hindari hydration mismatch

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  let s = now === null ? 0 : Math.max(0, Math.floor((end - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;

  return {
    ready: now !== null,
    expired: now !== null && end - now <= 0,
    parts: [
      { v: pad(d), l: 'HARI' },
      { v: pad(h), l: 'JAM' },
      { v: pad(m), l: 'MNT' },
      { v: pad(s), l: 'DTK' },
    ],
  };
}

/** Ulang item sampai cukup panjang, lalu digandakan supaya loop marquee mulus. */
function loop<T>(items: T[], min = 8): T[] {
  if (items.length === 0) return [];
  const out: T[] = [];
  while (out.length < min) out.push(...items);
  return out.concat(out);
}

function ProductCard({ p }: { p: LowtoberProduct }) {
  const off = p.originalPrice > 0 ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const bar = Math.max(8, Math.min(100, Math.round((p.stock / 12) * 100)));

  return (
    <Link href={p.href} className={styles.card} aria-label={`${p.name}, Rp ${rupiah(p.price)}`}>
      <div className={styles.cardTop}>
        {off > 0 && <span className={styles.badge}>-{off}%</span>}
        <span className={styles.wordmark}>SNKRS<br />FLASH</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.image} alt={p.name} className={styles.img} loading="lazy" />
      <span className={styles.eyebrow}>EVENT PROMO</span>
      <span className={styles.name}>{p.name}</span>
      <span className={styles.price}>Rp {rupiah(p.price)}</span>
      {p.originalPrice > p.price && <span className={styles.was}>Rp {rupiah(p.originalPrice)}</span>}
      <div className={styles.stock}>
        <div className={styles.track}><div className={styles.fill} style={{ width: `${bar}%` }} /></div>
        <span className={styles.stockLabel}>Sisa {p.stock}</span>
      </div>
    </Link>
  );
}

export default function LowtoberSection({
  products,
  endsAt,
  seeAllHref = '/event/lowtober',
  speedSeconds = 60,
}: Props) {
  const { parts, expired } = useCountdown(endsAt);

  const inStock = products.filter((p) => p.stock > 0);
  const row1 = loop(inStock.filter((_, i) => i % 2 === 0));
  const row2 = loop(inStock.filter((_, i) => i % 2 === 1).length ? inStock.filter((_, i) => i % 2 === 1) : inStock);
  const words = Array.from({ length: 20 }, (_, i) => (i % 2 ? 'LOWTOBER' : 'SALE'));

  if (expired || inStock.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Lowtober Sale">
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.marquee} aria-hidden="true">
            <div className={`${styles.move} ${styles.left}`} style={{ animationDuration: `${Math.round(speedSeconds * 0.6)}s` }}>
              {words.map((w, i) => <span key={i} className={styles.word}>{w}</span>)}
            </div>
          </div>
          <h2 className={styles.srOnly}>Lowtober Sale</h2>

          <div className={styles.divider} />

          <div className={styles.timerRow}>
            <div className={styles.timer} role="timer" aria-label="Sisa waktu promo">
              {parts.map((t) => (
                <div key={t.l} className={styles.box}>
                  <span className={styles.boxV}>{t.v}</span>
                  <span className={styles.boxL}>{t.l}</span>
                </div>
              ))}
            </div>
            <Link href={seeAllHref} className={styles.seeAll} aria-label="Lihat semua promo Lowtober">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {[{ items: row1, dir: styles.left }, { items: row2, dir: styles.right }].map((row, r) => (
          <div key={r} className={styles.lane}>
            <div className={`${styles.move} ${row.dir}`} style={{ animationDuration: `${speedSeconds}s` }}>
              {row.items.map((p, i) => <ProductCard key={`${p.id}-${i}`} p={p} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
