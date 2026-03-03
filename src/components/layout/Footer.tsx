import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Youtube, Facebook } from "lucide-react";

const FOOTER_LINKS = {
  Help: [
    { label: "Contact Us",        href: "/contact"          },
    { label: "Order Status",      href: "/account/orders"   },
    { label: "Shipping & Returns",href: "/shipping"         },
    { label: "Size Guide",        href: "/size-guide"       },
    { label: "FAQs",              href: "/faq"              },
  ],
  Company: [
    { label: "About SNKRS Flash", href: "/about"            },
    { label: "Careers",           href: "/careers"          },
    { label: "Press",             href: "/press"            },
    { label: "Sustainability",    href: "/sustainability"   },
  ],
  Shop: [
    { label: "New Arrivals",      href: "/products?sort=newest"  },
    { label: "Best Sellers",      href: "/products?sort=popular" },
    { label: "Sale",              href: "/products?sale=true"    },
    { label: "All Brands",        href: "/brands"                },
    { label: "Gift Cards",        href: "/gift-cards"            },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/snkrsflash" },
  { icon: Twitter,   label: "X / Twitter",href: "https://twitter.com/snkrsflash"  },
  { icon: Youtube,   label: "YouTube",   href: "https://youtube.com/@snkrsflash"  },
  { icon: Facebook,  label: "Facebook",  href: "https://facebook.com/snkrsflash"  },
];

const PAYMENT_METHODS = ["VISA", "MC", "BCA", "BNI", "GoPay", "OVO", "Dana"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-24">

      {/* ── Newsletter band ── */}
      <div className="bg-muted border-b border-border">
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
                className="flex-1 md:w-72 bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary hover:bg-brand-yellowDark text-primary-foreground px-6 py-3 text-sm font-display uppercase tracking-widest transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="container-2xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand col */}
          <div className="lg:col-span-2">
            {/* Real logo */}
            <Link href="/" className="block mb-5">
              <Image
                src="/images/logo.jpeg"
                alt="SNKRS Flash"
                width={160}
                height={42}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Indonesia's home for authentic sneakers and streetwear.
              New drops every Friday. Always legit. ⚡
            </p>

            {/* Social */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200"
                >
                  <Icon size={15} />
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
        <div className="container-2xl py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>© {year} SNKRS Flash. All rights reserved.</span>
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