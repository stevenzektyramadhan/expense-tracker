import Skeleton from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div
      className="grid min-w-0 grid-cols-1 gap-4 px-4 sm:px-0 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-8 md:gap-y-6"
      role="status"
      aria-label="Memuat dashboard"
    >
      <div className="order-1 hidden md:col-start-1 md:row-start-1 md:block">
        <Skeleton width="12rem" height="2rem" />
        <Skeleton className="mt-2" width="19rem" height="1rem" />
      </div>
      <div className="order-2 hidden grid-cols-2 gap-2 md:col-start-2 md:row-start-1 md:grid">
        <Skeleton width="10.5rem" height="2.75rem" />
        <Skeleton width="10rem" height="2.75rem" />
      </div>

      <div className="order-2 overflow-hidden rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--elevation-2)] md:order-3 md:col-span-2 md:row-start-2">
        <div className="p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:gap-6 lg:p-6">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton width="2.25rem" height="2.25rem" />
                <div>
                  <Skeleton width="7.5rem" height="0.875rem" />
                  <Skeleton className="mt-1" width="4.5rem" height="0.75rem" />
                </div>
              </div>
              <Skeleton width="3.5rem" height="2.75rem" />
            </div>

            <Skeleton className="mt-3" width="min(17rem, 82%)" height="2.5rem" />
            <Skeleton className="mt-2" width="10rem" height="0.875rem" />
            <div className="mt-3 flex justify-between gap-3">
              <Skeleton width="6.5rem" height="0.75rem" />
              <Skeleton width="5.5rem" height="0.75rem" />
            </div>
            <Skeleton className="mt-2" height="0.5rem" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:mt-0 lg:self-end">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] p-3"
              >
                <Skeleton width="5.5rem" height="0.75rem" />
                <Skeleton className="mt-2" width="7rem" height="1.25rem" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] bg-[var(--color-income-soft)] px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <Skeleton width="7rem" height="0.75rem" />
            <Skeleton width="8.5rem" height="0.75rem" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <Skeleton width="min(7rem, 100%)" height="1rem" />
            <Skeleton width="min(7rem, 100%)" height="1rem" />
          </div>
        </div>
      </div>

      <div className="order-3 md:hidden">
        <Skeleton height="2.75rem" />
      </div>

      <div className="order-4 md:hidden">
        <div className="mb-2 flex items-center justify-between gap-4">
          <Skeleton width="10rem" height="1.5rem" />
          <Skeleton width="6rem" height="1rem" />
        </div>
        <div className="grid gap-2">
          {[0, 1].map((item) => (
            <Skeleton key={item} height="4.5rem" />
          ))}
        </div>
      </div>

      <div className="order-6 grid gap-3 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:grid-cols-2 lg:grid-cols-4 md:col-span-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} height="4.5rem" />
        ))}
      </div>
      <div className="order-7 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:col-span-2">
        <Skeleton width="11rem" height="1.5rem" />
        <div className="mt-5 grid gap-3">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} height="4.25rem" />
          ))}
        </div>
      </div>
    </div>
  );
}
