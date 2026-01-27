import { supabasePublic } from "@/lib/supabase/public";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  if (!supabasePublic) {
    return [];
  }

  const { data, error } = await supabasePublic
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error || !data) {
    return [];
  }

  return data as Category[];
};
