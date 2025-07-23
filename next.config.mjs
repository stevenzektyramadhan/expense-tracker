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
};

export default withPWA(nextConfig);
