import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAppBasePath, withBasePath } from "@/lib/base-path";
import {
  pathRequiresSession,
  roleMayAccessPath,
} from "@/lib/auth/protected-routes";
import type { UserRole } from "@/lib/auth/user-role";
import { getProxySupabaseSession } from "@/lib/supabase/middleware";

const AUTH_GATE_PAGES = ["/login", "/signup", "/forgot-password"];

const PUBLIC_AUTH_FLOW_PREFIXES = ["/auth/callback"];

function supabaseConnectOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return "https://*.supabase.co";
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://*.supabase.co";
  }
}

function createContentSecurityPolicy(nonce: string) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const supabaseOrigin = supabaseConnectOrigin();

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://consent.cookiebot.com https://consentcdn.cookiebot.com https://www.googletagmanager.com${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://imgsct.cookiebot.com https://*.cookiebot.com",
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} https://*.supabase.co https://*.supabase.in https://consent.cookiebot.com https://consentcdn.cookiebot.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com${isDevelopment ? " ws: wss:" : ""}`,
    "frame-src 'self' https://www.openstreetmap.org https://consentcdn.cookiebot.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function withSecurityHeaders(response: NextResponse, contentSecurityPolicy: string) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

function stripAppBase(pathname: string): string {
  const base = getAppBasePath();
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || "/";
  return pathname;
}

function isPublicAuthFlow(path: string): boolean {
  return PUBLIC_AUTH_FLOW_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = createContentSecurityPolicy(nonce);

  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-nonce", nonce);

  const pathname = stripAppBase(request.nextUrl.pathname);
  const isAuthGatePage = AUTH_GATE_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const publicAuth = isPublicAuthFlow(pathname);

  const { response, userId, supabase } = await getProxySupabaseSession(request, forwardedHeaders);

  let isAuthenticated = false;
  let sessionRole: UserRole | null = null;
  let profileDisabled = false;

  if (supabase && userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, disabled")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.disabled) {
      profileDisabled = true;
    } else {
      isAuthenticated = true;
      const r = profile?.role as string | undefined;
      sessionRole = r === "admin" || r === "editor" || r === "viewer" ? r : "viewer";
    }
  }

  const needsSession = pathRequiresSession(pathname);

  if (profileDisabled && needsSession && !publicAuth) {
    const loginUrl = new URL(withBasePath("/login"), request.url);
    loginUrl.searchParams.set("reason", "disabled");
    return withSecurityHeaders(NextResponse.redirect(loginUrl), contentSecurityPolicy);
  }

  if (needsSession && !isAuthenticated && !publicAuth) {
    const loginUrl = new URL(withBasePath("/login"), request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl), contentSecurityPolicy);
  }

  if (isAuthenticated && sessionRole && needsSession && !publicAuth && !roleMayAccessPath(sessionRole, pathname)) {
    const dash = new URL(withBasePath("/dashboard"), request.url);
    dash.searchParams.set("denied", "role");
    return withSecurityHeaders(NextResponse.redirect(dash), contentSecurityPolicy);
  }

  if (isAuthGatePage && isAuthenticated) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL(withBasePath("/dashboard"), request.url)),
      contentSecurityPolicy,
    );
  }

  return withSecurityHeaders(response, contentSecurityPolicy);
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
