export const slugify = (value: string) => {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();
};

export const sanitizeFileName = (value: string) => {
  const parts = value.split(".");
  const ext = parts.length > 1 ? parts.pop() ?? "" : "";
  const base = slugify(parts.join(".")) || "archivo";
  return ext ? `${base}.${ext.toLowerCase()}` : base;
};
