import Link from "next/link";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

const FOOTER_LINKS = {
  Help: [
    { label: "Contact Us", href: "/contact" },
    { label: "Order Status", href: "/account/orders" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "FAQs", href: "/faq" },
  ],
  Company: [
    { label: "About SneakersFlash", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  Shop: [
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Best Sellers", href: "/products?sort=popular" },
    { label: "Sale", href: "/products?sale=true" },
    { label: "All Brands", href: "/brands" },
    { label: "Gift Cards", href: "/gift-cards" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/sneakersflash" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com/sneakersflash" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@sneakersflash" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/sneakersflash" },
];

const PAYMENT_METHODS = ["VISA", "MC", "BCA", "BNI", "GoPay", "OVO", "Dana"];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-gray-900 border-t border-border mt-24">
      {/* ── Newsletter band ── */}
      <div className="bg-brand-gray-800 border-b border-border">
        <div className="container-2xl py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-display text-2xl uppercase tracking-wider font-bold">
                Don't miss a drop
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Get exclusive access to new releases and member-only deals.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-72 bg-brand-gray-700 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 text-sm font-display uppercase tracking-widest transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="container-2xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-wider block mb-4"
            >
              SNEAKERS<span className="text-primary">FLASH</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Indonesia's home for authentic sneakers and streetwear. New drops every week. Always legit.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-brand-gray-800 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="label mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
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
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border">
        <div className="container-2xl py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Legal links */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© {currentYear} SneakersFlash. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="px-2 py-0.5 bg-brand-gray-800 border border-border text-[10px] font-mono font-bold text-muted-foreground tracking-wider"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
