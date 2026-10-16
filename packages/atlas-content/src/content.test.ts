import { describe, expect, test } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDocuments, isExcluded, slugForFile } from "./index.js";
import { parseDocument } from "./index.js";
import { validateMeta } from "./index.js";
import { extractHeadings } from "./index.js";
import { loadDocuments } from "./index.js";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

describe("discoverDocuments", () => {
  test("finds markdown files as sorted relative paths", () => {
    expect(discoverDocuments(join(fixtures, "docs"))).toEqual([
      "getting-started.md",
      "guides/architecture.md",
      "index.md",
    ]);
  });

  test("throws a descriptive error for a missing directory", () => {
    expect(() => discoverDocuments(join(fixtures, "nope"))).toThrow(/Cannot discover documents/);
  });
});

describe("slugForFile / isExcluded", () => {
  test("maps index files to their directory", () => {
    expect(slugForFile("index.md")).toBe("");
    expect(slugForFile("guides/index.md")).toBe("guides");
    expect(slugForFile("getting-started.md")).toBe("getting-started");
  });

  test("neutralizes dot segments so slugs cannot escape the output dir", () => {
    expect(slugForFile("..md")).toBe("md");
    expect(slugForFile("...md")).toBe("md");
    expect(slugForFile("a/../b.md")).toBe("a/b");
    expect(slugForFile("a//b.md")).toBe("a/b");
  });

  test("matches exact paths and prefixes", () => {
    expect(isExcluded("drafts/a.md", ["drafts"])).toBe(true);
    expect(isExcluded("drafts", ["drafts"])).toBe(true);
    expect(isExcluded("drafts-new/a.md", ["drafts"])).toBe(false);
    expect(isExcluded("a.md", undefined)).toBe(false);
  });
});

describe("parseDocument", () => {
  test("splits frontmatter from body", () => {
    const result = parseDocument("a.md", "---\ntitle: T\n---\n\nBody\n");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ title: "T" });
      expect(result.body.trim()).toBe("Body");
    }
  });

  test("reports broken YAML with file context", () => {
    const result = parseDocument("bad.md", "---\ntitle: [oops\n---\nBody\n");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.file).toBe("bad.md");
      expect(result.diagnostics[0]?.severity).toBe("error");
    }
  });

  test("parsing is deterministic across repeated calls (no cache poisoning)", () => {
    const bad = "---\ntitle: [oops\n---\nBody\n";
    const first = parseDocument("bad.md", bad);
    const second = parseDocument("bad.md", bad);
    expect(first).toEqual(second);
    expect(first.ok).toBe(false);

    const good = "---\ntitle: T\n---\n\nBody\n";
    expect(parseDocument("good.md", good)).toEqual(parseDocument("good.md", good));
  });
});

describe("validateMeta", () => {
  test("accepts complete metadata", () => {
    const result = validateMeta("a.md", {
      title: "T",
      description: "D",
      order: 2,
      maturity: "stable",
    });
    expect(result).toEqual({
      ok: true,
      meta: { title: "T", description: "D", order: 2, maturity: "stable" },
    });
  });

  test("rejects missing metadata, bad order, and bad maturity", () => {
    const missing = validateMeta("a.md", { description: "D" });
    expect(missing.ok).toBe(false);

    const order = validateMeta("a.md", { title: "T", description: "D", order: -1 });
    expect(order.ok).toBe(false);

    const maturity = validateMeta("a.md", { title: "T", description: "D", maturity: "soon" });
    expect(maturity.ok).toBe(false);
    if (!maturity.ok) {
      expect(maturity.diagnostics[0]?.message).toContain("draft, stable, deprecated");
    }
  });
});

describe("extractHeadings", () => {
  test("extracts headings and skips fenced code", () => {
    const headings = extractHeadings("# Title\n\n```\n# Fake\n```\n\n## Real ##\n");
    expect(headings).toEqual([
      { depth: 1, text: "Title", id: "title" },
      { depth: 2, text: "Real", id: "real" },
    ]);
  });

  test("deduplicates repeat heading ids", () => {
    const headings = extractHeadings("# A\n\n# A\n\n## A\n");
    expect(headings.map((h) => h.id)).toEqual(["a", "a-1", "a-2"]);
  });

  test("supports setext headings and indented ATX, not thematic breaks", () => {
    const headings = extractHeadings(
      "Big\n===\n\nSmall\n---\n\n  ## Indented\n\n    # Code, not a heading\n\n***\n",
    );
    expect(headings).toEqual([
      { depth: 1, text: "Big", id: "big" },
      { depth: 2, text: "Small", id: "small" },
      { depth: 2, text: "Indented", id: "indented" },
    ]);
  });

  test("ignores setext underlines after lists, quotes, and bare punctuation", () => {
    const headings = extractHeadings("- item\n---\n\n> quoted\n===\n\n---\n\ntext\n===\n");
    expect(headings).toEqual([{ depth: 1, text: "text", id: "text" }]);
  });

  test("normalizes CRLF input to LF bodies", () => {
    const result = parseDocument("c.md", "---\r\ntitle: T\r\ndescription: D\r\n---\r\n\r\nBody\r\n");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).not.toContain("\r");
      expect(result.body.trim()).toBe("Body");
    }
  });
});

describe("loadDocuments", () => {
  test("loads, validates, and orders the valid fixture set", () => {
    const { documents, diagnostics } = loadDocuments(join(fixtures, "docs"));
    expect(diagnostics).toEqual([]);
    expect(documents.map((d) => d.slug)).toEqual(["", "getting-started", "guides/architecture"]);
    const root = documents[0];
    expect(root?.meta.title).toBe("Atlas Fixtures");
    expect(root?.headings.map((h) => h.text)).toEqual([
      "Atlas Fixtures",
      "Section One",
      "Section Two",
    ]);
  });

  test("collects errors from every invalid file", () => {
    const { documents, diagnostics } = loadDocuments(join(fixtures, "invalid"));
    expect(documents).toEqual([]);
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics.map((d) => d.file).sort()).toEqual([
      "bad-yaml.md",
      "missing-title.md",
    ]);
  });

  test("detects duplicate slugs", () => {
    const { documents, diagnostics } = loadDocuments(join(fixtures, "duplicates"));
    expect(documents).toHaveLength(1);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.message).toContain('Duplicate slug "dup"');
  });

  test("reports a missing content directory without throwing", () => {
    const { documents, diagnostics } = loadDocuments(join(fixtures, "nope"));
    expect(documents).toEqual([]);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.severity).toBe("error");
  });
});
