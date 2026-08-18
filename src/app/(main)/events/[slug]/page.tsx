import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import CampaignsService from "@/lib/api/campaigns.service";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { EventGridClient } from "./EventGridClient";

// Sesuaikan tipe untuk Next.js versi 15
type EventPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// ── React.cache agar API tidak dipanggil 2x (sekali di generateMetadata, sekali di page) ──
const getEventData = cache(async (slug: string, page: number = 1) => {
    return CampaignsService.getEventBySlug(slug, { page, limit: 16 });
});

// ── generateMetadata: inject <head> dinamis dari data backend ──
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const resolvedParams = await params;

    let eventData;
    try {
        eventData = await getEventData(resolvedParams.slug);
    } catch {
        return { title: "Event Tidak Ditemukan" };
    }

    const title       = eventData.metaTitle       || eventData.title;
    const description = eventData.metaDescription || "";
    const ogImage     = eventData.ogImageUrl       || eventData.bannerDesktopUrl || "";
    const url         = `https://sneakersflash.com/events/${eventData.slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        robots: { index: true, follow: true },
        openGraph: {
            title,
            description,
            url,
            type: "website",
            images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ogImage ? [ogImage] : [],
        },
    };
}

export default async function EventDetailPage({ params, searchParams }: EventPageProps) {
    const resolvedParams      = await params;
    const resolvedSearchParams = await searchParams;

    const currentPage = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;

    let eventData;
    try {
        // Pakai getEventData yang sudah di-cache — tidak ada double request
        eventData = await getEventData(resolvedParams.slug, currentPage);
    } catch (error) {
        notFound();
    }

    if (!eventData) return notFound();

    // Event yang sudah dimatikan admin — atau yang tanggalnya lewat — tidak
    // punya halaman lagi. Daftar produknya masih memakai badge & harga promo,
    // dan itu menyesatkan begitu promonya selesai. Dialihkan ke beranda, bukan
    // 404, karena tautan lamanya masih beredar di IG/WA/iklan.
    // Dipasang 18 Agt 2026 waktu mematikan Freedom in Every Step; berlaku juga
    // untuk event lama yang sudah nonaktif (clearance-sale, last-drop, dst).
    if (!eventData.isActive) redirect("/");

    const bgColor = eventData.styleConfig?.backgroundColor || "#1A1A1A";

    return (
    <div className="min-h-screen bg-white pb-10">
    
      {/* === HEADER BANNER === */}
      <div className="relative w-full overflow-hidden">
        <div className="relative h-[250px] md:h-[350px] w-full max-w-7xl mx-auto flex flex-col justify-center px-4 md:px-12">
          
          {eventData.bannerDesktopUrl ? (
            <Image 
              src={eventData.bannerDesktopUrl} 
              alt={eventData.title} 
              fill 
              className="object-cover opacity-50 mix-blend-overlay object-center" 
              priority
            />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 mt-auto pb-6 md:pb-12 w-full">
            <div className="w-full md:w-auto">
              <span className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold bg-white text-black px-2.5 py-1 md:px-3 md:py-1.5 rounded-md uppercase tracking-widest mb-2 md:mb-3 shadow-lg">
                <span className="relative flex h-2 w-2">
                  {eventData.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                {eventData.isActive ? "Live Event" : "Event Berakhir"}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-lg line-clamp-2 md:line-clamp-none">
                {eventData.title}
              </h1>
            </div>

            {eventData.isActive && eventData.countDownEnd && (
              <div className="bg-black/30 backdrop-blur-md p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl w-full md:w-auto">
                <p className="text-[10px] md:text-xs text-white/80 uppercase tracking-widest font-semibold mb-1 md:mb-2">
                  Promo Berakhir Dalam:
                </p>
                <CountdownTimer targetDate={eventData.countDownEnd} />
              </div>
            )}
          </div>
        </div>
      </div>

      {eventData.contentHtml && (
        <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-8">
          <div 
            className="prose prose-sm md:prose-base max-w-none text-gray-700 p-4 md:p-6 bg-gray-50 rounded-xl"
            dangerouslySetInnerHTML={{ __html: eventData.contentHtml }}
          />
        </div>
      )}

      {/* === AREA PRODUK & PAGINATION === */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 md:gap-3">
             <h2 className="text-lg md:text-xl font-bold uppercase tracking-tight text-[#111111]">Produk Promo</h2>
             <span className="bg-gray-100 text-gray-600 text-[10px] md:text-xs font-bold px-2 py-1 rounded-full">
               {eventData.meta.total} Items
             </span>
          </div>
        </div>

        <EventGridClient 
          products={eventData.products} 
          meta={eventData.meta} 
        />
      </div>

    </div>
  );
}