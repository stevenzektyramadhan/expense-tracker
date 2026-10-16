CREATE TABLE IF NOT EXISTS "public"."category_monthly_budgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_monthly_budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "category_monthly_budgets_month_check" CHECK ("month" BETWEEN 1 AND 12),
    CONSTRAINT "category_monthly_budgets_amount_check" CHECK ("amount" > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "category_monthly_budgets_user_id_year_month_category_key"
ON "public"."category_monthly_budgets" ("user_id", "year", "month", "category");

CREATE INDEX IF NOT EXISTS "category_monthly_budgets_user_id_year_month_idx"
ON "public"."category_monthly_budgets" ("user_id", "year", "month");

ALTER TABLE "public"."category_monthly_budgets" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own category monthly budgets" ON "public"."category_monthly_budgets";
CREATE POLICY "Users can view own category monthly budgets"
ON "public"."category_monthly_budgets"
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can insert own category monthly budgets" ON "public"."category_monthly_budgets";
CREATE POLICY "Users can insert own category monthly budgets"
ON "public"."category_monthly_budgets"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can update own category monthly budgets" ON "public"."category_monthly_budgets";
CREATE POLICY "Users can update own category monthly budgets"
ON "public"."category_monthly_budgets"
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = "user_id")
WITH CHECK ((SELECT auth.uid()) = "user_id");

DROP POLICY IF EXISTS "Users can delete own category monthly budgets" ON "public"."category_monthly_budgets";
CREATE POLICY "Users can delete own category monthly budgets"
ON "public"."category_monthly_budgets"
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = "user_id");
