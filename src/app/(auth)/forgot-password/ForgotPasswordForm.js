"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectTo = process.env.NEXT_PUBLIC_REDIRECT_URL;

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire("Oops!", "Masukkan email Anda", "warning");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      Swal.fire("Gagal!", error.message, "error");
    } else {
      Swal.fire("Berhasil!", "Link reset dikirim ke email Anda.", "success");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Pemulihan Akun</p>
          <h1 className="text-3xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-sm text-gray-600">Kami akan mengirimkan link reset ke email kamu.</p>
        </div>

        <form onSubmit={handleResetPassword} className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-6 sm:p-8 space-y-5 border border-gray-100">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-800">
              Email terdaftar
            </label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Mengirim...
              </span>
            ) : (
              "Kirim Link Reset Password"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Ingat kata sandi?{` `}
          <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-500">
            Kembali ke login
          </Link>
        </p>
      </div>
    </div>
  );
}
