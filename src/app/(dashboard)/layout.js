"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false); // for mobile menu toggle
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteksi halaman: jika tidak login, redirect ke /login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Loading state (spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Kalau user tidak login (dan sudah redirect), tidak render apapun
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-indigo-600">
            Expense Tracker
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 max-w-[120px] truncate">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* NAVBAR (desktop only) */}
      <nav className="hidden md:block bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* LEFT: Logo + Desktop Menu */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  Expense Tracker
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/add" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Tambah Pengeluaran
                </Link>
                <Link href="/summary" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Ringkasan
                </Link>
              </div>
            </div>

            {/* RIGHT: Desktop User Info */}
            <div className="hidden sm:flex items-center">
              <span className="text-gray-700 text-sm mr-4">{user.email}</span>
              <button onClick={handleSignOut} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                Keluar
              </button>
            </div>

            {/* MOBILE: Hamburger Button (kept for consistency but hidden with nav) */}
            <div className="sm:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-600 hover:text-indigo-600 focus:outline-none">
                {isOpen ? (
                  // X icon
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  // Hamburger icon
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN (desktop view only) */}
        {isOpen && (
          <div className="sm:hidden px-4 pb-4 space-y-2 animate-slide-down">
            <Link href="/" className="block text-gray-700 hover:text-indigo-600" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link href="/add" className="block text-gray-700 hover:text-indigo-600" onClick={() => setIsOpen(false)}>
              Tambah Pengeluaran
            </Link>
            <Link href="/summary" className="block text-gray-700 hover:text-indigo-600" onClick={() => setIsOpen(false)}>
              Ringkasan
            </Link>

            <div className="flex flex-col space-y-2 mt-2">
              <span className="text-gray-500 text-sm">{user.email}</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium w-full text-left"
              >
                Keluar
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT: children handle their own responsive layouts */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-0">
        <div className="px-0 sm:px-0 lg:px-0">{children}</div>
      </main>
    </div>
  );
}
