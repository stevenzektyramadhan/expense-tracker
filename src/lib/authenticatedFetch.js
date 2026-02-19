import { supabase } from "@/lib/supabaseClient";

export async function authenticatedFetch(url, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}
