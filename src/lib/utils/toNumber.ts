/**
 * Ubah nilai Prisma Decimal dari API jadi number.
 *
 * Backend menyimpan uang & poin sebagai `Decimal(15,2)`. Bentuknya di response
 * JSON tidak konsisten tergantung apakah objeknya sempat lewat `toJSON()`:
 *   - "23790"                     → string (paling umum, Decimal.toJSON)
 *   - 23790                       → number
 *   - { s: 1, e: 4, d: [23790] }  → objek Decimal.js mentah
 *
 * Jangan pernah baca `.d[0]` langsung: itu representasi internal Decimal.js
 * yang dipecah per 7 digit, jadi nilai >= 1e7 akan terbaca salah total.
 */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value === "object") {
    // Decimal.js punya toString() yang selalu mengembalikan nilai penuh.
    const parsed = Number(String(value));
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}
