import { Inter } from "next/font/google";
import "./globals.css";
import AppClientProviders from "@/components/AppClientProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
      <body className={inter.className}>
        {children}
        <AppClientProviders />
      </body>
    </html>
  );
}
