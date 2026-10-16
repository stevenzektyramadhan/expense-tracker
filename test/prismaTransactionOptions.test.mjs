import assert from "node:assert/strict";

import { transactionOptions } from "../src/lib/prisma.js";

assert.deepEqual(transactionOptions, {
  maxWait: 10_000,
});

console.log("prisma transaction options keep expense edits waiting longer than Prisma defaults");
