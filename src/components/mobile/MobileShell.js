"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PlusCircle, BarChart3, LogOut } from "./icons";
import { signOut } from "@/lib/supabaseClient";

export default function MobileShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const navItems = [
    { href: "/", label: "Home", Icon: Home, type: "link" },
    { href: "/add", label: "Tambah", Icon: PlusCircle, type: "link" },
    { href: "/summary", label: "Ringkasan", Icon: BarChart3, type: "link" },
    { label: "Keluar", Icon: LogOut, type: "action", onClick: handleLogout },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      {children}

      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-3xl p-4 shadow-lg">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map(({ href, label, Icon }) => {
              if (href) {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex flex-col items-center transition ${isActive ? "text-white" : "text-purple-200"}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-semibold">{label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={label}
                  type="button"
                  onClick={handleLogout}
                  className="flex flex-col items-center text-purple-200 transition hover:text-white active:scale-[0.98]"
                >
                  <Icon className="w-7 h-7 mb-1" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
