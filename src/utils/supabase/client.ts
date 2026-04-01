import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a client-side Supabase instance that correctly
 * shares authentication state with the server-side clients.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
