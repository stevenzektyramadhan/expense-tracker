"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [tokenReady, setTokenReady] = useState(false);
  const [loading, setLoading] = useState(false); // <- loading state

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1)); // Remove "#"

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        Swal.fire("Error", "Token tidak ditemukan. Link mungkin sudah kadaluarsa.", "error");
        return;
      }

      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            Swal.fire("Gagal", "Token tidak valid atau kadaluarsa.", "error");
          } else {
            setTokenReady(true);
          }
        })
        .catch(() => {
          Swal.fire("Error", "Gagal mengatur sesi pengguna.", "error");
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      Swal.fire("Oops!", "Password baru tidak boleh kosong.", "warning");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      Swal.fire("Gagal", error.message, "error");
    } else {
      Swal.fire("Berhasil", "Password berhasil diubah.", "success").then(() => {
        router.push("/login");
      });
    }
  };

  if (!tokenReady) {
    return <p className="text-center mt-10 text-gray-500">Memuat...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4 text-black">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" placeholder="Password baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded text-black" disabled={loading} />
        <button type="submit" disabled={loading} className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? "Mengubah..." : "Ubah Password"}
        </button>
      </form>
    </div>
  );
}
