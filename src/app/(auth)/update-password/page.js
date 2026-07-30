"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import StatusBanner from "@/components/ui/StatusBanner";
import AuthShell from "@/features/auth/AuthShell";
import PasswordField from "@/features/auth/PasswordField";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error("Sesi tidak valid. Silakan minta tautan reset baru.");
        router.replace("/forgot-password");
        return;
      }

      setSessionReady(true);
      setCheckingSession(false);
    };

    checkSession();
  }, [router]);

  const validatePassword = (value) =>
    value.length < 6
      ? "Kata sandi terlalu pendek. Gunakan minimal 6 karakter."
      : "";

  const validateConfirmation = (value) =>
    value !== newPassword
      ? "Kata sandi tidak sama. Ketik ulang kata sandi yang sama."
      : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextPasswordError = validatePassword(newPassword);
    const nextConfirmationError = validateConfirmation(confirmPassword);

    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmationError);
    setFormError("");

    if (nextPasswordError || nextConfirmationError) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      setFormError(
        error.message || "Kata sandi belum dapat diubah. Coba lagi.",
      );
      return;
    }

    toast.success("Kata sandi berhasil diubah. Silakan masuk kembali.");
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (checkingSession) {
    return (
      <AuthShell
        title="Memverifikasi tautan"
        description="Kami memastikan tautan pemulihan masih valid."
      >
        <div
          className="flex min-h-24 items-center gap-3 text-[var(--color-text-muted)]"
          role="status"
        >
          <span className="ui-inline-spinner" aria-hidden="true" />
          <p>Memeriksa sesi pemulihan…</p>
        </div>
      </AuthShell>
    );
  }

  if (!sessionReady) return null;

  return (
    <AuthShell
      title="Buat kata sandi baru"
      description="Setelah disimpan, Anda perlu masuk kembali dengan kata sandi baru."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {formError ? (
          <StatusBanner
            className="auth-form__status"
            tone="error"
            title="Kata sandi belum berubah"
          >
            {formError}
          </StatusBanner>
        ) : null}

        <PasswordField
          id="new-password"
          name="newPassword"
          label="Kata sandi baru"
          autoComplete="new-password"
          required
          placeholder="Minimal 6 karakter"
          helperText="Gunakan minimal 6 karakter."
          value={newPassword}
          error={passwordError}
          onBlur={() => setPasswordError(validatePassword(newPassword))}
          onChange={(event) => {
            const nextValue = event.target.value;
            setNewPassword(nextValue);
            if (passwordError) setPasswordError(validatePassword(nextValue));
            if (confirmPassword) {
              setConfirmPasswordError(
                confirmPassword === nextValue
                  ? ""
                  : "Kata sandi tidak sama. Ketik ulang kata sandi yang sama.",
              );
            }
            if (formError) setFormError("");
          }}
          disabled={loading}
        />

        <PasswordField
          id="new-password-confirmation"
          name="confirmPassword"
          label="Ulangi kata sandi"
          autoComplete="new-password"
          required
          placeholder="Ketik ulang kata sandi baru"
          value={confirmPassword}
          error={confirmPasswordError}
          onBlur={() =>
            setConfirmPasswordError(validateConfirmation(confirmPassword))
          }
          onChange={(event) => {
            const nextValue = event.target.value;
            setConfirmPassword(nextValue);
            if (confirmPasswordError) {
              setConfirmPasswordError(
                nextValue === newPassword
                  ? ""
                  : "Kata sandi tidak sama. Ketik ulang kata sandi yang sama.",
              );
            }
            if (formError) setFormError("");
          }}
          disabled={loading}
        />

        <Button
          className="auth-form__submit"
          type="submit"
          fullWidth
          isLoading={loading}
          loadingLabel="Menyimpan…"
        >
          Simpan kata sandi
        </Button>
      </form>
    </AuthShell>
  );
}
