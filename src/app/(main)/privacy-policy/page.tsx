// app/privacy-policy/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

const sections = [
  {
    title: "1. Informasi yang Kami Kumpulkan",
    content: [
      "Ketika kamu menggunakan layanan SneakersFlash, kami mengumpulkan berbagai jenis informasi untuk memberikan pengalaman terbaik:",
      "**Informasi Akun:** Nama lengkap, alamat email, nomor telepon, dan kata sandi terenkripsi saat kamu mendaftar.",
      "**Informasi Transaksi:** Detail pesanan, alamat pengiriman, metode pembayaran (tidak termasuk data kartu lengkap), dan riwayat pembelian.",
      "**Informasi Perangkat:** Alamat IP, jenis browser, sistem operasi, dan data penggunaan aplikasi untuk keperluan analitik dan keamanan.",
      "**Cookies:** Kami menggunakan cookies untuk menyimpan preferensi, sesi login, dan data keranjang belanja.",
    ],
  },
  {
    title: "2. Bagaimana Kami Menggunakan Informasi",
    content: [
      "Informasi yang kami kumpulkan digunakan untuk:",
      "• Memproses dan mengirimkan pesanan kamu",
      "• Mengirimkan konfirmasi pembelian dan update status pesanan",
      "• Memberikan layanan pelanggan yang responsif",
      "• Personalisasi rekomendasi produk berdasarkan preferensimu",
      "• Meningkatkan keamanan akun dan mendeteksi aktivitas mencurigakan",
      "• Mengirimkan promosi dan informasi produk terbaru (jika kamu opt-in)",
    ],
  },
  {
    title: "3. Keamanan Data",
    content: [
      "Keamanan datamu adalah prioritas kami. Kami menggunakan enkripsi SSL (Secure Socket Layer) untuk melindungi transmisi data. Data sensitif seperti kata sandi disimpan menggunakan algoritma hashing yang kuat.",
      "Meskipun kami berupaya maksimal, perlu diingat bahwa tidak ada metode transmisi internet yang 100% aman. Kami menyarankanmu untuk menjaga kerahasiaan akun dan tidak membagikan kata sandi kepada siapapun.",
    ],
  },
  {
    title: "4. Berbagi Informasi dengan Pihak Ketiga",
    content: [
      "Kami tidak menjual atau menyewakan informasi pribadimu kepada pihak ketiga. Kami hanya membagikan data kepada mitra terpercaya untuk operasional layanan, seperti:",
      "**Layanan Logistik:** Kurir pengiriman (JNE, Sicepat, Gojek) untuk mengantarkan pesananmu.",
      "**Payment Gateway:** Untuk memproses pembayaran secara aman.",
      "**Analitik:** Google Analytics untuk memahami cara pengguna berinteraksi dengan situs kami.",
    ],
  },
];

export default function PrivacyPolicyPage() {
    const renderContent = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                // Diubah ke text-black untuk penekanan di tema terang
                return <strong key={i} className="text-black font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <PageLayout>
        <PageHeader
            title="Privacy Policy"
            subtitle="Kami menjaga privasi dan keamanan data kamu dengan standar tertinggi. Pelajari bagaimana kami mengelola informasimu."
            accentWord="Policy"
        />

        <SectionWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Sidebar Nav */}
            <div className="lg:sticky lg:top-24 space-y-6">
                <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-4">
                    Navigasi
                </p>
                <nav className="flex flex-col space-y-3">
                    {sections.map((s, i) => (
                    <a
                        key={i}
                        href={`#section-${i}`}
                        className="text-xs text-gray-500 hover:text-black transition-colors duration-200 border-l border-gray-200 pl-4 hover:border-yellow-500"
                    >
                        {s.title}
                    </a>
                    ))}
                </nav>
                </div>

                <div className="pt-6 border-t border-gray-200">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">
                    Terakhir Diperbarui
                </p>
                <p className="text-xs text-gray-600 font-medium">
                    1 Januari 2026
                </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-12">
                {/* Ringkasan Box diubah ke warna kuning lembut agar kontras dengan putih */}
                <div className="border border-yellow-200 bg-yellow-50/50 p-6">
                <p className="text-yellow-700 text-[10px] uppercase tracking-wider font-black mb-3">
                    ⚡ Ringkasan Cepat
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                    Kami mengumpulkan data yang diperlukan untuk memproses pesanan dan meningkatkan
                    layanan. Kami <strong>tidak menjual</strong> datamu. Kamu bisa meminta penghapusan data kapan
                    saja. Kontak: <span className="text-black font-semibold">privacy@sneakersflash.com</span>
                </p>
                </div>

                {sections.map((s, i) => (
                <div key={i} id={`section-${i}`} className="scroll-mt-24">
                    <h2 className="text-lg font-black uppercase tracking-wider text-black mb-5 border-b border-gray-100 pb-2">
                    {s.title}
                    </h2>
                    <div className="space-y-4">
                    {s.content.map((para, j) => (
                        <p key={j} className="text-gray-600 text-sm leading-relaxed">
                        {renderContent(para)}
                        </p>
                    ))}
                    </div>
                </div>
                ))}

                {/* Footer Content */}
                <div className="pt-10 border-t border-gray-200 text-center">
                    <p className="text-gray-400 text-xs italic">
                        Punya pertanyaan mengenai privasi? <a href="/contact-us" className="text-black underline font-medium">Hubungi Tim Keamanan Kami</a>
                    </p>
                </div>
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}