import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// =============================================================================
// AUTH CALLBACK ROUTE (handles password reset, magic links, OAuth)
// =============================================================================
// URL: /auth/callback?code=xxx&next=/update-password
//
// FLOW:
// 1. User clicks link in email → arrives here with ?code=xxx
// 2. Exchange code for session via exchangeCodeForSession()
// 3. Session is stored in cookies
// 4. Redirect to "next" page (e.g., /update-password)

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/summary";

  if (code) {
    // CRITICAL for Next.js 16+: cookies() is async and must be awaited
    const cookieStore = await cookies();

    // Create server-side Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          // Get a specific cookie by name
          get(name) {
            return cookieStore.get(name)?.value;
          },
          // Set a cookie
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore errors in Server Components (read-only context)
            }
          },
          // Remove a cookie
          remove(name, options) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Ignore errors in Server Components
            }
          },
        },
      }
    );

    // Exchange the authorization code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success! Redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Log error for debugging
    console.error("Auth callback error:", error.message);
  }

  // Redirect to login with error if code is missing or exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
