"use client";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import ExpenseDetailContent, {
  defaultExpenseDetailLabels,
} from "@/features/expenses/ExpenseDetailContent";

export default function ExpenseDetailModal({
  expense,
  labels = defaultExpenseDetailLabels,
  onClose,
  onEdit,
  onDelete,
  onZoom,
}) {
  const copy = { ...defaultExpenseDetailLabels, ...labels };

  if (!expense) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      variant="responsive-sheet"
      title={copy.title}
      closeLabel={copy.close}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full md:w-auto">
            {copy.close}
          </Button>
          {onEdit ? (
              <Button variant="secondary" onClick={() => onEdit(expense)} className="w-full md:w-auto">
              {copy.edit}
            </Button>
          ) : null}
          {onDelete ? (
              <Button variant="destructive" onClick={() => onDelete(expense.id)} className="w-full md:w-auto">
              {copy.delete}
            </Button>
          ) : null}
        </>
      }
    >
      <ExpenseDetailContent expense={expense} copy={copy} onZoom={onZoom} />
    </Dialog>
  );
}
