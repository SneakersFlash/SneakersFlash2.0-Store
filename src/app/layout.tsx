import type { Metadata, Viewport } from "next";
import { Oswald, Barlow, Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/common/Providers";
import { ChunkReloadGuard } from "@/components/common/ChunkReloadGuard";
import { BootSplash } from "@/components/common/BootSplash";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MerdekaFloatingButton } from "@/components/game/MerdekaFloatingButton";
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
  // Fallback WAJIB domain produksi, bukan localhost. NEXT_PUBLIC_* dibakar saat
  // build, jadi kalau variabelnya lupa di-set di tahap build, seluruh URL absolut
  // (og:image paling terasa) ikut menunjuk localhost dan setiap share ke
  // WhatsApp/Instagram tampil tanpa gambar. Untuk dev, isi NEXT_PUBLIC_SITE_URL
  // di .env.local.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sneakersflash.com"
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
    // /og-image.jpg TIDAK PERNAH ADA di public/ — preview share selama ini
    // menunjuk berkas 404. Pakai aset yang benar-benar ada; ukurannya di bawah
    // 1200x630 anjuran, tapi masih jauh di atas ambang minimum dan akan
    // di-crop rapi oleh WhatsApp/Facebook.
    images: [{ url: "/images/sneakers-hero.jpeg", width: 824, height: 661 }],
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
        <noscript><img height="1" width="1" style={{display: "none"}}
        src="https://www.facebook.com/tr?id=1703072617370190&ev=PageView&noscript=1"
        /></noscript>

        {/* Loading untuk render pertama. Harus di paling atas <body> dan di luar
            Providers: ia sudah harus tergambar sebelum React sempat hidup. */}
        <BootSplash />

        {/* Sengaja DI LUAR Providers: kalau chunk yang gagal dimuat kebetulan
            milik salah satu provider, guard-nya tetap hidup dan bisa reload. */}
        <ChunkReloadGuard />

        <Providers>
          {children}
          <ChatWidget />
          {/* Duduk di atas tombol chat. Urutannya di sini tidak menentukan
              lapisan - tombol game sudah dipatok z-40, chat z-50. */}
          <MerdekaFloatingButton />
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


        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1703072617370190');
        fbq('track', 'PageView');`
          }}
        />
        
      </body>
    </html>
  );
}