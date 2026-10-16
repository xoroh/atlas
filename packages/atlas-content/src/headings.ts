import { toSlug } from "@xoroh/atlas-core";
import type { DocumentHeading } from "@xoroh/atlas-core";

const ATX = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const SETEXT_UNDERLINE = /^ {0,3}(=+|-+)\s*$/;
/** Lines that can never be setext content: quotes, lists, or bare punctuation. */
const NOT_SETEXT_CONTENT = /^ {0,3}([-*+>]|\d+[.)])\s|^ {0,3}[=*_\s]*$/;

/**
 * Extract ATX (`#`, 0–3 leading spaces allowed) and single-line setext
 * (`===`/`---` underline) headings, skipping fenced code blocks. Internal
 * detail: exposed only through `loadDocuments` until a consumer needs it
 * directly.
 */
export function extractHeadings(body: string): DocumentHeading[] {
  const headings: DocumentHeading[] = [];
  const usedIds = new Map<string, number>();
  const lines = body.split("\n");
  let fenceChar: "`" | "~" | null = null;

  const push = (depth: number, text: string): void => {
    const clean = text.trim();
    if (clean === "") return;
    headings.push({ depth, text: clean, id: uniqueId(usedIds, clean, headings.length) });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const char = (fence[1] as string).startsWith("`") ? ("`" as const) : ("~" as const);
      fenceChar = fenceChar === null ? char : fenceChar === char ? null : fenceChar;
      continue;
    }
    if (fenceChar !== null) continue;

    const atx = line.match(ATX);
    if (atx) {
      push((atx[1] as string).length, atx[2] as string);
      continue;
    }

    const underline = (lines[i + 1] ?? "").match(SETEXT_UNDERLINE);
    if (underline && /\w/.test(line) && !NOT_SETEXT_CONTENT.test(line)) {
      push((underline[1] as string).startsWith("=") ? 1 : 2, line);
      i++;
    }
  }
  return headings;
}

/**
 * Anchor ids must be unique within a document: repeat texts get `-1`,
 * `-2`, … suffixes; texts with no slug characters fall back to an ordinal.
 */
function uniqueId(used: Map<string, number>, text: string, ordinal: number): string {
  const base = toSlug(text) || `heading-${ordinal + 1}`;
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}
