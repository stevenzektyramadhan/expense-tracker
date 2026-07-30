// Hallmark - focused desktop navigation - Calm Ledger - shared routes and callbacks only
import Link from "next/link";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";

export default function DesktopNavigation({
  isLoggingOut = false,
  onLogout,
  routes,
}) {
  return (
    <nav
      className="hidden shrink-0 items-center gap-2 md:flex"
      aria-label="Navigasi utama"
    >
      <ul className="flex items-center gap-1">
        {routes.map(({ Icon, href, isActive, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm font-semibold text-[var(--color-text-muted)] transition-colors duration-[var(--motion-standard)] ease-[var(--ease-enter)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:bg-[var(--color-primary-soft)] data-[active=true]:bg-[var(--color-primary-soft)] data-[active=true]:text-[var(--color-primary-strong)]"
              data-active={isActive ? "true" : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Button
        variant="quiet"
        size="compact"
        onClick={onLogout}
        isLoading={isLoggingOut}
        loadingLabel="Keluar…"
        aria-label="Keluar dari kiteCatat"
      >
        <LogOut className="size-4" aria-hidden="true" />
        <span>Keluar</span>
      </Button>
    </nav>
  );
}
