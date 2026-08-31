"use client";

/**
 * Halaman pendaratan setelah bayar di aplikasi e-wallet / PayLater.
 *
 * Backend mengirim `callback_url: {APP_URL}/payment/finish` ke Midtrans untuk
 * GoPay, ShopeePay, dan Akulaku. Sebelum halaman ini ada, semua customer yang
 * selesai membayar mendarat di 404 — kelihatan seperti pembayarannya gagal
 * padahal sudah masuk.
 *
 * Midtrans mengembalikan query `order_id` (= order_number kita),
 * `transaction_status`, dan `status_code`. Order number tidak bisa langsung
 * dipakai membuka /orders/[id] yang memakai id numerik, jadi nomornya dicocokkan
 * lewat daftar pesanan milik user. Kalau ketemu → langsung dialihkan ke detail
 * pesanan; kalau tidak (mis. sesi login hilang saat pindah ke app), tetap ada
 * layar status dengan nomor pesanannya, bukan halaman error.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { ordersService } from "@/lib/api/orders.service";
import { useAuthStore } from "@/lib/store/authStore";
import ThunderLoader from "@/components/common/ThunderLoader";

type Nada = "sukses" | "menunggu" | "gagal";

const NADA_DARI_STATUS: Record<string, Nada> = {
  settlement: "sukses",
  capture: "sukses",
  pending: "menunggu",
  deny: "gagal",
  cancel: "gagal",
  expire: "gagal",
  failure: "gagal",
};

const SALINAN: Record<Nada, { judul: string; pesan: string }> = {
  sukses: {
    judul: "Pembayaran berhasil",
    pesan: "Pesanan kamu sudah kami terima dan akan segera diproses.",
  },
  menunggu: {
    judul: "Menunggu pembayaran",
    pesan:
      "Kalau kamu sudah membayar, status akan berubah otomatis dalam beberapa menit.",
  },
  gagal: {
    judul: "Pembayaran tidak selesai",
    pesan:
      "Pesanan kamu belum dibayar. Kamu bisa coba bayar ulang dari detail pesanan.",
  },
};

function IsiHalaman() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const orderNumber = searchParams.get("order_id");
  const transactionStatus = searchParams.get("transaction_status") ?? "";

  const [mencari, setMencari] = useState(true);

  const nada: Nada = NADA_DARI_STATUS[transactionStatus] ?? "menunggu";
  const { judul, pesan } = SALINAN[nada];

  useEffect(() => {
    if (!isHydrated) return;
    if (!orderNumber || !isAuthenticated) {
      setMencari(false);
      return;
    }

    let batal = false;
    (async () => {
      try {
        const orders = await ordersService.getMyOrders();
        const daftar = Array.isArray(orders) ? orders : (orders?.data ?? []);
        const cocok = daftar.find(
          (o: any) =>
            o.orderNumber === orderNumber || o.order_number === orderNumber,
        );
        if (!batal && cocok?.id) {
          router.replace(`/orders/${cocok.id}`);
          return;
        }
      } catch {
        // Gagal ambil daftar pesanan bukan alasan menampilkan error ke customer —
        // layar status di bawah sudah cukup informatif.
      }
      if (!batal) setMencari(false);
    })();

    return () => {
      batal = true;
    };
  }, [isHydrated, isAuthenticated, orderNumber, router]);

  if (mencari) {
    return (
      <ThunderLoader variant="section" label="Mengecek status pembayaran" />
    );
  }

  const Ikon =
    nada === "sukses" ? CheckCircle2 : nada === "gagal" ? XCircle : Clock;
  const warna =
    nada === "sukses"
      ? "text-emerald-500"
      : nada === "gagal"
        ? "text-red-500"
        : "text-amber-500";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 text-center">
        <Ikon className={`w-14 h-14 mx-auto mb-4 ${warna}`} />
        <h1 className="text-lg font-black text-gray-900">{judul}</h1>
        <p className="text-[13px] text-gray-500 mt-2 leading-snug">{pesan}</p>

        {orderNumber && (
          <p className="text-[11px] text-gray-400 mt-4">
            Nomor pesanan:{" "}
            <span className="font-mono font-bold text-gray-700">
              {orderNumber}
            </span>
          </p>
        )}

        <Link
          href="/account"
          className="block w-full mt-6 bg-gray-900 hover:bg-black text-white font-bold text-sm py-3 rounded-2xl transition-colors"
        >
          Lihat pesanan saya
        </Link>
        <Link
          href="/"
          className="block w-full mt-2 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          Kembali belanja
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFinishPage() {
  return (
    <Suspense
      fallback={
        <ThunderLoader variant="section" />
      }
    >
      <IsiHalaman />
    </Suspense>
  );
}
