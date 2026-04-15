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

    const inputClass =
        "w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm focus:outline-none focus:border-[#f5f500] transition-colors duration-200 rounded-none";

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
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
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
                    <p className="mt-1 text-xs text-red-400">{errors.orderId}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
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
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#f5f500] text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-white transition-colors duration-200"
                >
                    Track Order →
                </button>

                <p className="text-center text-white/30 text-xs">
                    Order ID bisa ditemukan di email konfirmasi pembelianmu.
                </p>
                </form>
            ) : (
                /* Tracking Result */
                <div>
                <div className="border border-white/10 bg-white/[0.02] p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Order ID</p>
                        <p className="font-bold text-white">{orderId}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-[#f5f500]/10 border border-[#f5f500]/30 text-[#f5f500] text-xs uppercase tracking-wider font-bold px-4 py-2">
                        <span className="w-2 h-2 rounded-full bg-[#f5f500] animate-pulse" />
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
                                ? "bg-[#f5f500] border-[#f5f500]"
                                : step.active
                                ? "bg-transparent border-[#f5f500] ring-4 ring-[#f5f500]/20"
                                : "bg-transparent border-white/20"
                            }`}
                        />
                        {i < steps.length - 1 && (
                            <div
                            className={`w-px flex-1 mt-1 ${
                                step.done ? "bg-[#f5f500]/40" : "bg-white/10"
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
                                ? "text-[#f5f500]"
                                : step.done
                                ? "text-white"
                                : "text-white/30"
                            }`}
                        >
                            {step.label}
                        </p>
                        <p className="text-xs text-white/30 mt-1">{step.desc}</p>
                        </div>
                    </div>
                    ))}
                </div>

                <button
                    onClick={() => { setTracked(false); setOrderId(""); setEmail(""); }}
                    className="mt-6 text-xs uppercase tracking-wider text-white/40 hover:text-white underline underline-offset-4 transition-colors"
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