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
  themeColor: "#4f46e5",
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
