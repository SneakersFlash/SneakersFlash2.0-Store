import type { Metadata, Viewport } from "next";
import { Oswald, Barlow } from "next/font/google";
import { Providers } from "@/components/common/Providers";
// Be sure to adjust these import paths to match where you saved your components
import { Navbar } from "@/components/layout/Navbar"; 
import { Footer } from "@/components/layout/Footer"; 
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

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "SneakersFlash — Premium Sneakers & Footwear",
    template: "%s | SneakersFlash",
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
      className={`${oswald.variable} ${barlow.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}