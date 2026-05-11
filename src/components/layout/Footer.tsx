import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Instagram, Mail } from "lucide-react";

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

const CONTACT_LINKS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: "https://wa.me/6281313911391",
    display: "WhatsApp",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/sneakers_flash",
    display: "Instagram",
  },
  {
    icon: TikTokIcon,
    label: "TikTok",
    href: "https://www.tiktok.com/@sneakers_flash",
    display: "TikTok",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@sneakersflash.com",
    display: "Email",
  },
];

const INFORMATION_LINKS = [
  { label: "Track Order",      href: "/order-status" },
  { label: "Return & Refunds", href: "/shipping"     },
  { label: "Size Guide",       href: "/size-guide"   },
];

const SUPPORT_LINKS = [
  { label: "Privacy Policy",    href: "/privacy-policy"  },
  { label: "FAQ",               href: "/faq"             },
  { label: "Term & Conditions", href: "/term-condition"  },
];

const PAYMENT_METHODS = ["VISA", "MC", "BCA", "BNI", "GoPay", "OVO", "Dana"];

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
              At Sneakers Flash, every activation is built with one goal:
              <br />to convert attention into measurable business results.
              <br />
              From offline events to digital channels, we focus on
              creating impact that goes beyond visibility. ⚡
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
              <span>© {year} Sneakers Flash. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m}
                  className="px-2 py-1 bg-muted border border-border text-[10px] font-mono font-bold text-muted-foreground tracking-wider"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}