"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || "Login gagal. Silakan coba lagi.");
    } else {
      toast.success("Login berhasil! Mengalihkan...");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Glassmorphism Card */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/kitecatat_pwa_192.png"
            alt="kiteCatat Logo"
            width={60}
            height={60}
            className="rounded-xl shadow-md"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              Selamat Datang di{" "}
              <span className="text-orange-500">kite</span>
              <span className="text-blue-600">Catat</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white/50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition"
            >
              Lupa Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition"
            >
              Daftar disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
