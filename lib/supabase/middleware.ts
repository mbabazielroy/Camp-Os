import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { DEMO_COOKIE } from "@/lib/demo/client";

const PUBLIC_PATHS = ["/login", "/auth", "/setup"];

function redirectTo(request: NextRequest, pathname: string, search?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ?? "";
  return NextResponse.redirect(url);
}

// The public marketing website - no session needed, so skip the Supabase round trip.
const SITE_PATHS = ["/summer-camps", "/retreats", "/leadership", "/about", "/contact"];

function isSitePath(path: string) {
  return path === "/" || SITE_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  if (isSitePath(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p));

  // No database configured: run the app on sample data rather than failing.
  // The demo cookie stands in for a session so the login screen still works.
  if (!isSupabaseConfigured()) {
    const inDemoSession = request.cookies.get(DEMO_COOKIE)?.value === "1";

    if (!inDemoSession && !isPublicPath) {
      return redirectTo(request, "/login");
    }
    if (inDemoSession && path === "/login") {
      return redirectTo(request, "/dashboard");
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && path === "/login") {
    return redirectTo(request, "/dashboard");
  }

  return response;
}
