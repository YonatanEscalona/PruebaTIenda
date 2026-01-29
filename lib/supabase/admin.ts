import "server-only";
import { createClient } from "@supabase/supabase-js";

const serviceKeyCandidates = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_KEY",
] as const;

const resolveServiceKey = () => {
  for (const name of serviceKeyCandidates) {
    const value = process.env[name];
    if (value && value.trim()) {
      return { name, value: value.trim() };
    }
  }
  return { name: "", value: "" };
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const resolvedServiceKey = resolveServiceKey();
const supabaseServiceKey = resolvedServiceKey.value;

export const getSupabaseAdminConfig = () => {
  const missing: string[] = [];
  if (!supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL (o SUPABASE_URL)");
  }
  if (!supabaseServiceKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY)");
  }

  return {
    hasUrl: Boolean(supabaseUrl),
    hasServiceKey: Boolean(supabaseServiceKey),
    missing,
    serviceKeyEnv: resolvedServiceKey.name || null,
  };
};

const { missing } = getSupabaseAdminConfig();
if (missing.length > 0) {
  console.warn(`Missing ${missing.join(", ")}`);
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;
