"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import AuthShell from "@/features/auth/AuthShell";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setEmailError("Alamat email belum diisi. Masukkan email akun Anda.");
      return;
    }

    setEmailError("");
    setFormError("");
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setFormError(
        error.message || "Petunjuk reset belum dapat dikirim. Coba lagi.",
      );
    } else {
      setEmailSent(true);
    }
  };

  return (
    <AuthShell
      title="Atur ulang kata sandi"
      description="Kami akan mengirim petunjuk pemulihan ke alamat email akun Anda."
      footer={
        <Link href="/login" className="auth-link">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Kembali ke halaman masuk
        </Link>
      }
    >
      {emailSent ? (
        <div className="auth-success-panel">
          <StatusBanner tone="success" title="Periksa email Anda">
            Jika <strong>{email}</strong> terhubung dengan akun, petunjuk reset
            akan tersedia di kotak masuk atau folder spam.
          </StatusBanner>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => {
              setEmailSent(false);
              setFormError("");
            }}
          >
            Gunakan email lain
          </Button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {formError ? (
            <StatusBanner
              className="auth-form__status"
              tone="error"
              title="Petunjuk belum terkirim"
            >
              {formError}
            </StatusBanner>
          ) : null}

          <FormField
            label="Alamat email"
            id="reset-email"
            required
            error={emailError}
          >
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@email.com"
              value={email}
              onBlur={() => {
                if (!email.trim()) {
                  setEmailError(
                    "Alamat email belum diisi. Masukkan email akun Anda.",
                  );
                }
              }}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError("");
                if (formError) setFormError("");
              }}
              disabled={loading}
            />
          </FormField>

          <Button
            className="auth-form__submit"
            type="submit"
            fullWidth
            isLoading={loading}
            loadingLabel="Mengirim petunjuk…"
          >
            Kirim petunjuk reset
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
