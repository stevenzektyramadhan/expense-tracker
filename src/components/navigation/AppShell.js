"use client";

// Hallmark - authenticated application shell - Calm Ledger - one responsive component tree
import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Home,
  PlusCircle,
  Wallet,
} from "lucide-react";
import AppHeader from "@/components/navigation/AppHeader";
import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { ConfirmDialog } from "@/components/ui/Dialog";
import Skeleton from "@/components/ui/Skeleton";
import { signOut } from "@/lib/supabaseClient";

const NAVIGATION_ROUTES = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/add", label: "Tambah", Icon: PlusCircle },
  { href: "/income", label: "Pendapatan", Icon: Wallet },
  { href: "/summary", label: "Ringkasan", Icon: BarChart3 },
];

const ROUTE_TITLES = [
  { path: "/income/add", title: "Tambah pendapatan" },
  { path: "/allowance", title: "Uang saku" },
  { path: "/summary", title: "Ringkasan" },
  { path: "/income", title: "Pendapatan" },
  { path: "/add", title: "Tambah pengeluaran" },
  { path: "/", title: "Beranda", exact: true },
];

function isActiveRoute(pathname, href) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getRouteTitle(pathname) {
  const match = ROUTE_TITLES.find(({ exact, path }) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`),
  );

  return match?.title || "Aplikasi";
}

export default function AppShell({ children, isLoading = false, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const routes = NAVIGATION_ROUTES.map((route) => ({
    ...route,
    isActive: isActiveRoute(pathname, route.href),
  }));
  const routeTitle = getRouteTitle(pathname);

  const handleLogout = useCallback(() => {
    setLogoutError("");
    setLogoutConfirmOpen(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const { error } = await signOut();
      if (error) throw error;

      setLogoutConfirmOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Failed signing out", error?.message || error);
      setLogoutError("Sesi belum dapat ditutup. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  return (
    <div
      className="flex min-h-dvh flex-col bg-[var(--color-canvas)] text-[var(--color-text)]"
      style={{
        "--app-header-height": "3.5rem",
        "--mobile-navigation-height": "4.5rem",
        "--app-navigation-layer": "40",
        "--app-shell-mobile-reservation":
          "calc(var(--mobile-navigation-height) + env(safe-area-inset-bottom, 0px) + var(--space-xl))",
        "--app-status-bottom":
          "calc(var(--mobile-navigation-height) + env(safe-area-inset-bottom, 0px) + var(--space-sm))",
      }}
    >
      <a
        href="#main-content"
        className="sr-only z-[var(--z-tooltip)] min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 font-semibold text-[var(--color-on-primary)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:flex focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]"
      >
        Lewati ke konten utama
      </a>

      <div className="sticky top-0 z-[var(--app-navigation-layer)] border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/95 backdrop-blur-lg">
        <div
          className="mx-auto flex min-h-[var(--app-header-height)] w-full max-w-7xl items-stretch gap-3 px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <AppHeader
            isLoading={isLoading}
            routeLabel={isLoading ? "Memuat aplikasi" : routeTitle}
            user={user}
          />
          {isLoading ? null : (
            <DesktopNavigation
              routes={routes}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          )}
        </div>
      </div>

      <div
        id="app-status-region"
        className="pointer-events-none fixed inset-x-4 bottom-[var(--app-status-bottom)] z-[var(--z-toast)] mx-auto max-w-lg md:inset-x-auto md:right-6 md:bottom-6 md:mx-0 md:w-[min(28rem,calc(100vw-3rem))]"
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-0 py-6 pb-[var(--app-shell-mobile-reservation)] sm:px-6 md:pb-8 lg:px-8"
      >
        {isLoading ? (
          <div
            className="space-y-4 px-4 sm:px-0"
            role="status"
            aria-label="Memuat aplikasi"
          >
            <Skeleton width="8rem" height="1rem" />
            <Skeleton height="8rem" radius="var(--radius-surface)" />
            <Skeleton height="8rem" radius="var(--radius-surface)" />
          </div>
        ) : (
          children
        )}
      </main>

      {isLoading ? null : (
        <MobileBottomNav
          routes={routes}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      )}

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Keluar dari kiteCatat?"
        description="Anda perlu masuk kembali untuk melihat catatan keuangan."
        confirmLabel="Keluar"
        loadingLabel="Keluar…"
        isLoading={isLoggingOut}
        error={logoutError}
        onClose={() => {
          if (!isLoggingOut) setLogoutConfirmOpen(false);
        }}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
