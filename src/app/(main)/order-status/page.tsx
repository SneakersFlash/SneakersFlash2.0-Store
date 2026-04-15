// app/order-status/page.tsx
"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type TrackingStep = {
    label: string;
    desc: string;
    done: boolean;
    active: boolean;
};

export default function OrderStatusPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [tracked, setTracked] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!orderId.trim()) e.orderId = "Order ID wajib diisi";
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email tidak valid";
        return e;
    };

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setTracked(true);
    };

    const steps: TrackingStep[] = [
        { label: "Pesanan Dikonfirmasi", desc: "15 Apr 2025, 10:32", done: true, active: false },
        { label: "Diproses Gudang", desc: "15 Apr 2025, 14:00", done: true, active: false },
        { label: "Dikirim ke Kurir", desc: "16 Apr 2025, 09:15", done: true, active: true },
        { label: "Dalam Pengiriman", desc: "Estimasi 17–18 Apr 2025", done: false, active: false },
        { label: "Terkirim", desc: "Menunggu...", done: false, active: false },
    ];

    // Diubah: background putih, teks hitam, border abu-abu
    const inputClass =
        "w-full bg-white border border-gray-300 text-black placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors duration-200 rounded-none";

    return (
        <PageLayout>
        <PageHeader
            title="Order Status"
            subtitle="Lacak pesananmu secara real-time. Masukkan Order ID dan email untuk melihat status terkini."
            accentWord="Status"
        />

        <SectionWrapper>
            <div className="max-w-2xl mx-auto">
            {/* Search Form */}
            {!tracked ? (
                <form onSubmit={handleTrack} className="space-y-5" noValidate>
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    Order ID
                    </label>
                    <input
                    type="text"
                    placeholder="Contoh: SF-2024-00123"
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
                    Email Pembelian
                    </label>
                    <input
                    type="email"
                    placeholder="email yang digunakan saat order"
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
                    // Diubah: efek hover menjadi hitam agar lebih tegas di atas putih
                    className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-black hover:text-white transition-colors duration-200"
                >
                    Track Order →
                </button>

                <p className="text-center text-gray-500 text-xs">
                    Order ID bisa ditemukan di email konfirmasi pembelianmu.
                </p>
                </form>
            ) : (
                /* Tracking Result */
                <div>
                {/* Kotak Result - background abu-abu terang */}
                <div className="border border-gray-200 bg-gray-50 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Order ID</p>
                        <p className="font-bold text-black">{orderId}</p>
                    </div>
                    {/* Badge Status - disesuaikan ke yellow untuk kontras */}
                    <span className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs uppercase tracking-wider font-bold px-4 py-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Dalam Pengiriman
                    </span>
                    </div>
                </div>

                {/* Stepper */}
                <div className="space-y-0">
                    {steps.map((step, i) => (
                    <div key={i} className="flex gap-5">
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                        <div
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 transition-all ${
                            step.done
                                ? "bg-yellow-500 border-yellow-500" // Selesai: Kuning solid
                                : step.active
                                ? "bg-white border-yellow-500 ring-4 ring-yellow-200" // Aktif: Putih dengan ring kuning
                                : "bg-transparent border-gray-300" // Belum: Abu-abu
                            }`}
                        />
                        {i < steps.length - 1 && (
                            <div
                            className={`w-px flex-1 mt-1 ${
                                step.done ? "bg-yellow-400" : "bg-gray-200" // Garis penghubung
                            }`}
                            style={{ minHeight: "40px" }}
                            />
                        )}
                        </div>

                        {/* Text */}
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
                    onClick={() => { setTracked(false); setOrderId(""); setEmail(""); }}
                    className="mt-6 text-xs uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-4 transition-colors"
                >
                    ← Cari Order Lain
                </button>
                </div>
            )}
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}