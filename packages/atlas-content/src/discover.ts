import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { toSlug } from "@xoroh/atlas-core";

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
 *
 * Defensive: path segments that could escape the output directory (`.`,
 * `..`, empty segments from `//`, Windows `\` separators) are neutralized
 * so slugs derived from hostile or bizarre filenames stay contained.
 * Discovery never produces such segments; this only affects pathological
 * names, never legitimate files.
 */
export function slugForFile(relativePath: string): string {
  const segments = relativePath
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
    .split("/")
    .filter((seg) => seg !== "" && seg !== "." && seg !== "..");
  if (segments.length === 0) {
    // Degenerate name (e.g. `..md`): fall back to a slug of the raw name.
    return toSlug(relativePath) || "untitled";
  }
  const joined = segments.join("/");
  if (joined === "index") return "";
  if (joined.endsWith("/index")) return joined.slice(0, -"/index".length);
  return joined;
}

/** True when a content-relative path is covered by an exclude prefix list. */
export function isExcluded(relativePath: string, exclude: readonly string[] | undefined): boolean {
  if (!exclude) return false;
  return exclude.some((prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`));
}
