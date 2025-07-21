"use client";

import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";

export default function ExpenseListItem({ expense, onClick }) {
  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => onClick(expense)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>{expense.category}</span>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{expense.description || "Tidak ada deskripsi"}</div>
            <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
      </div>
    </li>
  );
}
