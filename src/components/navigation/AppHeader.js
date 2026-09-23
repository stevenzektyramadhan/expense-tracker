// Hallmark - shared app context - Calm Ledger - compact route label, not a page heading
import Link from "next/link";
import { LoaderCircle, LogOut } from "lucide-react";

export default function AppHeader({
  isLoading = false,
  routeLabel,
  user,
  onLogout,
  isLoggingOut = false,
}) {
  return (
    <header className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-control)] px-1 font-[family-name:var(--font-display-family)] text-lg font-bold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          aria-label="kiteCatat, buka beranda"
        >
          <span className="text-[var(--color-brand-warm)]">kite</span>
          <span className="text-[var(--color-primary)]">Catat</span>
        </Link>

        <span
          className="h-5 w-px shrink-0 bg-[var(--color-border)]"
          aria-hidden="true"
        />

        <p
          className="min-w-0 truncate text-sm font-medium text-[var(--color-text-muted)] md:hidden"
          aria-label={`Bagian aktif: ${routeLabel}`}
        >
          {routeLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onLogout && !isLoading ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors duration-[var(--motion-standard)] ease-[var(--ease-enter)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-expense-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:bg-[var(--color-expense-soft)] disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut || undefined}
            aria-label="Keluar dari akun"
            title="Keluar dari akun"
          >
            {isLoggingOut ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            <span>Keluar</span>
          </button>
        ) : null}

        <div className="hidden min-w-0 xl:block">
          {isLoading ? (
            <span className="text-sm text-[var(--color-text-muted)]">
              Memuat sesi…
            </span>
          ) : (
            <span
              className="block max-w-48 truncate text-sm text-[var(--color-text-muted)]"
              title={user?.email}
            >
              {user?.email}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
