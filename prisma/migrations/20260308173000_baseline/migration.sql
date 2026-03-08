-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "receipt_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "allowance_id" UUID,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allowances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "remaining" DECIMAL(12,2) NOT NULL,
    "frequency" VARCHAR(10) NOT NULL DEFAULT 'monthly',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allowances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additional_incomes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "allowance_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "additional_incomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "additional_incomes_user_id_date_idx" ON "additional_incomes"("user_id", "date" DESC);

-- CreateIndex
CREATE INDEX "additional_incomes_allowance_id_idx" ON "additional_incomes"("allowance_id");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_allowance_id_fkey" FOREIGN KEY ("allowance_id") REFERENCES "allowances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "additional_incomes" ADD CONSTRAINT "additional_incomes_allowance_id_fkey" FOREIGN KEY ("allowance_id") REFERENCES "allowances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
