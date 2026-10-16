import { toSlug } from "@xoroh/atlas-core";
import type { DocumentHeading } from "@xoroh/atlas-core";

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;

/**
 * Extract ATX headings from a Markdown body, skipping fenced code blocks.
 * Internal detail: exposed only through `loadDocuments` until a consumer
 * needs it directly.
 */
export function extractHeadings(body: string): DocumentHeading[] {
  const headings: DocumentHeading[] = [];
  const usedIds = new Map<string, number>();
  let fenceChar: "`" | "~" | null = null;
  for (const line of body.split("\n")) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const char = (fence[1] as string).startsWith("`") ? ("`" as const) : ("~" as const);
      fenceChar = fenceChar === null ? char : fenceChar === char ? null : fenceChar;
      continue;
    }
    if (fenceChar !== null) continue;
    const match = line.match(HEADING);
    if (!match) continue;
    const text = (match[2] as string).trim();
    if (text === "") continue;
    headings.push({ depth: (match[1] as string).length, text, id: uniqueId(usedIds, text, headings.length) });
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
