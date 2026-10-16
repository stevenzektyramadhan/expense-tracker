"use client";

import ExpenseForm from "@/features/expenses/ExpenseForm";
import useDashboardData from "@/features/dashboard/useDashboardData";
import { useAuth } from "@/hooks/useAuth";

export default function AddExpensePage() {
  const { user } = useAuth();
  const { frequentExpenseCategories } = useDashboardData({
    userId: user?.id || null,
  });

  return <ExpenseForm frequentExpenseCategories={frequentExpenseCategories} />;
}
