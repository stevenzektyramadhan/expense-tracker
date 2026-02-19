"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const MobileSummary = dynamic(() => import("@/components/mobile/MobileSummary"), { ssr: false });

export default function SummaryPage() {
  const { user, loading } = useAuth();
  const { isMobile, isReady } = useIsMobile();
  const router = useRouter();

  const [monthlyData, setMonthlyData] = useState([]);
  const [currentMonthData, setCurrentMonthData] = useState({
    total: 0,
    categories: [],
    chartData: [],
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  
  // ✅ Store category data per month (from API)
  const [categoryByMonth, setCategoryByMonth] = useState({});

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // ✅ Updated to work with pre-aggregated data from API
  const updateCurrentMonthData = useCallback((monthKey, categoryData, monthTotal) => {
    // Calculate percentages for each category
    const categories = categoryData.map((cat) => ({
      name: cat.name,
      amount: cat.amount,
      percentage: monthTotal > 0 ? ((cat.amount / monthTotal) * 100).toFixed(1) : 0,
    }));

    // Format data for pie chart
    const chartData = categories.map((cat) => ({
      name: cat.name,
      value: cat.amount,
    }));

    setCurrentMonthData({
      total: monthTotal,
      categories,
      chartData,
    });
  }, []);

  // ✅ Refactored to use the new /api/summary endpoint
  // This is MUCH more efficient because:
  // 1. Database does all the grouping and summing (not JavaScript)
  // 2. Only aggregated results are sent over the network (tiny payload)
  // 3. No memory overhead from loading thousands of raw expense records
  const fetchSummaryData = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      // ✅ Fetch pre-aggregated data from API
      const response = await authenticatedFetch("/api/summary");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengambil data ringkasan");
      }

      const data = await response.json();

      // ✅ Data already aggregated by the API - no client-side processing needed!
      // Structure: { totalExpense, totalTransactions, expensesByCategory, expensesByMonth, categoryByMonth }
      
      // Store monthly data directly from API (no transformation needed)
      setMonthlyData(data.expensesByMonth);
      setCategoryByMonth(data.categoryByMonth);

      // Set current month as default, or use the first available month
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const currentMonthSummary = data.expensesByMonth.find((m) => m.key === currentMonthKey);

      if (currentMonthSummary) {
        setSelectedMonth(currentMonthKey);
        const catData = data.categoryByMonth[currentMonthKey] || [];
        updateCurrentMonthData(currentMonthKey, catData, currentMonthSummary.total);
      } else if (data.expensesByMonth.length > 0) {
        const firstMonth = data.expensesByMonth[0];
        setSelectedMonth(firstMonth.key);
        const catData = data.categoryByMonth[firstMonth.key] || [];
        updateCurrentMonthData(firstMonth.key, catData, firstMonth.total);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
      alert(error.message || "Gagal mengambil data ringkasan");
    } finally {
      setLoadingData(false);
    }
  }, [updateCurrentMonthData, user]);

  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user, fetchSummaryData]);

  // ✅ Updated to use categoryByMonth from API response
  const handleMonthChange = (monthKey) => {
    setSelectedMonth(monthKey);
    const monthData = monthlyData.find((m) => m.key === monthKey);
    if (monthData) {
      const catData = categoryByMonth[monthKey] || [];
      updateCurrentMonthData(monthKey, catData, monthData.total);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!isReady || loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <>
      {!isMobile && <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ringkasan Bulanan</h1>
          <p className="text-gray-600">Lihat pengeluaran Anda berdasarkan bulan dan kategori</p>
        </div>

        {monthlyData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data pengeluaran</h3>
            <p className="text-gray-600 mb-4">Mulai catat pengeluaran Anda untuk melihat ringkasan</p>
            <button onClick={() => router.push("/add")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Tambah Pengeluaran
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Month Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Bulan</label>
              <select value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {monthlyData.map((month) => (
                  <option key={month.key} value={month.key}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Month Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{monthlyData.find((m) => m.key === selectedMonth)?.label}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories List */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Pengeluaran per Kategori</h3>
                  <div className="space-y-3">
                    {currentMonthData.categories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-600 font-semibold">{formatCurrency(category.amount)}</p>
                          <p className="text-sm text-gray-600">{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={currentMonthData.chartData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {currentMonthData.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Bulanan</h3>
              <div className="space-y-3">
                {monthlyData.map((month) => (
                  <div key={month.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{month.label}</p>
                      <p className="text-sm text-gray-600">{month.transactionCount} transaksi</p>
                    </div>
                    <p className="text-blue-600 font-semibold">{formatCurrency(month.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>}

      {isMobile && monthlyData.length > 0 ? (
        <div>
          <MobileSummary monthlyData={monthlyData} selectedMonth={selectedMonth} onMonthChange={handleMonthChange} currentMonthData={currentMonthData} />
        </div>
      ) : isMobile ? (
        <div className="text-center py-12 px-4">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-white mb-2">Belum ada data pengeluaran</h3>
          <p className="text-gray-400 mb-4">Mulai catat pengeluaran Anda untuk melihat ringkasan</p>
          <button onClick={() => router.push("/add")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Tambah Pengeluaran
          </button>
        </div>
      ) : null}
    </>
  );
}
