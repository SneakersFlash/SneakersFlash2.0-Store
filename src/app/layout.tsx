import type { Metadata, Viewport } from "next";
import { Oswald, Barlow, Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/common/Providers";
import { ChatWidget } from "@/components/chat/ChatWidget";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ['400', '500', '600', '700'],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "SneakersFlash — Premium Sneakers & Footwear",
    template: "%s | SneakersFlash",
  },
  icons: {
    icon: [
      { url: '/images/petir.svg', type: 'image/svg+xml' },
      { url: '/images/petir.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/petir.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/petir.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/petir.svg',
  },
  description:
    "Shop the latest sneakers, running shoes, and streetwear. New drops every week. Free shipping on orders over Rp 500k.",
  keywords: ["sneakers", "footwear", "shoes", "streetwear", "Nike", "Adidas"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SneakersFlash",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
    >
      <body className={`min-h-screen bg-background text-foreground antialiased ${inter.variable}`}>

        {/* ── Google Tag Manager (noscript fallback) ── */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TP5Z473"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Providers>
          {children}
          <ChatWidget />
        </Providers>

        {/* ── Google Tag Manager (script) ── */}
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TP5Z473');`,
          }}
        />

      </body>
    </html>
  );
}