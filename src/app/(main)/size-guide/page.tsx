"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";
type BrandKey = "nike" | "adidas" | "jordan" | "newbalance" | "vans" | "converse" | "puma" | "asics";

interface BrandInfo {
  label: string;
  fit: { id: string; en: string };
  fitType: "true" | "small" | "large";
  note: { id: string; en: string };
  sizes: { us: string; uk: string; eu: string; cm: string }[];
}

// ─── Brand size data ───────────────────────────────────────────────────────────
const brands: Record<BrandKey, BrandInfo> = {
  nike: {
    label: "Nike",
    fit: { id: "Sesuai Ukuran", en: "True to Size" },
    fitType: "true",
    note: {
      id: "Nike umumnya sesuai ukuran. Beberapa model seperti Air Force 1 cenderung lebar — pertimbangkan setengah size lebih kecil.",
      en: "Nike generally fits true to size. Some models like Air Force 1 run wide — consider going half a size down.",
    },
    sizes: [
      { us: "6",   uk: "5",    eu: "38.5", cm: "24"   },
      { us: "6.5", uk: "5.5",  eu: "39",   cm: "24.5" },
      { us: "7",   uk: "6",    eu: "40",   cm: "25"   },
      { us: "7.5", uk: "6.5",  eu: "40.5", cm: "25.5" },
      { us: "8",   uk: "7",    eu: "41",   cm: "26"   },
      { us: "8.5", uk: "7.5",  eu: "42",   cm: "26.5" },
      { us: "9",   uk: "8",    eu: "42.5", cm: "27"   },
      { us: "9.5", uk: "8.5",  eu: "43",   cm: "27.5" },
      { us: "10",  uk: "9",    eu: "44",   cm: "28"   },
      { us: "10.5",uk: "9.5",  eu: "44.5", cm: "28.5" },
      { us: "11",  uk: "10",   eu: "45",   cm: "29"   },
      { us: "12",  uk: "11",   eu: "46",   cm: "30"   },
      { us: "13",  uk: "12",   eu: "47.5", cm: "31"   },
    ],
  },
  adidas: {
    label: "Adidas",
    fit: { id: "Sesuai Ukuran", en: "True to Size" },
    fitType: "true",
    note: {
      id: "Adidas umumnya sesuai ukuran. Ultraboost dan NMD cocok dengan ukuran normal; Stan Smith cenderung sedikit sempit.",
      en: "Adidas generally fits true to size. Ultraboost & NMD fit as expected; Stan Smith runs slightly narrow.",
    },
    sizes: [
      { us: "6",   uk: "5.5",  eu: "38",   cm: "24"   },
      { us: "6.5", uk: "6",    eu: "39",   cm: "24.5" },
      { us: "7",   uk: "6.5",  eu: "40",   cm: "25"   },
      { us: "7.5", uk: "7",    eu: "40.5", cm: "25.5" },
      { us: "8",   uk: "7.5",  eu: "42",   cm: "26"   },
      { us: "8.5", uk: "8",    eu: "42.5", cm: "26.5" },
      { us: "9",   uk: "8.5",  eu: "43",   cm: "27"   },
      { us: "9.5", uk: "9",    eu: "43.5", cm: "27.5" },
      { us: "10",  uk: "9.5",  eu: "44",   cm: "28"   },
      { us: "10.5",uk: "10",   eu: "44.5", cm: "28.5" },
      { us: "11",  uk: "10.5", eu: "45.5", cm: "29"   },
      { us: "12",  uk: "11.5", eu: "46.5", cm: "30"   },
      { us: "13",  uk: "12.5", eu: "48",   cm: "31"   },
    ],
  },
  jordan: {
    label: "Air Jordan",
    fit: { id: "Kecil — Naik ½ Size", en: "Runs Small — Size Up ½" },
    fitType: "small",
    note: {
      id: "Air Jordan cenderung kecil, terutama seri Jordan 1 & 3. Disarankan naik setengah ukuran untuk kenyamanan optimal.",
      en: "Air Jordans tend to run small, especially Jordan 1 & 3. We recommend sizing up half a size for the best fit.",
    },
    sizes: [
      { us: "6",   uk: "5",    eu: "38.5", cm: "24"   },
      { us: "6.5", uk: "5.5",  eu: "39",   cm: "24.5" },
      { us: "7",   uk: "6",    eu: "40",   cm: "25"   },
      { us: "7.5", uk: "6.5",  eu: "40.5", cm: "25.5" },
      { us: "8",   uk: "7",    eu: "41",   cm: "26"   },
      { us: "8.5", uk: "7.5",  eu: "42",   cm: "26.5" },
      { us: "9",   uk: "8",    eu: "42.5", cm: "27"   },
      { us: "9.5", uk: "8.5",  eu: "43",   cm: "27.5" },
      { us: "10",  uk: "9",    eu: "44",   cm: "28"   },
      { us: "10.5",uk: "9.5",  eu: "44.5", cm: "28.5" },
      { us: "11",  uk: "10",   eu: "45",   cm: "29"   },
      { us: "12",  uk: "11",   eu: "46",   cm: "30"   },
      { us: "13",  uk: "12",   eu: "47.5", cm: "31"   },
    ],
  },
  newbalance: {
    label: "New Balance",
    fit: { id: "Sesuai Ukuran", en: "True to Size" },
    fitType: "true",
    note: {
      id: "New Balance sesuai ukuran dan tersedia dalam lebar D (standar) & 2E (lebar). Ideal untuk kaki lebar.",
      en: "New Balance fits true to size and comes in D (standard) & 2E (wide) widths. Great for wider feet.",
    },
    sizes: [
      { us: "6",   uk: "5.5",  eu: "38.5", cm: "24"   },
      { us: "6.5", uk: "6",    eu: "39",   cm: "24.5" },
      { us: "7",   uk: "6.5",  eu: "40",   cm: "25"   },
      { us: "7.5", uk: "7",    eu: "40.5", cm: "25.5" },
      { us: "8",   uk: "7.5",  eu: "41.5", cm: "26"   },
      { us: "8.5", uk: "8",    eu: "42",   cm: "26.5" },
      { us: "9",   uk: "8.5",  eu: "42.5", cm: "27"   },
      { us: "9.5", uk: "9",    eu: "43",   cm: "27.5" },
      { us: "10",  uk: "9.5",  eu: "44",   cm: "28"   },
      { us: "10.5",uk: "10",   eu: "44.5", cm: "28.5" },
      { us: "11",  uk: "10.5", eu: "45",   cm: "29"   },
      { us: "12",  uk: "11.5", eu: "46.5", cm: "30"   },
      { us: "13",  uk: "12.5", eu: "47.5", cm: "31"   },
    ],
  },
  vans: {
    label: "Vans",
    fit: { id: "Besar — Turun ½ Size", en: "Runs Large — Size Down ½" },
    fitType: "large",
    note: {
      id: "Vans cenderung besar. Old Skool & Sk8-Hi disarankan turun setengah ukuran. Model slip-on turun satu ukuran penuh.",
      en: "Vans run large. Old Skool & Sk8-Hi: go half a size down. Slip-ons: go a full size down for best fit.",
    },
    sizes: [
      { us: "6",   uk: "5.5",  eu: "38",   cm: "24"   },
      { us: "6.5", uk: "6",    eu: "38.5", cm: "24.5" },
      { us: "7",   uk: "6.5",  eu: "39",   cm: "25"   },
      { us: "7.5", uk: "7",    eu: "40",   cm: "25.5" },
      { us: "8",   uk: "7.5",  eu: "40.5", cm: "26"   },
      { us: "8.5", uk: "8",    eu: "41",   cm: "26.5" },
      { us: "9",   uk: "8.5",  eu: "42",   cm: "27"   },
      { us: "9.5", uk: "9",    eu: "42.5", cm: "27.5" },
      { us: "10",  uk: "9.5",  eu: "43",   cm: "28"   },
      { us: "10.5",uk: "10",   eu: "44",   cm: "28.5" },
      { us: "11",  uk: "10.5", eu: "44.5", cm: "29"   },
      { us: "12",  uk: "11.5", eu: "45.5", cm: "30"   },
      { us: "13",  uk: "12.5", eu: "47",   cm: "31"   },
    ],
  },
  converse: {
    label: "Converse",
    fit: { id: "Sangat Besar — Turun 1–1½ Size", en: "Runs Very Large — Size Down 1–1½" },
    fitType: "large",
    note: {
      id: "Converse sangat besar dan panjang. Disarankan turun 1 hingga 1.5 ukuran. Chuck Taylor Low lebih besar dari High Top.",
      en: "Converse runs very long. Size down 1 to 1.5 sizes. Chuck Taylor Lows tend to run even larger than High Tops.",
    },
    sizes: [
      { us: "5",   uk: "4",    eu: "36",   cm: "23"   },
      { us: "5.5", uk: "4.5",  eu: "37",   cm: "23.5" },
      { us: "6",   uk: "5",    eu: "37.5", cm: "24"   },
      { us: "6.5", uk: "5.5",  eu: "38",   cm: "24.5" },
      { us: "7",   uk: "6",    eu: "39",   cm: "25"   },
      { us: "7.5", uk: "6.5",  eu: "39.5", cm: "25.5" },
      { us: "8",   uk: "7",    eu: "41",   cm: "26"   },
      { us: "8.5", uk: "7.5",  eu: "41.5", cm: "26.5" },
      { us: "9",   uk: "8",    eu: "42",   cm: "27"   },
      { us: "9.5", uk: "8.5",  eu: "42.5", cm: "27.5" },
      { us: "10",  uk: "9",    eu: "43",   cm: "28"   },
      { us: "11",  uk: "10",   eu: "44.5", cm: "29"   },
      { us: "12",  uk: "11",   eu: "46",   cm: "30"   },
    ],
  },
  puma: {
    label: "Puma",
    fit: { id: "Sesuai Ukuran", en: "True to Size" },
    fitType: "true",
    note: {
      id: "Puma umumnya sesuai ukuran. RS-X dan Suede Classic cocok dengan ukuran normal.",
      en: "Puma generally fits true to size. RS-X and Suede Classic fit as expected.",
    },
    sizes: [
      { us: "6",   uk: "5",    eu: "38",   cm: "24"   },
      { us: "6.5", uk: "5.5",  eu: "38.5", cm: "24.5" },
      { us: "7",   uk: "6",    eu: "39",   cm: "25"   },
      { us: "7.5", uk: "6.5",  eu: "40",   cm: "25.5" },
      { us: "8",   uk: "7",    eu: "40.5", cm: "26"   },
      { us: "8.5", uk: "7.5",  eu: "41",   cm: "26.5" },
      { us: "9",   uk: "8",    eu: "42",   cm: "27"   },
      { us: "9.5", uk: "8.5",  eu: "42.5", cm: "27.5" },
      { us: "10",  uk: "9",    eu: "43.5", cm: "28"   },
      { us: "10.5",uk: "9.5",  eu: "44",   cm: "28.5" },
      { us: "11",  uk: "10",   eu: "44.5", cm: "29"   },
      { us: "12",  uk: "11",   eu: "46",   cm: "30"   },
      { us: "13",  uk: "12",   eu: "47",   cm: "31"   },
    ],
  },
  asics: {
    label: "ASICS",
    fit: { id: "Sesuai Ukuran", en: "True to Size" },
    fitType: "true",
    note: {
      id: "ASICS sesuai ukuran dan dikenal nyaman untuk kaki lebar. Gel-Kayano & Gel-Nimbus memberikan ruang jari yang lega.",
      en: "ASICS fits true to size and is known for comfort on wider feet. Gel-Kayano & Gel-Nimbus offer ample toe room.",
    },
    sizes: [
      { us: "6",   uk: "5",    eu: "38.5", cm: "24"   },
      { us: "6.5", uk: "5.5",  eu: "39",   cm: "24.5" },
      { us: "7",   uk: "6",    eu: "40",   cm: "25"   },
      { us: "7.5", uk: "6.5",  eu: "40.5", cm: "25.5" },
      { us: "8",   uk: "7",    eu: "41.5", cm: "26"   },
      { us: "8.5", uk: "7.5",  eu: "42",   cm: "26.5" },
      { us: "9",   uk: "8",    eu: "42.5", cm: "27"   },
      { us: "9.5", uk: "8.5",  eu: "43.5", cm: "27.5" },
      { us: "10",  uk: "9",    eu: "44",   cm: "28"   },
      { us: "10.5",uk: "9.5",  eu: "44.5", cm: "28.5" },
      { us: "11",  uk: "10",   eu: "45",   cm: "29"   },
      { us: "12",  uk: "11",   eu: "46.5", cm: "30"   },
      { us: "13",  uk: "12",   eu: "48",   cm: "31"   },
    ],
  },
};

const brandKeys: BrandKey[] = ["nike", "adidas", "jordan", "newbalance", "vans", "converse", "puma", "asics"];

// ─── Static content ────────────────────────────────────────────────────────────
const content = {
  id: {
    pageTitle: "Panduan Ukuran",
    pageSubtitle: "Temukan ukuran yang paling pas untukmu. Gunakan panduan ini untuk memastikan setiap langkah tetap nyaman.",
    accentWord: "Ukuran",
    tableTitle: "Tabel Ukuran Sepatu",
    tableNote: "Konversi ukuran US / UK / EU / CM untuk pria. Untuk wanita, kurangi 1.5 dari size US pria.",
    brandLabel: "Pilih Brand",
    fitLabel: "Rekomendasi Fit",
    measureTitle: "Cara Mengukur Kaki",
    measureSteps: [
      "Siapkan selembar kertas, pensil, dan penggaris.",
      "Letakkan kaki di atas kertas dan berdiri tegak.",
      "Tandai ujung jari terpanjang dan bagian tumit.",
      "Ukur jarak antara kedua titik tersebut (dalam cm).",
      "Cocokkan hasil ukuran dengan size chart.",
    ],
    tipsTitle: "SIZE TIPS",
    tips: [
      { icon: "📏", title: "Ukur di Sore Hari", desc: "Kaki cenderung sedikit membengkak saat siang/sore, sehingga hasil pengukuran lebih akurat." },
      { icon: "🧦", title: "Gunakan Kaos Kaki", desc: "Ukur kaki dengan kaos kaki yang biasa kamu pakai saat menggunakan sepatu." },
      { icon: "📐", title: "Ikuti Size Merek", desc: "Setiap brand memiliki ukuran yang sedikit berbeda. Selalu cek size chart pada produk jika tersedia." },
      { icon: "🔢", title: "Di Antara Dua Size?", desc: "Jika kamu berada di antara dua ukuran, kami sarankan memilih ukuran yang lebih besar untuk kenyamanan." },
    ],
  },
  en: {
    pageTitle: "Size Guide",
    pageSubtitle: "Find your perfect fit. Use this guide to choose the right size for every step.",
    accentWord: "Guide",
    tableTitle: "Shoe Size Chart",
    tableNote: "US / UK / EU / CM conversion for men. For women, subtract 1.5 from the men's US size.",
    brandLabel: "Select Brand",
    fitLabel: "Fit Recommendation",
    measureTitle: "How to Measure Your Foot",
    measureSteps: [
      "Prepare a piece of paper, a pencil, and a ruler.",
      "Place your foot on the paper and stand straight.",
      "Mark the longest toe and the back of your heel.",
      "Measure the distance between both points (in cm).",
      "Match your measurement with the size chart.",
    ],
    tipsTitle: "SIZE TIPS",
    tips: [
      { icon: "📏", title: "Measure in the Afternoon", desc: "Feet tend to swell during the day, measuring in the afternoon gives more accurate results." },
      { icon: "🧦", title: "Wear Socks", desc: "Measure your feet while wearing the socks you usually use with your shoes." },
      { icon: "📐", title: "Follow Brand Sizing", desc: "Each brand may have slightly different sizing. Always check the product size chart if available." },
      { icon: "🔢", title: "Between Sizes?", desc: "If you're between two sizes, we recommend choosing the larger one for better comfort." },
    ],
  },
};

// ─── Fit badge colours ─────────────────────────────────────────────────────────
const fitColors = {
  true:  { bg: "bg-green-100",  border: "border-green-300",  text: "text-green-700"  },
  small: { bg: "bg-red-100",    border: "border-red-300",    text: "text-red-700"    },
  large: { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SizeGuidePage() {
  const [lang, setLang] = useState<Lang>("id");
  const [activeBrand, setActiveBrand] = useState<BrandKey>("nike");

  const t = content[lang];
  const brand = brands[activeBrand];
  const fit = fitColors[brand.fitType];
  const headers = ["US", "UK", "EU", "CM"];

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

      <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} accentWord={t.accentWord} />

      <SectionWrapper>
        {/* ── Size Table ──────────────────────────────────────────────── */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-2">
            {t.tableTitle}
          </h2>
          <p className="text-gray-500 text-sm mb-6">{t.tableNote}</p>

          {/* Brand Tabs */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
              {t.brandLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {brandKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveBrand(key)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors duration-150 ${
                    activeBrand === key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                  }`}
                >
                  {brands[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* Fit Badge + Note */}
          <div className={`flex flex-col sm:flex-row sm:items-start gap-3 border ${fit.border} ${fit.bg} p-4 mb-4`}>
            <div className="flex-shrink-0">
              <span className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1 border ${fit.border} ${fit.text}`}>
                {t.fitLabel}: {brand.fit[lang]}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${fit.text}`}>{brand.note[lang]}</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  {headers.map((h) => (
                    <th key={h} className="text-left py-4 px-4 text-xs uppercase tracking-widest text-yellow-600 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brand.sizes.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 hover:bg-yellow-50 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-black font-semibold">{row.us}</td>
                    <td className="py-3 px-4 text-gray-600">{row.uk}</td>
                    <td className="py-3 px-4 text-gray-600">{row.eu}</td>
                    <td className="py-3 px-4 text-gray-600">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── How to Measure ──────────────────────────────────────────── */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-6">
            {t.measureTitle}
          </h2>
          <div className="border border-gray-200 bg-gray-50 p-6 md:p-8 max-w-2xl">
            <ol className="space-y-4">
              {t.measureSteps.map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="w-7 h-7 flex-shrink-0 bg-yellow-400 text-black text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Size Tips ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-wider mb-6">
            {t.tipsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.tips.map((tip) => (
              <div
                key={tip.title}
                className="border border-gray-200 bg-white p-5 hover:border-black hover:shadow-md transition-all duration-200"
              >
                <p className="text-3xl mb-4">{tip.icon}</p>
                <p className="font-bold text-black text-sm uppercase tracking-wider mb-2">{tip.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}