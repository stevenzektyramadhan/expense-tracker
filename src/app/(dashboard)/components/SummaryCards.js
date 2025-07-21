"use client";

import { formatCurrency } from "@/lib/utils";

export default function SummaryCards({ totalExpenses, totalTransactions }) {
  const average = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Pengeluaran */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5 flex items-center">
          <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
            <p className="text-lg font-medium text-gray-900">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Total Transaksi */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5 flex items-center">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
            <p className="text-lg font-medium text-gray-900">{totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Rata-rata */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5 flex items-center">
          <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Rata-rata per Transaksi</p>
            <p className="text-lg font-medium text-gray-900">{formatCurrency(average)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
