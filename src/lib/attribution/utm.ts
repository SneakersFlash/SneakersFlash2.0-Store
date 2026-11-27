// Atribusi UTM (link KOL / kampanye).
//
// Model "klik terakhir 30 hari": tiap kali pengunjung mendarat lewat link
// ber-UTM, nilainya menimpa yang lama dan berlaku 30 hari. Saat checkout,
// nilai yang masih berlaku ikut dikirim dan disimpan di order.
//
// Disimpan di localStorage, bukan cookie: tidak perlu terbaca server, dan
// tidak ikut membebani tiap request. Semua akses dibungkus try/catch karena
// localStorage bisa melempar (mode privat / storage diblokir) - atribusi yang
// hilang jauh lebih murah daripada halaman yang crash.

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

const KUNCI = "sf_utm";
const KUNCI_SESI = "sf_utm_visit";
const UMUR_MS = 30 * 24 * 60 * 60 * 1000;

// Klik iklan META dihitung cuma 7 hari — sama dengan jendela atribusi Meta
// (7 hari setelah klik). Dulu 30 hari seperti UTM lain, jadi order dari klik
// iklan berumur 8–30 hari terlabel "Ads" di website padahal Meta sudah tidak
// mengkreditkannya → angka website & Meta tidak selaras. UTM lain (KOL, dll)
// tetap 30 hari.
const UMUR_META_ADS_MS = 7 * 24 * 60 * 60 * 1000;
// Sumber yang ditempel Meta otomatis ke klik iklan (utm_source) + medium berbayar.
const SUMBER_META = ["ig", "fb", "th", "an", "msg", "facebook", "instagram", "threads", "meta"];
const MEDIUM_BERBAYAR = ["paid", "paid_social", "paid-social", "paidsocial", "cpc", "ppc", "cpm", "ads", "ad"];

export function isKlikIklanMeta(utm?: Utm | null): boolean {
  return !!utm && SUMBER_META.includes(utm.source ?? "") && MEDIUM_BERBAYAR.includes(utm.medium ?? "");
}
const FIELD = ["source", "medium", "campaign", "content", "term"] as const;

/**
 * Ambil UTM dari query string; null kalau tidak ada satu pun.
 *
 * Klik iklan yang datang tanpa UTM masih bisa dikenali dari click ID yang
 * ditempel platformnya: ttclid (TikTok) & gclid/gbraid/wbraid (Google) cuma
 * muncul dari iklan, jadi dicatat sebagai medium berbayar. fbclid SENGAJA
 * tidak dipakai: Meta menempelkannya juga ke klik link organik FB/IG. Iklan
 * Meta sendiri sudah membawa UTM otomatis (utm_source=ig|fb|th,
 * utm_medium=paid, utm_campaign/utm_content = ID kampanye/iklan).
 */
export function bacaUtmDariUrl(search: string): Utm | null {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const f of FIELD) {
    const v = params.get(`utm_${f}`)?.trim().toLowerCase().slice(0, 100);
    if (v) utm[f] = v;
  }
  if (Object.keys(utm).length) return utm;
  if (params.get("ttclid")) return { source: "tiktok", medium: "paid" };
  if (params.get("gclid") || params.get("gbraid") || params.get("wbraid")) {
    return { source: "google", medium: "cpc" };
  }
  return null;
}

export function simpanUtm(utm: Utm) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify({ utm, at: Date.now() }));
  } catch {}
}

/** UTM yang masih berlaku (< 30 hari), untuk dikirim saat checkout. */
export function ambilUtm(): Utm | undefined {
  try {
    const raw = localStorage.getItem(KUNCI);
    if (!raw) return undefined;
    const { utm, at } = JSON.parse(raw);
    if (typeof at !== "number" || Date.now() - at > UMUR_MS) {
      localStorage.removeItem(KUNCI);
      return undefined;
    }
    // Klik iklan Meta > 7 hari: di luar jendela Meta → bukan "Ads" lagi.
    if (isKlikIklanMeta(utm) && Date.now() - at > UMUR_META_ADS_MS) return undefined;
    return utm;
  } catch {
    return undefined;
  }
}

/**
 * True kalau kunjungan dengan UTM ini belum dicatat di sesi tab ini - supaya
 * refresh atau pindah halaman tidak menggandakan hitungan kunjungan.
 */
export function kunjunganBaru(utm: Utm): boolean {
  const id = JSON.stringify(utm);
  try {
    if (sessionStorage.getItem(KUNCI_SESI) === id) return false;
    sessionStorage.setItem(KUNCI_SESI, id);
  } catch {}
  return true;
}
