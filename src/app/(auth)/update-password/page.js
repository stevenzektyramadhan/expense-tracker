"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // Check if user arrived via valid password reset flow
  useEffect(() => {
    const checkSession = async () => {
      // Supabase handles the token exchange via auth callback
      // At this point, user should already have a valid session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast.error("Sesi tidak valid. Silakan minta link reset password baru.");
        router.push("/forgot-password");
        return;
      }
      
      setSessionReady(true);
      setCheckingSession(false);
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok. Periksa kembali.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Gagal mengubah password.");
    } else {
      toast.success("Password berhasil diubah!");
      // Sign out the user so they can log in with new password
      await supabase.auth.signOut();
      router.push("/login");
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // Show form only when session is ready
  if (!sessionReady) {
    return null;
  }

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
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Password Baru</h1>
            </div>
            <p className="text-sm text-gray-500">
              Masukkan password baru untuk akun{" "}
              <span className="text-orange-500">kite</span>
              <span className="text-blue-600">Catat</span> Anda.
            </p>
          </div>
        </div>

        {/* Update Password Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Password Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white/50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Konfirmasi Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white/50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password match indicator */}
            {confirmPassword && (
              <p className={`text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {newPassword === confirmPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
              </p>
            )}
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
                Menyimpan...
              </>
            ) : (
              "Simpan Password"
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Setelah password diubah, Anda akan dialihkan ke halaman login.
          </p>
        </div>
      </div>
    </div>
  );
}
