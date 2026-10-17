import test from "node:test";
import assert from "node:assert/strict";

import {
  createExpenseCsv,
  escapeCsvCell,
  getExpenseCsvFilename,
  getMonthDateRange,
} from "../src/lib/csvExport.mjs";

test("Given a normal month, When getting its date range, Then it includes that month's final day", () => {
  assert.deepEqual(getMonthDateRange("2026-10"), {
    startDate: "2026-10-01",
    endDate: "2026-10-31",
  });
});

test("Given a leap-year February, When getting its date range, Then it includes February 29", () => {
  assert.deepEqual(getMonthDateRange("2024-02"), {
    startDate: "2024-02-01",
    endDate: "2024-02-29",
  });
});

test("Given December, When getting its date range, Then it keeps the year boundary in the selected month", () => {
  assert.deepEqual(getMonthDateRange("2026-12"), {
    startDate: "2026-12-01",
    endDate: "2026-12-31",
  });
});

test("Given a selected month, When getting the CSV filename, Then it uses the month in the filename", () => {
  assert.equal(getExpenseCsvFilename("2026-12"), "transaksi-2026-12.csv");
});

test("Given a cell with commas, quotes, or newlines, When escaping CSV, Then it uses RFC 4180 quoting", () => {
  assert.equal(escapeCsvCell('Makan, "siang"\nkantor'), '"Makan, ""siang""\nkantor"');
});

test("Given a formula-like cell, When escaping CSV, Then it is prefixed to prevent spreadsheet execution", () => {
  assert.equal(
    escapeCsvCell("=HYPERLINK(\"https://example.com\")"),
    "\"'=HYPERLINK(\"\"https://example.com\"\")\"",
  );
  assert.equal(escapeCsvCell("+628123456"), "'+628123456");
  assert.equal(escapeCsvCell("-10"), "'-10");
  assert.equal(escapeCsvCell("@user"), "'@user");
});

test("Given a normal finance transaction, When creating CSV, Then it includes Indonesian labels and formatted expense data", () => {
  const csv = createExpenseCsv(
    [
      {
        amount: 125000,
        category: "Makan",
        date: "2026-10-05",
        description: "Makan siang",
      },
    ],
    (date) => `5 Oktober 2026 (${date})`,
    (amount) => `Rp ${amount.toLocaleString("id-ID")}`,
  );

  assert.equal(
    csv,
    "Tanggal,Kategori,Deskripsi,Arah,Jumlah\r\n5 Oktober 2026 (2026-10-05),Makan,Makan siang,Pengeluaran,Rp 125.000",
  );
});
