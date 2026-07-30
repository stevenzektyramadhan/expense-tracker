import "./globals.css";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import AppClientProviders from "@/components/AppClientProviders";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  title: "kiteCatat - Kelola Uangmu",
  description: "Aplikasi pencatat keuangan harian yang simpel dan modern.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geist.variable} ${plusJakartaSans.variable}`}>
        {children}
        <AppClientProviders />
      </body>
    </html>
  );
}
