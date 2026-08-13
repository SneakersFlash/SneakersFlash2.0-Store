/**
 * Jendela promo bonus poin registrasi (Kemerdekaan).
 *
 * HARUS sama persis dengan `SIGNUP_POINTS_PROMO` di backend
 * (`src/common/constants/loyalty.ts`). Kalau salah satu diubah, ubah keduanya —
 * kalau tidak, storefront menjanjikan hadiah yang tidak diberikan backend.
 *
 * Offset +07:00 ditulis eksplisit supaya tidak ikut zona waktu browser
 * pengunjung: promo berakhir 17 Agustus 2026 pukul 23:59 WIB untuk semua orang.
 */
export const SIGNUP_POINTS_PROMO = {
  amount: 81000,
  startAt: new Date("2026-08-13T00:00:00+07:00"),
  endAt: new Date("2026-08-18T00:00:00+07:00"),
};

export function isSignupPointsPromoActive(now: Date = new Date()): boolean {
  return now >= SIGNUP_POINTS_PROMO.startAt && now < SIGNUP_POINTS_PROMO.endAt;
}
