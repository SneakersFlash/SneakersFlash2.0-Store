import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

const shippingOptions = [
    {
        name: "Regular",
        est: "3–5 Hari Kerja",
        price: "Rp 15.000 – Rp 25.000",
        note: "Tersedia untuk seluruh Indonesia",
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
        est: "Hari yang Sama",
        price: "Rp 50.000 – Rp 80.000",
        note: "Hanya untuk Jakarta, Surabaya, Bandung",
    },
];

const returnSteps = [
    { step: "01", title: "Ajukan Return", desc: "Hubungi CS kami via WhatsApp atau email dalam 7 hari setelah barang diterima." },
    { step: "02", title: "Konfirmasi", desc: "Tim kami akan memverifikasi permintaan returnmu dalam 1×24 jam kerja." },
    { step: "03", title: "Kirim Barang", desc: "Kemas barang dalam kondisi original (box, tag, aksesoris lengkap) dan kirim ke alamat gudang kami." },
    { step: "04", title: "Pengembalian Dana", desc: "Refund diproses dalam 3–5 hari kerja setelah barang diterima dan diverifikasi." },
];

export default function ShippingReturnsPage() {
    return (
        <PageLayout>
        <PageHeader
            title="Shipping & Returns"
            subtitle="Semua yang perlu kamu tahu tentang pengiriman dan kebijakan pengembalian barang."
            accentWord="Returns"
        />

        <SectionWrapper>
            {/* Shipping */}
            <div className="mb-20">
            <h2 className="text-2xl font-black uppercase tracking-wider mb-8">
                Opsi Pengiriman
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {shippingOptions.map((opt) => (
                <div
                    key={opt.name}
                    className={`border p-6 relative ${
                    opt.highlight
                        ? "border-[#f5f500] bg-[#f5f500]/5"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                >
                    {opt.highlight && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] bg-[#f5f500] text-black font-black px-2 py-1">
                        Populer
                    </span>
                    )}
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-3">
                    {opt.name}
                    </p>
                    <p className="text-2xl font-black text-white mb-1">{opt.est}</p>
                    <p className="text-[#f5f500] font-semibold text-sm mb-3">{opt.price}</p>
                    <p className="text-white/40 text-xs">{opt.note}</p>
                </div>
                ))}
            </div>

            <div className="mt-6 border border-white/10 bg-white/[0.02] p-5">
                <p className="text-xs uppercase tracking-wider text-[#f5f500] mb-2">📦 Info Pengiriman</p>
                <ul className="space-y-2 text-sm text-white/60">
                <li>• Pesanan diproses setiap hari kerja pukul 08.00–15.00 WIB.</li>
                <li>• Pesanan masuk setelah pukul 15.00 WIB akan diproses keesokan harinya.</li>
                <li>• Estimasi pengiriman tidak termasuk hari libur nasional.</li>
                <li>• <strong className="text-white">GRATIS ONGKIR</strong> untuk pembelian di atas Rp 500.000 (berlaku Regular).</li>
                </ul>
            </div>
            </div>

            {/* Returns */}
            <div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-3">
                Kebijakan Return
            </h2>
            <p className="text-white/50 text-sm mb-8 max-w-xl">
                Kami menerima pengembalian barang dalam kondisi tertentu. Pastikan kamu membaca
                kebijakan di bawah sebelum mengajukan return.
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {returnSteps.map((s) => (
                <div key={s.step} className="border border-white/10 p-5 hover:border-[#f5f500]/30 transition-colors">
                    <p className="text-[#f5f500] text-3xl font-black mb-4">{s.step}</p>
                    <p className="font-bold text-white uppercase text-sm tracking-wider mb-2">{s.title}</p>
                    <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                </div>
                ))}
            </div>

            {/* Kondisi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-green-500/20 bg-green-500/5 p-5">
                <p className="text-green-400 font-bold uppercase text-sm tracking-wider mb-4">
                    ✓ Dapat Di-return Jika:
                </p>
                <ul className="space-y-2 text-sm text-white/60">
                    <li>• Barang cacat produksi atau rusak saat diterima</li>
                    <li>• Barang tidak sesuai dengan pesanan (warna/model/size)</li>
                    <li>• Barang berbeda dari deskripsi di website</li>
                    <li>• Pengajuan dilakukan ≤ 7 hari setelah terima barang</li>
                </ul>
                </div>
                <div className="border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-red-400 font-bold uppercase text-sm tracking-wider mb-4">
                    ✗ Tidak Dapat Di-return Jika:
                </p>
                <ul className="space-y-2 text-sm text-white/60">
                    <li>• Sudah dipakai atau dicuci</li>
                    <li>• Tag, box, atau aksesoris hilang/rusak</li>
                    <li>• Produk sale atau clearance</li>
                    <li>• Pengajuan lebih dari 7 hari setelah terima</li>
                </ul>
                </div>
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}