"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

const content = {
  id: {
    pageSubtitle: "Lahir dari passion. Tumbuh selama satu dekade. Inilah perjalanan kami.",
    stats: [
      { value: "50K+", label: "Pelanggan Aktif" },
      { value: "10K+", label: "Produk Tersedia" },
      { value: "5★",   label: "Rating Kepuasan" },
      { value: "2015", label: "Berdiri Sejak" },
    ],
    storyTitle: "Cerita Kami",
    storyParagraphs: [
      "Dari Sebuah Passion Menjadi Destinasi Sneakers Terpercaya.",
      "Sneakers Flash didirikan pada tahun 2015 dengan satu keyakinan sederhana. Setiap orang berhak mendapatkan akses ke sneakers original berkualitas tanpa ribet. Berawal dari inisiatif kecil yang didorong oleh passion, kini Sneakers Flash berkembang menjadi salah satu destinasi terpercaya di Indonesia untuk sneakers dan streetwear.",
      "Seiring waktu, Sneakers Flash tidak hanya sekadar menjual produk. Kami membangun komunitas yang terdiri dari pecinta sneakers, pengikut tren, dan individu yang menghargai gaya serta keaslian.",
      "Lebih dari Sekadar Sneakers.",
      "Di Sneakers Flash, setiap produk kami kurasi dengan cermat. Mulai dari model klasik yang timeless hingga rilisan terbaru, semua dipastikan memenuhi standar kualitas dan keaslian kami. Kami percaya bahwa sneakers bukan hanya sekadar alas kaki. Sneakers adalah bagian dari identitas, kepercayaan diri, dan gaya hidup. Karena itu, kami tidak hanya fokus pada apa yang kami jual, tetapi juga bagaimana kami menghadirkan pengalaman bagi setiap pelanggan.",
      "Dibangun dari Kepercayaan. Dikirim dengan Cepat.",
      "Kami berkomitmen untuk menghadirkan produk 100 persen original, pengiriman cepat dan terpercaya ke seluruh Indonesia, serta pengalaman belanja yang mudah dan nyaman. Dengan pertumbuhan yang terus berjalan, baik di platform digital maupun aktivitas offline, Sneakers Flash akan terus melangkah maju — membawa sneakers lebih dekat ke semua orang, kapan saja dan di mana saja.",
      "Inilah Sneakers Flash. Tempat setiap langkah dimulai.",
    ],
    visionLabel: "🎯 Visi",
    visionText: "Menjadi destinasi utama untuk sneakers dan streetwear di Indonesia yang dikenal karena keaslian, kurasi produk, dan pengalaman belanja yang terpercaya.",
    missionLabel: "🚀 Misi",
    missionItems: [
      "Menyediakan produk sneakers dan streetwear yang 100 persen original dengan kualitas terbaik.",
      "Menghadirkan pilihan produk yang relevan, mulai dari model klasik hingga rilisan terbaru yang sesuai dengan perkembangan tren.",
      "Memberikan pengalaman belanja yang mudah, cepat, dan dapat diandalkan di seluruh Indonesia.",
      "Membangun komunitas yang terhubung melalui passion terhadap sneakers, gaya, dan budaya.",
      "Terus berkembang melalui inovasi, baik secara digital maupun melalui berbagai aktivasi online dan offline.",
    ],
    valuesTitle: "Nilai Kami",
    values: [
      {
        icon: "⚡",
        title: "Flash Speed",
        desc: "Kami bergerak cepat. Dari drop terbaru hingga sampai ke tanganmu. Dalam dunia yang selalu berubah, kecepatan adalah keunggulan kami.",
      },
      {
        icon: "✔",
        title: "100% Authentic",
        desc: "Keaslian adalah standar, bukan pilihan. Setiap produk melewati proses verifikasi ketat. No fake. No compromise.",
      },
      {
        icon: "🌐",
        title: "Community First",
        desc: "Kami tumbuh bersama komunitas. Sneakers Flash bukan sekadar platform — ini rumah bagi para sneakerhead.",
      },
      {
        icon: "♻",
        title: "Sustainable",
        desc: "Kami percaya pertumbuhan harus sejalan dengan tanggung jawab. Dari packaging hingga operasional, kami terus bergerak ke arah yang lebih berkelanjutan.",
      },
    ],
    timelineTitle: "Perjalanan Kami",
    milestones: [
      { year: "2015", event: "Sneakers Flash lahir dari sebuah passion. Berawal dari keyakinan bahwa semua orang berhak mendapatkan sneakers original berkualitas." },
      { year: "2017", event: "Pelanggan pertama kami tumbuh hingga ribuan. Kepercayaan komunitas mulai terbentuk." },
      { year: "2019", event: "Ekspansi ke platform digital penuh. Hadir di seluruh Indonesia dengan pengiriman terpercaya." },
      { year: "2021", event: "Flash Club diluncurkan — program membership eksklusif untuk sneakerhead sejati." },
      { year: "2023", event: "Bermitra dengan 50+ brand global. Warehouse diperluas untuk mendukung pertumbuhan." },
      { year: "2025", event: "50.000+ pelanggan aktif di seluruh Indonesia. Sneakers Flash terus melangkah maju." },
    ],
  },

  en: {
    pageSubtitle: "Born from passion. Grown over a decade. This is our journey.",
    stats: [
      { value: "50K+", label: "Active Customers" },
      { value: "10K+", label: "Products Available" },
      { value: "5★",   label: "Satisfaction Rating" },
      { value: "2015", label: "Founded" },
    ],
    storyTitle: "Our Story",
    storyParagraphs: [
      "From a Passion for Sneakers to a Trusted Destination.",
      "Sneakers Flash was founded in 2015 with one simple belief. Everyone deserves access to authentic, high-quality sneakers without the hassle. What started as a small initiative driven by passion has grown into one of Indonesia's trusted destinations for sneakers and streetwear.",
      "Over the years, Sneakers Flash has evolved beyond just selling products. We've built a community of sneaker enthusiasts, trend followers, and everyday individuals who value both style and authenticity.",
      "More Than Just Sneakers.",
      "At Sneakers Flash, we carefully curate every pair. From timeless classics to the latest releases, ensuring every product meets our standard of authenticity and quality. We understand that sneakers are more than just footwear — they represent identity, confidence, and lifestyle. That's why we focus not only on what we sell, but also on how we deliver the experience.",
      "Built on Trust. Delivered with Speed.",
      "We are committed to 100 percent authentic products, fast and reliable nationwide shipping, and a seamless shopping experience. With continuous growth across digital platforms and offline activations, Sneakers Flash continues to move forward — bringing sneakers closer to everyone, anytime, anywhere.",
      "This is Sneakers Flash. Where every step begins.",
    ],
    visionLabel: "🎯 Vision",
    visionText: "To become the leading destination for sneakers and streetwear in Indonesia, known for authenticity, curated selections, and a trusted shopping experience.",
    missionLabel: "🚀 Mission",
    missionItems: [
      "To provide 100 percent authentic sneakers and streetwear with the highest quality.",
      "To curate products that stay relevant, from timeless classics to the latest releases that reflect current trends.",
      "To deliver a seamless, fast, and reliable shopping experience across Indonesia.",
      "To build a community connected through a shared passion for sneakers, style, and culture.",
      "To continuously grow through innovation, both digitally and through online and offline activations.",
    ],
    valuesTitle: "Our Values",
    values: [
      {
        icon: "⚡",
        title: "Flash Speed",
        desc: "We move fast. From the latest drops to your doorstep. In a fast-moving culture, speed is our edge.",
      },
      {
        icon: "✔",
        title: "100% Authentic",
        desc: "Authenticity is not an option — it's our standard. Every product goes through strict verification. No fakes. No compromises.",
      },
      {
        icon: "🌐",
        title: "Community First",
        desc: "We grow with the community. Sneakers Flash is not just a platform — it's home for sneakerheads.",
      },
      {
        icon: "♻",
        title: "Sustainable",
        desc: "We believe growth comes with responsibility. From packaging to operations, we're moving toward a more sustainable future.",
      },
    ],
    timelineTitle: "Our Journey",
    milestones: [
      { year: "2015", event: "Sneakers Flash was born from passion — a belief that everyone deserves access to authentic, quality sneakers." },
      { year: "2017", event: "Our first customers grew to thousands. Community trust began to take shape." },
      { year: "2019", event: "Full expansion to digital. Nationwide shipping with trusted delivery partners." },
      { year: "2021", event: "Flash Club launched — an exclusive membership program for true sneaker enthusiasts." },
      { year: "2023", event: "Partnered with 50+ global brands. Warehouse expanded to support growing demand." },
      { year: "2025", event: "50,000+ active customers across Indonesia. Sneakers Flash keeps moving forward." },
    ],
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const headingParagraphs = new Set([
  "Dari Sebuah Passion Menjadi Destinasi Sneakers Terpercaya.",
  "Lebih dari Sekadar Sneakers.",
  "Dibangun dari Kepercayaan. Dikirim dengan Cepat.",
  "Inilah Sneakers Flash. Tempat setiap langkah dimulai.",
  "From a Passion for Sneakers to a Trusted Destination.",
  "More Than Just Sneakers.",
  "Built on Trust. Delivered with Speed.",
  "This is Sneakers Flash. Where every step begins.",
]);

export default function AboutPage() {
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
                lang === l ? "bg-black text-white" : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <PageHeader
        title="About SneakersFlash"
        subtitle={t.pageSubtitle}
        accentWord="Flash"
      />

      <SectionWrapper>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mb-24">
          {t.stats.map((s) => (
            <div key={s.label} className="bg-white p-8 text-center">
              <p className="text-4xl md:text-5xl font-black text-black mb-2">{s.value}</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-start">
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-6">
              {t.storyTitle}
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              {t.storyParagraphs.map((p, i) =>
                headingParagraphs.has(p) ? (
                  <p key={i} className="font-black text-black uppercase tracking-wide text-base">
                    {p}
                  </p>
                ) : (
                  <p key={i} className="text-gray-600">{p}</p>
                )
              )}
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="space-y-5">
            <div className="border border-yellow-300 bg-yellow-50 p-6">
              <p className="text-yellow-700 text-xs uppercase tracking-widest font-bold mb-3">
                {t.visionLabel}
              </p>
              <p className="text-gray-900 font-semibold leading-relaxed">{t.visionText}</p>
            </div>
            <div className="border border-gray-200 bg-gray-50 p-6">
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-3">
                {t.missionLabel}
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                {t.missionItems.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-24">
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-8">
            {t.valuesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.values.map((v) => (
              <div
                key={v.title}
                className="border border-gray-200 bg-white p-6 hover:border-black transition-colors group"
              >
                <p className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {v.icon}
                </p>
                <p className="font-black text-black uppercase text-sm tracking-wider mb-3">
                  {v.title}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-8">
            {t.timelineTitle}
          </h2>
          <div className="space-y-0 max-w-2xl">
            {t.milestones.map((m, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-black mt-1 flex-shrink-0" />
                  {i < t.milestones.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: "40px" }} />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-black font-black text-xs tracking-widest mb-1">{m.year}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}