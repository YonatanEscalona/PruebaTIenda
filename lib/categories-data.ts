import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabasePublic } from "@/lib/supabase/public";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

const fetchCategoriesWithClient = async () => {
  if (!supabasePublic) return null;
  const { data, error } = await supabasePublic
    .from("categories")
    .select("id, name, slug")
    .order("name");
  if (error || !data) return null;
  return data as Category[];
};

const fetchCategoriesWithAdmin = async () => {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .order("name");
  if (error || !data) return null;
  return data as Category[];
};

export const fetchCategories = async (): Promise<Category[]> => {
  if (supabasePublic) {
    const data = await fetchCategoriesWithClient();
    if (data) return data;
  }

  const adminData = await fetchCategoriesWithAdmin();
  return adminData ?? [];
};
