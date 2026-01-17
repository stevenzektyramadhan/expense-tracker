import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UpdatePrompt from "@/components/UpdatePrompt";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Expense Tracker",
  description: "Catat pengeluaran pribadimu dengan mudah",
  manifest: "/manifest.json",
};
// =============================================================================
// VIEWPORT CONFIGURATION
// =============================================================================
// viewportFit: 'cover' is REQUIRED for safe-area-inset CSS values to work.
// This tells the browser to extend the webpage into the notch/home indicator
// areas, and then we use CSS env() variables to add appropriate padding.
// Without this, env(safe-area-inset-bottom) would always be 0.
export const viewport = {
  themeColor: "#4f46e5",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Client Component khusus update prompt */}
        <UpdatePrompt />
      </body>
    </html>
  );
}
