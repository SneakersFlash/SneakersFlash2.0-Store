import Link from 'next/link';

/**
 * Penjelas "Next in Rotation" — tiga slot: Daily, Active, dan slot kosong.
 *
 * Ini inti pesan campaign-nya, bukan hiasan: brief menuntut orang paham dalam
 * satu detik bahwa ada kebutuhan yang BELUM terisi di rotasi mereka. Karena itu
 * kartu ketiga sengaja dibiarkan kosong dan bergaris putus-putus — bentuk "slot
 * bolong" yang mengundang diisi — sementara dua kartu pertama solid.
 *
 * Tiap kartu adalah tautan ke section produknya di halaman yang sama, jadi
 * penjelasnya sekaligus jadi navigasi.
 */

const SLOT = [
  {
    nomor: '01',
    judul: 'Daily',
    baris: [
      'Lifestyle sneakers',
      'Neutral & versatile',
      'Office • campus • hangout',
    ],
    kicker: 'Made for the everyday rotation.',
    href: '#daily-99',
    // Kartu hitam: judul & kicker kuning, isi putih.
    kelas: 'bg-[#0D0D0D] text-white',
    kelasJudul: 'text-primary',
    kelasIsi: 'text-white/75',
    kelasKicker: 'text-primary',
  },
  {
    nomor: '02',
    judul: 'Active',
    baris: [
      'Running & training',
      'Comfort & cushioning',
      'For days that keep moving',
    ],
    kicker: 'Ready when your day gets moving.',
    href: '#active-99',
    // Kartu kuning: semuanya hitam.
    kelas: 'bg-primary text-primary-foreground',
    kelasJudul: 'text-primary-foreground',
    kelasIsi: 'text-primary-foreground/75',
    kelasKicker: 'text-primary-foreground',
  },
];

/** Panah putus-putus antar kartu — hanya muncul di layar lebar. */
function Panah() {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex items-center justify-center px-1"
    >
      <span className="block w-10 border-t-2 border-dashed border-foreground/30" />
      <span className="ml-[-2px] border-y-[5px] border-y-transparent border-l-[8px] border-l-foreground/30" />
    </div>
  );
}

export function RotationExplainer99() {
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-0">
      {SLOT.map((slot) => (
        // `contents` supaya kartu dan panahnya jadi anak langsung grid di lg,
        // tanpa pembungkus yang merusak kolom.
        <div key={slot.nomor} className="contents">
          <Link
            href={slot.href}
            className={`group flex flex-col gap-4 p-6 md:p-7 rounded-2xl transition-transform duration-200 hover:-translate-y-1 ${slot.kelas}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] opacity-60">
              {slot.nomor} {slot.judul}
            </span>

            <h3
              className={`text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight ${slot.kelasJudul}`}
            >
              {slot.judul}
              <br />
              Rotation
            </h3>

            <ul
              className={`teks-ringan text-sm leading-relaxed ${slot.kelasIsi}`}
            >
              {slot.baris.map((baris) => (
                <li key={baris}>{baris}</li>
              ))}
            </ul>

            <span
              className={`mt-auto pt-4 text-[11px] font-bold uppercase tracking-widest ${slot.kelasKicker}`}
            >
              {slot.kicker}
            </span>
          </Link>

          <Panah />
        </div>
      ))}

      {/* ── Slot ketiga: sengaja kosong ── */}
      <Link
        href="#fresh-99"
        className="group flex flex-col gap-4 p-6 md:p-7 rounded-2xl border-2 border-dashed border-foreground/30 transition-colors duration-200 hover:border-primary"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          03 Next ?
        </span>

        <h3 className="text-2xl md:text-3xl font-black uppercase leading-[0.95] tracking-tight">
          Next
          <br />
          In Rotation
        </h3>

        {/* Tanda tanya besar = slot yang belum terisi. aria-hidden karena
            maknanya sudah ditulis di teks di bawahnya. */}
        <span
          aria-hidden="true"
          className="text-5xl md:text-6xl font-black text-primary leading-none"
        >
          ?
        </span>

        <p className="teks-ringan text-sm leading-relaxed text-muted-foreground">
          Kebutuhan berikutnya yang belum terisi di rotasi kamu.
        </p>

        <span className="mt-auto pt-4 text-[11px] font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
          What&apos;s next in yours?
        </span>
      </Link>
    </div>
  );
}
