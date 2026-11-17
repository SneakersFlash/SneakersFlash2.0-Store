// Pop-up pembayaran Snap Midtrans. Pembeli memilih metode (VA, QRIS, GoPay,
// ShopeePay, kartu kredit + cicilan, Akulaku, ...) di dalam Snap; channel yang
// tampil = channel aktif di dashboard Midtrans.

type SnapResult = { order_id?: string; transaction_status?: string; status_code?: string };
type SnapHandlers = {
  onSuccess?: (r: SnapResult) => void;
  onPending?: (r: SnapResult) => void;
  onError?: (r: SnapResult) => void;
  onClose?: () => void;
};

const SCRIPT_ID = "midtrans-snap";
let loading: Promise<any> | null = null;

function snapScriptUrl() {
  return process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

export function snapRedirectUrl(token: string) {
  const host = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  return `${host}/snap/v4/redirection/${token}`;
}

export function loadSnap(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Snap hanya di browser"));
  const w = window as any;
  if (w.snap?.pay) return Promise.resolve(w.snap);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const done = () => (w.snap?.pay ? resolve(w.snap) : reject(new Error("Snap gagal dimuat")));
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", done, { once: true });
    s.addEventListener("error", () => reject(new Error("Snap gagal dimuat")), { once: true });
    if (!existing) {
      s.id = SCRIPT_ID;
      s.src = snapScriptUrl();
      s.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
      document.head.appendChild(s);
    }
  }).catch((e) => { loading = null; throw e; });
  return loading;
}

/**
 * Buka pop-up Snap. Kalau script Snap gagal dimuat (diblokir jaringan/ekstensi),
 * jatuh ke halaman Snap penuh lewat redirect — pembayaran tetap bisa jalan.
 */
export async function openSnap(token: string, handlers: SnapHandlers = {}) {
  try {
    const snap = await loadSnap();
    snap.pay(token, handlers);
  } catch {
    window.location.href = snapRedirectUrl(token);
  }
}
