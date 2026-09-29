import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("[storage] Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

export const storageAdmin = createClient(url ?? "", serviceKey ?? "", {
  auth: { persistSession: false },
});