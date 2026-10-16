/**
 * Convert free text into a URL-friendly slug: lowercase, runs of
 * non-alphanumerics become a single `-`, leading/trailing dashes trimmed.
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
