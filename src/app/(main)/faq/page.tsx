"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SectionWrapper from "@/components/layout/SectionWrapper";

type Lang = "id" | "en";
type FAQ = { q: string; a: string | string[] };
type Category = { label: string; items: FAQ[] };

// ─── Content ───────────────────────────────────────────────────────────────────
const content: Record<
  Lang,
  {
    pageSubtitle: string;
    categoryLabel: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    categories: Category[];
  }
> = {
  id: {
    pageSubtitle: "Temukan jawaban atas pertanyaan yang paling sering ditanyakan seputar Sneakers Flash.",
    categoryLabel: "Kategori",
    ctaTitle: "Tidak menemukan jawaban?",
    ctaDesc: "Tim CS kami siap membantu kamu.",
    ctaBtn: "Hubungi Kami →",
    categories: [
      {
        label: "Pemesanan",
        items: [
          {
            q: "Bagaimana cara memesan di Sneakers Flash?",
            a: [
              "Pilih produk yang kamu inginkan, tentukan ukuran, lalu klik 'Add to Cart'.",
              "Lanjutkan ke checkout dan lakukan pembayaran sesuai metode yang dipilih.",
              "Setelah pembayaran berhasil, konfirmasi pesanan akan dikirim ke emailmu.",
            ],
          },
          {
            q: "Apakah saya bisa mengubah atau membatalkan pesanan?",
            a: [
              "Pesanan dapat diubah atau dibatalkan dalam waktu maksimal 1 jam setelah pemesanan.",
              "Setelah itu, pesanan akan masuk ke proses packing dan tidak dapat diubah.",
              "Silakan hubungi tim CS kami secepatnya jika ada perubahan.",
            ],
          },
          {
            q: "Metode pembayaran apa saja yang tersedia?",
            a: [
              "Kami menerima berbagai metode pembayaran, antara lain:",
              "• Transfer Bank (BCA, Mandiri, BNI, BRI)",
              "• Virtual Account",
              "• E-wallet (GoPay, OVO, DANA, ShopeePay)",
              "• Kartu Kredit/Debit (VISA/Mastercard)",
              "• COD (tersedia untuk area tertentu)",
            ],
          },
        ],
      },
      {
        label: "Produk & Keaslian",
        items: [
          {
            q: "Apakah semua produk di Sneakers Flash 100% original?",
            a: [
              "Ya, 100%.",
              "Setiap produk telah melalui proses verifikasi keaslian berlapis sebelum dijual.",
              "Kami bekerja sama dengan distributor resmi dan brand terpercaya.",
              "Jika terbukti tidak original, kami memberikan garansi pengembalian dana penuh.",
            ],
          },
          {
            q: "Bagaimana cara memverifikasi keaslian produk?",
            a: [
              "Setiap produk dilengkapi dengan QR code verifikasi pada box.",
              "Kamu juga bisa menghubungi tim CS kami dengan foto produk untuk pengecekan tambahan.",
              "Untuk produk tertentu, kami juga menyediakan certificate of authenticity.",
            ],
          },
          {
            q: "Produk apa saja yang tersedia di Sneakers Flash?",
            a: [
              "Kami menyediakan berbagai pilihan sneakers dari brand global seperti Nike, Adidas, Jordan, New Balance, Vans, Converse, Puma, Asics, Reebok, dan lainnya.",
              "Termasuk koleksi limited edition dan kolaborasi eksklusif.",
            ],
          },
        ],
      },
      {
        label: "Pengiriman",
        items: [
          {
            q: "Berapa lama estimasi pengiriman?",
            a: [
              "Estimasi pengiriman tergantung pada metode yang dipilih:",
              "• Regular: 3–5 hari kerja",
              "• Express: 1–2 hari kerja",
              "• Same Day: dikirim di hari yang sama (khusus kota tertentu)",
              "Estimasi tidak termasuk akhir pekan dan hari libur nasional.",
            ],
          },
          {
            q: "Apakah ada ongkos kirim gratis?",
            a: [
              "Ya!",
              "Gratis ongkir untuk pengiriman Regular dengan minimum pembelian Rp 500.000 ke seluruh Indonesia.",
              "Member Flash Point berkesempatan mendapatkan gratis ongkir tambahan melalui promo atau voucher tertentu.",
            ],
          },
          {
            q: "Bagaimana jika paket saya hilang atau rusak?",
            a: [
              "Semua pesanan dilindungi oleh asuransi pengiriman.",
              "Jika paket hilang atau rusak selama proses pengiriman, segera hubungi tim CS kami dengan bukti foto.",
              "Kami akan membantu proses klaim dan pengiriman penggantian.",
            ],
          },
        ],
      },
      {
        label: "Return & Refund",
        items: [
          {
            q: "Bagaimana cara mengajukan return?",
            a: [
              "Kamu dapat mengajukan return dalam waktu maksimal 7 hari setelah barang diterima.",
              "Hubungi tim CS kami melalui WhatsApp atau email, sertakan foto produk dan alasan return.",
              "Tim kami akan melakukan verifikasi dalam 1x24 jam di hari kerja.",
            ],
          },
          {
            q: "Berapa lama proses refund?",
            a: [
              "Setelah barang diterima dan diverifikasi, refund akan diproses dalam 3–5 hari kerja.",
              "Dana akan dikembalikan ke metode pembayaran yang digunakan saat transaksi.",
            ],
          },
        ],
      },
      {
        label: "Flash Club",
        items: [
          {
            q: "Apa itu Flash Club?",
            a: [
              "Flash Club adalah program membership eksklusif dari Sneakers Flash.",
              "Member mendapatkan berbagai keuntungan seperti akses early release, diskon spesial, voucher ongkir, dan benefit eksklusif lainnya.",
              "Semakin tinggi level membership, semakin banyak keuntungan yang bisa kamu dapatkan.",
            ],
          },
          {
            q: "Berapa biaya bergabung Flash Club?",
            a: [
              "Flash Club tersedia dalam 3 tier:",
              "• Flash – Gratis",
              "• Flash Pro – Rp 99.000/bulan",
              "• Flash Elite – Rp 249.000/bulan",
              "Setiap tier menawarkan benefit yang berbeda sesuai level membership kamu.",
            ],
          },
        ],
      },
    ],
  },

  en: {
    pageSubtitle: "Find answers to the most frequently asked questions about Sneakers Flash.",
    categoryLabel: "Category",
    ctaTitle: "Didn't find your answer?",
    ctaDesc: "Our support team is here to help.",
    ctaBtn: "Contact Us →",
    categories: [
      {
        label: "Orders",
        items: [
          {
            q: "How do I place an order on Sneakers Flash?",
            a: [
              "Choose your desired product, select the size, and click 'Add to Cart'.",
              "Proceed to checkout and complete your payment.",
              "Once your payment is successful, you'll receive an order confirmation via email.",
            ],
          },
          {
            q: "Can I modify or cancel my order?",
            a: [
              "Orders can be modified or canceled within 1 hour after placement.",
              "After that, the order will enter the packing process and can no longer be changed.",
              "Please contact our customer service team as soon as possible if needed.",
            ],
          },
          {
            q: "What payment methods are available?",
            a: [
              "We accept various payment methods, including:",
              "• Bank Transfer (BCA, Mandiri, BNI, BRI)",
              "• Virtual Account",
              "• E-wallets (GoPay, OVO, DANA, ShopeePay)",
              "• Credit/Debit Card (VISA/Mastercard)",
              "• COD (available in selected areas)",
            ],
          },
        ],
      },
      {
        label: "Product & Authenticity",
        items: [
          {
            q: "Are all products on Sneakers Flash 100% authentic?",
            a: [
              "Yes, 100%.",
              "Every product goes through a multi-layer authentication process before being sold.",
              "We work directly with trusted distributors and brands.",
              "If any product is proven not authentic, we offer a full refund guarantee.",
            ],
          },
          {
            q: "How can I verify product authenticity?",
            a: [
              "Each product comes with a verification QR code on the box.",
              "You can also contact our customer service team with product photos for additional checks.",
              "For selected items, we also provide a certificate of authenticity.",
            ],
          },
          {
            q: "What products are available on Sneakers Flash?",
            a: [
              "We offer a wide selection of sneakers from global brands such as Nike, Adidas, Jordan, New Balance, Vans, Converse, Puma, Asics, Reebok, and more.",
              "Including limited edition collections and exclusive collaborations.",
            ],
          },
        ],
      },
      {
        label: "Shipping",
        items: [
          {
            q: "How long does shipping take?",
            a: [
              "Delivery time depends on the selected shipping method:",
              "• Regular: 3–5 business days",
              "• Express: 1–2 business days",
              "• Same Day: delivered within the same day (selected cities only)",
              "Delivery estimates exclude weekends and public holidays.",
            ],
          },
          {
            q: "Is free shipping available?",
            a: [
              "Yes!",
              "Free shipping is available for Regular delivery with a minimum purchase of Rp 500.000 across Indonesia.",
              "Flash Point members may receive additional free shipping through exclusive promotions or vouchers.",
            ],
          },
          {
            q: "What if my package is lost or damaged?",
            a: [
              "All orders are covered by shipping insurance.",
              "If your package is lost or damaged during transit, please contact our customer service team with photo evidence.",
              "We will assist you with the claim process and arrange a replacement.",
            ],
          },
        ],
      },
      {
        label: "Return & Refund",
        items: [
          {
            q: "How do I request a return?",
            a: [
              "You can submit a return request within 7 days of receiving your item.",
              "Contact our team via WhatsApp or email, and include photos of the product and your reason for return.",
              "Our team will verify your request within 24 business hours.",
            ],
          },
          {
            q: "How long does the refund process take?",
            a: [
              "Once the item is received and verified, the refund will be processed within 3–5 business days.",
              "Funds will be returned to the original payment method.",
            ],
          },
        ],
      },
      {
        label: "Flash Club",
        items: [
          {
            q: "What is Flash Club?",
            a: [
              "Flash Club is an exclusive membership program from Sneakers Flash.",
              "Members enjoy benefits such as early access to new releases, special discounts, free shipping vouchers, and other exclusive perks.",
              "The higher your membership level, the more rewards you unlock.",
            ],
          },
          {
            q: "How much does it cost to join Flash Club?",
            a: [
              "Flash Club offers 3 membership tiers:",
              "• Flash – Free",
              "• Flash Pro – Rp 99.000/month",
              "• Flash Elite – Rp 249.000/month",
              "Each tier comes with different benefits based on your membership level.",
            ],
          },
        ],
      },
    ],
  },
};

// ─── Accordion Item ────────────────────────────────────────────────────────────
function AccordionItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);
  const lines = Array.isArray(a) ? a : [a];

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-black group-hover:text-gray-600 transition-colors leading-relaxed">
          {q}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 border border-gray-300 flex items-center justify-center text-gray-400 mt-0.5 transition-all duration-200 ${
            open ? "rotate-45 border-black text-black" : ""
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
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed ${
                line.startsWith("•")
                  ? "text-gray-600 pl-1"
                  : "text-gray-600"
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FAQsPage() {
  const [lang, setLang] = useState<Lang>("id");
  const [activeCategory, setActiveCategory] = useState(0);

  const t = content[lang];

  // Reset category when lang changes to avoid index mismatch
  const handleLangChange = (l: Lang) => {
    setLang(l);
    setActiveCategory(0);
  };

  return (
    <PageLayout>
      {/* Language Toggle */}
      <div className="flex justify-end px-6 pt-4">
        <div className="inline-flex border border-gray-300 overflow-hidden">
          {(["id", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLangChange(l)}
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
        title="FAQs"
        subtitle={t.pageSubtitle}
        accentWord="FAQ"
      />

      <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Category Nav */}
          <div className="lg:col-span-1">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              {t.categoryLabel}
            </p>
            <nav className="space-y-1">
              {t.categories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(i)}
                  className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 border-l-2 ${
                    activeCategory === i
                      ? "border-black text-black bg-gray-100 font-semibold"
                      : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Accordion */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-black text-black uppercase tracking-wider mb-6">
              {t.categories[activeCategory].label}
            </h2>

            <div className="border border-gray-200 bg-white px-5 md:px-8">
              {t.categories[activeCategory].items.map((item, i) => (
                <AccordionItem key={`${lang}-${activeCategory}-${i}`} q={item.q} a={item.a} />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 border border-gray-200 bg-gray-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-black text-sm">{t.ctaTitle}</p>
                <p className="text-gray-500 text-xs mt-1">{t.ctaDesc}</p>
              </div>
              <a
                href="/contact-us"
                className="flex-shrink-0 bg-yellow-400 text-black font-black uppercase tracking-widest text-xs px-6 py-3 hover:bg-black hover:text-white transition-colors"
              >
                {t.ctaBtn}
              </a>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </PageLayout>
  );
}