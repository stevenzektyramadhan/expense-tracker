import Skeleton from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col gap-5 px-4 sm:px-0"
      role="status"
      aria-label="Memuat ringkasan keuangan"
    >
      {/* 1. Header Skeleton */}
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Skeleton width="13rem" height="2rem" />
          <Skeleton className="mt-1.5" width="20rem" height="1rem" />
        </div>
        <div className="hidden items-center gap-2.5 sm:flex">
          <Skeleton width="9.5rem" height="2.5rem" />
          <Skeleton width="11rem" height="2.5rem" />
        </div>
      </div>

      {/* 2. Hero Overview Skeleton */}
      <div className="overflow-hidden rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--elevation-1)]">
        <div className="p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:gap-8 lg:p-6">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Skeleton width="2.25rem" height="2.25rem" className="rounded-[var(--radius-control)]" />
                <div>
                  <Skeleton width="7.5rem" height="0.875rem" />
                  <Skeleton className="mt-1" width="4rem" height="0.625rem" />
                </div>
              </div>
              <Skeleton width="4.5rem" height="1.75rem" />
            </div>

            <Skeleton className="mt-4" width="min(17rem, 80%)" height="2.75rem" />
            <Skeleton className="mt-2" width="11rem" height="0.875rem" />

            <div className="mt-5">
              <div className="flex justify-between gap-3">
                <Skeleton width="7rem" height="0.75rem" />
                <Skeleton width="6rem" height="0.75rem" />
              </div>
              <Skeleton className="mt-2 rounded-[var(--radius-pill)]" height="0.625rem" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 lg:mt-0 lg:self-center">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5"
              >
                <Skeleton width="5rem" height="0.75rem" />
                <Skeleton className="mt-2.5" width="7rem" height="1.25rem" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)]/60 px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <Skeleton width="8rem" height="0.75rem" />
            <Skeleton width="6rem" height="0.75rem" />
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Skeleton width="min(7rem, 100%)" height="1rem" />
            <Skeleton width="min(7rem, 100%)" height="1rem" />
            <Skeleton width="min(7rem, 100%)" height="1rem" className="col-span-2 sm:col-span-1" />
          </div>
        </div>
      </div>

      {/* 3. Mobile Action Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Skeleton height="2.75rem" />
        <Skeleton height="2.75rem" />
      </div>

      {/* 4. Responsive Workbench Grid Skeleton */}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        {/* Left Column: Ledger */}
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1 lg:col-span-7 xl:col-span-8">
          <div className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
            <Skeleton width="8rem" height="1.25rem" />
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} height="2.5rem" />
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
              <Skeleton width="9rem" height="1.25rem" />
              <Skeleton width="6rem" height="2rem" />
            </div>
            <div className="mt-4 grid gap-2.5">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} height="4.25rem" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2 lg:col-span-5 xl:col-span-4">
          <div className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <Skeleton width="8rem" height="1.25rem" />
              <Skeleton width="5.5rem" height="1.75rem" />
            </div>
            <div className="mt-4 grid gap-2.5">
              {[0, 1].map((item) => (
                <Skeleton key={item} height="4.5rem" />
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:p-5">
            <Skeleton width="9rem" height="1.25rem" />
            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <Skeleton height="5.5rem" />
              <Skeleton height="5.5rem" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
