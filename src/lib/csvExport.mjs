const FORMULA_PREFIX = /^[=+\-@]/;

export const getMonthDateRange = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

export const getExpenseCsvFilename = (month) => `transaksi-${month}.csv`;

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
