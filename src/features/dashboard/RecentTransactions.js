import { ArrowRight } from "lucide-react";

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
    transactions.length <= PREVIEW_LIMIT
  ) {
    return null;
  }

  return (
    <section className="md:hidden" aria-labelledby="recent-transactions-title">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2
          id="recent-transactions-title"
          className="font-[family-name:var(--font-display-family)] text-lg font-bold"
        >
          Transaksi terbaru
        </h2>
        <a
          href="#transaction-history"
          className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-[var(--radius-control)] px-2 text-sm font-semibold text-[var(--color-primary-strong)] outline-none hover:underline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)] active:text-[var(--color-text)]"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <ul className="grid gap-2" aria-label="Pratinjau transaksi terbaru">
        {transactions.slice(0, PREVIEW_LIMIT).map((transaction) => (
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
