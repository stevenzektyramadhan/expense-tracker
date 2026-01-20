"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PlusCircle, BarChart3, LogOut } from "./icons";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

// =============================================================================
// MOBILE SHELL - Main layout wrapper for mobile views
// =============================================================================
// This component provides:
// 1. Top header with app title and logout button
// 2. Bottom navigation bar with safe area handling
// 3. Main content area with proper padding
// =============================================================================

export default function MobileShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/add", label: "Tambah", Icon: PlusCircle },
    { href: "/summary", label: "Ringkasan", Icon: BarChart3 },
  ];

  // =========================================================================
  // LOGOUT HANDLER
  // =========================================================================
  // Uses SweetAlert2 for confirmation dialog before signing out
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout",
      text: "Apakah anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* ===================================================================
          TOP HEADER
          =================================================================== 
          Fixed header with app title and logout button.
          Uses z-50 to ensure it stays above other content.
      */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <h1 className="text-lg font-bold">
            <span className="text-orange-500">kite</span>
            <span className="text-blue-500">Catat</span>
          </h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-red-400"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===================================================================
          MAIN CONTENT AREA
          =================================================================== 
          Flexible area that grows to fill available space.
          pb-24 provides space for the fixed bottom navigation.
      */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* ===================================================================
          BOTTOM NAVIGATION BAR
          ===================================================================
          Fixed at the bottom with safe area handling for modern devices.
          
          SAFE AREA INSETS EXPLANATION:
          ------------------------------
          Modern smartphones (especially iPhones with Face ID) have screen
          areas that are partially obscured by hardware elements like:
          - The "notch" at the top
          - The "home indicator" swipe bar at the bottom
          
          CSS provides `env(safe-area-inset-*)` values that represent the
          size of these obstructed areas. By adding padding equal to
          `safe-area-inset-bottom`, we ensure our navigation bar sits
          ABOVE the home indicator, not behind it.
          
          The Tailwind class `pb-[env(safe-area-inset-bottom)]` uses
          arbitrary value syntax to apply this dynamic padding.
          
          For this to work, the viewport meta tag in the HTML must include:
          `viewport-fit=cover`
      */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div 
          className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-t-3xl shadow-lg"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex justify-around items-center max-w-md mx-auto p-4">
            {navItems.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <Link 
                  key={href} 
                  href={href} 
                  className={`flex flex-col items-center transition ${isActive ? "text-white" : "text-blue-200 hover:text-white"}`} 
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-7 h-7 mb-1" />
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
