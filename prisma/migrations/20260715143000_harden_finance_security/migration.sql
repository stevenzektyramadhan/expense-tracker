-- Harden finance tables with indexes, uniqueness, and Supabase RLS policies.
--
-- Production safety:
-- 1. Run DATABASE_PREFLIGHT_CHECKS.sql first against the target Supabase project.
-- 2. Confirm duplicate allowance rows do not exist before applying the unique index.
-- 3. Confirm orphan finance rows are understood before tightening access policies.
-- 4. Do not run destructive cleanup automatically from this migration.

-- ---------------------------------------------------------------------------
-- Performance indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "expenses_user_id_date_idx"
ON "public"."expenses" ("user_id", "date" DESC);

CREATE INDEX IF NOT EXISTS "expenses_allowance_id_idx"
ON "public"."expenses" ("allowance_id");

CREATE INDEX IF NOT EXISTS "allowances_user_id_year_month_idx"
ON "public"."allowances" ("user_id", "year", "month");

-- ---------------------------------------------------------------------------
-- Data integrity
-- ---------------------------------------------------------------------------
-- Keep one allowance per authenticated user and period. The partial predicate
-- preserves existing nullable legacy rows while enforcing the real app invariant
-- for user-owned rows.

CREATE UNIQUE INDEX IF NOT EXISTS "allowances_user_id_month_year_key"
ON "public"."allowances" ("user_id", "month", "year")
WHERE "user_id" IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."allowances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."additional_incomes" ENABLE ROW LEVEL SECURITY;

-- Expenses policies
DROP POLICY IF EXISTS "Users can view own expenses" ON "public"."expenses";
CREATE POLICY "Users can view own expenses"
ON "public"."expenses"
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can insert own expenses" ON "public"."expenses";
CREATE POLICY "Users can insert own expenses"
ON "public"."expenses"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can update own expenses" ON "public"."expenses";
CREATE POLICY "Users can update own expenses"
ON "public"."expenses"
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = "user_id")
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can delete own expenses" ON "public"."expenses";
CREATE POLICY "Users can delete own expenses"
ON "public"."expenses"
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = "user_id");

-- Allowances policies
DROP POLICY IF EXISTS "Users can view own allowances" ON "public"."allowances";
CREATE POLICY "Users can view own allowances"
ON "public"."allowances"
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can insert own allowances" ON "public"."allowances";
CREATE POLICY "Users can insert own allowances"
ON "public"."allowances"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can update own allowances" ON "public"."allowances";
CREATE POLICY "Users can update own allowances"
ON "public"."allowances"
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = "user_id")
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can delete own allowances" ON "public"."allowances";
CREATE POLICY "Users can delete own allowances"
ON "public"."allowances"
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = "user_id");

-- Additional incomes policies
DROP POLICY IF EXISTS "Users can view own additional incomes" ON "public"."additional_incomes";
CREATE POLICY "Users can view own additional incomes"
ON "public"."additional_incomes"
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can insert own additional incomes" ON "public"."additional_incomes";
CREATE POLICY "Users can insert own additional incomes"
ON "public"."additional_incomes"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can update own additional incomes" ON "public"."additional_incomes";
CREATE POLICY "Users can update own additional incomes"
ON "public"."additional_incomes"
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = "user_id")
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can delete own additional incomes" ON "public"."additional_incomes";
CREATE POLICY "Users can delete own additional incomes"
ON "public"."additional_incomes"
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = "user_id");
