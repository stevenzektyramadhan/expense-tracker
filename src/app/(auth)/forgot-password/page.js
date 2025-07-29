// src/app/(auth)/forgot-password/page.js
import { Suspense } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10 text-gray-500">Memuat formulir...</p>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
