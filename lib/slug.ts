export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!base) base = "produto";
  let slug = base;
  let i = 2;
  while (taken.has(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}
