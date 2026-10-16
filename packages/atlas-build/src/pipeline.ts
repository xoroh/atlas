import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { loadConfig } from "@xoroh/atlas-core";
import type { AtlasDiagnostic, AtlasDocument } from "@xoroh/atlas-core";
import { loadDocuments } from "@xoroh/atlas-content";
import { buildOutputs } from "./outputs.js";
import type { GeneratedOutputs } from "./outputs.js";

export type { GeneratedOutputs, GeneratedPage, AtlasManifest, ManifestRoute } from "./outputs.js";
export { buildOutputs, pagePath, routePath } from "./outputs.js";

export type BuildResult =
  | {
      readonly ok: true;
      readonly documents: AtlasDocument[];
      readonly outputs: GeneratedOutputs;
      /** Non-blocking warnings (e.g. empty corpus). Empty when there are none. */
      readonly warnings: AtlasDiagnostic[];
    }
  | { readonly ok: false; readonly diagnostics: AtlasDiagnostic[] };

/**
 * Full engine lifecycle: validate configuration → discover and validate
 * content → generate deterministic outputs. Never throws for invalid input;
 * every problem is returned as diagnostics.
 */
export function buildAtlas(configInput: unknown): BuildResult {
  const configResult = loadConfig(configInput);
  if (!configResult.ok) return { ok: false, diagnostics: configResult.diagnostics };
  const config = configResult.config;

  const { documents, diagnostics } = loadDocuments(config.contentDir, config.exclude);
  if (diagnostics.some((d) => d.severity === "error")) {
    return { ok: false, diagnostics };
  }
  const warnings = diagnostics.filter((d) => d.severity === "warning");
  return { ok: true, documents, outputs: buildOutputs(config, documents), warnings };
}

export interface WrittenOutputs {
  readonly manifest: string;
  readonly llmsTxt: string;
  readonly pages: readonly string[];
}

/**
 * Write generated outputs to `outDir` (`manifest.json`, `llms.txt`,
 * one Markdown file per document). Returns written output-relative paths.
 * Refuses to write outside `outDir`: a page path escaping the output root
 * (absolute path or `..` traversal) throws instead of writing elsewhere.
 */
export function writeOutputs(outDir: string, outputs: GeneratedOutputs): WrittenOutputs {
  const root = resolve(outDir);
  mkdirSync(root, { recursive: true });
  const manifest = "manifest.json";
  const llmsTxt = "llms.txt";
  writeFileSync(join(root, manifest), outputs.manifest);
  writeFileSync(join(root, llmsTxt), outputs.llmsTxt);
  const pages = outputs.pages.map((page) => {
    const target = resolve(root, page.path);
    const rel = relative(root, target);
    if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
      throw new Error(`Refusing to write outside output directory: ${page.path}`);
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, page.markdown);
    return page.path;
  });
  return { manifest, llmsTxt, pages };
}
