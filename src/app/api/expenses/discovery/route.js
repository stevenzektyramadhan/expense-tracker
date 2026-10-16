import prisma from "@/lib/prisma";
import {
  buildExpenseDiscoveryQuery,
  parseExpenseDiscoveryQuery,
} from "@/lib/expenseDiscovery.mjs";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const parsed = parseExpenseDiscoveryQuery(searchParams);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), { status: 400 });
    }

    const query = buildExpenseDiscoveryQuery(user.id, parsed.value);
    const [data, aggregate, categories] = await Promise.all([
      prisma.expenses.findMany(query),
      prisma.expenses.aggregate({
        where: query.where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.expenses.groupBy({
        by: ["category"],
        where: query.where,
        _count: { id: true },
        _sum: { amount: true },
        orderBy: { category: "asc" },
      }),
    ]);

    return Response.json({
      data,
      pageInfo: {
        limit: parsed.value.limit,
        returned: data.length,
      },
      totals: {
        count: aggregate._count.id,
        amount: aggregate._sum.amount ?? 0,
      },
      facets: {
        categories: categories.map((category) => ({
          category: category.category,
          count: category._count.id,
          amount: category._sum.amount ?? 0,
        })),
      },
    });
  } catch (err) {
    console.error("Expense discovery GET error:", err);
    return new Response(JSON.stringify({ error: "Unable to load expenses" }), { status: 500 });
  }
}
