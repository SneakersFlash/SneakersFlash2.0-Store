"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

interface EventCampaignSectionProps {
  campaigns: any[];
}

export function EventCampaignSection({ campaigns }: EventCampaignSectionProps) {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <div className="flex flex-col gap-10 mb-12">
      {campaigns.map((campaign: any) => (
        <section key={campaign.id} className="w-full">
          
          {/* === 1. HEADER BANNER DENGAN COUNTDOWN === */}
          <Link href={`/events/${campaign.slug}`} className="block group mb-4">
            <div 
              className="relative p-5 md:p-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
              style={{ backgroundColor: campaign.styleConfig?.backgroundColor || "#1A1A1A" }}
            >
              {campaign.bannerDesktopUrl ? (
                <Image 
                  src={campaign.bannerDesktopUrl} 
                  alt={campaign.title} 
                  fill 
                  className="object-cover object-center opacity-40 transition-opacity duration-500 group-hover:opacity-60 mix-blend-overlay" 
                  sizes="(max-width: 768px) 100vw, 100vw" 
                />
              ) : (
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

              <div className="relative z-10 flex flex-col items-start gap-1">
                <span className="text-[10px] md:text-xs font-bold bg-white text-black px-2 py-1 rounded shadow-sm uppercase tracking-widest flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Special Event
                </span>
                <p className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-md">
                  {campaign.title}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between w-full md:w-auto md:justify-end gap-4 md:gap-6">
                {campaign.countDownEnd && (
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider mb-1 hidden md:block">
                      Berakhir Dalam:
                    </span>
                    <CountdownTimer targetDate={campaign.countDownEnd} />
                  </div>
                )}
                <div className="hidden sm:flex items-center justify-center w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:shadow-lg">
                  <ChevronRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* === 2. SCROLL PRODUK EVENT (Flash Sale Card) === */}
          <div className="flex gap-3 lg:gap-4 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none">
            {campaign.products?.map((p: any) => {
              // Hitung persentase sisa stok untuk animasi bar
              const stockPercentage = p.stockBar 
                ? Math.min((p.stockBar.sold / p.stockBar.total) * 100, 100) 
                : 0;
              const sisaStok = p.stockBar ? p.stockBar.total - p.stockBar.sold : 0;

              return (
                <div key={p.productVariantId} className="snap-start shrink-0">
                  <Link href={`/products/${p.slug}`}>
                    <div className="w-[155px] lg:w-[220px] bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                      
                      {/* Image Frame */}
                      <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-2" style={{ aspectRatio: "1/1" }}>
                        {p.image ? (
                          <Image 
                            src={p.image} 
                            alt={p.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                            sizes="(max-width: 768px) 155px, 220px" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-300 text-3xl">👟</span>
                          </div>
                        )}
                        {/* Sold Out Overlay (Jika Habis) */}
                        {p.isSoldOut && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                            <span className="bg-gray-900 text-white font-black text-xs md:text-sm px-3 py-1 rounded-full border border-gray-600">
                              HABIS
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info Produk */}
                      <div className="space-y-1 px-0.5 flex-grow">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {p.isSoldOut ? "Sold Out" : "Event Promo"}
                        </p>
                        <p className="text-[12px] font-medium text-gray-900 line-clamp-2">
                          {p.name}
                        </p>
                        <p className="font-bold text-[14px] lg:text-[18px]">
                          Rp {p.finalPrice?.toLocaleString('id-ID')}
                        </p>
                        
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          {p.originalPrice > p.finalPrice && (
                            <p className="text-[10px] line-through text-gray-400">
                              Rp {p.originalPrice?.toLocaleString('id-ID')}
                            </p>
                          )}
                          {p.discountPercent > 0 && (
                            <span className="inline-flex items-center justify-center bg-green-200 text-green-500 text-[10px] lg:text-[11px] font-bold px-1.5 py-0.5 rounded">
                                Save {p.discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* === FLASH SALE STOCK BAR === */}
                      {p.stockBar && p.stockBar.total > 0 && (
                        <div className="mt-3 px-0.5">
                          <div className="relative h-[14px] w-full bg-red-400 rounded-full overflow-hidden flex items-center justify-center shadow-inner p-1">
                            {/* Bar pengisi (Gradasi Merah/Orange) */}
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${stockPercentage}%` }}
                            />
                            {/* Efek Api kecil jika stok mau habis (Opsional) */}
                            {stockPercentage > 80 && !p.isSoldOut && (
                              <span className="absolute left-1 text-[8px] z-10 animate-pulse">🔥</span>
                            )}
                            {/* Teks sisa stok di tengah-tengah bar */}
                            <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-md uppercase tracking-wider">
                              {p.isSoldOut ? "SOLD" : `Available ${sisaStok}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          
        </section>
      ))}
    </div>
  );
}