// app/flash-club/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

const tiers = [
    {
        name: "Basic",
        requirement: "Member Baru",
        desc: "Langkah awal perjalananmu di SneakersFlash.",
        color: "border-gray-200",
        badgeColor: "bg-gray-100 text-gray-700",
        highlight: false,
        benefits: [
            "Dapatkan 1 Flash Point setiap belanja 10rb",
            "Akses produk rilis reguler",
            "Voucher ulang tahun",
            "Akses komunitas member",
        ],
        cta: "Daftar Sekarang",
    },
    {
        name: "Advance",
        requirement: "Belanja 5 Juta",
        desc: "Untuk sneakerhead yang mulai serius membangun koleksi.",
        color: "border-yellow-400",
        badgeColor: "bg-yellow-400 text-black",
        highlight: true,
        benefits: [
            "Semua benefit Basic",
            "Early access 24 jam untuk produk Limited",
            "Multiplier Point 1.5x",
            "3 voucher ongkir gratis/bulan",
            "Undangan eksklusif ke Secret Flash Sale",
        ],
        cta: "Cek Progress Belanja",
    },
    {
        name: "Ultimate",
        requirement: "Tier Tertinggi",
        desc: "Privilese maksimal dengan diskon tambahan di setiap transaksi.",
        color: "border-black",
        badgeColor: "bg-black text-white",
        highlight: false,
        benefits: [
            "Semua benefit Advance",
            "Diskon Flat 10% untuk semua produk",
            "Multiplier Point 2x",
            "Voucher ongkir gratis tanpa batas",
            "Layanan Concierge (Personal Shopper)",
            "Birthday Gift eksklusif dari SneakersFlash",
        ],
        cta: "Lihat Benefit Ultimate",
    },
];

export default function FlashPointPage() {
    return (
        <PageLayout>
            <PageHeader
                title="Flash Point"
                subtitle="Kumpulkan poin dari setiap transaksi dan naikkan levelmu untuk membuka diskon serta akses eksklusif."
                accentWord="Point"
            />

            <SectionWrapper>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative border p-8 bg-white transition-all duration-300 hover:shadow-xl ${
                                tier.color
                            } ${tier.highlight ? "ring-1 ring-yellow-400 scale-105 z-10" : ""}`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 ${tier.badgeColor}`}>
                                    {tier.name}
                                </span>
                                <div className="mt-4">
                                    <span className="text-2xl font-black text-black block">{tier.requirement}</span>
                                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">{tier.desc}</p>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {tier.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                        <span className={`mt-0.5 ${tier.name === 'Ultimate' && benefit.includes('10%') ? 'text-red-500 font-bold' : 'text-yellow-600'}`}>
                                            {tier.name === 'Ultimate' && benefit.includes('10%') ? '★' : '✓'}
                                        </span>
                                        <span className={tier.name === 'Ultimate' && benefit.includes('10%') ? 'font-bold text-black' : ''}>
                                            {benefit}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`block w-full text-center py-4 text-xs font-black uppercase tracking-widest transition-colors duration-200 ${
                                    tier.highlight
                                        ? "bg-yellow-400 text-black hover:bg-black hover:text-white"
                                        : "bg-white text-black border border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                {tier.cta}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 border border-gray-100 bg-gray-50/50 p-8 text-center max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-black mb-2">Bagaimana Cara Kerja Flash Point?</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Sistem ini otomatis melacak total belanja kamu sejak pertama kali mendaftar. Setelah akumulasi belanja mencapai <strong>Rp 5.000.000</strong>, akunmu akan otomatis naik ke level <strong>Advance</strong>. Level <strong>Ultimate</strong> diberikan kepada member terpilih dengan kontribusi komunitas tertinggi dan riwayat belanja terbaik.
                    </p>
                </div>
            </SectionWrapper>

            {/* Bottom CTA */}
            <div className="border-t border-gray-200 bg-white px-5 md:px-10 lg:px-20 py-20">
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <p className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight mb-4">
                            Makin Sering Belanja, <span className="text-yellow-500 text-outline-black">Makin Untung.</span>
                        </p>
                        <p className="text-gray-500 text-sm">
                            Level membership kamu tidak akan hangus. Sekali mencapai Advance atau Ultimate, kamu akan menikmati keuntungannya selamanya.
                        </p>
                    </div>
                    <a
                        href="/register"
                        className="inline-block bg-black text-white font-black uppercase tracking-widest text-sm px-12 py-5 hover:bg-yellow-400 hover:text-black transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
                    >
                        Mulai Kumpulkan Poin →
                    </a>
                </div>
            </div>
        </PageLayout>
    );
}