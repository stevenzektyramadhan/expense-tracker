"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Loader2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Masukkan email Anda.");
      return;
    }

    setLoading(true);

    // Redirect URL points to our auth callback, which then redirects to update-password
    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Gagal mengirim link reset.");
    } else {
      setEmailSent(true);
      toast.success("Link reset password telah dikirim ke email Anda!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Glassmorphism Card */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
        {/* Logo & Header */}
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/kitecatat_pwa_192.png"
            alt="kiteCatat Logo"
            width={50}
            height={50}
            className="rounded-xl shadow-md"
          />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <KeyRound className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Lupa Password?</h1>
            </div>
            <p className="text-sm text-gray-500">
              Masukkan email yang terdaftar di{" "}
              <span className="text-orange-500">kite</span>
              <span className="text-blue-600">Catat</span>.
            </p>
          </div>
        </div>

        {emailSent ? (
          // Success State
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                Email Terkirim!
              </h3>
              <p className="text-sm text-green-600">
                Cek inbox atau folder spam di <strong>{email}</strong> untuk link reset password.
              </p>
            </div>
            <button
              onClick={() => setEmailSent(false)}
              className="w-full py-3 px-4 text-blue-600 font-medium border border-blue-200 rounded-xl hover:bg-blue-50 transition duration-200"
            >
              Kirim Ulang ke Email Berbeda
            </button>
          </div>
        ) : (
          // Form State
          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Kirim Link Reset"
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-200">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
