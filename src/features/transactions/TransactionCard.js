import { ChevronRight, Pencil, ReceiptText, Trash2 } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

export default function TransactionCard({
  transaction,
  onSelect,
  onEdit,
  onDelete,
  compact = false,
}) {
  const description = transaction.description?.trim() || "Tanpa deskripsi";

  if (compact) {
    return (
      <article className="flex min-h-[4.5rem] min-w-0 items-center gap-2 overflow-hidden rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 shadow-[var(--elevation-1)]">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-[var(--color-text)]">
            {description}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-text-muted)]">
            <span className="max-w-full truncate">{transaction.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={transaction.date}>
              {formatDate(transaction.date)}
            </time>
            {transaction.receipt_url ? (
              <ReceiptText
                className="h-3.5 w-3.5 shrink-0"
                aria-label="Ada struk"
              />
            ) : null}
          </div>
        </div>
        <CurrencyAmount
          amount={transaction.amount}
          tone="expense"
          showSign
          className="max-w-[46%] shrink-0 break-words text-right text-sm font-bold"
          style={wrappingAmountStyle}
        />
        <Button
          size="icon"
          variant="quiet"
          onClick={() => onSelect(transaction)}
          aria-label={`Lihat detail ${description}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </article>
    );
  }

  return (
    <article className="min-w-0 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)]">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold leading-snug text-[var(--color-text)]">
            {description}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-text-muted)]">
            <span className="max-w-full break-words">{transaction.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={transaction.date}>{formatDate(transaction.date)}</time>
            {transaction.receipt_url ? (
              <span className="inline-flex items-center gap-1">
                <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
                Ada struk
              </span>
            ) : null}
          </div>
        </div>
        <CurrencyAmount
          amount={transaction.amount}
          tone="expense"
          showSign
          className="max-w-[46%] shrink-0 break-words text-right font-bold"
          style={wrappingAmountStyle}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-1">
        <Button
          size="compact"
          variant="quiet"
          onClick={() => onSelect(transaction)}
          aria-label={`Lihat detail ${description}`}
        >
          Detail
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="flex flex-wrap justify-end gap-1">
          <Button
            size="icon"
            variant="quiet"
            onClick={() => onEdit(transaction)}
            aria-label={`Edit ${description}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="quiet"
            onClick={() => onDelete(transaction.id)}
            aria-label={`Hapus ${description}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
