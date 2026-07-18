// Hallmark · component: CurrencyAmount · genre: authenticated finance utility · theme: Calm Ledger · states: neutral/income/expense/unavailable · contrast: sign plus semantic tone
import { formatCurrency } from "@/lib/utils";

export default function CurrencyAmount({
  amount,
  className = "",
  showSign,
  tone = "neutral",
  "aria-label": ariaLabel,
  ...props
}) {
  const numericAmount = Number(amount);
  const isAvailable = Number.isFinite(numericAmount);
  const classes = ["ui-currency-amount", className]
    .filter(Boolean)
    .join(" ");

  if (!isAvailable) {
    return (
      <span
        {...props}
        className={classes}
        data-tone="neutral"
        aria-label={ariaLabel || "Nilai tidak tersedia"}
      >
        —
      </span>
    );
  }

  const formattedAmount = formatCurrency(Math.abs(numericAmount));
  const shouldShowSign =
    showSign ?? (tone === "income" || tone === "expense" || numericAmount < 0);
  const sign = shouldShowSign
    ? tone === "expense"
      ? "−"
      : tone === "income"
        ? "+"
        : numericAmount < 0
          ? "−"
          : "+"
    : "";
  const accessibleLabel =
    tone === "income"
      ? `Pemasukan, ${formattedAmount}`
      : tone === "expense"
        ? `Pengeluaran, ${formattedAmount}`
        : `${numericAmount < 0 ? "Minus, " : ""}${formattedAmount}`;

  return (
    <span
      {...props}
      className={classes}
      data-tone={tone}
      aria-label={ariaLabel || accessibleLabel}
    >
      {sign}
      {formattedAmount}
    </span>
  );
}
