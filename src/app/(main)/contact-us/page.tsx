// app/contact/page.tsx
"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

const content = {
  id: {
    pageTitle: "Hubungi Kami",
    pageSubtitle: "Ada pertanyaan atau butuh bantuan? Tim kami siap membantu kamu.",
    accentWord: "Kami",
    formTitle: "Kirim Pesan",
    namLabel: "Nama Lengkap",
    namePlaceholder: "John Doe",
    emailLabel: "Email",
    emailPlaceholder: "kamu@email.com",
    messageLabel: "Pesan",
    messagePlaceholder: "Tuliskan pesanmu di sini...",
    submitBtn: "Kirim Pesan →",
    successTitle: "Pesan Terkirim!",
    successDesc: "Kami akan menghubungi kamu dalam 1×24 jam.",
    infoTitle: "Info Kontak",
    responseTitle: "Waktu Respon",
    responseDesc:
      "Kami biasanya merespons dalam waktu 1x24 jam di hari kerja. Untuk hal yang mendesak, silakan hubungi kami melalui WhatsApp.",
    responseFooter: "Kami di sini untuk memastikan pengalaman belanja Anda tetap nyaman.",
    errName: "Nama wajib diisi",
    errEmail: "Email tidak valid",
    errMessage: "Pesan minimal 10 karakter",
    operatingHours: "Senin–Jumat, 09.00–17.00 WIB",
  },
  en: {
    pageTitle: "Contact Us",
    pageSubtitle: "Have a question or need help? Our team is ready to assist you.",
    accentWord: "Us",
    formTitle: "Send a Message",
    namLabel: "Full Name",
    namePlaceholder: "John Doe",
    emailLabel: "Email",
    emailPlaceholder: "you@email.com",
    messageLabel: "Message",
    messagePlaceholder: "Write your message here...",
    submitBtn: "Send Message →",
    successTitle: "Message Sent!",
    successDesc: "We'll get back to you within 24 hours.",
    infoTitle: "Contact Info",
    responseTitle: "Response Time",
    responseDesc:
      "We typically respond within 24 hours on business days. For urgent matters, feel free to reach us via WhatsApp.",
    responseFooter: "We're here to make your experience seamless.",
    errName: "Name is required",
    errEmail: "Invalid email address",
    errMessage: "Message must be at least 10 characters",
    operatingHours: "Monday – Friday, 9.00 AM – 5.00 PM",
  },
};

const WA_NUMBER = "6281313911391"; // no + or spaces

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("id");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const t = content[lang];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t.errName;
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = t.errEmail;
    if (form.message.trim().length < 10) e.message = t.errMessage;
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  };

  const inputClass =
    "w-full bg-white border border-gray-300 text-black placeholder:text-gray-400 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors duration-200";
  const errorClass = "mt-1 text-xs text-red-500";

  const contacts = [
    { label: { id: "Email", en: "Email" }, value: "hello@sneakersflash.com", icon: "✉", href: "mailto:hello@sneakersflash.com" },
    {
      label: { id: "WhatsApp", en: "WhatsApp" },
      value: "+62 813-1391-1391",
      icon: "📱",
      href: `https://wa.me/${WA_NUMBER}`,
    },
    { label: { id: "Instagram", en: "Instagram" }, value: "@sneakers_flash", icon: "📸", href: "https://instagram.com/sneakers_flash" },
    {
      label: { id: "Jam Operasional", en: "Operating Hours" },
      value: t.operatingHours,
      icon: "🕐",
      href: null,
    },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Form */}
          <div>
            <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-8">
              {t.formTitle}
            </h2>

            {submitted ? (
              <div className="border border-green-500 bg-green-50 p-8 text-center">
                <p className="text-green-600 text-4xl mb-4">✓</p>
                <p className="text-gray-900 font-bold text-lg uppercase tracking-wide">
                  {t.successTitle}
                </p>
                <p className="text-gray-600 text-sm mt-2">{t.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    {t.namLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                    {t.messageLabel}
                  </label>
                  <textarea
                    rows={6}
                    placeholder={t.messagePlaceholder}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className={`${inputClass} resize-none`}
                  />
                  {errors.message && (
                    <p className={errorClass}>{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-black font-black uppercase tracking-widest text-sm py-4 hover:bg-black hover:text-white transition-colors duration-200"
                >
                  {t.submitBtn}
                </button>
              </form>
            )}
          </div>

          {/* Info Kontak */}
          <div>
            <h2 className="text-xl font-bold text-black uppercase tracking-wider mb-8">
              {t.infoTitle}
            </h2>
            <div className="space-y-4">
              {contacts.map((c) => {
                const label = c.label[lang];
                const inner = (
                  <div
                    key={label}
                    className="flex items-start gap-4 border border-gray-200 bg-white p-5 hover:border-black transition-colors duration-200"
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                        {label}
                      </p>
                      <p className="text-black font-medium">{c.value}</p>
                    </div>
                  </div>
                );

                return c.href ? (
                  <a
                    key={label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={label}>{inner}</div>
                );
              })}
            </div>

            <div className="mt-8 border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs uppercase tracking-wider text-black font-bold mb-3">
                {t.responseTitle}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                {t.responseDesc}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.responseFooter}
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}