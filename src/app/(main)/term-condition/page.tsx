"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ContentPart =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "bullet"; text: string }
  | { type: "subheading"; text: string };

interface Section {
  id: string;
  navLabel: string;
  title: string;
  content: ContentPart[];
}

// ─── Content ───────────────────────────────────────────────────────────────────
const content: Record<
  Lang,
  {
    pageTitle: string;
    pageSubtitle: string;
    accentWord: string;
    navLabel: string;
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    summaryLabel: string;
    summaryLines: string[];
    summaryEmail: string;
    footerText: string;
    footerLinkText: string;
    sections: Section[];
  }
> = {
  id: {
    pageTitle: "Syarat & Ketentuan",
    pageSubtitle:
      "Dengan berbelanja di Sneakers Flash, kamu dianggap telah membaca dan menyetujui syarat & ketentuan berikut.",
    accentWord: "Ketentuan",
    navLabel: "Navigasi",
    lastUpdatedLabel: "Terakhir Diperbarui",
    lastUpdatedValue: "1 Januari 2026",
    summaryLabel: "⚡ Poin Utama",
    summaryLines: [
      "Harga dan ketersediaan stok dapat berubah sewaktu-waktu.",
      "Pengembalian diterima dalam 2×24 jam setelah barang diterima.",
      "Seluruh konten di website ini adalah milik Sneakers Flash.",
    ],
    summaryEmail: "Pertanyaan? Hubungi kami di:",
    footerText: "Butuh klarifikasi mengenai syarat ini?",
    footerLinkText: "Hubungi Tim Kami",
    sections: [
      {
        id: "section-0",
        navLabel: "1. Ketersediaan Produk",
        title: "1. Ketersediaan Produk",
        content: [
          {
            type: "text",
            text: "Sneakers Flash berkomitmen untuk menyajikan koleksi sneakers terkini dengan stok yang selalu diperbarui. Namun, karena tingginya permintaan dan dinamika pasar sneaker, stok dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.",
          },
          {
            type: "subheading",
            text: "Konfirmasi Stok",
          },
          {
            type: "text",
            text: "Setiap pesanan yang masuk akan melalui proses verifikasi stok. Jika produk yang kamu pesan ternyata sudah habis atau tidak tersedia, tim kami akan menghubungimu dalam 1×24 jam untuk:",
          },
          { type: "bullet", text: "Menawarkan produk pengganti dengan model atau warna serupa" },
          { type: "bullet", text: "Memproses pengembalian dana (refund) secara penuh" },
          { type: "bullet", text: "Memasukkan produk ke daftar waitlist jika restock sedang dijadwalkan" },
          {
            type: "subheading",
            text: "Pre-Order & Limited Edition",
          },
          {
            type: "text",
            text: "Untuk produk pre-order dan limited edition, estimasi ketersediaan akan dicantumkan di halaman produk. Sneakers Flash tidak menjamin ketersediaan produk limited edition karena bergantung pada alokasi dari brand terkait.",
          },
        ],
      },
      {
        id: "section-1",
        navLabel: "2. Harga & Pembayaran",
        title: "2. Harga & Pembayaran",
        content: [
          {
            type: "text",
            text: "Semua harga yang tercantum di website Sneakers Flash menggunakan mata uang Rupiah (IDR) dan sudah termasuk pajak yang berlaku, kecuali disebutkan lain.",
          },
          {
            type: "subheading",
            text: "Perubahan Harga",
          },
          {
            type: "text",
            text: "Harga dapat berubah sewaktu-waktu mengikuti kondisi pasar, kebijakan brand, atau faktor eksternal lainnya. Harga yang berlaku adalah harga pada saat pesanan dikonfirmasi dan pembayaran berhasil diverifikasi.",
          },
          {
            type: "subheading",
            text: "Metode Pembayaran",
          },
          {
            type: "text",
            text: "Sneakers Flash menerima berbagai metode pembayaran untuk kemudahan bertransaksi:",
          },
          { type: "bullet", text: "Transfer bank (BCA, Mandiri, BNI, BRI)" },
          { type: "bullet", text: "Dompet digital (GoPay, OVO, Dana, ShopeePay)" },
          { type: "bullet", text: "Kartu kredit & debit (Visa, Mastercard)" },
          { type: "bullet", text: "QRIS (semua penyedia dompet digital)" },
          { type: "bullet", text: "Cicilan 0% (kartu kredit bank tertentu, minimal transaksi berlaku)" },
          {
            type: "subheading",
            text: "Verifikasi Pembayaran",
          },
          {
            type: "text",
            text: "Pesanan baru akan diproses setelah pembayaran berhasil terverifikasi. Untuk transfer bank manual, konfirmasi pembayaran wajib dilakukan maksimal 1×24 jam setelah pesanan dibuat. Jika tidak ada konfirmasi, pesanan akan otomatis dibatalkan.",
          },
          {
            type: "text",
            text: "Sneakers Flash tidak bertanggung jawab atas kerugian akibat kesalahan pengisian data pembayaran yang dilakukan oleh pembeli.",
          },
        ],
      },
      {
        id: "section-2",
        navLabel: "3. Pengiriman",
        title: "3. Pengiriman",
        content: [
          {
            type: "text",
            text: "Sneakers Flash bekerja sama dengan mitra logistik terpercaya untuk memastikan produkmu sampai dengan aman dan tepat waktu ke seluruh wilayah Indonesia.",
          },
          {
            type: "subheading",
            text: "Estimasi Waktu Pengiriman",
          },
          { type: "bullet", text: "Jabodetabek: 1–2 hari kerja (Same Day & Next Day tersedia)" },
          { type: "bullet", text: "Pulau Jawa & Bali: 2–4 hari kerja" },
          { type: "bullet", text: "Luar Pulau Jawa: 3–7 hari kerja" },
          { type: "bullet", text: "Papua & wilayah terpencil: 7–14 hari kerja" },
          {
            type: "subheading",
            text: "Keterlambatan Pengiriman",
          },
          {
            type: "text",
            text: "Sneakers Flash tidak bertanggung jawab atas keterlambatan pengiriman yang disebabkan oleh kondisi di luar kendali kami, seperti bencana alam, cuaca ekstrem, gangguan operasional kurir, hari libur nasional, atau kepadatan paket di musim tertentu.",
          },
          {
            type: "text",
            text: "Namun, kami berkomitmen untuk aktif membantu dalam proses pemantauan, pelacakan, dan tindak lanjut dengan pihak kurir jika terjadi keterlambatan atau kendala pengiriman.",
          },
          {
            type: "subheading",
            text: "Kerusakan Saat Pengiriman",
          },
          {
            type: "text",
            text: "Jika produk diterima dalam kondisi rusak akibat proses pengiriman, segera dokumentasikan (foto/video unboxing) dan hubungi tim kami dalam 1×24 jam sejak paket diterima. Klaim kerusakan pengiriman tidak dapat diproses jika melewati batas waktu tersebut.",
          },
        ],
      },
      {
        id: "section-3",
        navLabel: "4. Pengembalian & Refund",
        title: "4. Pengembalian & Refund",
        content: [
          {
            type: "text",
            text: "Kepuasanmu adalah prioritas kami. Sneakers Flash menerima permintaan pengembalian produk dalam kondisi tertentu yang telah ditetapkan.",
          },
          {
            type: "subheading",
            text: "Syarat Pengembalian",
          },
          {
            type: "text",
            text: "Permintaan pengembalian hanya dapat dilakukan dalam 2×24 jam setelah produk diterima, dengan ketentuan:",
          },
          { type: "bullet", text: "Produk belum pernah digunakan, dicoba pakai di luar ruangan, atau dicuci" },
          { type: "bullet", text: "Tag, label, dan stiker original masih terpasang dan utuh" },
          { type: "bullet", text: "Kemasan box sepatu dalam kondisi baik (tidak rusak atau dicoret)" },
          { type: "bullet", text: "Disertai bukti pembelian (nomor order atau invoice)" },
          { type: "bullet", text: "Tidak termasuk produk dari kategori sale, clearance, atau limited edition" },
          {
            type: "subheading",
            text: "Proses Refund",
          },
          {
            type: "text",
            text: "Setelah produk diterima dan diverifikasi oleh tim kami, refund akan diproses dalam 3–7 hari kerja ke metode pembayaran asal. Ongkos kirim pengembalian ditanggung pembeli, kecuali jika pengembalian disebabkan oleh kesalahan dari pihak Sneakers Flash.",
          },
          {
            type: "subheading",
            text: "Penukaran Ukuran",
          },
          {
            type: "text",
            text: "Penukaran ukuran (exchange) dapat dilakukan jika stok ukuran yang diinginkan tersedia. Biaya pengiriman untuk penukaran ditanggung pembeli. Penukaran hanya berlaku satu kali per transaksi.",
          },
        ],
      },
      {
        id: "section-4",
        navLabel: "5. Penggunaan Website",
        title: "5. Penggunaan Website",
        content: [
          {
            type: "text",
            text: "Website Sneakers Flash (sneakersflash.com) dirancang dan dikelola sepenuhnya oleh tim kami untuk memberikan pengalaman belanja sneakers terbaik di Indonesia.",
          },
          {
            type: "subheading",
            text: "Hak Kekayaan Intelektual",
          },
          {
            type: "text",
            text: "Seluruh konten yang terdapat di website ini, termasuk namun tidak terbatas pada:",
          },
          { type: "bullet", text: "Foto dan visual produk" },
          { type: "bullet", text: "Deskripsi, copywriting, dan artikel editorial" },
          { type: "bullet", text: "Logo, ikon, dan elemen desain grafis" },
          { type: "bullet", text: "Nama brand, tagline, dan identitas visual Sneakers Flash" },
          {
            type: "text",
            text: "...adalah milik eksklusif Sneakers Flash dan dilindungi oleh hukum hak kekayaan intelektual yang berlaku di Indonesia. Penggunaan konten tanpa izin tertulis dari Sneakers Flash merupakan pelanggaran hukum dan dapat dikenakan tindakan hukum.",
          },
          {
            type: "subheading",
            text: "Larangan Penggunaan",
          },
          { type: "bullet", text: "Menyalin, mendistribusikan, atau memodifikasi konten untuk kepentingan komersial" },
          { type: "bullet", text: "Melakukan scraping otomatis atau crawling tanpa izin" },
          { type: "bullet", text: "Menggunakan konten untuk tujuan yang menyesatkan atau merugikan" },
          { type: "bullet", text: "Mencoba meretas atau mengganggu sistem website" },
          {
            type: "subheading",
            text: "Akurasi Informasi",
          },
          {
            type: "text",
            text: "Kami berupaya menyajikan informasi produk yang akurat, termasuk warna, ukuran, dan spesifikasi. Namun, tampilan warna aktual dapat sedikit berbeda akibat pengaturan layar perangkat masing-masing pengguna. Jika ada ketidaksesuaian signifikan, kamu berhak mengajukan pengembalian sesuai kebijakan yang berlaku.",
          },
        ],
      },
      {
        id: "section-5",
        navLabel: "6. Akun Pengguna",
        title: "6. Akun Pengguna",
        content: [
          {
            type: "text",
            text: "Membuat akun di Sneakers Flash memudahkan proses belanja, pelacakan pesanan, dan akses ke penawaran eksklusif member.",
          },
          {
            type: "subheading",
            text: "Tanggung Jawab Akun",
          },
          {
            type: "text",
            text: "Kamu bertanggung jawab penuh atas keamanan dan kerahasiaan akun, termasuk password dan informasi login. Segala aktivitas yang terjadi di bawah akunmu menjadi tanggung jawabmu sepenuhnya.",
          },
          { type: "bullet", text: "Jangan bagikan password akunmu kepada siapapun" },
          { type: "bullet", text: "Gunakan password yang kuat dan unik" },
          { type: "bullet", text: "Segera hubungi kami jika mencurigai akun telah diakses tanpa izin" },
          {
            type: "subheading",
            text: "Penangguhan Akun",
          },
          {
            type: "text",
            text: "Sneakers Flash berhak menangguhkan atau menghapus akun yang terbukti melakukan penyalahgunaan, termasuk penipuan, pemalsuan data, atau pelanggaran terhadap syarat & ketentuan ini.",
          },
        ],
      },
    ],
  },

  en: {
    pageTitle: "Terms & Conditions",
    pageSubtitle:
      "By shopping at Sneakers Flash, you agree to abide by the following terms and conditions governing our services.",
    accentWord: "Conditions",
    navLabel: "Navigation",
    lastUpdatedLabel: "Last Updated",
    lastUpdatedValue: "January 1, 2026",
    summaryLabel: "⚡ Key Points",
    summaryLines: [
      "Prices and stock availability may change at any time without prior notice.",
      "Returns are accepted within 2×24 hours of receiving your item.",
      "All content on this website is the property of Sneakers Flash.",
    ],
    summaryEmail: "Questions? Contact us at:",
    footerText: "Need clarification on these terms?",
    footerLinkText: "Contact Our Team",
    sections: [
      {
        id: "section-0",
        navLabel: "1. Product Availability",
        title: "1. Product Availability",
        content: [
          {
            type: "text",
            text: "Sneakers Flash is committed to offering the latest sneaker collections with continuously updated inventory. However, due to high demand and the dynamic nature of the sneaker market, stock availability may change at any time without prior notice.",
          },
          {
            type: "subheading",
            text: "Stock Confirmation",
          },
          {
            type: "text",
            text: "Every incoming order goes through a stock verification process. If the product you ordered is out of stock or unavailable, our team will contact you within 1×24 hours to:",
          },
          { type: "bullet", text: "Offer an alternative product with a similar model or colorway" },
          { type: "bullet", text: "Process a full refund to your original payment method" },
          { type: "bullet", text: "Add you to a waitlist if a restock is scheduled" },
          {
            type: "subheading",
            text: "Pre-Order & Limited Edition",
          },
          {
            type: "text",
            text: "For pre-order and limited edition products, estimated availability will be listed on the product page. Sneakers Flash cannot guarantee the availability of limited edition items, as they depend on brand allocations.",
          },
        ],
      },
      {
        id: "section-1",
        navLabel: "2. Pricing & Payment",
        title: "2. Pricing & Payment",
        content: [
          {
            type: "text",
            text: "All prices listed on the Sneakers Flash website are in Indonesian Rupiah (IDR) and inclusive of applicable taxes unless otherwise stated.",
          },
          {
            type: "subheading",
            text: "Price Changes",
          },
          {
            type: "text",
            text: "Prices may change at any time in response to market conditions, brand policies, or other external factors. The applicable price is the one displayed at the time your order is confirmed and payment is successfully verified.",
          },
          {
            type: "subheading",
            text: "Payment Methods",
          },
          {
            type: "text",
            text: "Sneakers Flash accepts a variety of payment methods for your convenience:",
          },
          { type: "bullet", text: "Bank transfer (BCA, Mandiri, BNI, BRI)" },
          { type: "bullet", text: "Digital wallets (GoPay, OVO, Dana, ShopeePay)" },
          { type: "bullet", text: "Credit & debit cards (Visa, Mastercard)" },
          { type: "bullet", text: "QRIS (all digital wallet providers)" },
          { type: "bullet", text: "0% installment plans (selected bank credit cards, minimum transaction applies)" },
          {
            type: "subheading",
            text: "Payment Verification",
          },
          {
            type: "text",
            text: "Orders will only be processed after payment is successfully verified. For manual bank transfers, payment confirmation must be submitted within 1×24 hours of placing the order. Orders without confirmation will be automatically cancelled.",
          },
          {
            type: "text",
            text: "Sneakers Flash is not liable for any losses resulting from incorrect payment details entered by the buyer.",
          },
        ],
      },
      {
        id: "section-2",
        navLabel: "3. Shipping",
        title: "3. Shipping",
        content: [
          {
            type: "text",
            text: "Sneakers Flash partners with trusted logistics providers to ensure your products arrive safely and on time across Indonesia.",
          },
          {
            type: "subheading",
            text: "Estimated Delivery Times",
          },
          { type: "bullet", text: "Greater Jakarta (Jabodetabek): 1–2 business days (Same Day & Next Day available)" },
          { type: "bullet", text: "Java & Bali: 2–4 business days" },
          { type: "bullet", text: "Outside Java: 3–7 business days" },
          { type: "bullet", text: "Papua & remote areas: 7–14 business days" },
          {
            type: "subheading",
            text: "Shipping Delays",
          },
          {
            type: "text",
            text: "Sneakers Flash is not responsible for delivery delays caused by circumstances beyond our control, such as natural disasters, extreme weather, courier operational disruptions, national holidays, or peak shipping seasons.",
          },
          {
            type: "text",
            text: "We are, however, committed to actively assisting with package tracking and following up with courier partners in the event of delays or delivery issues.",
          },
          {
            type: "subheading",
            text: "Damage During Shipping",
          },
          {
            type: "text",
            text: "If a product arrives damaged due to shipping, please document it immediately (photo or video of the unboxing) and contact our team within 1×24 hours of receipt. Shipping damage claims will not be accepted after this period.",
          },
        ],
      },
      {
        id: "section-3",
        navLabel: "4. Returns & Refunds",
        title: "4. Returns & Refunds",
        content: [
          {
            type: "text",
            text: "Your satisfaction is our priority. Sneakers Flash accepts return requests under specific conditions outlined below.",
          },
          {
            type: "subheading",
            text: "Return Eligibility",
          },
          {
            type: "text",
            text: "Return requests must be submitted within 2×24 hours of receiving the product, subject to the following conditions:",
          },
          { type: "bullet", text: "The product has not been worn, used outdoors, or washed" },
          { type: "bullet", text: "Original tags, labels, and stickers remain intact and attached" },
          { type: "bullet", text: "The shoebox is in good condition (not damaged or written on)" },
          { type: "bullet", text: "Proof of purchase is provided (order number or invoice)" },
          { type: "bullet", text: "Does not apply to sale, clearance, or limited edition products" },
          {
            type: "subheading",
            text: "Refund Process",
          },
          {
            type: "text",
            text: "Once the returned product is received and verified by our team, refunds will be processed within 3–7 business days to the original payment method. Return shipping costs are the buyer's responsibility unless the return is due to an error on Sneakers Flash's part.",
          },
          {
            type: "subheading",
            text: "Size Exchanges",
          },
          {
            type: "text",
            text: "Size exchanges are permitted if the desired size is in stock. Shipping costs for the exchange are the buyer's responsibility. Exchanges are limited to one instance per transaction.",
          },
        ],
      },
      {
        id: "section-4",
        navLabel: "5. Website Usage",
        title: "5. Website Usage",
        content: [
          {
            type: "text",
            text: "The Sneakers Flash website (sneakersflash.com) is fully designed and managed by our team to provide the best sneaker shopping experience in Indonesia.",
          },
          {
            type: "subheading",
            text: "Intellectual Property Rights",
          },
          {
            type: "text",
            text: "All content on this website, including but not limited to:",
          },
          { type: "bullet", text: "Product photography and visual assets" },
          { type: "bullet", text: "Descriptions, copywriting, and editorial articles" },
          { type: "bullet", text: "Logos, icons, and graphic design elements" },
          { type: "bullet", text: "Brand name, tagline, and visual identity of Sneakers Flash" },
          {
            type: "text",
            text: "...is the exclusive property of Sneakers Flash and is protected under applicable Indonesian intellectual property laws. Unauthorized use of any content without written permission from Sneakers Flash constitutes a legal violation and may be subject to legal action.",
          },
          {
            type: "subheading",
            text: "Prohibited Activities",
          },
          { type: "bullet", text: "Copying, distributing, or modifying content for commercial purposes" },
          { type: "bullet", text: "Automated scraping or crawling without permission" },
          { type: "bullet", text: "Using content for misleading or harmful purposes" },
          { type: "bullet", text: "Attempting to hack or disrupt the website's systems" },
          {
            type: "subheading",
            text: "Information Accuracy",
          },
          {
            type: "text",
            text: "We strive to present accurate product information, including colors, sizes, and specifications. However, actual colors may vary slightly due to individual screen settings. If there is a significant discrepancy, you are entitled to request a return in accordance with our return policy.",
          },
        ],
      },
      {
        id: "section-5",
        navLabel: "6. User Accounts",
        title: "6. User Accounts",
        content: [
          {
            type: "text",
            text: "Creating a Sneakers Flash account makes shopping easier and gives you access to order tracking and exclusive member offers.",
          },
          {
            type: "subheading",
            text: "Account Responsibility",
          },
          {
            type: "text",
            text: "You are fully responsible for the security and confidentiality of your account, including your password and login credentials. All activities occurring under your account are your sole responsibility.",
          },
          { type: "bullet", text: "Never share your account password with anyone" },
          { type: "bullet", text: "Use a strong and unique password" },
          { type: "bullet", text: "Contact us immediately if you suspect unauthorized access to your account" },
          {
            type: "subheading",
            text: "Account Suspension",
          },
          {
            type: "text",
            text: "Sneakers Flash reserves the right to suspend or delete accounts found to be engaged in misuse, including fraud, falsification of data, or any violation of these terms and conditions.",
          },
        ],
      },
    ],
  },
};

// ─── Renderer ──────────────────────────────────────────────────────────────────
function RenderContent({ parts }: { parts: ContentPart[] }) {
  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <p key={i} className="text-gray-600 text-sm leading-relaxed">
              {part.text}
            </p>
          );
        }
        if (part.type === "subheading") {
          return (
            <p key={i} className="text-black font-bold text-sm mt-4">
              {part.text}
            </p>
          );
        }
        if (part.type === "bold") {
          return (
            <p key={i} className="text-black font-bold text-sm mt-4">
              {part.text}
            </p>
          );
        }
        if (part.type === "bullet") {
          return (
            <p key={i} className="text-gray-600 text-sm leading-relaxed flex gap-2">
              <span className="text-yellow-500 flex-shrink-0">•</span>
              {part.text}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TermsAndConditionsPage() {
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
                lang === l
                  ? "bg-black text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <PageHeader
        title={t.pageTitle}
        subtitle={t.pageSubtitle}
        accentWord={t.accentWord}
      />

      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          {/* Sidebar Nav */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-4">
                {t.navLabel}
              </p>
              <nav className="flex flex-col space-y-3">
                {t.sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-xs text-gray-500 hover:text-black transition-colors duration-200 border-l border-gray-200 pl-4 hover:border-yellow-500"
                  >
                    {s.navLabel}
                  </a>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2">
                {t.lastUpdatedLabel}
              </p>
              <p className="text-xs text-gray-600 font-medium">{t.lastUpdatedValue}</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-12">
            {/* Summary Box */}
            <div className="border border-yellow-200 bg-yellow-50/50 p-6">
              <p className="text-yellow-700 text-[10px] uppercase tracking-wider font-black mb-3">
                {t.summaryLabel}
              </p>
              <div className="space-y-1 mb-3">
                {t.summaryLines.map((line, i) => (
                  <p key={i} className="text-gray-700 text-sm leading-relaxed flex gap-2">
                    <span className="text-yellow-500 flex-shrink-0">•</span>
                    {line}
                  </p>
                ))}
              </div>
              <p className="text-gray-700 text-sm">
                {t.summaryEmail}{" "}
                <a
                  href="mailto:hello@sneakersflash.com"
                  className="text-black font-semibold underline underline-offset-2"
                >
                  hello@sneakersflash.com
                </a>
              </p>
            </div>

            {/* Sections */}
            {t.sections.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-lg font-black uppercase tracking-wider text-black mb-5 border-b border-gray-100 pb-2">
                  {s.title}
                </h2>
                <RenderContent parts={s.content} />
              </div>
            ))}

            {/* Footer */}
            <div className="pt-10 border-t border-gray-200 text-center">
              <p className="text-gray-400 text-xs italic">
                {t.footerText}{" "}
                <a
                  href="/contact-us"
                  className="text-black underline font-medium"
                >
                  {t.footerLinkText}
                </a>
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}