import { Pencil, ReceiptText, Trash2 } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

export default function TransactionTable({
  transactions,
  onSelect,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">Daftar pengeluaran sesuai filter</caption>
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
            <th className="w-[30%] px-4 py-3 font-semibold" scope="col">
              Transaksi
            </th>
            <th className="w-[18%] px-4 py-3 font-semibold" scope="col">
              Kategori
            </th>
            <th className="w-[18%] px-4 py-3 font-semibold" scope="col">
              Tanggal
            </th>
            <th className="w-[16%] px-4 py-3 text-right font-semibold" scope="col">
              Jumlah
            </th>
            <th className="w-[18%] px-4 py-3 text-right font-semibold" scope="col">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {transactions.map((transaction) => {
            const description =
              transaction.description?.trim() || "Tanpa deskripsi";

            return (
              <tr key={transaction.id} className="align-top hover:bg-[var(--color-surface-subtle)]">
                <th className="min-w-0 px-4 py-4 font-medium" scope="row">
                  <button
                    type="button"
                    onClick={() => onSelect(transaction)}
                    className="min-h-11 max-w-full rounded-[var(--radius-control)] text-left font-semibold text-[var(--color-text)] outline-none hover:text-[var(--color-primary-strong)] focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)] active:text-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span className="block break-words">{description}</span>
                    {transaction.receipt_url ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-normal text-[var(--color-text-muted)]">
                        <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
                        Ada struk
                      </span>
                    ) : null}
                  </button>
                </th>
                <td className="break-words px-4 py-4 text-[var(--color-text-muted)]">
                  {transaction.category}
                </td>
                <td className="px-4 py-4 text-[var(--color-text-muted)]">
                  <time dateTime={transaction.date}>{formatDate(transaction.date)}</time>
                </td>
                <td className="break-words px-4 py-4 text-right">
                  <CurrencyAmount
                    amount={transaction.amount}
                    tone="expense"
                    showSign
                    className="font-bold"
                    style={wrappingAmountStyle}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
