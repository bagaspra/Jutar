import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Service role for bulletproof RBAC check in middleware
  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false }
    }
  );

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Initial Protection: All /admin routes (and others) require login
  const publicRoutes = ["/login", "/cfd", "/menu"];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  const adminRoutes = ["/admin", "/"];
  const loginRequired = !isPublic && adminRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  if (loginRequired && pathname !== "/login" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url, {
      headers: response.headers,
    });
  }

  // 2. Role-Based Protection
  if (user) {
    // Force role lookup using Admin Client to bypass RLS race conditions
    let { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Secondary fallback: email check if ID mismatch (manual db edits)
    if (!profile) {
      const { data: emailProfile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("email", user.email)
        .single();
      profile = emailProfile;
    }

    // Default to 'cashier' if no profile exists (legacy accounts)
    // to prevent infinite signOut/redirect loops.
    const role = profile?.role || 'cashier';

    // Role Boundries:
    
    // CASHIER
    // Allowed: /, /cfd, /admin/history, /admin/management
    // Blocked: /admin/accounts, /admin/report, /admin/settings
    if (role === 'cashier') {
      const blocked = ["/admin/accounts", "/admin/report", "/admin/settings"];
      if (blocked.some(path => pathname === path || pathname.startsWith(path))) {
         const url = request.nextUrl.clone();
         url.pathname = "/";
         return NextResponse.redirect(url, {
            headers: response.headers,
         });
      }
    }

    // INVENTORY ADMIN
    // Allowed: ONLY /admin/management
    // Blocked: /, /cfd, /admin/history, /admin/accounts, /admin/report, /admin/settings
    if (role === 'inventory_admin') {
      const allowed = ["/admin/management"];
      if (!allowed.some(path => pathname === path || pathname.startsWith(path))) {
         const url = request.nextUrl.clone();
         url.pathname = "/admin/management";
         return NextResponse.redirect(url, {
            headers: response.headers,
         });
      }
    }

    // SUPER ADMIN
    // Full Access - No additional checks needed
  }

  return response;
};
