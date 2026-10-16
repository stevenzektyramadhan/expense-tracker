# Improvement roadmap

Status: planned. This roadmap separates local, reversible code work from database and production operations that require explicit approval.

## Locked invariants

- Finance calculations remain server-authoritative:

  ```text
  allowances.amount = base allowance + total additional incomes
  allowances.remaining = allowances.amount - total linked expenses
  ```

- The server derives the authenticated user and verifies ownership for every mutation.
- Existing API routes, Supabase Auth flows, PWA behavior, and legacy receipt URLs remain supported.
- No migration is applied to Supabase production by this roadmap or its code changes.

## Milestone 1: mutation and receipt security

Files: `src/lib/supabaseServer.js`, new mutation guard utility, all non-GET handlers under `src/app/api/`, `src/features/expenses/useExpenseForm.js`, `prisma/schema.prisma`, and a new forward migration.

- Distinguish bearer authentication from cookie authentication. Require an exact server-configured origin only for cookie-authenticated mutations; bearer requests remain supported for the existing client.
- Add nullable `expenses.receipt_public_id`. New expense creation verifies the Cloudinary asset owner and folder server-side, then stores the canonical URL and public ID. Client values are not authoritative.
- Enable removal only for mapped receipts owned by the current user. Legacy URL-only receipts remain readable and fail closed for deletion.

Validation: focused route-level regression checks, `npx prisma generate`, `npm run lint`, `npm run build`, and manual bearer/cookie mutation probes.

Rollback: do not apply the migration; deployed application code continues to accept null `receipt_public_id` values.

## Milestone 2: regression safety net

Files: `package.json`, a minimal test runner configuration only if required, and targeted tests beside finance/server utilities.

- Lock authorization, mutation-origin decisions, overspending rejection, and allowance recalculation before broad feature work.
- Add one integration-level scenario for each finance mutation shape when a safe local database setup is available.

Validation: tests run in CI and locally, followed by lint and production build.

## Milestone 3: database hardening rollout

Files: `prisma/migrations/20260715143000_harden_finance_security/migration.sql` and an accompanying read-only preflight script/document.

- Run duplicate-allowance and orphan-row preflight checks in the exact target environment.
- Review backup, target project, and RLS behavior with two test users before applying the already-reviewed hardening migration.

Production gate: explicit user approval is required after reviewing the exact SQL, preflight results, backup status, and target environment. This milestone is not automated.

## Milestone 4: budget controls and transaction discovery

Files likely include a new `src/features/budgets/` owner, dashboard selectors, transaction section components, and dedicated API/schema changes when finalized.

- Add per-category monthly budgets with clear spent, remaining, and threshold states.
- Add server-backed filtering by period, category, amount range, and text search; do not filter only a partial client dataset.
- Keep desktop table and mobile card presentations on one data/mutation source.

Validation: category limit and filter combinations, empty/loading/error states, plus mobile and desktop viewport checks.

## Milestone 5: scheduled and portable data

Files likely include a recurring-transaction feature, a scheduled server execution strategy, reporting export utilities, and summary/transaction route consumers.

- Add recurring income and expense templates only with an idempotent schedule key and a server-side runner; never rely on a browser being open.
- Add CSV export for the active filtered result before considering PDF export.

Validation: duplicate-run protection, date-boundary behavior, ownership isolation, and spreadsheet-safe CSV escaping.

## Milestone 6: quick capture

Files likely include the add-expense route, expense form state, and existing PWA/navigation surfaces.

- Provide an optional quick-add path that starts with amount, then recent/frequent category, then save.
- Reuse the current expense validation and API mutation; do not create a second financial write path or claim offline mutation support.

Validation: 360x800 and 390x844 touch checks, safe-area behavior, keyboard focus, slow-network loading, and standard expense regression tests.

## Sequence

Implement and release each milestone independently: security first, tests second, production hardening only after approval, then budget/discovery, scheduled/export, and quick capture. Deprecated or legacy code is not deleted as part of this roadmap without separate approval.
