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
    // Instance Decimal.js asli punya toString() yang mengembalikan nilai penuh.
    // Objek hasil JSON.parse TIDAK punya itu — String()-nya "[object Object]"
    // → NaN → saldo tampil 0 tanpa error sama sekali. Ini yang bikin bonus
    // 81.000 poin tidak kelihatan di halaman akun (13 Agt 2026).
    const asString = String(value);
    if (asString !== "[object Object]") {
      const parsed = Number(asString);
      if (Number.isFinite(parsed)) return parsed;
    }

    const dec = value as { s?: number; e?: number; d?: unknown };
    if (Array.isArray(dec.d) && typeof dec.e === "number") {
      const digits = dec.d as number[];
      // `d` menyimpan digit dalam basis 1e7: grup pertama apa adanya, sisanya
      // dipadkan 7 digit. `e` menandai posisi titik desimal dari digit pertama.
      const raw =
        String(digits[0] ?? 0) +
        digits
          .slice(1)
          .map((g) => String(g).padStart(7, "0"))
          .join("");

      const titik = dec.e + 1;
      const teks =
        titik <= 0
          ? `0.${"0".repeat(-titik)}${raw}`
          : titik >= raw.length
            ? raw.padEnd(titik, "0")
            : `${raw.slice(0, titik)}.${raw.slice(titik)}`;

      const parsed = Number(teks) * (dec.s === -1 ? -1 : 1);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
}
