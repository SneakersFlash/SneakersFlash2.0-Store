/**
 * Data pencocokan Meta di browser: cookie _fbc dari fbclid, dan cache
 * Advanced Matching (em/ph/external_id ter-hash) untuk fbq('init').
 *
 * Normalisasi & hash WAJIB sama dengan backend
 * (sneakersflash/src/modules/meta-pixel/meta-capi.payload.ts) — kalau beda,
 * hash browser ≠ hash server dan pencocokan gagal diam-diam.
 */

/** Kunci cache yang dibaca script init pixel di app/layout.tsx (sinkron). */
export const META_AM_CACHE_KEY = "sf-meta-am";

const FBC_MAX_AGE_S = 90 * 24 * 3600; // umur _fbc bawaan Meta

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

/**
 * fbclid di URL pendaratan → cookie _fbc `fb.1.<ms>.<fbclid>`. Plugin cookie
 * pixel biasanya sudah melakukannya; ini cadangan saat fbevents.js diblokir
 * (adblock) atau belum termuat. Klik baru (fbclid beda) menimpa yang lama.
 */
export function captureFbc(search: string, hostname: string): void {
  const fbclid = new URLSearchParams(search).get("fbclid");
  if (!fbclid) return;
  const existing = readCookie("_fbc");
  if (existing && existing.split(".").slice(3).join(".") === fbclid) return;

  const value = `fb.1.${Date.now()}.${fbclid}`;
  // Domain induk supaya terbaca di sneakersflash.com dan www (subdomain index 1).
  const domain = hostname.endsWith("sneakersflash.com")
    ? "; domain=.sneakersflash.com"
    : "";
  document.cookie = `_fbc=${encodeURIComponent(value)}; path=/; max-age=${FBC_MAX_AGE_S}; SameSite=Lax; Secure${domain}`;
}

/** Cookie Meta untuk dikirim bareng checkout (disimpan di order untuk CAPI). */
export function metaCookies(): { fbp?: string; fbc?: string } {
  return { fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
}

/** Sama dengan normalizePhoneId backend: 08xx / +628xx / 8xx → 628xx. */
export function normalizePhoneId(phone?: string | null): string | null {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return /^62\d{8,12}$/.test(d) ? d : null;
}

async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value.trim().toLowerCase()),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Simpan em/ph/external_id ter-hash untuk user yang login, atau hapus kalau
 * logout. Pixel menerima nilai yang sudah di-hash (64 hex) apa adanya.
 */
export async function syncAdvancedMatchingCache(
  user: { id?: string | number; email?: string; phone?: string } | null,
): Promise<void> {
  try {
    if (!user) {
      localStorage.removeItem(META_AM_CACHE_KEY);
      return;
    }
    if (typeof crypto === "undefined" || !crypto.subtle) return;
    const email = (user.email ?? "").trim().toLowerCase();
    const phone = normalizePhoneId(user.phone);
    const cache: Record<string, string | number> = { v: 1 };
    if (email.includes("@")) cache.em = await sha256Hex(email);
    if (phone) cache.ph = await sha256Hex(phone);
    if (user.id != null && String(user.id))
      cache.external_id = await sha256Hex(String(user.id));
    localStorage.setItem(META_AM_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage diblokir / crypto tidak ada — pixel tetap jalan tanpa AM.
  }
}
