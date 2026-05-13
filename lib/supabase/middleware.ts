import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type ProxySupabaseSession = {
  response: NextResponse;
  /** Validated JWT `sub` (user id), or null if not signed in. */
  userId: string | null;
  supabase: ReturnType<typeof createServerClient> | null;
};

/**
 * Refreshes the Supabase session from cookies and returns the response that must
 * be returned from middleware (so Set-Cookie survives). Uses `getClaims()` so the
 * JWT is validated against project keys (recommended for Proxy / middleware).
 */
export async function getProxySupabaseSession(
  request: NextRequest,
  forwardedHeaders: Headers,
): Promise<ProxySupabaseSession> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });

  if (!url?.trim() || !anon?.trim()) {
    return { response, userId: null, supabase: null };
  }

  const supabase = createServerClient(url.trim(), anon.trim(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: forwardedHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const sub =
    !error && data?.claims && typeof (data.claims as { sub?: unknown }).sub === "string"
      ? ((data.claims as { sub: string }).sub)
      : null;

  return { response, userId: sub, supabase };
}
