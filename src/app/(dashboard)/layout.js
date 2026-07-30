"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/navigation/AppShell";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteksi halaman: jika tidak login, redirect ke /login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Kalau user tidak login (dan sudah redirect), tidak render apapun
  if (!loading && !user) return null;

  return (
    <AppShell user={user} isLoading={loading}>
      {children}
    </AppShell>
  );
}
