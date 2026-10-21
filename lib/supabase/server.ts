import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createDemoClient, DEMO_COOKIE } from "@/lib/demo/client";
import type { Database } from "./database.types";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function createRealClient(cookieStore: CookieStore) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - middleware refreshes the
            // session cookie instead, so this can be safely ignored.
          }
        },
      },
    }
  );
}

// Keeps the real client's row typing for every caller.
type AppSupabaseClient = ReturnType<typeof createRealClient>;

// For use in Server Components, Route Handlers, and Server Actions.
// With no credentials configured the app runs on in-memory sample data, so
// everything is explorable before a Supabase project exists.
export async function createClient(): Promise<AppSupabaseClient> {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    const signedIn = cookieStore.get(DEMO_COOKIE)?.value === "1";
    return createDemoClient(signedIn) as unknown as AppSupabaseClient;
  }

  return createRealClient(cookieStore);
}
