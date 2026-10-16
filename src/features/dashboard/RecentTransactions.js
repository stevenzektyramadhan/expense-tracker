import { ArrowRight, History } from "lucide-react";

import TransactionCard from "@/features/transactions/TransactionCard";

const PREVIEW_LIMIT = 3;

export default function RecentTransactions({
  transactions,
  requestStatus,
  filtersAreActive,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (
    filtersAreActive ||
    requestStatus !== "success" ||
    !Array.isArray(transactions) ||
    transactions.length === 0
  ) {
    return null;
  }

  const previewTransactions = transactions.slice(0, PREVIEW_LIMIT);

  return (
    <section
      className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--elevation-1)] md:hidden"
      aria-labelledby="recent-transactions-title"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
            <History className="size-3.5" aria-hidden="true" />
          </span>
          <h2
            id="recent-transactions-title"
            className="font-[family-name:var(--font-display-family)] text-sm font-bold text-[var(--color-text)]"
          >
            Transaksi terbaru
          </h2>
        </div>

        <a
          href="#transaction-history"
          className="inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-[var(--color-primary-strong)] outline-none hover:underline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)]"
        >
          Lihat semua
          <ArrowRight className="size-3" aria-hidden="true" />
        </a>
      </div>

      <ul className="grid gap-2" aria-label="Pratinjau transaksi terbaru">
        {previewTransactions.map((transaction) => (
          <li key={transaction.id}>
            <TransactionCard
              transaction={transaction}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              compact
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
