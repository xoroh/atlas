import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AtlasDiagnostic, AtlasDocument } from "@xoroh/atlas-core";
import { discoverDocuments, isExcluded, slugForFile } from "./discover.js";
import { parseDocument } from "./parse.js";
import { validateMeta } from "./validate.js";
import { extractHeadings } from "./headings.js";

export interface LoadResult {
  readonly documents: AtlasDocument[];
  readonly diagnostics: AtlasDiagnostic[];
}

/**
 * End-to-end content loading: discover `.md` files, parse frontmatter,
 * validate metadata, and return normalized documents sorted by
 * (`order`, `slug`) for deterministic output. All failures are collected
 * as diagnostics — one bad file never hides another.
 */
export function loadDocuments(contentDir: string, exclude?: readonly string[]): LoadResult {
  const documents: AtlasDocument[] = [];
  const diagnostics: AtlasDiagnostic[] = [];

  let files: string[];
  try {
    files = discoverDocuments(contentDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { documents, diagnostics: [{ severity: "error", message }] };
  }

  const seenSlugs = new Map<string, string>();
  for (const file of files) {
    if (isExcluded(file, exclude)) continue;
    const slug = slugForFile(file);
    const duplicate = seenSlugs.get(slug);
    if (duplicate !== undefined) {
      diagnostics.push({
        severity: "error",
        file,
        message: `Duplicate slug "${slug}" (already defined by "${duplicate}").`,
      });
      continue;
    }
    seenSlugs.set(slug, file);

    let raw: string;
    try {
      raw = readFileSync(join(contentDir, file), "utf8");
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      diagnostics.push({ severity: "error", file, message: `Cannot read file: ${reason}` });
      continue;
    }

    const parsed = parseDocument(file, raw);
    if (!parsed.ok) {
      diagnostics.push(...parsed.diagnostics);
      continue;
    }
    const meta = validateMeta(file, parsed.data);
    if (!meta.ok) {
      diagnostics.push(...meta.diagnostics);
      continue;
    }
    documents.push({
      slug,
      file,
      meta: meta.meta,
      body: parsed.body.trim(),
      headings: extractHeadings(parsed.body),
    });
  }

  documents.sort((a, b) => {
    const orderA = a.meta.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.meta.order ?? Number.POSITIVE_INFINITY;
    return orderA - orderB || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);
  });
  return { documents, diagnostics };
}
