import test from "node:test";
import assert from "node:assert/strict";

import { createExpenseCsv, escapeCsvCell } from "../src/lib/csvExport.mjs";

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
