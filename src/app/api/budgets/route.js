import prisma from "@/lib/prisma";
import { requireAllowedMutationOrigin } from "@/lib/mutationOrigin";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";
import {
  buildCategoryBudgetPeriodRange,
  calculateCategoryBudgetStatus,
  parseCategoryBudgetInput,
  parseCategoryBudgetPeriod,
} from "@/lib/categoryBudget.mjs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const response = (payload, status = 200) => new Response(JSON.stringify(payload), { status });

const serializeBudget = (budget, spent) => ({
  ...budget,
  ...calculateCategoryBudgetStatus(budget.amount, spent),
});

const getBudgetSpending = async (userId, budgets, period) => {
  if (!budgets.length) return new Map();

  const spending = await prisma.expenses.groupBy({
    by: ["category"],
    where: {
      user_id: userId,
      category: { in: budgets.map((budget) => budget.category) },
      date: { gte: period.start, lt: period.end },
    },
    _sum: { amount: true },
  });

  return new Map(spending.map((item) => [item.category, item._sum.amount ?? 0]));
};

const getSingleBudgetSpending = async (userId, category, period) => {
  const result = await prisma.expenses.aggregate({
    where: {
      user_id: userId,
      category,
      date: { gte: period.start, lt: period.end },
    },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
};

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const parsedPeriod = parseCategoryBudgetPeriod(new URL(req.url).searchParams);
    if (!parsedPeriod.ok) return response({ error: parsedPeriod.error }, 400);

    const { month, year } = parsedPeriod.value;
    const budgets = await prisma.category_monthly_budgets.findMany({
      where: { user_id: user.id, month, year },
      orderBy: { category: "asc" },
    });
    const spending = await getBudgetSpending(user.id, budgets, buildCategoryBudgetPeriodRange(year, month));

    return response({ data: budgets.map((budget) => serializeBudget(budget, spending.get(budget.category) ?? 0)) });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return response({ error: "Unable to load budgets" }, 500);
  }
}

export async function PUT(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const body = await req.json();
    const parsedBudget = parseCategoryBudgetInput(body);
    if (!parsedBudget.ok) return response({ error: parsedBudget.error }, 400);

    const { month, year, category, amount } = parsedBudget.value;
    const budget = await prisma.category_monthly_budgets.upsert({
      where: {
        user_id_year_month_category: { user_id: user.id, year, month, category },
      },
      create: { user_id: user.id, year, month, category, amount },
      update: { amount, updated_at: new Date() },
    });
    const spent = await getSingleBudgetSpending(user.id, category, buildCategoryBudgetPeriodRange(year, month));

    return response(serializeBudget(budget, spent));
  } catch (error) {
    console.error("Budgets PUT error:", error);
    return response({ error: "Unable to save budget" }, 500);
  }
}

export async function DELETE(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { id } = await req.json();
    if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
      return response({ error: "id must be a UUID" }, 400);
    }

    const deleted = await prisma.category_monthly_budgets.deleteMany({
      where: { id, user_id: user.id },
    });
    if (deleted.count !== 1) return response({ error: "Budget not found" }, 404);

    return response({ success: true });
  } catch (error) {
    console.error("Budgets DELETE error:", error);
    return response({ error: "Unable to delete budget" }, 500);
  }
}
