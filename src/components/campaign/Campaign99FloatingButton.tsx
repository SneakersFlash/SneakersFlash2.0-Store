'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  CAMPAIGN_99_BERAKHIR,
  CAMPAIGN_99_HREF,
} from '@/lib/campaign/next-in-rotation-99';

/**
 * Tombol mengambang menuju halaman campaign 9.9.
 *
 * Disembunyikan di halaman campaign itu sendiri (percuma) dan di checkout
 * (jangan menarik orang keluar dari alur bayar). Juga hilang sendiri begitu
 * campaign lewat, supaya tidak perlu deploy lagi cuma untuk mencabutnya.
 *
 * Warnanya kuning-hitam, bukan merah seperti tombol 8.8: brief menetapkan
 * kuning sebagai penghubung antara campaign di sosial media dan website, dan
 * melarang tampilan oranye/marketplace.
 */
export function Campaign99FloatingButton() {
  const pathname = usePathname();
  const [tampil, setTampil] = useState(false);

  // Dipasang sesudah mount: tanpa ini, keputusan "sudah lewat atau belum"
  // dihitung saat build dan bisa beda dengan jam pembeli.
  useEffect(() => {
    if (Date.now() >= Date.parse(CAMPAIGN_99_BERAKHIR)) return;
    // Jeda singkat supaya tombol tidak menabrak konten saat halaman baru muncul.
    const t = setTimeout(() => setTampil(true), 600);
    return () => clearTimeout(t);
  }, []);

  const disembunyikan =
    pathname === CAMPAIGN_99_HREF ||
    pathname.startsWith(`${CAMPAIGN_99_HREF}/`) ||
    pathname.startsWith('/checkout');

  if (disembunyikan) return null;

  return (
    <Link
      href={CAMPAIGN_99_HREF}
      aria-label="Buka halaman 9.9 Next In Rotation"
      className={cn(
        'fixed z-40 right-4 flex items-center gap-2.5 rounded-full',
        'bg-[#F7E608] text-[#0D0D0D] shadow-lg shadow-black/25',
        'pl-3 pr-4 py-2.5 group',
        'transition-all duration-300 ease-out hover:brightness-95 active:scale-95',
        // Di layar kecil bottom-nav (~64px) menutupi kanan bawah, jadi tombol
        // digeser naik di atasnya; desktop tidak punya bottom-nav.
        'bottom-[200px] lg:bottom-[100px]',
        tampil
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none',
      )}
    >
      {/* Titik berdenyut — bahasa visual yang sama dengan lencana Special Event */}
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black" />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-black tracking-tight">9.9 SALE</span>
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 mt-0.5">
          Next In Rotation
        </span>
      </span>

      <ArrowRight
        size={15}
        strokeWidth={2.5}
        className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
