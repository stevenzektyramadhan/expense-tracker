import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Service worker & manifest akan di-generate ke /public
  register: true, // Auto register service worker
  skipWaiting: true, // Service worker baru langsung aktif tanpa tunggu close browser
  disable: process.env.NODE_ENV === "development", // Nonaktif saat dev mode
});

const imageDomains = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { host } = new URL(supabaseUrl);
    if (host) {
      imageDomains.push(host);
    }
  } catch (error) {
    // Ignore invalid Supabase URLs at build time; domains array will remain empty
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: imageDomains,
  },
};

export default withPWA(nextConfig);
