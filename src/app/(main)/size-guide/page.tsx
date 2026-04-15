// app/size-guide/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

const sizeData = [
    { us: "4", uk: "3.5", eu: "36", cm: "22.5" },
    { us: "4.5", uk: "4", eu: "36.5", cm: "23" },
    { us: "5", uk: "4.5", eu: "37.5", cm: "23.5" },
    { us: "5.5", uk: "5", eu: "38", cm: "24" },
    { us: "6", uk: "5.5", eu: "38.5", cm: "24.5" },
    { us: "6.5", uk: "6", eu: "39", cm: "25" },
    { us: "7", uk: "6.5", eu: "40", cm: "25.5" },
    { us: "7.5", uk: "7", eu: "40.5", cm: "26" },
    { us: "8", uk: "7.5", eu: "41", cm: "26.5" },
    { us: "8.5", uk: "8", eu: "42", cm: "27" },
    { us: "9", uk: "8.5", eu: "42.5", cm: "27.5" },
    { us: "9.5", uk: "9", eu: "43", cm: "28" },
    { us: "10", uk: "9.5", eu: "44", cm: "28.5" },
    { us: "10.5", uk: "10", eu: "44.5", cm: "29" },
    { us: "11", uk: "10.5", eu: "45", cm: "29.5" },
    { us: "12", uk: "11.5", eu: "46", cm: "30" },
    { us: "13", uk: "12.5", eu: "47.5", cm: "31" },
];

const tips = [
    { icon: "📏", title: "Ukur di Sore Hari", desc: "Kaki sedikit membengkak saat siang/sore — ukur di waktu ini untuk hasil paling akurat." },
    { icon: "🧦", title: "Pakai Kaos Kaki", desc: "Ukur kaki dengan kaos kaki yang biasa kamu pakai saat memakai sepatu." },
    { icon: "📐", title: "Ikuti Merek", desc: "Setiap brand punya sizing yang sedikit berbeda. Cek size chart per produk jika tersedia." },
    { icon: "🔢", title: "Di Antara Size?", desc: "Jika kamu di antara dua ukuran, kami rekomendasikan untuk pilih yang lebih besar." },
];

export default function SizeGuidePage() {
    const headers = ["US", "UK", "EU", "CM"];

    return (
        <PageLayout>
        <PageHeader
            title="Size Guide"
            subtitle="Panduan lengkap ukuran sepatu. Temukan size yang tepat dan pastikan setiap pair perfect di kaki kamu."
            accentWord="Guide"
        />

        <SectionWrapper>
            {/* Size Table */}
            <div className="mb-20">
            <h2 className="text-2xl font-black uppercase tracking-wider mb-6">
                Tabel Ukuran Sepatu
            </h2>
            <p className="text-white/40 text-sm mb-6">
                Konversi ukuran US / UK / EU / CM untuk pria. Untuk wanita, kurangi 1.5 dari size US pria.
            </p>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-sm">
                <thead>
                    <tr className="border-b border-white/20">
                    {headers.map((h) => (
                        <th
                        key={h}
                        className="text-left py-4 px-4 text-xs uppercase tracking-widest text-[#f5f500] font-bold"
                        >
                        {h}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {sizeData.map((row, i) => (
                    <tr
                        key={i}
                        className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                        i % 2 === 0 ? "" : "bg-white/[0.015]"
                        }`}
                    >
                        <td className="py-3 px-4 text-white font-semibold">{row.us}</td>
                        <td className="py-3 px-4 text-white/60">{row.uk}</td>
                        <td className="py-3 px-4 text-white/60">{row.eu}</td>
                        <td className="py-3 px-4 text-white/60">{row.cm}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {/* Cara Ukur */}
            <div className="mb-20">
            <h2 className="text-2xl font-black uppercase tracking-wider mb-6">
                Cara Mengukur Kaki
            </h2>
            <div className="border border-white/10 bg-white/[0.02] p-6 md:p-8 max-w-2xl">
                <ol className="space-y-4">
                {[
                    "Siapkan selembar kertas, pensil, dan penggaris.",
                    "Letakkan kaki di atas kertas, pastikan berdiri tegak.",
                    "Tandai ujung jari terpanjang dan tumit dengan pensil.",
                    "Ukur jarak antara dua titik tersebut dalam satuan cm.",
                    "Cocokkan hasil ukuran dengan tabel di atas.",
                ].map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                    <span className="w-7 h-7 flex-shrink-0 bg-[#f5f500] text-black text-xs font-black flex items-center justify-center">
                        {i + 1}
                    </span>
                    <p className="text-white/70 text-sm leading-relaxed pt-1">{step}</p>
                    </li>
                ))}
                </ol>
            </div>
            </div>

            {/* Tips */}
            <div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-6">
                Tips Memilih Size
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {tips.map((tip) => (
                <div
                    key={tip.title}
                    className="border border-white/10 p-5 hover:border-[#f5f500]/30 transition-colors duration-200"
                >
                    <p className="text-3xl mb-4">{tip.icon}</p>
                    <p className="font-bold text-white text-sm uppercase tracking-wider mb-2">
                    {tip.title}
                    </p>
                    <p className="text-white/40 text-xs leading-relaxed">{tip.desc}</p>
                </div>
                ))}
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}