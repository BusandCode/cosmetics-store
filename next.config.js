/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // or list specific hosts you actually use, safer for production
      },
    ],
  },
};

module.exports = nextConfig;