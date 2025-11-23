"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, BarChart3 } from "./icons";

export default function MobileShell({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/add", label: "Tambah", Icon: PlusCircle },
    { href: "/summary", label: "Ringkasan", Icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {children}

      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-3xl p-4 shadow-lg">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map(({ href, label, Icon }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href} className={`flex flex-col items-center transition ${isActive ? "text-white" : "text-purple-200"}`} aria-current={isActive ? "page" : undefined}>
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
