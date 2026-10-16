import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadConfig } from "@xoroh/atlas-core";
import type { AtlasDiagnostic, AtlasDocument } from "@xoroh/atlas-core";
import { loadDocuments } from "@xoroh/atlas-content";
import { buildOutputs } from "./outputs.js";
import type { GeneratedOutputs } from "./outputs.js";

export type { GeneratedOutputs, GeneratedPage, AtlasManifest, ManifestRoute } from "./outputs.js";
export { buildOutputs, pagePath, routePath } from "./outputs.js";

export type BuildResult =
  | { readonly ok: true; readonly documents: AtlasDocument[]; readonly outputs: GeneratedOutputs }
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
  return { ok: true, documents, outputs: buildOutputs(config, documents) };
}

export interface WrittenOutputs {
  readonly manifest: string;
  readonly llmsTxt: string;
  readonly pages: readonly string[];
}

/**
 * Write generated outputs to `outDir` (`manifest.json`, `llms.txt`,
 * one Markdown file per document). Returns written output-relative paths.
 */
export function writeOutputs(outDir: string, outputs: GeneratedOutputs): WrittenOutputs {
  mkdirSync(outDir, { recursive: true });
  const manifest = "manifest.json";
  const llmsTxt = "llms.txt";
  writeFileSync(join(outDir, manifest), outputs.manifest);
  writeFileSync(join(outDir, llmsTxt), outputs.llmsTxt);
  const pages = outputs.pages.map((page) => {
    const target = join(outDir, page.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, page.markdown);
    return page.path;
  });
  return { manifest, llmsTxt, pages };
}
