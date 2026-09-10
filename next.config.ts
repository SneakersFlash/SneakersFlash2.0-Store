import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.sneakersflash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },

  // Tautan /9-9-sale masih beredar di IG/WA dan materi iklan sesudah halamannya
  // dicabut (10 Sep 2026). Dialihkan ke event clearance — barangnya memang
  // himpunan yang sama — bukan dibiarkan 404. Sengaja SEMENTARA (307): kalau
  // suatu saat 9.9 dipakai lagi, redirect permanen sudah terlanjur di-cache
  // peramban dan susah dicabut.
  async redirects() {
    return [
      {
        source: "/9-9-sale",
        destination: "/events/clearance-sale",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;