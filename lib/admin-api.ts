import { supabase } from "@/lib/supabase/client";

export const adminFetch = async (input: RequestInfo, init?: RequestInit) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("No active session");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    headers,
  });
};
