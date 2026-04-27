"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

const content = {
  id: {
    pageTitle: "Shipping & Returns",
    pageSubtitle:
      "Semua yang perlu kamu tahu tentang pengiriman dan kebijakan pengembalian.",
    accentWord: "Returns",
    shippingTitle: "Opsi Pengiriman",
    infoTitle: "📦 Informasi Pengiriman",
    infoItems: [
      "Pesanan diproses di hari kerja pukul 08.00–15.00 WIB.",
      "Pesanan setelah pukul 15.00 WIB akan diproses keesokan harinya.",
      "Estimasi pengiriman tidak termasuk akhir pekan & hari libur nasional.",
      "Gratis ongkir untuk pembelian di atas Rp 500.000 (berlaku untuk Regular).",
    ],
    returnTitle: "Kebijakan Return",
    returnSubtitle:
      "Kami menerima pengembalian barang dalam kondisi tertentu. Pastikan membaca kebijakan berikut sebelum mengajukan return.",
    popularBadge: "Populer",
    canReturn: "✓ Dapat di-Return Jika:",
    cannotReturn: "✗ Tidak Dapat di-Return Jika:",
    canItems: [
      "Barang cacat atau rusak saat diterima",
      "Barang tidak sesuai pesanan (warna/model/size)",
      "Barang berbeda dari deskripsi di website",
      "Pengajuan dilakukan maksimal 7 hari setelah diterima",
    ],
    cannotItems: [
      "Barang sudah digunakan atau dicuci",
      "Tag, box, atau aksesoris hilang/rusak",
      "Produk sale atau clearance",
      "Pengajuan lebih dari 7 hari setelah diterima",
    ],
    shipping: [
      {
        name: "Regular",
        est: "3–5 Hari Kerja",
        price: "Rp 15.000 – Rp 25.000",
        note: "Tersedia untuk seluruh Indonesia",
        highlight: false,
      },
      {
        name: "Express",
        est: "1–2 Hari Kerja",
        price: "Rp 30.000 – Rp 50.000",
        note: "Tersedia untuk Jawa & Bali",
        highlight: true,
      },
      {
        name: "Same Day",
        est: "Dikirim di hari yang sama",
        price: "Rp 50.000 – Rp 80.000",
        note: "Tersedia di kota tertentu (Jakarta, Surabaya, Bandung)",
        highlight: false,
      },
    ],
    returnSteps: [
      {
        step: "01",
        title: "Ajukan Return",
        desc: "Hubungi tim kami via WhatsApp atau email maksimal 7 hari setelah barang diterima.",
      },
      {
        step: "02",
        title: "Konfirmasi",
        desc: "Tim kami akan memverifikasi permintaanmu dalam 1x24 jam di hari kerja.",
      },
      {
        step: "03",
        title: "Kirim Barang",
        desc: "Kemas barang dalam kondisi original (box, tag, dan aksesoris lengkap), lalu kirim ke gudang kami.",
      },
      {
        step: "04",
        title: "Pengembalian Dana",
        desc: "Refund diproses dalam 3–5 hari kerja setelah barang diterima dan diverifikasi.",
      },
    ],
  },
  en: {
    pageTitle: "Shipping & Returns",
    pageSubtitle:
      "Everything you need to know about delivery options and return policy.",
    accentWord: "Returns",
    shippingTitle: "Shipping Options",
    infoTitle: "📦 Shipping Information",
    infoItems: [
      "Orders are processed on business days from 08.00–15.00 WIB.",
      "Orders placed after 15.00 WIB will be processed the next business day.",
      "Delivery time excludes weekends and public holidays.",
      "Free shipping available for orders above Rp 500.000 (Regular shipping only).",
    ],
    returnTitle: "Return Policy",
    returnSubtitle:
      "We accept returns under certain conditions. Please review the policy below before submitting a request.",
    popularBadge: "Popular",
    canReturn: "✓ Eligible for Return:",
    cannotReturn: "✗ Not Eligible for Return:",
    canItems: [
      "Defective or damaged items upon arrival",
      "Item does not match the order (color/model/size)",
      "Item differs from website description",
      "Return request submitted within 7 days",
    ],
    cannotItems: [
      "Item has been worn or washed",
      "Missing or damaged tags, box, or accessories",
      "Sale or clearance items",
      "Request submitted after 7 days",
    ],
    shipping: [
      {
        name: "Regular",
        est: "3–5 Business Days",
        price: "Rp 15.000 – Rp 25.000",
        note: "Available nationwide",
        highlight: false,
      },
      {
        name: "Express",
        est: "1–2 Business Days",
        price: "Rp 30.000 – Rp 50.000",
        note: "Available in Java & Bali",
        highlight: true,
      },
      {
        name: "Same Day",
        est: "Delivered within the same day",
        price: "Rp 50.000 – Rp 80.000",
        note: "Available in selected cities (Jakarta, Surabaya, Bandung)",
        highlight: false,
      },
    ],
    returnSteps: [
      {
        step: "01",
        title: "Submit a Return",
        desc: "Contact our team via WhatsApp or email within 7 days after receiving your order.",
      },
      {
        step: "02",
        title: "Verification",
        desc: "Our team will review your request within 24 hours on business days.",
      },
      {
        step: "03",
        title: "Send the Item",
        desc: "Pack the item in its original condition (box, tags, and accessories) and send it to our warehouse.",
      },
      {
        step: "04",
        title: "Refund Process",
        desc: "Refund will be processed within 3–5 business days after the item is received and verified.",
      },
    ],
  },
};

export default function ShippingReturnsPage() {
  const [lang, setLang] = useState<Lang>("id");
  const t = content[lang];

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
        {/* Shipping Options */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-8">
            {t.shippingTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.shipping.map((opt) => (
              <div
                key={opt.name}
                className={`border p-6 relative ${
                  opt.highlight
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {opt.highlight && (
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] bg-yellow-400 text-black font-black px-2 py-1">
                    {t.popularBadge}
                  </span>
                )}
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                  {opt.name}
                </p>
                <p className="text-2xl font-black text-black mb-1">{opt.est}</p>
                <p className="text-yellow-600 font-semibold text-sm mb-3">
                  {opt.price}
                </p>
                <p className="text-gray-500 text-xs">{opt.note}</p>
              </div>
            ))}
          </div>

          {/* Shipping Info */}
          <div className="mt-6 border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-wider text-yellow-600 font-bold mb-2">
              {t.infoTitle}
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {t.infoItems.map((item, i) => (
                <li key={i}>
                  {"• "}
                  {i === 3 ? (
                    <>
                      <strong className="text-black">
                        {lang === "id" ? "Gratis ongkir" : "Free shipping"}
                      </strong>{" "}
                      {lang === "id"
                        ? "untuk pembelian di atas Rp 500.000 (berlaku untuk Regular)."
                        : "available for orders above Rp 500.000 (Regular shipping only)."}
                    </>
                  ) : (
                    item
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Returns */}
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-3">
            {t.returnTitle}
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xl">{t.returnSubtitle}</p>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {t.returnSteps.map((s) => (
              <div
                key={s.step}
                className="border border-gray-200 bg-white p-5 hover:border-yellow-400 transition-colors"
              >
                <p className="text-yellow-500 text-3xl font-black mb-4">{s.step}</p>
                <p className="font-bold text-black uppercase text-sm tracking-wider mb-2">
                  {s.title}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-green-200 bg-green-50 p-5">
              <p className="text-green-700 font-bold uppercase text-sm tracking-wider mb-4">
                {t.canReturn}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {t.canItems.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="border border-red-200 bg-red-50 p-5">
              <p className="text-red-700 font-bold uppercase text-sm tracking-wider mb-4">
                {t.cannotReturn}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {t.cannotItems.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}