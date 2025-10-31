import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Service worker & manifest akan di-generate ke /public
  register: true, // Auto register service worker
  skipWaiting: true, // Service worker baru langsung aktif tanpa tunggu close browser
  disable: process.env.NODE_ENV === "development", // Nonaktif saat dev mode
});

const imageDomains = new Set();
const remotePatterns = [];

const addRemotePattern = (pattern) => {
  const key = `${pattern.protocol ?? "https"}://${pattern.hostname}${pattern.pathname ?? ""}`;
  if (!remotePatterns.some((entry) => `${entry.protocol ?? "https"}://${entry.hostname}${entry.pathname ?? ""}` === key)) {
    remotePatterns.push(pattern);
  }
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { host } = new URL(supabaseUrl);
    if (host) {
      imageDomains.add(host);
      addRemotePattern({ protocol: "https", hostname: host, pathname: "/**" });
    }
  } catch (error) {
    // Ignore invalid Supabase URLs at build time; domains array will remain empty
  }
}

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

addRemotePattern({
  protocol: "https",
  hostname: "res.cloudinary.com",
  pathname: cloudinaryCloudName ? `/${cloudinaryCloudName}/image/upload/**` : "/**",
});

imageDomains.add("res.cloudinary.com");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: Array.from(imageDomains),
    remotePatterns,
  },
};

export default withPWA(nextConfig);
