# kiteCatat Expense Tracker

kiteCatat adalah aplikasi web personal finance untuk mencatat uang saku, pengeluaran, pendapatan tambahan, dan ringkasan bulanan. Aplikasi ini memakai Next.js App Router, Supabase Auth/Postgres, Prisma, Cloudinary, dan PWA support.

## Main Features

- Login, register, forgot password, dan update password dengan Supabase Auth.
- Satu dashboard responsif untuk mobile, tablet, dan desktop.
- Atur allowance atau uang saku per periode.
- Tambah, edit, hapus pengeluaran.
- Tambah, edit, hapus pendapatan tambahan.
- Upload struk ke Cloudinary.
- Ringkasan pengeluaran berdasarkan bulan dan kategori.
- PWA service worker dan update prompt.
- API internal session-based untuk data finance.
- Database hardening plan: indexes, unique allowance per periode, dan Supabase RLS policies.

## Tech Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma 7 with PostgreSQL adapter
- Supabase Auth and Postgres
- Cloudinary
- Recharts
- next-pwa

## Project Structure

```text
expense-tracker/
  prisma/
    schema.prisma
    migrations/
  public/
    manifest.json
    sw.js
    workbox-*.js
  src/
    app/
      (auth)/
      (dashboard)/
      api/
      auth/
      globals.css
      layout.js
    components/
      finance/
      mobile/        # focused mobile presentation variants
      navigation/
      ui/
    features/
      auth/
      dashboard/
      expenses/
      income/
      reports/
    hooks/
    lib/
      authenticatedFetch.js
      finance.js
      prisma.js
      supabase.js
      supabaseClient.js
      supabaseServer.js
      utils.js
  next.config.mjs
  package.json
```

## Frontend Architecture

- Routes own one shared data and mutation source; viewport width does not change
  finance queries, validation, or authorization behavior.
- Layout changes primarily through CSS/Tailwind breakpoints.
- Focused presentation variants remain where appropriate, such as desktop
  navigation versus mobile bottom navigation and desktop expense dialog versus
  mobile expense-detail sheet.
- `src/components/mobile/MobileExpenseDetailSheet.js` remains an active
  presentation variant backed by shared dashboard data and actions.
- The replaced mobile page trees were removed after the approved Phase 9
  cleanup. Their checkpoints remain available in Git history for rollback.

## Environment Variables

Create `.env` for local development. Do not commit `.env*`.

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

DATABASE_URL=your-postgres-connection-url
DIRECT_URL=your-direct-postgres-connection-url

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

Notes:

- Only `NEXT_PUBLIC_*` values are exposed to the browser.
- `DATABASE_URL`, `DIRECT_URL`, and Cloudinary secrets must stay server-only.
- Supabase service role keys must not be used in client code.

## Local Setup

Install dependencies:

```powershell
npm install
```

Generate Prisma client:

```powershell
npx prisma generate
```

Run development server:

```powershell
npm.cmd run dev
```

Build production:

```powershell
npm.cmd run build
```

Run production server after build:

```powershell
npm.cmd start
```

## Scripts

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd start
npm.cmd run lint
```

`npm.cmd run lint` runs:

```text
eslint src --max-warnings=0
```

## Database And Supabase Safety

This project uses Supabase Postgres. Treat production data carefully.

Before applying database changes to Supabase production:

1. Confirm the target environment.
2. Confirm a recent backup exists.
3. Run read-only preflight checks first.
4. Review duplicate allowances and orphan/mismatched ownership rows.
5. Apply migrations to local/staging first when available.
6. Apply production changes only after explicit approval.

Do not run these commands against production without explicit approval:

- `supabase db reset`
- `prisma migrate reset`
- `DROP TABLE`
- `DROP SCHEMA`
- `TRUNCATE`
- unscoped `DELETE`
- unscoped `UPDATE`

## Database Hardening

The database hardening migration is:

```text
prisma/migrations/20260715143000_harden_finance_security/migration.sql
```

It adds indexes, a unique allowance index, and RLS policies for finance tables.

The hardening migration is committed as a reviewable file. It has not been applied to Supabase by this agent.

## Finance Rules

Important invariant:

```text
allowances.amount = base allowance + total additional incomes
allowances.remaining = allowances.amount - total linked expenses
```

Client code must not control `user_id`, `remaining`, or `allowance_id` for balance updates.

## Security Review

Security focus areas:

- Broken object level authorization and IDOR.
- Supabase RLS.
- Upload validation and Cloudinary asset ownership.
- CSRF/origin strategy for mutation endpoints.
- XSS from user text fields.
- Secret exposure.
- Dependency audit and supply chain risk.

## Regression Checklist

Minimum checks before release:

```powershell
npm.cmd run lint
npm.cmd run build
```

Also manually review these flows:

- allowance update after expenses/incomes,
- overspending rejection,
- two-user IDOR tests,
- upload abuse tests,
- RLS two-user tests.

## Current Known Residual Risks

- `npm audit` still reports vulnerabilities that require breaking-change dependency decisions around Prisma, Next, and next-pwa transitive dependencies.
- Upload delete is fail-closed until receipt `public_id` ownership mapping is stored in the database.
- CSRF/origin validation for mutation endpoints still needs a dedicated follow-up.
- Automated unit/integration tests are not yet configured.
