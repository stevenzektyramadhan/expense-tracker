"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import AuthShell from "@/features/auth/AuthShell";
import PasswordField from "@/features/auth/PasswordField";
import { signIn } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setFormError(error.message || "Akun belum dapat diakses. Coba lagi.");
        return;
      }

      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Selamat datang kembali"
      description="Masuk untuk melihat sisa uang saku dan melanjutkan pencatatan."
      footer={
        <p>
          Belum punya akun?{" "}
          <Link href="/register" className="auth-link">
            Buat akun
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {formError ? (
          <StatusBanner
            className="auth-form__status"
            tone="error"
            title="Akun belum dapat diakses"
          >
            {formError}
          </StatusBanner>
        ) : null}

        <FormField label="Alamat email" id="login-email" required>
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
          id="login-password"
          name="password"
          label="Kata sandi"
          autoComplete="current-password"
          required
          placeholder="Kata sandi akun"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (formError) setFormError("");
          }}
          disabled={loading}
        />

        <div className="auth-form__support">
          <span aria-hidden="true" />
          <Link href="/forgot-password" className="auth-link">
            Lupa kata sandi?
          </Link>
        </div>

        <Button
          className="auth-form__submit"
          type="submit"
          fullWidth
          isLoading={loading}
          loadingLabel="Memeriksa…"
        >
          Masuk
        </Button>
      </form>
    </AuthShell>
  );
}
