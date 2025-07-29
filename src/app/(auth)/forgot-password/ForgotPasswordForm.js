"use client";

import { useState } from "react";
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4 text-black">Lupa Password</h1>
      <form onSubmit={handleResetPassword} className="space-y-4">
        <input type="email" placeholder="Masukkan email Anda" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded text-black" required />
        <button type="submit" disabled={loading} className={`w-full py-2 rounded text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? (
            <span className="flex justify-center items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengirim...
            </span>
          ) : (
            "Kirim Link Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
