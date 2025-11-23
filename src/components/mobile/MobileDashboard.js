"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "./icons";
import MobileShell from "./MobileShell";

const formatCurrency = (amount = 0) => new Intl.NumberFormat("id-ID").format(amount);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const getMonthName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const getCategoryColor = (category) => {
  const colors = {
    Transportasi: "bg-blue-500",
    Makanan: "bg-green-500",
    Belanja: "bg-purple-500",
    Hiburan: "bg-pink-500",
    Kesehatan: "bg-red-500",
    Lainnya: "bg-gray-500",
  };
  return colors[category] || "bg-gray-500";
};

export default function MobileDashboard({ user, expenses = [], allowance }) {
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchDesc, setSearchDesc] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const uniqueMonths = useMemo(() => [...new Set(expenses.map((e) => getMonthName(e.date)))], [expenses]);
  const categories = useMemo(() => {
    const unique = new Set(expenses.map((e) => e.category));
    return unique.size ? Array.from(unique) : ["Makanan", "Transportasi", "Lainnya"];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (filterMonth !== "all") {
      filtered = filtered.filter((e) => getMonthName(e.date) === filterMonth);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }

    if (searchDesc) {
      filtered = filtered.filter((e) => e.description?.toLowerCase().includes(searchDesc.toLowerCase()));
    }

    filtered.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.date) - new Date(a.date);
      return new Date(a.date) - new Date(b.date);
    });

    return filtered;
  }, [expenses, filterCategory, filterMonth, searchDesc, sortOrder]);

  const currentMonthLabel = useMemo(
    () => new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    []
  );

  const totalExpense = useMemo(
    () =>
      expenses
        .filter((e) => getMonthName(e.date) === currentMonthLabel)
        .reduce((sum, e) => sum + (e.amount || 0), 0),
    [currentMonthLabel, expenses]
  );

  const avgPerTransaction = filteredExpenses.length > 0 ? totalExpense / filteredExpenses.length : 0;
  const monthlyBudget = allowance?.amount || 0;
  const remainingBudget = allowance?.remaining ?? monthlyBudget - totalExpense;

  return (
    <MobileShell>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold">{user?.email || "Pengguna"}</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" aria-hidden />
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 mb-4">
          <p className="text-white text-sm mb-2 opacity-90">Balance</p>
          <h2 className="text-4xl font-bold text-white">Rp {formatCurrency(remainingBudget)}</h2>
        </div>

        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-3xl p-6 mb-6">
          <p className="text-white text-sm mb-2 opacity-90">Total Pengeluaran</p>
          <h3 className="text-2xl font-bold text-white">Rp {formatCurrency(totalExpense)}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-600 rounded-2xl p-4">
            <p className="text-white text-xs mb-1 opacity-90">Total Transaksi</p>
            <p className="text-2xl font-bold text-white">{expenses.length}</p>
          </div>
          <div className="bg-purple-600 rounded-2xl p-4">
            <p className="text-white text-xs mb-1 opacity-90">Rata-rata Transaksi</p>
            <p className="text-lg font-bold text-white">Rp {formatCurrency(Math.round(avgPerTransaction))}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={searchDesc}
              onChange={(e) => setSearchDesc(e.target.value)}
              placeholder="Search here"
              className="bg-transparent text-white outline-none w-full text-sm placeholder-gray-500"
            />
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-3" aria-hidden>
            <ChevronDown className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="all">Semua Bulan</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="newest">Tanggal terbaru</option>
            <option value="oldest">Tanggal terlama</option>
          </select>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Transactions</h3>
            <span className="text-purple-400 text-sm flex items-center">
              Sort by: {sortOrder === "newest" ? "Latest" : "Oldest"} <ChevronDown className="w-4 h-4 ml-1" />
            </span>
          </div>

          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="bg-gray-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getCategoryColor(expense.category)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg">💰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{expense.description || "Tidak ada deskripsi"}</h4>
                    <p className="text-gray-400 text-xs">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{expense.category}</p>
                  <p className="text-green-400 text-xs">Rp {formatCurrency(expense.amount)}</p>
                </div>
              </div>
            ))}

            {filteredExpenses.length === 0 && (
              <div className="text-center text-gray-400 py-8">Belum ada pengeluaran untuk filter ini.</div>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
