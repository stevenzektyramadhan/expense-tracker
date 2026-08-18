import Link from "next/link";
import { FilterX, Plus, ReceiptText, RefreshCw } from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import TransactionCard from "./TransactionCard";
import TransactionTable from "./TransactionTable";

function TransactionLoadingState() {
  return (
    <div className="grid gap-3 p-4" role="status" aria-label="Memuat transaksi">
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} height="4.5rem" />
      ))}
    </div>
  );
}

export default function TransactionSection({
  transactions,
  hasAnyTransactions,
  filtersAreActive,
  requestState,
  onSelect,
  onEdit,
  onDelete,
  onResetFilters,
  onRetry,
}) {
  let content;

  if (requestState.status === "idle" || requestState.status === "loading") {
    content = <TransactionLoadingState />;
  } else if (requestState.status === "error") {
    content = (
      <ErrorState
        className="m-4"
        title="Transaksi tidak dapat dimuat"
        description={requestState.error || "Coba muat kembali data pengeluaran Anda."}
        action={
          <Button size="compact" variant="secondary" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Coba lagi
          </Button>
        }
      />
    );
  } else if (!hasAnyTransactions) {
    content = (
      <EmptyState
        className="px-4"
        icon={Plus}
        title="Belum ada pengeluaran"
        description="Catat pengeluaran pertama agar riwayat dan ringkasan mulai terbentuk."
        action={
          <Link href="/add" className="ui-button" data-variant="primary">
            Tambah pengeluaran
          </Link>
        }
      />
    );
  } else if (transactions.length === 0 && filtersAreActive) {
    content = (
      <EmptyState
        className="px-4"
        icon={FilterX}
        title="Tidak ada hasil"
        description="Tidak ada transaksi yang cocok dengan filter atau pencarian ini."
        action={
          <Button size="compact" variant="secondary" onClick={onResetFilters}>
            Reset filter
          </Button>
        }
      />
    );
  } else if (transactions.length === 0) {
    content = (
      <EmptyState
        className="px-4"
        icon={Plus}
        title="Belum ada pengeluaran periode ini"
        description="Tambahkan pengeluaran untuk periode yang sedang dipilih."
        action={
          <Link href="/add" className="ui-button" data-variant="primary">
            Tambah pengeluaran
          </Link>
        }
      />
    );
  } else {
    content = (
      <>
        <ul className="grid gap-2 p-3 lg:hidden" aria-label="Daftar pengeluaran">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <TransactionCard
                transaction={transaction}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
        <div className="hidden lg:block">
          <TransactionTable
            transactions={transactions}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </>
    );
  }

  return (
    <section
      id="transaction-history"
      tabIndex={-1}
      className="scroll-mt-24 outline-none focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)] lg:overflow-hidden lg:rounded-[var(--radius-surface)] lg:border lg:border-[var(--color-border)] lg:bg-[var(--color-surface)] lg:shadow-[var(--elevation-1)]"
      aria-labelledby="transaction-history-title"
    >
      <div className="flex items-end justify-between gap-4 px-0 py-4 lg:border-b lg:border-[var(--color-border)] lg:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
            aria-hidden="true"
          >
            <ReceiptText className="size-5" />
          </span>
          <div className="min-w-0">
            <h2
              id="transaction-history-title"
              className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold"
            >
              Riwayat transaksi
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
              Pengeluaran sesuai filter yang dipilih
            </p>
          </div>
        </div>
        {requestState.status === "success" ? (
          <p className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-primary-soft)] px-2.5 py-1 text-sm font-semibold text-[var(--color-primary-strong)]">
            {transactions.length} transaksi
          </p>
        ) : null}
      </div>
      {content}
    </section>
  );
}
