// app/order-status/page.tsx
"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

type TrackingStep = {
  label: string;
  desc: string;
  done: boolean;
  active: boolean;
};

const content = {
  id: {
    pageTitle: "Order Status",
    pageSubtitle:
      "Lacak pesananmu secara real-time. Masukkan Order ID dan email untuk melihat status terbaru.",
    accentWord: "Status",
    orderIdLabel: "Order ID",
    orderIdPlaceholder: "Contoh: SF-2024-00123",
    emailLabel: "Email Pembelian",
    emailPlaceholder: "email yang digunakan saat order",
    trackBtn: "Track Order →",
    orderIdHint: "Order ID dapat ditemukan di email konfirmasi pesanan.",
    statusBadge: "Dalam Pengiriman",
    backBtn: "← Cari Order Lain",
    errOrderId: "Order ID wajib diisi",
    errEmail: "Email tidak valid",
    steps: [
      { label: "Pesanan Dikonfirmasi", desc: "15 Apr 2025, 10:32" },
      { label: "Diproses Gudang", desc: "15 Apr 2025, 14:00" },
      { label: "Dikirim ke Kurir", desc: "16 Apr 2025, 09:15" },
      { label: "Dalam Pengiriman", desc: "Estimasi 17–18 Apr 2025" },
      { label: "Terkirim", desc: "Menunggu..." },
    ],
  },
  en: {
    pageTitle: "Order Status",
    pageSubtitle:
      "Track your order in real-time. Enter your Order ID and email to see the latest status.",
    accentWord: "Status",
    orderIdLabel: "Order ID",
    orderIdPlaceholder: "Example: SF-2024-00123",
    emailLabel: "Purchase Email",
    emailPlaceholder: "email used when ordering",
    trackBtn: "Track Order →",
    orderIdHint: "Your Order ID can be found in your order confirmation email.",
    statusBadge: "In Transit",
    backBtn: "← Track Another Order",
    errOrderId: "Order ID is required",
    errEmail: "Invalid email address",
    steps: [
      { label: "Order Confirmed", desc: "15 Apr 2025, 10:32" },
      { label: "Processed by Warehouse", desc: "15 Apr 2025, 14:00" },
      { label: "Handed to Courier", desc: "16 Apr 2025, 09:15" },
      { label: "In Transit", desc: "Estimated 17–18 Apr 2025" },
      { label: "Delivered", desc: "Awaiting..." },
    ],
  },
};

const STEP_STATUS = [true, true, true, false, false];
const STEP_ACTIVE = [false, false, true, false, false];

export default function OrderStatusPage() {
  const [lang, setLang] = useState<Lang>("id");
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tracked, setTracked] = useState(false);

  const t = content[lang];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!orderId.trim()) e.orderId = t.errOrderId;
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t.errEmail;
    return e;
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setTracked(true);
  };

  const steps: TrackingStep[] = t.steps.map((s, i) => ({
    label: s.label,
    desc: s.desc,
    done: STEP_STATUS[i],
    active: STEP_ACTIVE[i],
  }));

  const inputClass =
    "w-full bg-white border border-gray-300 text-black placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors duration-200 rounded-none";

  return (
    <PageLayout>
      {/* Language Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <div className="inline-flex border border-gray-300 overflow-hidden">
          <button
            onClick={() => setLang("id")}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
              lang === "id"
                ? "bg-black text-white"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
              lang === "en"
                ? "bg-black text-white"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <PageHeader
        title={t.pageTitle}
        subtitle={t.pageSubtitle}
        accentWord={t.accentWord}
      />

      <SectionWrapper>
        <div className="max-w-2xl mx-auto">
          {!tracked ? (
            <form onSubmit={handleTrack} className="space-y-5" noValidate>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  {t.orderIdLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.orderIdPlaceholder}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className={inputClass}
                />
                {errors.orderId && (
                  <p className="mt-1 text-xs text-red-500">{errors.orderId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-black hover:text-white transition-colors duration-200"
              >
                {t.trackBtn}
              </button>

              <p className="text-center text-gray-500 text-xs">{t.orderIdHint}</p>
            </form>
          ) : (
            <div>
              <div className="border border-gray-200 bg-gray-50 p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                      Order ID
                    </p>
                    <p className="font-bold text-black">{orderId}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs uppercase tracking-wider font-bold px-4 py-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    {t.statusBadge}
                  </span>
                </div>
              </div>

              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all ${
                          step.done
                            ? "bg-yellow-500 border-yellow-500"
                            : step.active
                            ? "bg-white border-yellow-500 ring-4 ring-yellow-200"
                            : "bg-transparent border-gray-300"
                        }`}
                      />
                      {i < steps.length - 1 && (
                        <div
                          className={`w-px flex-1 mt-1 ${
                            step.done ? "bg-yellow-400" : "bg-gray-200"
                          }`}
                          style={{ minHeight: "40px" }}
                        />
                      )}
                    </div>

                    <div className="pb-8">
                      <p
                        className={`font-semibold text-sm uppercase tracking-wide ${
                          step.active
                            ? "text-yellow-600"
                            : step.done
                            ? "text-black"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setTracked(false);
                  setOrderId("");
                  setEmail("");
                }}
                className="mt-6 text-xs uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-4 transition-colors"
              >
                {t.backBtn}
              </button>
            </div>
          )}
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}