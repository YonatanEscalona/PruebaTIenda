import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface AdminCheck {
  ok: boolean;
  status: number;
  error?: string;
  userId?: string;
  email?: string | null;
}

const getAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const requireAdmin = async (req: Request): Promise<AdminCheck> => {
  if (!supabaseAdmin) {
    return { ok: false, status: 500, error: "Supabase admin not configured" };
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, error: "Missing token" };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, error: "Invalid token" };
  }

  const role =
    (data.user.app_metadata as { role?: string } | undefined)?.role ??
    (data.user.user_metadata as { role?: string } | undefined)?.role;
  const adminEmails = getAdminEmails();
  const isEmailAllowed =
    adminEmails.length === 0 ? false : adminEmails.includes(data.user.email ?? "");

  if (role !== "admin" && !isEmailAllowed) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return {
    ok: true,
    status: 200,
    userId: data.user.id,
    email: data.user.email,
  };
};
