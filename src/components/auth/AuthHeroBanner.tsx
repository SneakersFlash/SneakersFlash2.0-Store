"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { bannersService, type Banner } from "@/lib/api/banners.service";
import { buildImageUrl } from "@/lib/utils/imageUrl";

const FALLBACK_IMAGE = "/images/PAYDAY.jpeg";

export default function AuthHeroBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bannersService
      .getBanners("home_top")
      .then((banners) => {
        if (banners.length > 0) setBanner(banners[0]);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const src = banner
    ? banner.imageMobileUrl.startsWith("http")
      ? banner.imageMobileUrl
      : buildImageUrl(banner.imageMobileUrl)
    : FALLBACK_IMAGE;

  return (
    <div className="relative w-full aspect-[128/93] mb-8 rounded-2xl overflow-hidden shadow-sm bg-gray-200">
      {!ready && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 rounded-2xl" />
      )}
      {(ready || !banner) && (
        <Image
          src={src}
          alt="Sneakers Flash"
          fill
          className="object-cover hover:scale-105 transition-transform duration-500"
          priority
        />
      )}
    </div>
  );
}
