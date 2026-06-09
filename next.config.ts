import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: "http://160.187.141.236:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;