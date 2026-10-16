import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAtlas, writeOutputs } from "./index.js";
import { buildOutputs } from "./index.js";

const contentFixtures = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "atlas-content",
  "fixtures",
);
const validDir = join(contentFixtures, "docs");

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "atlas-build-"));
}

describe("buildAtlas lifecycle", () => {
  test("runs config to outputs end-to-end", () => {
    const result = buildAtlas({ title: "Atlas", description: "Engine", contentDir: validDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.documents).toHaveLength(3);

    const manifest = JSON.parse(result.outputs.manifest) as {
      version: number;
      title: string;
      routes: { path: string }[];
    };
    expect(manifest.version).toBe(1);
    expect(manifest.title).toBe("Atlas");
    expect(manifest.routes.map((r) => r.path)).toEqual([
      "/",
      "/getting-started/",
      "/guides/architecture/",
    ]);
    expect(result.outputs.llmsTxt).toContain("# Atlas");
    expect(result.outputs.llmsTxt).toContain("/getting-started/ — Getting Started:");
    expect(result.outputs.pages).toHaveLength(3);
    expect(result.outputs.pages[0]?.path).toBe("index.md");
    expect(result.outputs.pages[0]?.markdown).toContain("# Atlas Fixtures");
  });

  test("is deterministic across runs", () => {
    const first = buildAtlas({ title: "Atlas", contentDir: validDir });
    const second = buildAtlas({ title: "Atlas", contentDir: validDir });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(JSON.stringify(first.outputs)).toBe(JSON.stringify(second.outputs));

    const firstDoc = first.documents[0];
    expect(firstDoc).toBeDefined();
    if (firstDoc) {
      const rebuilt = buildOutputs({ title: "Atlas", contentDir: validDir }, first.documents);
      expect(rebuilt.manifest).toBe(first.outputs.manifest);
      expect(rebuilt.llmsTxt).toBe(first.outputs.llmsTxt);
    }
  });

  test("reports invalid configuration without throwing", () => {
    const result = buildAtlas({ contentDir: validDir });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.diagnostics.some((d) => d.message.includes('"title"'))).toBe(true);
  });

  test("reports missing content and invalid documents", () => {
    const missing = buildAtlas({ title: "T", contentDir: join(contentFixtures, "nope") });
    expect(missing.ok).toBe(false);

    const invalid = buildAtlas({
      title: "T",
      contentDir: join(contentFixtures, "invalid"),
    });
    expect(invalid.ok).toBe(false);
    if (invalid.ok) return;
    expect(invalid.diagnostics).toHaveLength(2);

    const duplicates = buildAtlas({
      title: "T",
      contentDir: join(contentFixtures, "duplicates"),
    });
    expect(duplicates.ok).toBe(false);
    if (duplicates.ok) return;
    expect(duplicates.diagnostics[0]?.message).toContain("Duplicate slug");
  });
});

describe("writeOutputs", () => {
  test("writes manifest, index, and pages, byte-identical across runs", () => {
    const result = buildAtlas({ title: "Atlas", contentDir: validDir });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const first = writeOutputs(join(tempDir(), "out"), result.outputs);
    const second = writeOutputs(join(tempDir(), "out"), result.outputs);
    expect(first).toEqual(second);
    expect(first.pages).toEqual(["index.md", "getting-started.md", "guides/architecture.md"]);

    const read = (base: string, rel: string): string => readFileSync(join(base, rel), "utf8");
    const dirA = join(tempDir(), "a");
    const dirB = join(tempDir(), "b");
    writeOutputs(dirA, result.outputs);
    writeOutputs(dirB, result.outputs);
    for (const rel of [first.manifest, first.llmsTxt, ...first.pages]) {
      expect(read(dirB, rel)).toBe(read(dirA, rel));
    }
    expect(JSON.parse(read(dirA, "manifest.json"))).toEqual(JSON.parse(result.outputs.manifest));
  });
});
