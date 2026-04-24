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
    <div className="flex flex-col gap-10 mb-4">
      {campaigns.map((campaign: any) => (
        <section 
          key={campaign.id} 
          // 1. Hapus class 'group' dari section ini agar tidak mengganggu hover produk
          className="relative w-full rounded-[20px] md:rounded-[24px] overflow-hidden shadow-lg"
          style={{ backgroundColor: campaign.styleConfig?.backgroundColor || "#1A1A1A" }}
        >
          
          {/* BACKGROUND IMAGE & GRADIENT */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
          </div>

          {/* KONTEN UTAMA */}
          <div className="relative z-10 p-4 md:p-6 lg:p-8 flex flex-col gap-5 md:gap-6">
            
            {/* HEADER EVENT */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col items-start gap-2">
                <span className="text-[10px] md:text-xs font-bold bg-white text-black px-2 py-1 rounded shadow-sm uppercase tracking-widest flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Special Event
                </span>
                
                <Link href={`/events/${campaign.slug}`}>
                  <h2 className="font-display font-black text-2xl md:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-md hover:text-gray-200 transition-colors">
                    {campaign.title}
                  </h2>
                </Link>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">
                {campaign.isTimer && campaign.countDownEnd && (
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider mb-1 hidden md:block">
                      Berakhir Dalam:
                    </span>
                    <CountdownTimer targetDate={campaign.countDownEnd} />
                  </div>
                )}
                
                <Link 
                  href={`/events/${campaign.slug}`} 
                  // Tambahkan shrink-0 dan ml-auto di bawah ini
                  className="flex items-center justify-center shrink-0 ml-auto w-10 h-10 md:w-11 md:h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </Link>
              </div>
            </div>

            {/* SCROLL PRODUK EVENT */}
            <div className="flex gap-3 lg:gap-4 pb-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none">
              {campaign.products?.map((p: any) => {
                const stockPercentage = p.stockBar 
                  ? Math.min((p.stockBar.sold / p.stockBar.total) * 100, 100) 
                  : 0;
                const sisaStok = p.stockBar ? p.stockBar.total - p.stockBar.sold : 0;

                return (
                  <div key={p.productVariantId} className="snap-start shrink-0">
                    <Link href={`/products/${p.slug}`}>
                      {/* 2. Tambahkan nama spesifik pada group: group/card */}
                      <div className="w-[155px] lg:w-[220px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 group/card flex flex-col h-full border border-transparent">
                        
                        <div className="relative aspect-square w-full bg-[#F5F5F5]">
                          
                          {/* BADGE DISKON MELAYANG */}
                          {p.discountPercent > 0 && (
                            <div className="absolute top-2 left-2 z-20">
                              <span className="bg-[#E50000] text-white text-[10px] lg:text-[11px] font-black px-2 py-1 rounded shadow-sm">
                                -{p.discountPercent}%
                              </span>
                            </div>
                          )}

                          {p.images && p.images.length > 0 ? (
                            <>
                              {/* 3. Ubah group-hover menjadi group-hover/card */}
                              <Image 
                                src={p.images[0]} 
                                alt={p.name} 
                                fill 
                                className={`object-cover object-top transition-all duration-700 ${
                                  p.images.length > 1 ? "group-hover/card:opacity-0" : "group-hover/card:scale-105"
                                }`} 
                                sizes="(max-width: 768px) 50vw, 25vw" 
                              />
                              {p.images.length > 1 && (
                                <Image 
                                  src={p.images[1]} 
                                  alt={`${p.name} hover`} 
                                  fill 
                                  className="object-cover object-top absolute inset-0 opacity-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700" 
                                  sizes="(max-width: 768px) 50vw, 25vw" 
                                />
                              )}
                            </>
                          ) : p.image ? (
                            <Image 
                              src={p.image} 
                              alt={p.name} 
                              fill 
                              className="object-cover object-top group-hover/card:scale-105 transition-transform duration-700" 
                              sizes="(max-width: 768px) 50vw, 25vw" 
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">👟</div>
                          )}
                          
                          {p.isSoldOut && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                              <span className="bg-gray-900 text-white font-black text-xs md:text-sm px-3 py-1 rounded-full border border-gray-600">
                                HABIS
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Produk */}
                        <div className="space-y-1 p-2.5 flex-grow bg-white">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#E50000]">
                            {p.isSoldOut ? "Sold Out" : "Event Promo"}
                          </p>
                          <p className="text-[12px] font-medium text-gray-900 line-clamp-2">
                            {p.name}
                          </p>
                          {p.availableSizes && p.availableSizes.length > 0 && (
                            <p className="text-[10px] lg:text-[11px] text-[#888888] mb-2 lg:mb-3 line-clamp-1">
                              Sizes: {p.availableSizes.slice(0, 5).join(", ")}
                              {p.availableSizes.length > 5 && "..."}
                            </p>
                          )}
                          <p className="font-bold text-[14px] lg:text-[18px]">
                            Rp {p.finalPrice?.toLocaleString('id-ID')}
                          </p>
                          
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {p.originalPrice > p.finalPrice && (
                              <p className="text-[10px] line-through text-gray-400">
                                Rp {p.originalPrice?.toLocaleString('id-ID')}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Flash Sale Stock Bar */}
                        {p.stockBar && p.stockBar.total > 0 && (
                          <div className="px-2.5 pb-2.5 bg-white">
                            <div className="relative h-[16px] w-full bg-red-300 rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-700 rounded-full transition-all duration-1000" 
                                style={{ width: `${stockPercentage}%` }}
                              />
                              {stockPercentage > 80 && !p.isSoldOut && (
                                <span className="absolute left-1 text-[10px] z-10 animate-pulse">🔥</span>
                              )}
                              <span className="relative z-10 text-[9px] font-bold text-white drop-shadow-md uppercase tracking-wider">
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
            
          </div>
        </section>
      ))}
    </div>
  );
}