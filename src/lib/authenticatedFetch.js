import { supabase } from "@/lib/supabaseClient";

let pendingSessionPromise = null;

function getSharedSession() {
  if (!pendingSessionPromise) {
    pendingSessionPromise = supabase.auth
      .getSession()
      .finally(() => {
        pendingSessionPromise = null;
      });
  }
  return pendingSessionPromise;
}

export async function authenticatedFetch(url, options = {}) {
  const {
    data: { session },
  } = await getSharedSession();

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
