// app/flash-club/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

const tiers = [
    {
        name: "Flash",
        price: "Gratis",
        period: "selamanya",
        color: "border-white/20",
        badgeColor: "bg-white/10 text-white",
        highlight: false,
        benefits: [
        "Akses ke semua produk reguler",
        "Newsletter mingguan",
        "1 voucher ongkir/bulan (maks. Rp 15.000)",
        "Poin reward setiap pembelian",
        "Akses komunitas member",
        ],
        cta: "Mulai Gratis",
    },
    {
        name: "Flash Pro",
        price: "Rp 99.000",
        period: "/ bulan",
        color: "border-[#f5f500]",
        badgeColor: "bg-[#f5f500] text-black",
        highlight: true,
        benefits: [
        "Semua benefit Flash",
        "Early access 24 jam sebelum publik",
        "Diskon 5% semua produk",
        "3 voucher ongkir gratis/bulan",
        "Priority customer service",
        "Akses flash sale eksklusif",
        "Badge Pro di profil",
        ],
        cta: "Bergabung Pro",
    },
    {
        name: "Flash Elite",
        price: "Rp 249.000",
        period: "/ bulan",
        color: "border-white/30",
        badgeColor: "bg-gradient-to-r from-yellow-400 to-orange-500 text-black",
        highlight: false,
        benefits: [
        "Semua benefit Flash Pro",
        "Early access 72 jam sebelum publik",
        "Diskon 10% semua produk",
        "Ongkir gratis unlimited",
        "Dedicated account manager",
        "Akses koleksi limited edition eksklusif",
        "Undangan event & launch party",
        "Birthday gift eksklusif",
        ],
        cta: "Bergabung Elite",
    },
];

const benefits = [
    { icon: "⚡", title: "Early Access", desc: "Dapatkan akses ke rilis terbaru sebelum siapapun. Jangan pernah miss drop lagi." },
    { icon: "💸", title: "Diskon Eksklusif", desc: "Hemat hingga 10% di semua produk, plus flash sale khusus member yang tidak tersedia untuk umum." },
    { icon: "🚚", title: "Ongkir Gratis", desc: "Voucher ongkir gratis setiap bulan. Belanja lebih banyak, bayar lebih sedikit." },
    { icon: "👑", title: "Priority Support", desc: "Antrian prioritas untuk customer service. Masalahmu diselesaikan lebih cepat." },
    { icon: "🎁", title: "Birthday Reward", desc: "Surprise gift spesial di bulan ulang tahunmu. Karena kamu layak mendapatkan yang terbaik." },
    { icon: "🌐", title: "Komunitas Eksklusif", desc: "Bergabung dengan ribuan sneakerhead Indonesia. Share, diskusi, dan tumbuh bersama." },
];

export default function FlashClubPage() {
    return (
        <PageLayout>
        <PageHeader
            title="Flash Club"
            subtitle="Bergabunglah dengan komunitas sneakerhead eksklusif. Privilege lebih banyak, pengalaman lebih tinggi."
            accentWord="Flash"
        />

        {/* Hero Banner */}
        <div className="bg-[#f5f500] px-5 md:px-10 lg:px-20 py-10">
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
                <p className="text-black font-black text-3xl md:text-4xl uppercase tracking-tight leading-none mb-2">
                Lebih dari Sekadar<br />Program Loyalty
                </p>
                <p className="text-black/60 text-sm max-w-md">
                Flash Club adalah lifestyle. Bergabung dengan 50.000+ sneakerhead yang sudah merasakan perbedaannya.
                </p>
            </div>
            <div className="flex-shrink-0 text-center">
                <p className="text-black/60 text-xs uppercase tracking-wider mb-1">Member Aktif</p>
                <p className="text-black font-black text-5xl">50K+</p>
            </div>
            </div>
        </div>

        <SectionWrapper>
            {/* Benefits Overview */}
            <div className="mb-20">
            <h2 className="text-2xl font-black uppercase tracking-wider mb-8">
                Kenapa Flash Club?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {benefits.map((b) => (
                <div
                    key={b.title}
                    className="border border-white/10 p-6 hover:border-[#f5f500]/30 transition-colors group"
                >
                    <p className="text-3xl mb-4">{b.icon}</p>
                    <p className="font-black uppercase text-sm tracking-wider text-white mb-2">
                    {b.title}
                    </p>
                    <p className="text-white/40 text-xs leading-relaxed">{b.desc}</p>
                </div>
                ))}
            </div>
            </div>

            {/* Pricing Tiers */}
            <div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-3">
                Pilih Tier Kamu
            </h2>
            <p className="text-white/40 text-sm mb-8">
                Mulai gratis atau upgrade kapan saja. Cancel kapan saja tanpa biaya.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {tiers.map((tier) => (
                <div
                    key={tier.name}
                    className={`border p-6 md:p-8 relative ${tier.color} ${
                    tier.highlight ? "bg-[#f5f500]/5" : "bg-white/[0.02]"
                    }`}
                >
                    {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-[#f5f500] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1">
                        Paling Populer
                        </span>
                    </div>
                    )}

                    <div className="mb-6">
                    <span
                        className={`inline-block text-[10px] uppercase tracking-widest font-black px-3 py-1 mb-4 ${tier.badgeColor}`}
                    >
                        {tier.name}
                    </span>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black text-white">{tier.price}</p>
                        <p className="text-white/40 text-sm">{tier.period}</p>
                    </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                    {tier.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                        <span className="text-[#f5f500] text-xs mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-white/60 text-xs leading-relaxed">{b}</span>
                        </li>
                    ))}
                    </ul>

                    <a
                    href="#"
                    className={`block text-center font-black uppercase tracking-widest text-xs py-4 transition-colors duration-200 ${
                        tier.highlight
                        ? "bg-[#f5f500] text-black hover:bg-white"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                    >
                    {tier.cta} →
                    </a>
                </div>
                ))}
            </div>

            <p className="text-center text-white/20 text-xs mt-8">
                Dengan bergabung, kamu menyetujui{" "}
                <a href="/privacy-policy" className="underline hover:text-white/50 transition-colors">
                Syarat & Ketentuan
                </a>{" "}
                Flash Club.
            </p>
            </div>
        </SectionWrapper>

        {/* Bottom CTA */}
        <div className="border-t border-white/10 px-5 md:px-10 lg:px-20 py-20">
            <div className="max-w-screen-xl mx-auto text-center">
            <p className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
                Ready to Join the{" "}
                <span className="text-[#f5f500]">Flash?</span>
            </p>
            <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                Ribuan sneakerhead sudah di sini. Jangan sampai kamu ketinggalan drop selanjutnya.
            </p>
            <a
                href="#"
                className="inline-block bg-[#f5f500] text-black font-black uppercase tracking-widest text-sm px-12 py-4 hover:bg-white transition-colors duration-200"
            >
                Join Now — Gratis →
            </a>
            </div>
        </div>
        </PageLayout>
    );
}