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
const FIELD = ["source", "medium", "campaign", "content", "term"] as const;

/** Ambil UTM dari query string; null kalau tidak ada satu pun. */
export function bacaUtmDariUrl(search: string): Utm | null {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const f of FIELD) {
    const v = params.get(`utm_${f}`)?.trim().toLowerCase().slice(0, 100);
    if (v) utm[f] = v;
  }
  return Object.keys(utm).length ? utm : null;
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
