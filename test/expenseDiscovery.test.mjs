import test from "node:test";
import assert from "node:assert/strict";

import {
  buildExpenseDiscoveryQuery,
  parseExpenseDiscoveryQuery,
} from "../src/lib/expenseDiscovery.mjs";

test("Given no period parameters, When parsing discovery filters, Then the reference month is normalized as the default", () => {
  const result = parseExpenseDiscoveryQuery(new URLSearchParams(), new Date("2026-10-05T12:00:00Z"));

  assert.deepEqual(result, {
    ok: true,
    value: {
      period: "month",
      month: 10,
      year: 2026,
      category: null,
      q: null,
      minAmount: null,
      maxAmount: null,
      sort: "date-desc",
      limit: 20,
    },
  });
});

test("Given an all-period query, When parsing discovery filters, Then month and year are not required", () => {
  const result = parseExpenseDiscoveryQuery(
    new URLSearchParams("period=all&category=%20Makan%20&q=%20Nasi%20Goreng%20&minAmount=0&maxAmount=25000&sort=amount-asc&limit=5"),
    new Date("2026-10-05T12:00:00Z"),
  );

  assert.deepEqual(result, {
    ok: true,
    value: {
      period: "all",
      month: null,
      year: null,
      category: "Makan",
      q: "Nasi Goreng",
      minAmount: 0,
      maxAmount: 25000,
      sort: "amount-asc",
      limit: 5,
    },
  });
});

test("Given invalid ranges or values, When parsing discovery filters, Then parsing rejects before a database query can be built", () => {
  const invalidQueries = [
    "period=week",
    "month=13",
    "year=1969",
    "minAmount=-1",
    "maxAmount=1.5",
    "minAmount=20&maxAmount=10",
    "sort=created-desc",
    "limit=51",
    "q=%20%20",
  ];

  for (const query of invalidQueries) {
    const result = parseExpenseDiscoveryQuery(
      new URLSearchParams(query),
      new Date("2026-10-05T12:00:00Z"),
    );

    assert.equal(result.ok, false, query);
    assert.match(result.error, /^(period|month|year|minAmount|maxAmount|sort|limit|q) /, query);
  }
});

test("Given trusted identity and untrusted query-like input, When building the Prisma query, Then user_id is always forced from trusted identity", () => {
  const filters = parseExpenseDiscoveryQuery(
    new URLSearchParams("period=month&month=10&year=2026&category=Makan&q=nasi&minAmount=1000&maxAmount=50000&sort=amount-desc&limit=7&user_id=attacker"),
    new Date("2026-10-05T12:00:00Z"),
  );

  assert.equal(filters.ok, true);

  const query = buildExpenseDiscoveryQuery("trusted-user-id", filters.value);

  assert.deepEqual(query, {
    where: {
      user_id: "trusted-user-id",
      date: {
        gte: new Date("2026-10-01T00:00:00.000Z"),
        lt: new Date("2026-11-01T00:00:00.000Z"),
      },
      category: "Makan",
      amount: { gte: 1000, lte: 50000 },
      OR: [
        { description: { contains: "nasi", mode: "insensitive" } },
        { category: { contains: "nasi", mode: "insensitive" } },
      ],
    },
    orderBy: [{ amount: "desc" }, { id: "desc" }],
    take: 7,
  });
});
