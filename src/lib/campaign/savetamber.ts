/**
 * Data voucher toko tiering SAVETAMBER (September 2026) untuk pop-up beranda.
 *
 * Angkanya SALINAN dari tabel `vouchers` campaign id 11 di backend
 * (SAVETAMBER25-2/3/4 untuk 25 Sep, SAVETAMBER-2/3/4 untuk 26–30 Sep). Pop-up
 * cuma hidup 5 detik, jadi tidak menunggu API — kalau voucher di admin diubah,
 * ubah juga di sini.
 *
 * Batas waktu ditulis dengan +07:00 eksplisit: yang menentukan periode adalah
 * jam WIB pembeli, bukan zona waktu server (kontainer berjalan di UTC).
 */

export interface TierSavetamber {
  persen: number;
  maks: string;
  minBelanja: string;
}

export interface PeriodeSavetamber {
  label: string;
  berakhir: string;
  tier: TierSavetamber[];
}

export const SAVETAMBER_NAMA = "SAVETAMBER";

/** Section klaim voucher di beranda (VoucherClaimSection, id="vouchers"). */
export const SAVETAMBER_HREF = "/#vouchers";

export const SAVETAMBER_MULAI = "2026-09-25T00:00:00+07:00";

/** Berurutan: periode pertama yang `berakhir`-nya belum lewat adalah yang tampil. */
export const SAVETAMBER_PERIODE: PeriodeSavetamber[] = [
  {
    label: "Khusus 25 September",
    berakhir: "2026-09-26T00:00:00+07:00",
    tier: [
      { persen: 2, maks: "50RB", minBelanja: "1JT" },
      { persen: 3, maks: "150RB", minBelanja: "1,5JT" },
      { persen: 4, maks: "300RB", minBelanja: "2,5JT" },
    ],
  },
  {
    label: "26 – 30 September",
    berakhir: "2026-10-01T00:00:00+07:00",
    tier: [
      { persen: 2, maks: "35RB", minBelanja: "700RB" },
      { persen: 3, maks: "100RB", minBelanja: "1,5JT" },
      { persen: 4, maks: "150RB", minBelanja: "2JT" },
    ],
  },
];

/** Periode yang berlaku pada `sekarang`, atau null di luar jendela campaign. */
export function periodeSavetamberAktif(
  sekarang: number = Date.now(),
): PeriodeSavetamber | null {
  if (sekarang < Date.parse(SAVETAMBER_MULAI)) return null;
  return (
    SAVETAMBER_PERIODE.find((p) => sekarang < Date.parse(p.berakhir)) ?? null
  );
}
