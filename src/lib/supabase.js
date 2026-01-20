import { createBrowserClient } from "@supabase/ssr";

// =============================================================================
// BROWSER CLIENT (for Client Components - "use client")
// =============================================================================
// This client is used in React components that run in the browser.
// It automatically handles session persistence via cookies.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Export a singleton instance for convenience in client components
export const supabase = createClient();
