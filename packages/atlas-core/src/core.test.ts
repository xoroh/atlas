import { describe, expect, test } from "bun:test";
import { hasErrors, formatDiagnostic, formatDiagnostics } from "./index.js";
import type { AtlasDiagnostic } from "./index.js";
import { loadConfig } from "./index.js";
import { toSlug } from "./index.js";

describe("diagnostics", () => {
  test("hasErrors detects errors only", () => {
    expect(hasErrors([])).toBe(false);
    expect(hasErrors([{ severity: "warning", message: "w" }])).toBe(false);
    expect(hasErrors([{ severity: "error", message: "e" }])).toBe(true);
  });

  test("formatDiagnostic includes location when known", () => {
    const d: AtlasDiagnostic = { severity: "error", message: "bad", file: "a.md", line: 3 };
    expect(formatDiagnostic(d)).toBe("error: a.md:3: bad");
    expect(formatDiagnostic({ severity: "warning", message: "w" })).toBe("warning: <config>: w");
    expect(formatDiagnostics([d])).toContain("a.md:3");
  });
});

describe("loadConfig", () => {
  test("accepts a minimal valid configuration", () => {
    const result = loadConfig({ title: "Atlas", contentDir: "docs" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.title).toBe("Atlas");
      expect(result.config.contentDir).toBe("docs");
      expect(result.config.description).toBeUndefined();
    }
  });

  test("accepts full configuration and trims strings", () => {
    const result = loadConfig({
      title: "  Atlas  ",
      description: "Docs engine",
      contentDir: "./content",
      exclude: ["drafts"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.title).toBe("Atlas");
      expect(result.config.exclude).toEqual(["drafts"]);
    }
  });

  test("rejects non-objects with a useful error", () => {
    for (const bad of [null, 42, "x", ["a"]]) {
      const result = loadConfig(bad);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0]?.message).toContain("must be an object");
      }
    }
  });

  test("reports every problem at once", () => {
    const result = loadConfig({ title: "  ", exclude: ["ok", 7] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const messages = result.diagnostics.map((d) => d.message);
      expect(messages.some((m) => m.includes('"title"'))).toBe(true);
      expect(messages.some((m) => m.includes('"contentDir"'))).toBe(true);
      expect(messages.some((m) => m.includes('"exclude"'))).toBe(true);
      expect(result.diagnostics.every((d) => d.severity === "error")).toBe(true);
    }
  });
});

describe("toSlug", () => {
  test("slugifies headings and paths", () => {
    expect(toSlug("Getting Started")).toBe("getting-started");
    expect(toSlug("  API & Reference!  ")).toBe("api-reference");
    expect(toSlug("already-slug")).toBe("already-slug");
  });
});
