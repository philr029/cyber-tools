import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { safeAppRedirectPath, withBasePath } from "@/lib/base-path";

/**
 * OAuth / email-confirm / password-recovery PKCE exchange.
 * Configure the same URL in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 */
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  let decodedNext: string | null = null;
  if (rawNext) {
    try {
      decodedNext = decodeURIComponent(rawNext);
    } catch {
      decodedNext = null;
    }
  }
  const nextPath = safeAppRedirectPath(decodedNext, "/dashboard");

  const fail = NextResponse.redirect(new URL(withBasePath("/login?error=auth"), origin));

  if (!code || !supabaseUrl || !anonKey) {
    return fail;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie mutation can fail outside a mutable response context.
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return fail;
  }

  return NextResponse.redirect(new URL(withBasePath(nextPath), origin));
}
