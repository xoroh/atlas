import matter from "gray-matter";
import type { AtlasDiagnostic } from "@xoroh/atlas-core";

export interface ParsedFrontmatter {
  readonly data: unknown;
  readonly content: string;
}

export type ParseResult =
  | { readonly ok: true; readonly data: unknown; readonly body: string }
  | { readonly ok: false; readonly diagnostics: AtlasDiagnostic[] };

interface YamlErrorLike {
  reason?: unknown;
  mark?: { line?: unknown };
}

/**
 * Split YAML frontmatter from the Markdown body. Malformed frontmatter is
 * reported as a diagnostic (with a 1-based line when the parser provides
 * one) instead of throwing.
 *
 * gray-matter caches parses by input when called WITHOUT options — and a
 * throw poisons that cache, so a second call with the same malformed input
 * silently returns empty data instead of throwing again. Atlas therefore
 * always passes an explicit (empty) options object, which bypasses the
 * cache entirely and keeps parsing deterministic. See `vendor.d.ts`, where
 * the options argument is typed as required to enforce this.
 */
export function parseDocument(file: string, raw: string): ParseResult {
  try {
    const parsed: ParsedFrontmatter = matter(raw, {});
    return { ok: true, data: parsed.data, body: parsed.content };
  } catch (error) {
    return { ok: false, diagnostics: [yamlDiagnostic(file, error)] };
  }
}

function yamlDiagnostic(file: string, error: unknown): AtlasDiagnostic {
  const like = error as YamlErrorLike | null;
  const reason = typeof like?.reason === "string" ? `: ${like.reason}` : "";
  const markLine = like?.mark && typeof like.mark.line === "number" ? like.mark.line + 1 : undefined;
  const fallback =
    error instanceof Error ? error.message.split("\n")[0] : "unknown frontmatter error";
  return {
    severity: "error",
    file,
    line: markLine,
    message: `Invalid YAML frontmatter${reason || `: ${fallback}`}`,
  };
}
