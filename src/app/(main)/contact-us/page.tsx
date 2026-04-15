// app/contact/page.tsx
"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Nama wajib diisi";
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email tidak valid";
        if (form.message.trim().length < 10) e.message = "Pesan minimal 10 karakter";
        return e;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitted(true);
    };

    // Diubah untuk tema terang
    const inputClass =
        "w-full bg-white border border-gray-300 text-black placeholder:text-gray-400 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors duration-200";
    const errorClass = "mt-1 text-xs text-red-500";

    const contacts = [
        { label: "Email", value: "cs@sneakersflash.com", icon: "✉" },
        { label: "WhatsApp", value: "+62 812-3456-7890", icon: "📱" },
        { label: "Instagram", value: "@sneakersflash.id", icon: "📸" },
        { label: "Jam Operasional", value: "Senin–Jumat, 09.00–17.00 WIB", icon: "🕐" },
    ];

    return (
        <PageLayout>
        <PageHeader
            title="Contact Us"
            subtitle="Ada pertanyaan atau butuh bantuan? Tim kami siap membantu kamu 24/7."
            accentWord="Us"
        />

        <SectionWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Form */}
            <div>
                <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-8">
                Kirim Pesan
                </h2>

                {submitted ? (
                <div className="border border-green-500 bg-green-50 p-8 text-center">
                    <p className="text-green-600 text-4xl mb-4">✓</p>
                    <p className="text-gray-900 font-bold text-lg uppercase tracking-wide">
                    Pesan Terkirim!
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                    Kami akan menghubungi kamu dalam 1×24 jam.
                    </p>
                </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>

                    <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="kamu@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                    />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                    </div>

                    <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Pesan
                    </label>
                    <textarea
                        rows={6}
                        placeholder="Tuliskan pesanmu di sini..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={`${inputClass} resize-none`}
                    />
                    {errors.message && <p className={errorClass}>{errors.message}</p>}
                    </div>

                    <button
                    type="submit"
                    className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-black hover:text-white transition-colors duration-200"
                    >
                    Kirim Pesan →
                    </button>
                </form>
                )}
            </div>

            {/* Info Kontak */}
            <div>
                <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-8">
                Info Kontak
                </h2>
                <div className="space-y-4">
                {contacts.map((c) => (
                    <div
                    key={c.label}
                    className="flex items-start gap-4 border border-gray-200 bg-white p-5 hover:border-black transition-colors duration-200"
                    >
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                        {c.label}
                        </p>
                        <p className="text-black font-medium">{c.value}</p>
                    </div>
                    </div>
                ))}
                </div>

                <div className="mt-8 border border-gray-200 bg-gray-50 p-6">
                <p className="text-xs uppercase tracking-wider text-black font-bold mb-3">
                    Response Time
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Kami biasanya merespons dalam <strong className="text-black">1×24 jam</strong> di
                    hari kerja. Untuk pertanyaan mendesak, hubungi kami via WhatsApp.
                </p>
                </div>
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}