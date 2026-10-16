import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { selectAuthenticatedUser } from "@/lib/mutationSecurity.mjs";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignore write errors in read-only contexts.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Ignore write errors in read-only contexts.
          }
        },
      },
    }
  );
}

const supabasePublicClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const getBearerToken = (request) => {
  const authHeader = request?.headers?.get("authorization") || request?.headers?.get("Authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
};

export async function requireAuthenticatedUser(request) {
  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    const {
      data: { user: bearerUser },
      error: bearerError,
    } = await supabasePublicClient.auth.getUser(bearerToken);

    if (!bearerError && bearerUser) {
      return { ...selectAuthenticatedUser(bearerUser, null), errorResponse: null };
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) {
    return { ...selectAuthenticatedUser(null, user), errorResponse: null };
  }

  return {
    user: null,
    authMethod: null,
    errorResponse: new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    }),
  };
}
