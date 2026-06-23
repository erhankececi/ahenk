import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVICE ROLE istemcisi — YALNIZ server-side route'larda kullanılmalı.
// SUPABASE_SERVICE_ROLE_KEY client bundle'a ASLA sızmamalı (NEXT_PUBLIC değil).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
