// app/about/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

const stats = [
    { value: "50K+", label: "Pelanggan Aktif" },
    { value: "10K+", label: "Produk Tersedia" },
    { value: "5★", label: "Rating Kepuasan" },
    { value: "2019", label: "Berdiri Sejak" },
];

const values = [
    {
        icon: "⚡",
        title: "Flash Speed",
        desc: "Kami menghadirkan drop terbaru secepat kilat. Dari rilis ke tanganmu, lebih cepat dari siapapun.",
    },
    {
        icon: "✔",
        title: "100% Authentic",
        desc: "Setiap pasang sepatu melewati verifikasi ketat. Zero fake. Zero compromise.",
    },
    {
        icon: "🌐",
        title: "Community First",
        desc: "Kami bukan sekadar toko. Kami adalah komunitas sneaker enthusiast yang tumbuh bersama.",
    },
    {
        icon: "♻",
        title: "Sustainable",
        desc: "Berkomitmen pada packaging ramah lingkungan dan praktik bisnis yang bertanggung jawab.",
    },
];

const milestones = [
    { year: "2019", event: "SneakersFlash berdiri di Jakarta dengan 10 pasang sepatu pertama." },
    { year: "2020", event: "Ekspansi ke platform digital. 1.000 pelanggan pertama terpenuhi." },
    { year: "2021", event: "Launch program Flash Club — membership eksklusif untuk sneakerhead sejati." },
    { year: "2022", event: "Bermitra dengan 50+ brand global. Warehouse pertama di Tangerang." },
    { year: "2023", event: "SneakersFlash 2.0 diluncurkan. Platform baru, pengalaman baru." },
    { year: "2024", event: "50.000+ pelanggan aktif. Ekspansi ke seluruh Indonesia." },
];

export default function AboutPage() {
    return (
        <PageLayout>
        <PageHeader
            title="About SneakersFlash"
            subtitle="Lahir dari passion, tumbuh bersama komunitas. Ini adalah cerita kami."
            accentWord="Flash"
        />

        <SectionWrapper>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 mb-24">
            {stats.map((s) => (
                <div key={s.label} className="bg-[#0a0a0a] p-8 text-center">
                <p className="text-4xl md:text-5xl font-black text-[#f5f500] mb-2">{s.value}</p>
                <p className="text-xs uppercase tracking-widest text-white/40">{s.label}</p>
                </div>
            ))}
            </div>

            {/* Story */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-start">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-wider mb-6">
                Cerita Kami
                </h2>
                <div className="space-y-4 text-white/60 text-sm leading-relaxed">
                <p>
                    SneakersFlash lahir pada 2019 dari sebuah kamar kos di Jakarta Selatan. Berawal
                    dari frustrasi mendapatkan sneakers autentik dengan harga wajar, pendiri kami
                    memutuskan untuk membangun solusi sendiri.
                </p>
                <p>
                    Nama "Flash" bukan sekadar kata. Ini adalah janji — bahwa kamu akan mendapatkan
                    rilis terbaru, tercepat, dan terpercaya. Dari Air Jordan hingga Yeezy, dari Nike
                    Dunk hingga New Balance, semua ada di sini.
                </p>
                <p>
                    Hari ini, SneakersFlash telah melayani lebih dari 50.000 sneakerhead di seluruh
                    Indonesia. Kami bangga menjadi rumah bagi komunitas yang mencintai sneakers
                    sebagai seni, budaya, dan gaya hidup.
                </p>
                </div>
            </div>

            {/* Vision Mission */}
            <div className="space-y-5">
                <div className="border border-[#f5f500]/20 bg-[#f5f500]/5 p-6">
                <p className="text-[#f5f500] text-xs uppercase tracking-widest font-bold mb-3">
                    🎯 Visi
                </p>
                <p className="text-white font-semibold leading-relaxed">
                    Menjadi platform sneaker terpercaya #1 di Asia Tenggara yang menghubungkan
                    sneakerhead dengan produk autentik terbaik.
                </p>
                </div>
                <div className="border border-white/10 bg-white/[0.02] p-6">
                <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">
                    🚀 Misi
                </p>
                <ul className="space-y-2 text-white/60 text-sm">
                    <li>• Menyediakan akses ke sneaker autentik dengan harga kompetitif</li>
                    <li>• Membangun komunitas sneaker yang inklusif dan teredukasi</li>
                    <li>• Menghadirkan pengalaman belanja yang cepat, aman, dan menyenangkan</li>
                    <li>• Mendukung sneakerhead lokal untuk berkembang bersama</li>
                </ul>
                </div>
            </div>
            </div>

            {/* Values */}
            <div className="mb-24">
            <h2 className="text-2xl font-black uppercase tracking-wider mb-8">
                Nilai Kami
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {values.map((v) => (
                <div
                    key={v.title}
                    className="border border-white/10 p-6 hover:border-[#f5f500]/30 transition-colors group"
                >
                    <p className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                    {v.icon}
                    </p>
                    <p className="font-black text-white uppercase text-sm tracking-wider mb-3">
                    {v.title}
                    </p>
                    <p className="text-white/40 text-xs leading-relaxed">{v.desc}</p>
                </div>
                ))}
            </div>
            </div>

            {/* Timeline */}
            <div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-8">
                Perjalanan Kami
            </h2>
            <div className="space-y-0 max-w-2xl">
                {milestones.map((m, i) => (
                <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#f5f500] mt-1 flex-shrink-0" />
                    {i < milestones.length - 1 && (
                        <div className="w-px flex-1 bg-white/10 mt-1" style={{ minHeight: "40px" }} />
                    )}
                    </div>
                    <div className="pb-8">
                    <p className="text-[#f5f500] font-black text-xs tracking-widest mb-1">
                        {m.year}
                    </p>
                    <p className="text-white/70 text-sm leading-relaxed">{m.event}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}