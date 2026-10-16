const FORMULA_PREFIX = /^[=+\-@]/;

export const escapeCsvCell = (value) => {
  const normalizedValue = String(value ?? "");
  const spreadsheetSafeValue = FORMULA_PREFIX.test(normalizedValue)
    ? `'${normalizedValue}`
    : normalizedValue;

  return /[",\r\n]/.test(spreadsheetSafeValue)
    ? `"${spreadsheetSafeValue.replaceAll('"', '""')}"`
    : spreadsheetSafeValue;
};

export const createExpenseCsv = (transactions, formatDate, formatCurrency) => {
  const rows = [
    ["Tanggal", "Kategori", "Deskripsi", "Arah", "Jumlah"],
    ...transactions.map((transaction) => [
      formatDate(transaction.date),
      transaction.category,
      transaction.description?.trim() || "Tanpa deskripsi",
      "Pengeluaran",
      formatCurrency(Math.abs(Number(transaction.amount))),
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
};
