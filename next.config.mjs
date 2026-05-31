/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.1.70", "192.168.1.69", "192.168.1.72"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.neupgroup.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "backend.lalpurjanepal.com.np",
      },
      {
        protocol: "https",
        hostname: "namsari.com",
      },
    ],
  },
};

export default nextConfig;
