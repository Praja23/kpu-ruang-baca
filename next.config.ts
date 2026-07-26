import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // port: "", // port itu opsional, gak usah diisi
        // pathname: "/apjudxfe/**", // pathname ini juga opsional, tapi kalo mau lebih aman bisa ditambahin
      },
    ],
  },
};

export default nextConfig;
