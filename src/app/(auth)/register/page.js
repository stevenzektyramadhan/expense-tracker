"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import AuthShell from "@/features/auth/AuthShell";
import PasswordField from "@/features/auth/PasswordField";
import { signUp } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  const validatePassword = (value) =>
    value.length < 6
      ? "Kata sandi terlalu pendek. Gunakan minimal 6 karakter."
      : "";

  const validateConfirmation = (value) =>
    value !== password
      ? "Kata sandi tidak sama. Ketik ulang kata sandi yang sama."
      : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextPasswordError = validatePassword(password);
    const nextConfirmationError = validateConfirmation(confirmPassword);

    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmationError);
    setFormError("");

    if (nextPasswordError || nextConfirmationError) return;

    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        setFormError(error.message || "Akun belum dapat dibuat. Coba lagi.");
        return;
      }

      setIsRegistered(true);
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat akun kiteCatat"
      description="Mulai catatan keuangan pribadi dengan alamat email Anda."
      footer={
        <p>
          Sudah punya akun?{" "}
          <Link href="/login" className="auth-link">
            Masuk
          </Link>
        </p>
      }
    >
      {isRegistered ? (
        <div className="auth-success-panel">
          <StatusBanner tone="success" title="Akun berhasil dibuat">
            Periksa email untuk verifikasi. Anda akan dialihkan ke halaman
            masuk.
          </StatusBanner>
          <Link href="/login" className="ui-button" data-variant="secondary">
            Buka halaman masuk
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {formError ? (
            <StatusBanner
              className="auth-form__status"
              tone="error"
              title="Akun belum dapat dibuat"
            >
              {formError}
            </StatusBanner>
          ) : null}

          <FormField label="Nama lengkap" id="register-name" required>
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Nama yang Anda gunakan"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={loading}
            />
          </FormField>

          <FormField label="Alamat email" id="register-email" required>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (formError) setFormError("");
              }}
              disabled={loading}
            />
          </FormField>

          <PasswordField
            id="register-password"
            name="password"
            label="Kata sandi"
            autoComplete="new-password"
            required
            placeholder="Minimal 6 karakter"
            helperText="Gunakan minimal 6 karakter."
            value={password}
            error={passwordError}
            onBlur={() => setPasswordError(validatePassword(password))}
            onChange={(event) => {
              const nextValue = event.target.value;
              setPassword(nextValue);
              if (passwordError) setPasswordError(validatePassword(nextValue));
              if (confirmPassword) {
                setConfirmPasswordError(
                  confirmPassword === nextValue
                    ? ""
                    : "Kata sandi tidak sama. Ketik ulang kata sandi yang sama.",
                );
              }
            }}
            disabled={loading}
          />

          <PasswordField
            id="register-password-confirmation"
            name="confirmPassword"
            label="Ulangi kata sandi"
            autoComplete="new-password"
            required
            placeholder="Ketik ulang kata sandi"
            value={confirmPassword}
            error={confirmPasswordError}
            onBlur={() =>
              setConfirmPasswordError(
                validateConfirmation(confirmPassword),
              )
            }
            onChange={(event) => {
              const nextValue = event.target.value;
              setConfirmPassword(nextValue);
              if (confirmPasswordError) {
                setConfirmPasswordError(
                  nextValue === password
                    ? ""
                    : "Kata sandi tidak sama. Ketik ulang kata sandi yang sama.",
                );
              }
            }}
            disabled={loading}
          />

          <Button
            className="auth-form__submit"
            type="submit"
            fullWidth
            isLoading={loading}
            loadingLabel="Membuat akun…"
          >
            Buat akun
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
