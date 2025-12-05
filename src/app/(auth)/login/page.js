"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Selamat Datang</p>
          <h2 className="text-3xl font-bold text-gray-900">Masuk ke Akun Anda</h2>
          <p className="text-sm text-gray-600">
            Atau{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              daftar akun baru
            </Link>
          </p>
        </div>

        <form className="mt-4 space-y-6 bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 border border-gray-100" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-800">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-800">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Lupa kata sandi?</span>
            <Link href="/forgot-password" className="text-indigo-600 font-semibold hover:text-indigo-500">
              Reset di sini
            </Link>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
