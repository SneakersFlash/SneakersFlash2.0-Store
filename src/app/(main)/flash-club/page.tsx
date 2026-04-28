"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

const content = {
  id: {
    pageTitle: "Flash Point",
    pageSubtitle:
      "Kumpulkan poin dari setiap transaksi dan buka berbagai keuntungan eksklusif seiring levelmu meningkat.",
    accentWord: "Point",
    mostPopular: "Most Popular",
    howTitle: "Bagaimana Cara Kerja Flash Point?",
    howDesc: (
      <>
        Sistem ini otomatis melacak total belanja kamu sejak pertama kali mendaftar.
        Setelah akumulasi belanja mencapai <strong>Rp 5.000.000</strong> dalam 6 bulan,
        akunmu akan otomatis naik ke level <strong>Advance</strong>. Level{" "}
        <strong>Ultimate</strong> diberikan kepada member yang telah berbelanja{" "}
        <strong>Rp 10.000.000</strong> dalam 6 bulan.
      </>
    ),
    ctaHeadline: (
      <>
        Makin Sering Belanja,{" "}
        <span className="text-yellow-500">Makin Untung.</span>
      </>
    ),
    ctaSubtitle:
      "Level membership kamu tidak akan hangus. Sekali mencapai Advance atau Ultimate, kamu akan menikmati keuntungannya selamanya.",
    ctaBtn: "Mulai Kumpulkan Poin →",
    tiers: [
      {
        name: "Basic",
        requirement: "Member Baru",
        desc: "Langkah awal perjalananmu di SneakersFlash.",
        benefits: [
          "1% poin di setiap pembelian",
          "Layanan pelanggan standar",
          "Tier default untuk member baru",
        ],
        cta: "Daftar Sekarang",
      },
      {
        name: "Advance",
        requirement: "Belanja 5 Juta",
        desc: "Untuk sneakerhead yang mulai serius membangun koleksi.",
        benefits: [
          "2.5% poin di setiap pembelian",
          "Layanan pelanggan prioritas",
          "Diperlukan belanja Rp 5 Juta dalam 6 bulan",
        ],
        cta: "Cek Progress Belanja",
      },
      {
        name: "Ultimate",
        requirement: "Tier Tertinggi",
        desc: "Privilese maksimal dengan diskon tambahan di setiap transaksi.",
        benefits: [
          "5% poin di setiap pembelian",
          "Layanan pelanggan VIP",
          "Penawaran eksklusif & early access",
          "Diperlukan belanja Rp 10 Juta dalam 6 bulan",
        ],
        cta: "Lihat Benefit Ultimate",
      },
    ],
  },
  en: {
    pageTitle: "Flash Point",
    pageSubtitle:
      "Earn points with every purchase and unlock exclusive rewards as you level up.",
    accentWord: "Point",
    mostPopular: "Most Popular",
    howTitle: "How Does Flash Point Work?",
    howDesc: (
      <>
        The system automatically tracks your total spending from the moment you sign
        up. Once you reach <strong>Rp 5,000,000</strong> in cumulative spending within
        6 months, your account is automatically upgraded to <strong>Advance</strong>.
        The <strong>Ultimate</strong> tier is granted to members who have spent{" "}
        <strong>Rp 10,000,000</strong> within 6 months.
      </>
    ),
    ctaHeadline: (
      <>
        Shop More,{" "}
        <span className="text-yellow-500">Earn More.</span>
      </>
    ),
    ctaSubtitle:
      "Your membership level never expires. Once you reach Advance or Ultimate, you enjoy the benefits forever.",
    ctaBtn: "Start Earning Points →",
    tiers: [
      {
        name: "Basic",
        requirement: "New Member",
        desc: "The first step of your SneakersFlash journey.",
        benefits: [
          "1% points on every purchase",
          "Standard customer support",
          "Default tier for new members",
        ],
        cta: "Register Now",
      },
      {
        name: "Advance",
        requirement: "Rp 5M Spending",
        desc: "For sneakerheads who are serious about building their collection.",
        benefits: [
          "2.5% points on every purchase",
          "Priority customer support",
          "Requires Rp 5M spending in 6 months",
        ],
        cta: "Check Spending Progress",
      },
      {
        name: "Ultimate",
        requirement: "Highest Tier",
        desc: "Maximum privileges with additional rewards on every transaction.",
        benefits: [
          "5% points on every purchase",
          "VIP customer support",
          "Exclusive offers & early access",
          "Requires Rp 10M spending in 6 months",
        ],
        cta: "View Ultimate Benefits",
      },
    ],
  },
};

const tierStyles = [
  {
    color: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-700",
    highlight: false,
  },
  {
    color: "border-yellow-400",
    badgeColor: "bg-yellow-400 text-black",
    highlight: true,
  },
  {
    color: "border-black",
    badgeColor: "bg-black text-white",
    highlight: false,
  },
];

export default function FlashPointPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.tiers.map((tier, idx) => {
            const style = tierStyles[idx];
            return (
              <div
                key={tier.name}
                className={`relative border p-8 bg-white transition-all duration-300 hover:shadow-xl ${
                  style.color
                } ${style.highlight ? "ring-1 ring-yellow-400 scale-105 z-10" : ""}`}
              >
                {style.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1">
                    {t.mostPopular}
                  </div>
                )}

                <div className="mb-8">
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 ${style.badgeColor}`}
                  >
                    {tier.name}
                  </span>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-black block">
                      {tier.requirement}
                    </span>
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                      {tier.desc}
                    </p>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="mt-0.5 text-yellow-600">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`block w-full text-center py-4 text-xs font-black uppercase tracking-widest transition-colors duration-200 ${
                    style.highlight
                      ? "bg-yellow-400 text-black hover:bg-black hover:text-white"
                      : "bg-white text-black border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-16 border border-gray-100 bg-gray-50/50 p-8 text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-black mb-2">{t.howTitle}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t.howDesc}</p>
        </div>
      </SectionWrapper>

      {/* Bottom CTA */}
      <div className="border-t border-gray-200 bg-white px-5 md:px-10 lg:px-20 py-20">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight mb-4">
              {t.ctaHeadline}
            </p>
            <p className="text-gray-500 text-sm">{t.ctaSubtitle}</p>
          </div>
          <a
            href="/register"
            className="inline-block bg-black text-white font-black uppercase tracking-widest text-sm px-12 py-5 hover:bg-yellow-400 hover:text-black transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
          >
            {t.ctaBtn}
          </a>
        </div>
      </div>
    </PageLayout>
  );
}