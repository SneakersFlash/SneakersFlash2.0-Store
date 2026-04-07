import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {

    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-test.sneakersflash.com', // <== Tambahkan ini
        port: '',
        pathname: '/**',
      },
      {
        protocol: "http",
        hostname: "localhost",
        // Opsional: batasi port jika perlu, tapi dikosongkan agar fleksibel
        port: '3000', 
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
