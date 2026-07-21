/* Hallmark · component: IncomeList · genre: modern-minimal · theme: Calm Ledger
 * states: loading · empty · populated · long-content · responsive card/table
 * contrast: shared semantic tokens · macrostructure: component-scope
 */
import Link from "next/link";
import { Pencil, PlusCircle, Trash2, WalletCards } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

function IncomeListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat riwayat pendapatan">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid min-h-28 min-w-0 grid-cols-[minmax(0,1fr)_7rem] gap-4 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:min-h-20 md:grid-cols-[minmax(0,1fr)_10rem_9rem] md:items-center"
        >
          <div className="space-y-2">
            <Skeleton width="45%" height="1rem" />
            <Skeleton width="70%" height="0.875rem" />
          </div>
          <Skeleton width="100%" height="1.25rem" />
          <Skeleton className="hidden md:block" width="100%" height="2.75rem" />
        </div>
      ))}
    </div>
  );
}

function IncomeCard({ income, onDelete, onEdit }) {
  const source = income.source?.trim() || "Sumber tidak diisi";

  return (
    <li>
      <article className="min-w-0 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)]">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-semibold leading-snug text-[var(--color-text)]">
              {source}
            </h3>
            <time
              dateTime={income.date}
              className="mt-1 block text-sm text-[var(--color-text-muted)]"
            >
              {formatDate(income.date)}
            </time>
          </div>
          <CurrencyAmount
            amount={income.amount}
            tone="income"
            showSign
            className="max-w-[52%] shrink-0 break-words text-right font-bold"
            style={wrappingAmountStyle}
          />
        </div>

        {income.note ? (
          <p className="mt-3 break-words text-sm leading-6 text-[var(--color-text-muted)]">
            {income.note}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-[var(--color-border)] pt-2">
          <Button
            size="compact"
            variant="quiet"
            onClick={() => onEdit(income)}
            aria-label={`Edit pendapatan dari ${source}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Button>
          <Button
            size="compact"
            variant="quiet"
            onClick={() => onDelete(income)}
            aria-label={`Hapus pendapatan dari ${source}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus
          </Button>
        </div>
      </article>
    </li>
  );
}

export default function IncomeList({
  incomes,
  isLoading = false,
  onDelete,
  onEdit,
}) {
  if (isLoading) {
    return <IncomeListSkeleton />;
  }

  if (!incomes.length) {
    return (
      <EmptyState
        icon={WalletCards}
        title="Belum ada pendapatan pada periode ini"
        description="Tambahkan pendapatan untuk mencatat uang yang menambah saldo periode tersebut."
        action={
          <Link
            href="/income/add"
            className="ui-button"
            data-variant="primary"
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            Tambah pendapatan
          </Link>
        }
      />
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden" aria-label="Riwayat pendapatan">
        {incomes.map((income) => (
          <IncomeCard
            key={income.id}
            income={income}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] md:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">
            Riwayat pendapatan sesuai bulan dan tahun yang dipilih
          </caption>
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <th className="w-[28%] px-4 py-3 font-semibold" scope="col">
                Sumber
              </th>
              <th className="w-[26%] px-4 py-3 font-semibold" scope="col">
                Catatan
              </th>
              <th className="w-[17%] px-4 py-3 font-semibold" scope="col">
                Tanggal
              </th>
              <th
                className="w-[16%] px-4 py-3 text-right font-semibold"
                scope="col"
              >
                Jumlah
              </th>
              <th
                className="w-[13%] px-4 py-3 text-right font-semibold"
                scope="col"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {incomes.map((income) => {
              const source = income.source?.trim() || "Sumber tidak diisi";

              return (
                <tr
                  key={income.id}
                  className="align-top hover:bg-[var(--color-surface-subtle)]"
                >
                  <th
                    className="break-words px-4 py-4 font-semibold text-[var(--color-text)]"
                    scope="row"
                  >
                    {source}
                  </th>
                  <td className="break-words px-4 py-4 text-[var(--color-text-muted)]">
                    {income.note || "—"}
                  </td>
                  <td className="px-4 py-4 text-[var(--color-text-muted)]">
                    <time dateTime={income.date}>{formatDate(income.date)}</time>
                  </td>
                  <td className="break-words px-4 py-4 text-right">
                    <CurrencyAmount
                      amount={income.amount}
                      tone="income"
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
                        onClick={() => onEdit(income)}
                        aria-label={`Edit pendapatan dari ${source}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon"
                        variant="quiet"
                        onClick={() => onDelete(income)}
                        aria-label={`Hapus pendapatan dari ${source}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
