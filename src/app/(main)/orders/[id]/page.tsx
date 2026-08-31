"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Copy, CheckCircle2, ArrowLeft, AlertCircle, ChevronDown, ChevronUp, Wallet, ExternalLink, Smartphone } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ordersService } from "@/lib/api/orders.service";
import ThunderLoader from "@/components/common/ThunderLoader";
import { ThunderBolt } from "@/components/common/ThunderBolt";
import ThunderSpinner from "@/components/common/ThunderSpinner";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod =
  | "qris" | "gopay" | "shopeepay"
  | "bni_va" | "bri_va" | "permata_va" | "mandiri_va"
  | "akulaku" | "credit_card" | "bca_va";

/** Nama tampilan per metode */
const METHOD_LABEL: Record<string, string> = {
  qris:        "QRIS",
  gopay:       "GoPay",
  shopeepay:   "ShopeePay",
  bca_va:      "BCA Virtual Account",
  bni_va:      "BNI Virtual Account",
  bri_va:      "BRI Virtual Account",
  permata_va:  "PermataBank Virtual Account",
  mandiri_va:  "Mandiri Bill Payment",
  akulaku:     "Akulaku PayLater",
  credit_card: "Kartu Kredit / Debit",
};

/** Nama bank singkat — untuk label badge */
const METHOD_BADGE: Record<string, string> = {
  qris:        "QRIS",
  gopay:       "GoPay",
  shopeepay:   "ShopeePay",
  bca_va:      "BCA",
  bni_va:      "BNI",
  bri_va:      "BRI",
  permata_va:  "Permata",
  mandiri_va:  "Mandiri",
  akulaku:     "Akulaku",
  credit_card: "CARD",
};

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** Mandiri simpan vaNumber sebagai "billerCode|billKey" */
function parseMandiri(vaNumber: string | null): { billerCode: string; billKey: string } | null {
  if (!vaNumber || !vaNumber.includes("|")) return null;
  const [billerCode, billKey] = vaNumber.split("|");
  return { billerCode, billKey };
}

// ─────────────────────────────────────────────────────────────────────────────
// Instruksi pembayaran per metode
// ─────────────────────────────────────────────────────────────────────────────

function PaymentInstructions({
  method, vaNumber, total,
}: {
  method: string;
  vaNumber?: string | null;
  total: number;
}) {
  const formattedTotal = formatPrice(total);

  if (method === "qris") {
    return (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Buka aplikasi m-Banking atau e-Wallet (GoPay, OVO, DANA, dll.).</li>
        <li>Pilih menu <strong>Scan QR</strong>.</li>
        <li>Scan QR Code yang tampil di halaman ini.</li>
        <li>Pastikan nominal sesuai: <strong className="text-[#E05600]">{formattedTotal}</strong>.</li>
        <li>Masukkan PIN untuk menyelesaikan pembayaran.</li>
      </ol>
    );
  }

  if (method === "gopay") {
    return (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Tap tombol <strong>Buka GoPay</strong> di bawah (mobile) atau scan QR (desktop).</li>
        <li>Aplikasi GoPay akan terbuka otomatis.</li>
        <li>Pastikan nominal: <strong className="text-[#E05600]">{formattedTotal}</strong>.</li>
        <li>Masukkan PIN GoPay untuk konfirmasi.</li>
      </ol>
    );
  }

  if (method === "shopeepay") {
    return (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Tap tombol <strong>Buka ShopeePay</strong> di bawah.</li>
        <li>Aplikasi Shopee akan terbuka dan memunculkan halaman konfirmasi pembayaran.</li>
        <li>Pastikan nominal: <strong className="text-[#E05600]">{formattedTotal}</strong>.</li>
        <li>Masukkan PIN ShopeePay untuk konfirmasi.</li>
      </ol>
    );
  }

  if (method === "mandiri_va") {
    const mandiri = parseMandiri(vaNumber ?? null);
    return (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Login ke Mandiri Online / ATM Mandiri.</li>
        <li>Pilih menu <strong>Bayar</strong> &gt; <strong>Multipayment</strong>.</li>
        <li>Masukkan Kode Perusahaan: <strong className="text-black">{mandiri?.billerCode ?? "-"}</strong>.</li>
        <li>Masukkan Nomor Tagihan: <strong className="text-black">{mandiri?.billKey ?? "-"}</strong>.</li>
        <li>Pastikan tagihan: <strong className="text-[#E05600]">{formattedTotal}</strong>, lalu konfirmasi.</li>
      </ol>
    );
  }

  if (method === "akulaku") {
    return (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Kamu akan diarahkan ke halaman Akulaku PayLater.</li>
        <li>Login ke akun Akulaku kamu.</li>
        <li>Pilih cicilan yang sesuai dan konfirmasi pembayaran.</li>
        <li>Setelah berhasil, kamu akan diarahkan kembali ke halaman pesanan.</li>
      </ol>
    );
  }

  if (method === "credit_card") {
    return (
      <ol className="list-decimal pl-5 space-y-2">
        <li>Kamu akan diarahkan ke halaman verifikasi 3D Secure bank penerbit.</li>
        <li>Masukkan OTP yang dikirim ke nomor HP terdaftar.</li>
        <li>Setelah verifikasi berhasil, pembayaran akan diproses otomatis.</li>
      </ol>
    );
  }

  // BNI / BRI / Permata VA
  return (
    <ol className="list-decimal pl-5 space-y-2">
      <li>Buka m-Banking, Internet Banking, atau ATM.</li>
      <li>Pilih <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</li>
      <li>Masukkan Nomor VA: <strong className="text-black">{vaNumber ?? "-"}</strong>.</li>
      <li>Pastikan nominal: <strong className="text-[#E05600]">{formattedTotal}</strong>.</li>
      <li>Selesaikan transaksi dan simpan bukti bayar.</li>
    </ol>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OrderPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [order, setOrder]           = useState<any>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState("");
  const [timeLeft, setTimeLeft]     = useState<{
    hours: number; minutes: number; seconds: number;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<"va" | "biller" | "billkey" | "amount" | "order" | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isRefreshing, setIsRefreshing]           = useState(false);
  const [isMobile, setIsMobile]                   = useState(false);

  // Detect mobile setelah hydration
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // ── Fetch order ─────────────────────────────────────────────────────────
  const fetchOrderDetails = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const data = await ordersService.getOrderDetails(resolvedParams.id);
        setOrder(data);
        if (data.status === "paid" || data.status === "processing") {
          router.push(`/orders/${resolvedParams.id}/success`);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Gagal memuat detail pesanan.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [resolvedParams.id, router],
  );

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // ── Auto-redirect untuk Akulaku & Credit Card 3DS ───────────────────────
  useEffect(() => {
    if (!order) return;
    const method: PaymentMethod = order.paymentMethod;
    if (
      (method === "akulaku" || method === "credit_card") &&
      order.deeplinkUrl &&
      order.status !== "paid" &&
      order.status !== "processing"
    ) {
      window.location.href = order.deeplinkUrl;
    }
  }, [order]);

  // ── Countdown ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!order) return;
    if (order.status !== "waiting_payment" && order.status !== "pending") return;

    const expiryMs = order.expireTime
      ? new Date(order.expireTime).getTime()
      : new Date(order.createdAt).getTime() + 60 * 60 * 1000;

    const timer = setInterval(() => {
      const distance = expiryMs - Date.now();
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          hours:   Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  // ── Copy handler ─────────────────────────────────────────────────────────
  const handleCopy = (
    text: string,
    field: "va" | "biller" | "billkey" | "amount" | "order",
  ) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Loading / Error states
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <ThunderLoader variant="fullscreen" />
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] p-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Gagal Memuat Pesanan</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 text-[#E05600] font-bold"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Kalau akulaku/credit_card dan ada deeplink → tampilkan loading redirect
  const method: PaymentMethod = order.paymentMethod;
  if (
    (method === "akulaku" || method === "credit_card") &&
    order.deeplinkUrl
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4 p-6 text-center">
        <ThunderBolt className="h-14 w-14" />
        <p className="font-bold text-gray-800">
          {method === "akulaku" ? "Mengarahkan ke Akulaku PayLater..." : "Mengarahkan ke halaman verifikasi 3DS..."}
        </p>
        <p className="text-[13px] text-gray-500">Jika tidak otomatis diarahkan, klik tombol di bawah.</p>
        <a
          href={order.deeplinkUrl}
          className="bg-[#E05600] text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <ExternalLink size={16} /> Lanjutkan Pembayaran
        </a>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────────────────

  const isQrMethod   = method === "qris";
  const isGoPay      = method === "gopay";
  const isShopeePay  = method === "shopeepay";
  const isVA         = ["bni_va", "bri_va", "permata_va", "bca_va"].includes(method);
  const isMandiriVA  = method === "mandiri_va";
  const mandiriData  = isMandiriVA ? parseMandiri(order.vaNumber) : null;

  const showQrSection   = isQrMethod || isGoPay;
  const showVASection   = isVA;
  const showMandiriSection = isMandiriVA;
  const showDeeplinkBtn = isShopeePay || (isGoPay && isMobile);

  const methodLabel = METHOD_LABEL[method] ?? method.toUpperCase();
  const methodBadge = METHOD_BADGE[method] ?? method.toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900 pb-24 lg:pb-16">

      {/* HEADER */}
      <header className="bg-white px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center hover:bg-gray-50 p-1.5 -ml-1.5 rounded-full transition-colors"
        >
          <ArrowLeft size={22} className="text-black" />
        </button>
        <p className="text-[18px] font-bold text-black">Payment Status</p>
      </header>

      <main className="max-w-6xl mx-auto w-full p-0 sm:p-4 lg:p-6 flex flex-col lg:flex-row items-start gap-4 lg:gap-8 mt-0 lg:mt-4">

        {/* ─── KOLOM KIRI ────────────────────────────────────────────────── */}
        <div className="flex-1 w-full flex flex-col gap-2 sm:gap-4">

          {/* Timer Banner */}
          <div className="bg-[#E05600] text-white px-5 py-4 sm:rounded-xl shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <span className="text-[14px] font-medium">
              Selesaikan pembayaran sebelum waktu habis
            </span>
            {timeLeft ? (
              <span className="font-bold text-[15px] bg-white/20 px-3 py-1 rounded-lg tabular-nums">
                {timeLeft.hours > 0 ? `${timeLeft.hours}j ` : ""}
                {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                {String(timeLeft.seconds).padStart(2, "0")}d
              </span>
            ) : (
              <span className="font-bold text-[15px] bg-white/20 px-3 py-1 rounded-lg">
                Waktu Habis
              </span>
            )}
          </div>

          {/* Cara Pembayaran Card */}
          <div className="bg-white sm:rounded-xl shadow-sm border-y sm:border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 font-black italic text-[11px] rounded uppercase tracking-wide">
                  {methodBadge}
                </div>
                <span className="font-bold text-[15px]">{methodLabel}</span>
              </div>
              <button
                onClick={() => setIsInstructionOpen((v) => !v)}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 p-2 rounded-full"
              >
                {isInstructionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {/* Accordion instruksi */}
            {isInstructionOpen && (
              <div className="px-5 py-5 bg-gray-50/50 border-t border-gray-100 text-[14px] text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-800 mb-3">Cara Pembayaran:</p>
                <PaymentInstructions
                  method={method}
                  vaNumber={order.vaNumber}
                  total={order.total}
                />
              </div>
            )}
          </div>

          {/* ShopeePay / GoPay Mobile — deeplink CTA */}
          {showDeeplinkBtn && order.deeplinkUrl && (
            <a
              href={order.deeplinkUrl}
              className="bg-white sm:rounded-xl shadow-sm border-y sm:border border-gray-100 px-5 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-[#E05600]" />
                <div>
                  <p className="font-bold text-[14px]">
                    {isShopeePay ? "Buka ShopeePay" : "Buka GoPay"}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    Klik untuk membuka aplikasi langsung
                  </p>
                </div>
              </div>
              <ExternalLink size={18} className="text-gray-400 group-hover:text-[#E05600] transition-colors" />
            </a>
          )}

        </div>

        {/* ─── KOLOM KANAN (sticky) ──────────────────────────────────────── */}
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 px-4 sm:px-0">

          {/* Main Payment Card */}
          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">

            {/* Label */}
            <div className="flex items-center gap-2 font-bold text-[13px] text-gray-800 uppercase tracking-wide">
              <Wallet size={18} className="text-[#E05600]" />
              <span>Rincian Tagihan</span>
            </div>

            {/* Order No */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">No. Pesanan</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold">
                  {order.orderNumber ?? order.id ?? "-"}
                </span>
                <button
                  onClick={() => handleCopy(order.orderNumber ?? order.id ?? "", "order")}
                  className="text-gray-400 hover:text-[#E05600] transition"
                >
                  {copiedField === "order" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <hr className="border-gray-100 border-dashed" />

            {/* Total */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-gray-500">Total Pembayaran</span>
                <button
                  onClick={() => handleCopy(String(order.total), "amount")}
                  className="text-gray-400 hover:text-[#E05600] transition"
                >
                  {copiedField === "amount" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <p className="text-[28px] font-black text-black tracking-tight mt-1">
                {formatPrice(order.total)}
              </p>
              <p className="text-[12px] text-red-500 mt-1 font-medium">
                Bayar tepat sesuai nominal. Selisih 1 rupiah pun gagal.
              </p>
            </div>

            <hr className="border-gray-100 border-dashed" />

            {/* ── QR Code (QRIS & GoPay desktop) ─────────────────────────── */}
            {showQrSection && (
              <div className="flex flex-col items-center py-2 gap-3">
                <p className="text-[13px] text-gray-500">
                  {isGoPay
                    ? isMobile
                      ? "Atau scan QR dengan aplikasi lain"
                      : "Scan QR dengan aplikasi GoPay"
                    : "Scan QR dengan e-Wallet / m-Banking manapun"}
                </p>
                <div className="w-56 h-56 relative border border-gray-200 rounded-2xl overflow-hidden p-2 bg-white shadow-inner">
                  {order.qrCodeUrl ? (
                    <Image
                      src={order.qrCodeUrl}
                      alt="QR Code Pembayaran"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-[12px] text-center px-4">
                      QR Code tidak tersedia
                    </div>
                  )}
                </div>
                {/* GoPay mobile CTA di dalam card */}
                {isGoPay && isMobile && order.deeplinkUrl && (
                  <a
                    href={order.deeplinkUrl}
                    className="w-full bg-[#00AED6] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-[14px]"
                  >
                    <Smartphone size={18} /> Buka GoPay
                  </a>
                )}
              </div>
            )}

            {/* ── VA Number (BNI / BRI / Permata) ────────────────────────── */}
            {showVASection && (
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-gray-500">Nomor Virtual Account</span>
                  <button
                    onClick={() => handleCopy(order.vaNumber ?? "", "va")}
                    className="text-gray-400 hover:text-[#E05600] transition bg-white p-1.5 rounded-md shadow-sm border border-gray-200"
                  >
                    {copiedField === "va" ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
                <p className="text-[18px] font-bold text-black">
                  {order.vaNumber ?? "-"}
                </p>
                <p className="text-[12px] text-gray-500 mt-1 font-medium">
                  Atas Nama: Sneaker Flash
                </p>
              </div>
            )}

            {/* ── Mandiri eChan (biller_code + bill_key) ──────────────────── */}
            {showMandiriSection && mandiriData && (
              <div className="flex flex-col gap-3">
                {/* Kode Perusahaan */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-gray-500">Kode Perusahaan</span>
                    <button
                      onClick={() => handleCopy(mandiriData.billerCode, "biller")}
                      className="text-gray-400 hover:text-[#E05600] transition bg-white p-1.5 rounded-md shadow-sm border border-gray-200"
                    >
                      {copiedField === "biller" ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-[20px] font-bold text-black tracking-widest">
                    {mandiriData.billerCode}
                  </p>
                </div>
                {/* Nomor Tagihan */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-gray-500">Nomor Tagihan (Bill Key)</span>
                    <button
                      onClick={() => handleCopy(mandiriData.billKey, "billkey")}
                      className="text-gray-400 hover:text-[#E05600] transition bg-white p-1.5 rounded-md shadow-sm border border-gray-200"
                    >
                      {copiedField === "billkey" ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-[20px] font-bold text-black tracking-widest">
                    {mandiriData.billKey}
                  </p>
                </div>
              </div>
            )}

            {/* ShopeePay — deeplink di dalam card (desktop fallback) */}
            {isShopeePay && order.deeplinkUrl && (
              <a
                href={order.deeplinkUrl}
                className="w-full bg-[#EE4D2D] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-[14px]"
              >
                <Smartphone size={18} /> Buka ShopeePay
              </a>
            )}

          </div>

          {/* Check Status Button */}
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchOrderDetails(false);
            }}
            disabled={isRefreshing}
            className="w-full bg-[#1C1C1C] text-white hover:bg-black active:scale-[0.98] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
          >
            {isRefreshing ? (
              <ThunderSpinner size={20} tone="mono" />
            ) : (
              "Cek Status Pembayaran"
            )}
          </button>

        </div>
      </main>
    </div>
  );
}