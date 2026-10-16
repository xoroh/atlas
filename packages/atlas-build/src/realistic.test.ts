import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAtlas, writeOutputs } from "./index.js";
import type { AtlasDocument } from "@xoroh/atlas-core";

const here = dirname(fileURLToPath(import.meta.url));
const contentFixtures = join(here, "..", "..", "atlas-content", "fixtures");
const realisticDir = join(contentFixtures, "realistic");

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "atlas-realistic-"));
}

describe("realistic corpus end to end", () => {
  test("loads, orders, and describes every document", () => {
    const result = buildAtlas({ title: "Atlas", contentDir: realisticDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.documents.map((d) => d.slug)).toEqual([
      "",
      "getting-started",
      "guides/advanced/nested",
    ]);
    const [root, start, nested] = result.documents as [AtlasDocument, AtlasDocument, AtlasDocument];
    expect(root?.meta.maturity).toBe("stable");
    expect(start?.meta.maturity).toBeUndefined();
    expect(nested?.meta.maturity).toBe("deprecated");

    const manifest = JSON.parse(result.outputs.manifest) as {
      routes: { path: string; maturity: string }[];
    };
    expect(manifest.routes.map((r) => r.path)).toEqual([
      "/",
      "/getting-started/",
      "/guides/advanced/nested/",
    ]);
    expect(manifest.routes.map((r) => r.maturity)).toEqual(["stable", "draft", "deprecated"]);
  });

  test("extracts real-world headings and folds anchors deterministically", () => {
    const result = buildAtlas({ title: "Atlas", contentDir: realisticDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const root = result.documents[0] as AtlasDocument;
    expect(root?.headings.map((h) => h.id)).toEqual([
      "atlas-realistic-corpus",
      "what-s-new-in-v2",
      "cafe-naive-resume",
      "repeated",
      "repeated-1",
      "setext-title",
      "setext-h2-example",
    ]);
    // Fenced `# Not a heading` and fake frontmatter never leak in.
    expect(root?.headings.some((h) => h.text.includes("Not a heading"))).toBe(false);

    const nested = result.documents[2] as AtlasDocument;
    expect(nested?.headings.map((h) => h.id)).toEqual([
      "nested-deep-dive",
      "indented-subsection",
      "setext-subsection",
    ]);
  });

  test("normalizes CRLF and preserves links verbatim", () => {
    const result = buildAtlas({ title: "Atlas", contentDir: realisticDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const start = result.documents[1] as AtlasDocument;
    expect(start?.body).not.toContain("\r");
    // Links pass through unresolved: no link resolution is claimed or done.
    expect(start?.body).toContain("[deep dive](guides/advanced/nested.md)");
    const nested = result.documents[2] as AtlasDocument;
    expect(nested?.body).toContain("[home](../../index.md)");
    const page = result.outputs.pages.find((p) => p.path === "guides/advanced/nested.md");
    expect(page?.markdown).toContain("[home](../../index.md)");
  });

  test("llms.txt indexes every route and rebuilds byte-identically", () => {
    const first = buildAtlas({ title: "Atlas", contentDir: realisticDir });
    const second = buildAtlas({ title: "Atlas", contentDir: realisticDir });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    expect(first.outputs.llmsTxt).toContain("/guides/advanced/nested/ — Nested Deep Dive:");
    expect(JSON.stringify(first.outputs)).toBe(JSON.stringify(second.outputs));

    const dirA = tempDir();
    const dirB = tempDir();
    const writtenA = writeOutputs(dirA, first.outputs);
    writeOutputs(dirB, second.outputs);
    expect(writtenA.pages).toEqual(["index.md", "getting-started.md", "guides/advanced/nested.md"]);
    for (const rel of [writtenA.manifest, writtenA.llmsTxt, ...writtenA.pages]) {
      expect(readFileSync(join(dirB, rel), "utf8")).toBe(readFileSync(join(dirA, rel), "utf8"));
    }
  });

  test("honors exclude prefixes end to end", () => {
    const result = buildAtlas({
      title: "Atlas",
      contentDir: join(contentFixtures, "realistic-excluded"),
      exclude: ["drafts"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.documents.map((d) => d.slug)).toEqual(["keep"]);
  });

  test("writeOutputs refuses to escape the output directory", () => {
    const hostile: AtlasDocument = {
      slug: "../evil",
      file: "evil.md",
      meta: { title: "Evil", description: "Traversal probe." },
      body: "Nope.",
      headings: [],
    };
    const result = buildAtlas({ title: "Atlas", contentDir: realisticDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const outputs = { ...result.outputs, pages: [{ path: "../evil.md", markdown: "Nope.\n" }] };
    expect(() => writeOutputs(tempDir(), outputs)).toThrow(/outside output directory/);
    expect(hostile.slug).toBe("../evil");
  });
});
