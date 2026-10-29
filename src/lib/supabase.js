import { createBrowserClient } from "@supabase/ssr";

async function browserAuthLock(name, acquireTimeout, fn) {
  if (typeof navigator === "undefined" || !navigator.locks?.request) {
    return await fn();
  }
  const options =
    acquireTimeout === 0
      ? { mode: "exclusive", ifAvailable: true }
      : { mode: "exclusive" };
  return await navigator.locks.request(name, options, async (lock) => {
    if (!lock) return undefined;
    return await fn();
  });
}

let browserClient = null;

export function createClient() {
  if (typeof window !== "undefined" && browserClient) {
    return browserClient;
  }
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        lock: browserAuthLock,
      },
    }
  );
  if (typeof window !== "undefined") {
    browserClient = client;
  }
  return client;
}

export const supabase = createClient();
