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
      "• Mematuhi kewajiban hukum dan regulasi yang berlaku",
    ],
  },
  {
    title: "3. Keamanan Data",
    content: [
      "Kami sangat serius dalam melindungi data pribadimu. Langkah-langkah yang kami terapkan meliputi:",
      "• Enkripsi SSL/TLS untuk semua transmisi data",
      "• Enkripsi data sensitif di database dengan standar AES-256",
      "• Autentikasi dua faktor (2FA) yang tersedia untuk semua akun",
      "• Pembatasan akses data internal berbasis kebutuhan (need-to-know basis)",
      "• Audit keamanan reguler dan penetration testing",
      "Meski demikian, tidak ada sistem yang 100% aman. Kami mendorong kamu untuk menggunakan kata sandi yang kuat dan tidak membagikan kredensial akunmu.",
    ],
  },
  {
    title: "4. Berbagi Informasi dengan Pihak Ketiga",
    content: [
      "Kami TIDAK menjual data pribadimu kepada pihak ketiga. Kami hanya berbagi informasi yang diperlukan dengan:",
      "• **Mitra Pengiriman:** JNE, J&T, SiCepat, GoSend, dll — untuk memproses pengiriman pesananmu.",
      "• **Payment Gateway:** Midtrans, Xendit, dll — untuk memproses pembayaran secara aman.",
      "• **Analitik:** Google Analytics (data anonim dan agregat) — untuk memahami penggunaan platform.",
      "• **Kewajiban Hukum:** Otoritas berwenang jika diwajibkan oleh hukum yang berlaku.",
      "Semua mitra pihak ketiga terikat oleh perjanjian kerahasiaan dan wajib melindungi datamu.",
    ],
  },
  {
    title: "5. Hak-Hak Kamu",
    content: [
      "Sesuai dengan regulasi perlindungan data yang berlaku, kamu memiliki hak untuk:",
      "• **Akses:** Meminta salinan data pribadi yang kami simpan tentang kamu",
      "• **Koreksi:** Memperbarui data yang tidak akurat atau tidak lengkap",
      "• **Penghapusan:** Meminta penghapusan data pribadimu (dengan catatan tertentu)",
      "• **Portabilitas:** Menerima datamu dalam format yang dapat dibaca mesin",
      "• **Keberatan:** Menolak pemrosesan data untuk tujuan pemasaran langsung",
      "• **Penarikan Persetujuan:** Menarik persetujuan kapan saja tanpa mempengaruhi pemrosesan sebelumnya",
      "Untuk menggunakan hak-hak di atas, hubungi kami di privacy@sneakersflash.com",
    ],
  },
  {
    title: "6. Cookies & Teknologi Pelacak",
    content: [
      "Kami menggunakan beberapa jenis cookies:",
      "• **Essential Cookies:** Diperlukan untuk fungsi dasar website (sesi login, keranjang belanja).",
      "• **Analytics Cookies:** Membantu kami memahami cara pengguna menggunakan platform.",
      "• **Marketing Cookies:** Digunakan untuk menampilkan iklan yang relevan (hanya jika kamu setuju).",
      "Kamu dapat mengatur preferensi cookies melalui pengaturan browser atau melalui banner cookies di website kami.",
    ],
  },
  {
    title: "7. Retensi Data",
    content: [
      "Kami menyimpan data pribadimu selama akun aktif atau selama diperlukan untuk tujuan yang disebutkan dalam kebijakan ini. Secara umum:",
      "• Data akun: Selama akun aktif + 2 tahun setelah penutupan",
      "• Data transaksi: 5 tahun untuk keperluan akuntansi dan pajak",
      "• Data log keamanan: 12 bulan",
      "Setelah masa retensi berakhir, data akan dihapus secara permanen atau dianonimkan.",
    ],
  },
  {
    title: "8. Perubahan Kebijakan",
    content: [
      "Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Jika ada perubahan material, kami akan memberitahumu melalui:",
      "• Email ke alamat yang terdaftar di akunmu",
      "• Notifikasi di website/aplikasi SneakersFlash",
      "Penggunaan layanan setelah tanggal efektif perubahan dianggap sebagai persetujuan terhadap kebijakan yang diperbarui.",
    ],
  },
  {
    title: "9. Hubungi Kami",
    content: [
      "Jika kamu memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini, hubungi:",
      "• **Email:** privacy@sneakersflash.com",
      "• **Alamat:** Jl. Sudirman No. 123, Jakarta Selatan, 12190",
      "• **Telepon:** +62 21-1234-5678",
      "Tim Privacy Officer kami akan merespons dalam 3 hari kerja.",
    ],
  },
];

function renderContent(text: string) {
    return text
        .split(/\*\*(.*?)\*\*/g)
        .map((part, i) =>
            i % 2 === 1 ? (
                <strong key={i} className="text-white">
                {part}
                </strong>
            ) : (
                part
            )
    );
}

export default function PrivacyPolicyPage() {
    return (
        <PageLayout>
        <PageHeader
            title="Privacy Policy"
            subtitle="Kami menghargai privasi kamu. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadimu."
            accentWord="Privacy"
        />

        <SectionWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* TOC */}
            <div className="lg:col-span-1 lg:sticky lg:top-8 lg:self-start">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-4">
                Daftar Isi
                </p>
                <nav className="space-y-1">
                {sections.map((s, i) => (
                    <a
                    key={i}
                    href={`#section-${i}`}
                    className="block text-xs text-white/40 hover:text-[#f5f500] transition-colors py-1.5 border-l-2 border-transparent hover:border-[#f5f500]/30 pl-3"
                    >
                    {s.title}
                    </a>
                ))}
                </nav>
                <div className="mt-8 border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs text-white/30 leading-relaxed">
                    Terakhir diperbarui:{" "}
                    <strong className="text-white/60">1 Januari 2025</strong>
                </p>
                </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-12">
                <div className="border border-[#f5f500]/20 bg-[#f5f500]/5 p-5">
                <p className="text-[#f5f500] text-xs uppercase tracking-wider font-bold mb-2">
                    Ringkasan Singkat
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                    Kami mengumpulkan data yang diperlukan untuk memproses pesanan dan meningkatkan
                    layanan. Kami tidak menjual datamu. Kamu bisa meminta penghapusan data kapan
                    saja. Kontak: privacy@sneakersflash.com
                </p>
                </div>

                {sections.map((s, i) => (
                <div key={i} id={`section-${i}`} className="scroll-mt-8">
                    <h2 className="text-lg font-black uppercase tracking-wider text-white mb-4">
                    {s.title}
                    </h2>
                    <div className="space-y-3">
                    {s.content.map((para, j) => (
                        <p key={j} className="text-white/55 text-sm leading-relaxed">
                        {renderContent(para)}
                        </p>
                    ))}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}