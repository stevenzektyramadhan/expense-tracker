// Hallmark - focused mobile navigation - Calm Ledger - safe-area aware and thumb reachable
import Link from "next/link";
import { LoaderCircle, LogOut } from "lucide-react";

const itemClassName =
  "flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] px-1 text-[0.6875rem] font-semibold leading-tight text-[var(--color-text-muted)] transition-colors duration-[var(--motion-standard)] ease-[var(--ease-enter)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus)] active:bg-[var(--color-primary-soft)] data-[active=true]:text-[var(--color-primary-strong)]";

export default function MobileBottomNav({
  isLoggingOut = false,
  onLogout,
  routes,
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[var(--app-navigation-layer)] border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--elevation-2)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navigasi utama"
    >
      <ul className="mx-auto grid h-[var(--mobile-navigation-height)] max-w-lg grid-cols-5 items-stretch px-2">
        {routes.map(({ Icon, href, isActive, label }) => (
          <li key={href} className="min-w-0">
            <Link
              href={href}
              className={itemClassName}
              data-active={isActive ? "true" : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          </li>
        ))}

        <li className="min-w-0">
          <button
            type="button"
            className={`${itemClassName} w-full disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut || undefined}
            aria-label="Keluar dari kiteCatat"
          >
            {isLoggingOut ? (
              <LoaderCircle
                className="size-5 shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <LogOut className="size-5 shrink-0" aria-hidden="true" />
            )}
            <span>Keluar</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
