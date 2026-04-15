// app/faqs/page.tsx
"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type FAQ = { q: string; a: string };
type Category = { label: string; items: FAQ[] };

const categories: Category[] = [
    {
        label: "Pemesanan",
        items: [
        {
            q: "Bagaimana cara memesan di SneakersFlash?",
            a: "Pilih produk yang kamu inginkan, pilih ukuran, lalu klik 'Add to Cart'. Setelah checkout, lakukan pembayaran sesuai metode yang dipilih. Konfirmasi pesanan akan dikirim ke emailmu.",
        },
        {
            q: "Apakah saya bisa mengubah atau membatalkan pesanan?",
            a: "Pesanan dapat dibatalkan atau diubah dalam 1 jam setelah pemesanan. Setelah itu, pesanan sudah masuk ke proses packing. Hubungi CS kami segera jika ada perubahan.",
        },
        {
            q: "Metode pembayaran apa saja yang tersedia?",
            a: "Kami menerima Transfer Bank (BCA, Mandiri, BNI, BRI), Virtual Account, GoPay, OVO, DANA, ShopeePay, Kartu Kredit/Debit VISA/Mastercard, serta COD untuk area tertentu.",
        },
        ],
    },
    {
        label: "Produk & Keaslian",
        items: [
        {
            q: "Apakah semua produk di SneakersFlash 100% original?",
            a: "Ya, 100%. Setiap produk melewati proses verifikasi keaslian berlapis. Kami bermitra langsung dengan distributor resmi dan brand. Jika terbukti tidak original, kami kembalikan uang kamu sepenuhnya.",
        },
        {
            q: "Bagaimana cara memverifikasi keaslian produk?",
            a: "Setiap produk dilengkapi QR code verifikasi di box. Kamu juga bisa menghubungi CS kami dengan foto produk untuk pengecekan manual. Kami juga menyertakan certificate of authenticity untuk produk premium.",
        },
        {
            q: "Produk apa saja yang tersedia di SneakersFlash?",
            a: "Kami menyediakan sneakers dari Nike, Adidas, Jordan, New Balance, Vans, Converse, Puma, Asics, Reebok, dan banyak brand lainnya — termasuk koleksi limited edition dan kolaborasi eksklusif.",
        },
        ],
    },
    {
        label: "Pengiriman",
        items: [
        {
            q: "Berapa lama estimasi pengiriman?",
            a: "Regular: 3–5 hari kerja. Express: 1–2 hari kerja. Same Day: hari yang sama (khusus Jakarta, Surabaya, Bandung). Semua estimasi di luar hari libur nasional.",
        },
        {
            q: "Apakah ada ongkos kirim gratis?",
            a: "Ya! Gratis ongkir Regular untuk pembelian di atas Rp 500.000 ke seluruh Indonesia. Member Flash Club mendapatkan ongkir gratis lebih sering lewat voucher bulanan.",
        },
        {
            q: "Bagaimana jika paket saya hilang atau rusak?",
            a: "Semua pesanan dilindungi asuransi pengiriman. Jika paket hilang atau rusak dalam transit, hubungi CS kami dengan bukti foto. Kami akan proses klaim dan kirimkan penggantian.",
        },
        ],
    },
    {
        label: "Return & Refund",
        items: [
        {
            q: "Bagaimana cara mengajukan return?",
            a: "Hubungi CS kami via WhatsApp atau email dalam 7 hari setelah barang diterima. Sertakan foto produk dan alasan return. Tim kami akan konfirmasi dalam 1×24 jam kerja.",
        },
        {
            q: "Berapa lama proses refund?",
            a: "Setelah barang diterima dan diverifikasi, refund diproses dalam 3–5 hari kerja. Dana dikembalikan ke metode pembayaran asal.",
        },
        ],
    },
    {
        label: "Flash Club",
        items: [
        {
            q: "Apa itu Flash Club?",
            a: "Flash Club adalah program membership eksklusif SneakersFlash. Member mendapatkan akses early release, diskon spesial, voucher ongkir, dan berbagai privilege lainnya.",
        },
        {
            q: "Berapa biaya bergabung Flash Club?",
            a: "Flash Club tersedia dalam 3 tier: Flash (Gratis), Flash Pro (Rp 99.000/bulan), dan Flash Elite (Rp 249.000/bulan). Setiap tier memiliki benefit yang berbeda.",
        },
        ],
    },
];

function AccordionItem({ q, a }: FAQ) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-b-0">
        <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-start justify-between gap-4 py-5 text-left group"
            aria-expanded={open}
        >
            <span className="text-sm font-semibold text-white group-hover:text-[#f5f500] transition-colors leading-relaxed">
            {q}
            </span>
            <span
            className={`flex-shrink-0 w-6 h-6 border border-white/20 flex items-center justify-center text-white/50 mt-0.5 transition-all duration-200 ${
                open ? "rotate-45 border-[#f5f500] text-[#f5f500]" : ""
            }`}
            >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            </span>
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
            }`}
        >
            <p className="text-white/50 text-sm leading-relaxed">{a}</p>
        </div>
        </div>
    );
    }

    export default function FAQsPage() {
    const [activeCategory, setActiveCategory] = useState(0);

    return (
        <PageLayout>
        <PageHeader
            title="FAQs"
            subtitle="Temukan jawaban atas pertanyaan yang paling sering ditanyakan seputar SneakersFlash."
            accentWord="FAQ"
        />

        <SectionWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Category Nav */}
            <div className="lg:col-span-1">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Kategori</p>
                <nav className="space-y-1">
                {categories.map((cat, i) => (
                    <button
                    key={cat.label}
                    onClick={() => setActiveCategory(i)}
                    className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 border-l-2 ${
                        activeCategory === i
                        ? "border-[#f5f500] text-[#f5f500] bg-[#f5f500]/5 font-semibold"
                        : "border-transparent text-white/50 hover:text-white hover:border-white/20"
                    }`}
                    >
                    {cat.label}
                    </button>
                ))}
                </nav>
            </div>

            {/* Accordion */}
            <div className="lg:col-span-3">
                <h2 className="text-xl font-black uppercase tracking-wider mb-6">
                {categories[activeCategory].label}
                </h2>
                <div className="border border-white/10 bg-white/[0.02] px-5 md:px-8">
                {categories[activeCategory].items.map((item, i) => (
                    <AccordionItem key={i} q={item.q} a={item.a} />
                ))}
                </div>

                {/* CTA */}
                <div className="mt-8 border border-white/10 bg-white/[0.02] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="font-bold text-white text-sm">Tidak menemukan jawaban?</p>
                    <p className="text-white/40 text-xs mt-1">
                    Tim CS kami siap membantu kamu.
                    </p>
                </div>
                <a
                    href="/contact-us"
                    className="flex-shrink-0 bg-[#f5f500] text-black font-black uppercase tracking-widest text-xs px-6 py-3 hover:bg-white transition-colors"
                >
                    Hubungi Kami →
                </a>
                </div>
            </div>
            </div>
        </SectionWrapper>
        </PageLayout>
    );
}