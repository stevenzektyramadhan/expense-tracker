import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10 text-gray-500">Memuat halaman...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
