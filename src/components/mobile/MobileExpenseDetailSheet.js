"use client";

import Button from "@/components/ui/Button";
import Sheet from "@/components/ui/Sheet";
import ExpenseDetailContent, {
  defaultExpenseDetailLabels,
} from "@/features/expenses/ExpenseDetailContent";

export default function MobileExpenseDetailSheet({
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
    <Sheet
      open
      onClose={onClose}
      title={copy.title}
      closeLabel={copy.close}
      footer={
        <div className="grid w-full grid-cols-2 gap-2">
          {onEdit ? (
            <Button fullWidth variant="secondary" onClick={() => onEdit(expense)}>
              {copy.edit}
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              fullWidth
              variant="destructive"
              onClick={() => onDelete(expense.id)}
            >
              {copy.delete}
            </Button>
          ) : null}
          <Button
            className="col-span-2"
            fullWidth
            variant="quiet"
            onClick={onClose}
          >
            {copy.close}
          </Button>
        </div>
      }
    >
      <ExpenseDetailContent expense={expense} copy={copy} onZoom={onZoom} />
    </Sheet>
  );
}

