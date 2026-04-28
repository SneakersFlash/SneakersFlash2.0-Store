"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ContentPart =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "bullet"; text: string }
  | { type: "subheading"; text: string };

interface Section {
  id: string;
  navLabel: string;
  title: string;
  content: ContentPart[];
}

// ─── Content ───────────────────────────────────────────────────────────────────
const content: Record<
  Lang,
  {
    pageTitle: string;
    pageSubtitle: string;
    accentWord: string;
    navLabel: string;
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    summaryLabel: string;
    summaryLines: string[];
    summaryEmail: string;
    footerText: string;
    footerLinkText: string;
    sections: Section[];
  }
> = {
  id: {
    pageTitle: "Kebijakan Privasi",
    pageSubtitle:
      "Privasi kamu adalah prioritas kami. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi datamu.",
    accentWord: "Privasi",
    navLabel: "Navigasi",
    lastUpdatedLabel: "Terakhir Diperbarui",
    lastUpdatedValue: "1 Januari 2026",
    summaryLabel: "⚡ Ringkasan Singkat",
    summaryLines: [
      "Kami hanya mengumpulkan data yang diperlukan untuk memproses pesanan dan meningkatkan layanan.",
      "Kami tidak menjual data pribadimu.",
      "Kamu dapat meminta penghapusan data kapan saja.",
    ],
    summaryEmail: "Hubungi kami di:",
    footerText: "Punya pertanyaan mengenai privasi?",
    footerLinkText: "Hubungi Tim Keamanan Kami",
    sections: [
      {
        id: "section-0",
        navLabel: "1. Informasi yang Kami Kumpulkan",
        title: "1. Informasi yang Kami Kumpulkan",
        content: [
          { type: "text", text: "Saat kamu menggunakan Sneakers Flash, kami mengumpulkan beberapa informasi untuk memberikan pengalaman terbaik:" },
          { type: "subheading", text: "Informasi Akun" },
          { type: "text", text: "Nama lengkap, email, nomor telepon, dan kata sandi terenkripsi." },
          { type: "subheading", text: "Informasi Transaksi" },
          { type: "text", text: "Detail pesanan, alamat pengiriman, metode pembayaran (tidak termasuk data kartu lengkap), dan riwayat pembelian." },
          { type: "subheading", text: "Informasi Perangkat" },
          { type: "text", text: "Alamat IP, jenis browser, sistem operasi, dan data penggunaan untuk analitik dan keamanan." },
          { type: "subheading", text: "Cookies" },
          { type: "text", text: "Kami menggunakan cookies untuk menyimpan preferensi, sesi login, dan data keranjang." },
        ],
      },
      {
        id: "section-1",
        navLabel: "2. Bagaimana Kami Menggunakan Informasi",
        title: "2. Bagaimana Kami Menggunakan Informasi",
        content: [
          { type: "text", text: "Data yang kami kumpulkan digunakan untuk:" },
          { type: "bullet", text: "Memproses dan mengirimkan pesanan" },
          { type: "bullet", text: "Mengirim konfirmasi dan update status pesanan" },
          { type: "bullet", text: "Memberikan layanan pelanggan yang responsif" },
          { type: "bullet", text: "Menyediakan rekomendasi produk sesuai preferensi" },
          { type: "bullet", text: "Meningkatkan keamanan akun dan mendeteksi aktivitas mencurigakan" },
          { type: "bullet", text: "Mengirim promo (jika kamu mengaktifkannya)" },
        ],
      },
      {
        id: "section-2",
        navLabel: "3. Keamanan Data",
        title: "3. Keamanan Data",
        content: [
          { type: "text", text: "Keamanan datamu adalah prioritas kami." },
          { type: "text", text: "Kami menggunakan enkripsi SSL untuk melindungi transmisi data, dan informasi sensitif seperti kata sandi disimpan dengan sistem keamanan yang kuat." },
          { type: "text", text: "Meskipun kami berupaya maksimal, tidak ada sistem yang 100% aman. Kami menyarankan untuk menjaga kerahasiaan akunmu." },
        ],
      },
      {
        id: "section-3",
        navLabel: "4. Berbagi Informasi dengan Pihak Ketiga",
        title: "4. Berbagi Informasi dengan Pihak Ketiga",
        content: [
          { type: "text", text: "Kami tidak menjual atau menyewakan data pribadimu." },
          { type: "text", text: "Data hanya dibagikan kepada mitra terpercaya untuk mendukung operasional layanan, seperti:" },
          { type: "bold", text: "Layanan Logistik" },
          { type: "text", text: "Pengiriman pesanan (JNE, SiCepat, Gojek)" },
          { type: "bold", text: "Payment Gateway" },
          { type: "text", text: "Pemrosesan pembayaran yang aman" },
          { type: "bold", text: "Analitik" },
          { type: "text", text: "Untuk memahami perilaku pengguna dan meningkatkan layanan" },
        ],
      },
    ],
  },

  en: {
    pageTitle: "Privacy Policy",
    pageSubtitle:
      "Your privacy matters to us. Learn how we collect, use, and protect your information.",
    accentWord: "Policy",
    navLabel: "Navigation",
    lastUpdatedLabel: "Last Updated",
    lastUpdatedValue: "January 1, 2026",
    summaryLabel: "⚡ Quick Summary",
    summaryLines: [
      "We collect only the data needed to process your orders and improve your experience.",
      "We do not sell your personal data.",
      "You can request data deletion at any time.",
    ],
    summaryEmail: "Contact us at:",
    footerText: "Have questions about privacy?",
    footerLinkText: "Contact Our Security Team",
    sections: [
      {
        id: "section-0",
        navLabel: "1. Information We Collect",
        title: "1. Information We Collect",
        content: [
          { type: "text", text: "When you use Sneakers Flash, we collect certain information to provide the best experience:" },
          { type: "subheading", text: "Account Information" },
          { type: "text", text: "Name, email address, phone number, and encrypted password." },
          { type: "subheading", text: "Transaction Information" },
          { type: "text", text: "Order details, shipping address, payment method (excluding full card details), and purchase history." },
          { type: "subheading", text: "Device Information" },
          { type: "text", text: "IP address, browser type, operating system, and usage data for analytics and security." },
          { type: "subheading", text: "Cookies" },
          { type: "text", text: "We use cookies to store preferences, login sessions, and cart data." },
        ],
      },
      {
        id: "section-1",
        navLabel: "2. How We Use Your Information",
        title: "2. How We Use Your Information",
        content: [
          { type: "text", text: "We use your data to:" },
          { type: "bullet", text: "Process and deliver your orders" },
          { type: "bullet", text: "Send order confirmations and updates" },
          { type: "bullet", text: "Provide responsive customer support" },
          { type: "bullet", text: "Personalize product recommendations" },
          { type: "bullet", text: "Improve account security and detect suspicious activity" },
          { type: "bullet", text: "Send promotions (only if you opt-in)" },
        ],
      },
      {
        id: "section-2",
        navLabel: "3. Data Security",
        title: "3. Data Security",
        content: [
          { type: "text", text: "Your data security is our priority." },
          { type: "text", text: "We use SSL encryption to protect data transmission, and sensitive information such as passwords is securely hashed." },
          { type: "text", text: "While we strive to protect your data, no system is 100% secure. Please keep your account credentials confidential." },
        ],
      },
      {
        id: "section-3",
        navLabel: "4. Sharing with Third Parties",
        title: "4. Sharing with Third Parties",
        content: [
          { type: "text", text: "We do not sell your personal data." },
          { type: "text", text: "We only share information with trusted partners to operate our services, such as:" },
          { type: "bold", text: "Logistics Partners" },
          { type: "text", text: "Delivery services (JNE, SiCepat, Gojek)" },
          { type: "bold", text: "Payment Providers" },
          { type: "text", text: "Secure payment processing" },
          { type: "bold", text: "Analytics Tools" },
          { type: "text", text: "To understand user behavior and improve our platform" },
        ],
      },
    ],
  },
};

// ─── Renderer ──────────────────────────────────────────────────────────────────
function RenderContent({ parts }: { parts: ContentPart[] }) {
  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <p key={i} className="text-gray-600 text-sm leading-relaxed">
              {part.text}
            </p>
          );
        }
        if (part.type === "subheading") {
          return (
            <p key={i} className="text-black font-bold text-sm mt-4">
              {part.text}
            </p>
          );
        }
        if (part.type === "bold") {
          return (
            <p key={i} className="text-black font-bold text-sm mt-4">
              {part.text}
            </p>
          );
        }
        if (part.type === "bullet") {
          return (
            <p key={i} className="text-gray-600 text-sm leading-relaxed flex gap-2">
              <span className="text-yellow-500 flex-shrink-0">•</span>
              {part.text}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState<Lang>("id");
  const t = content[lang];

  return (
    <PageLayout>
      {/* Language Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <div className="inline-flex border border-gray-300 overflow-hidden">
          {(["id", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
                lang === l
                  ? "bg-black text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <PageHeader
        title={t.pageTitle}
        subtitle={t.pageSubtitle}
        accentWord={t.accentWord}
      />

      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          {/* Sidebar Nav */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-4">
                {t.navLabel}
              </p>
              <nav className="flex flex-col space-y-3">
                {t.sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-xs text-gray-500 hover:text-black transition-colors duration-200 border-l border-gray-200 pl-4 hover:border-yellow-500"
                  >
                    {s.navLabel}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">
                {t.lastUpdatedLabel}
              </p>
              <p className="text-xs text-gray-600 font-medium">{t.lastUpdatedValue}</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-12">
            {/* Summary Box */}
            <div className="border border-yellow-200 bg-yellow-50/50 p-6">
              <p className="text-yellow-700 text-[10px] uppercase tracking-wider font-black mb-3">
                {t.summaryLabel}
              </p>
              <div className="space-y-1 mb-3">
                {t.summaryLines.map((line, i) => (
                  <p key={i} className="text-gray-700 text-sm leading-relaxed flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">•</span>
                    {i === 1 ? (
                      <>
                        Kami&nbsp;<strong>tidak menjual</strong>&nbsp;data pribadimu.
                      </>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
              <p className="text-gray-700 text-sm">
                {t.summaryEmail}{" "}
                <a
                  href="mailto:hello@sneakersflash.com"
                  className="text-black font-semibold underline underline-offset-2"
                >
                  hello@sneakersflash.com
                </a>
              </p>
            </div>

            {/* Sections */}
            {t.sections.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-lg font-black uppercase tracking-wider text-black mb-5 border-b border-gray-100 pb-2">
                  {s.title}
                </h2>
                <RenderContent parts={s.content} />
              </div>
            ))}

            {/* Footer */}
            <div className="pt-10 border-t border-gray-200 text-center">
              <p className="text-gray-400 text-xs italic">
                {t.footerText}{" "}
                <a
                  href="/contact-us"
                  className="text-black underline font-medium"
                >
                  {t.footerLinkText}
                </a>
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}