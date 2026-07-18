// Hallmark - shared app context - Calm Ledger - compact route label, not a page heading
import Link from "next/link";

export default function AppHeader({ isLoading = false, routeLabel, user }) {
  return (
    <header className="flex min-w-0 flex-1 items-center gap-3">
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

      <div className="ml-auto hidden min-w-0 xl:block">
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
    </header>
  );
}
