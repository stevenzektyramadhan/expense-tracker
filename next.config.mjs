import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Service worker & manifest akan di-generate ke /public
  register: true, // Auto register service worker
  skipWaiting: true, // Service worker baru langsung aktif tanpa tunggu close browser
  disable: process.env.NODE_ENV === "development", // Nonaktif saat dev mode
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Empty turbopack config to silence warning when using webpack plugins like next-pwa
  turbopack: {},
  images: {
    // Using remotePatterns with wildcard to allow all HTTPS images
    // This replaces the deprecated 'domains' configuration
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Wildcard allows all HTTPS hostnames
      },
    ],
  },
};

export default withPWA(nextConfig);
