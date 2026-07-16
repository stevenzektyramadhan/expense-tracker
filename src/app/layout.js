import "./globals.css";
import AppClientProviders from "@/components/AppClientProviders";

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
      <body>
        {children}
        <AppClientProviders />
      </body>
    </html>
  );
}
