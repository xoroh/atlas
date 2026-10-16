import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * Recursively discover Markdown (`.md`) source files under `contentDir`.
 * Returns content-relative POSIX paths, sorted, skipping hidden files and
 * directories. Throws a descriptive `Error` when the directory is unreadable.
 */
export function discoverDocuments(contentDir: string): string[] {
  let entries: string[];
  try {
    entries = walk(contentDir, contentDir);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot discover documents in "${contentDir}": ${reason}`);
  }
  return entries.sort();
}

function walk(root: string, dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walk(root, full));
    } else if (entry.toLowerCase().endsWith(".md")) {
      found.push(relative(root, full).split(sep).join("/"));
    }
  }
  return found;
}

/**
 * Derive the document slug from a content-relative path: `index.md` is the
 * enclosing directory (`""` at the root), other files drop the extension.
 */
export function slugForFile(relativePath: string): string {
  const withoutExt = relativePath.replace(/\.md$/i, "");
  if (withoutExt === "index") return "";
  if (withoutExt.endsWith("/index")) return withoutExt.slice(0, -"/index".length);
  return withoutExt;
}

/** True when a content-relative path is covered by an exclude prefix list. */
export function isExcluded(relativePath: string, exclude: readonly string[] | undefined): boolean {
  if (!exclude) return false;
  return exclude.some((prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`));
}
