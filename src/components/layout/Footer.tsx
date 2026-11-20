import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail } from "lucide-react";

// TikTok tidak ada di lucide-react, pakai custom SVG
function TikTokIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.74a4.85 4.85 0 0 1-1-.05z" />
    </svg>
  );
}

// Logo WhatsApp resmi (path dari simple-icons).
function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const CONTACT_LINKS = [
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    href: "https://wa.me/6281313911391",
    display: "0813 1391 1391",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/sneakers_flash",
    display: "sneakers_flash",
  },
  {
    icon: TikTokIcon,
    label: "TikTok",
    href: "https://www.tiktok.com/@sneakers_flash",
    display: "sneakers_flash",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@sneakersflash.com",
    display: "hello@sneakersflash.com",
  },
];

const INFORMATION_LINKS = [
  { label: "Track Order",      href: "/order-status" },
  { label: "Return & Refunds", href: "/shipping"     },
  { label: "Size Guide",       href: "/size-guide"   },
  { label: "Blog",          href: "/blog", },
];

const SUPPORT_LINKS = [
  { label: "Privacy Policy",    href: "/privacy-policy"  },
  { label: "FAQ",               href: "/faq"             },
  { label: "Term & Conditions", href: "/term-condition"  },
];

// Logo resmi (SVG dari Wikimedia Commons) di public/images/payments.
const PAYMENT_METHODS = [
  { name: "Visa",       src: "/images/payments/visa.svg" },
  { name: "Mastercard", src: "/images/payments/mastercard.svg" },
  { name: "BCA",        src: "/images/payments/bca.svg" },
  { name: "BNI",        src: "/images/payments/bni.svg" },
  { name: "GoPay",      src: "/images/payments/gopay.svg" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-24">

      {/* ── Main grid ── */}
      <div className="container-2xl py-12">
        {/*
          5 kolom:
          col-1 & col-2 → Brand (lg:col-span-2)
          col-3         → Contact Us
          col-4         → Information
          col-5         → Support
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="block mb-5">
              <Image
                src="/images/Logo Full Hitam.png"
                alt="Sneakers Flash"
                width={160}
                height={42}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Discover a curated selection of 100% authentic sneakers for every
              style and occasion. With easy returns, fast delivery, and a
              seamless shopping experience, finding your next pair has never
              been easier.
            </p>
          </div>

          {/* Contact Us */}
          <div>
            <p className="font-semibold text-sm text-foreground mb-4">Contact Us</p>
            <ul className="space-y-2.5">
              {CONTACT_LINKS.map(({ icon: Icon, label, href, display }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon size={14} className="shrink-0" />
                    {display}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <p className="font-semibold text-sm text-foreground mb-4">Information</p>
            <ul className="space-y-2.5">
              {INFORMATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="font-semibold text-sm text-foreground mb-4">Support</p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border">
        <div className="container-2xl py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>© {year} PT. MITRA RITEL INOVATIF. All rights reserved.</span>
              {/* Rute aslinya /privacy-policy dan /term-condition; /privacy dan
                  /terms tidak pernah ada sehingga dua tautan ini 404. */}
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/term-condition" className="hover:text-foreground transition-colors">Terms</Link>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m.name}
                  title={m.name}
                  className="inline-flex items-center justify-center h-8 px-2 bg-white border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.src} alt={m.name} className="h-[18px] w-auto" loading="lazy" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}