import type { AtlasConfig, AtlasDocument } from "@xoroh/atlas-core";

export interface ManifestRoute {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly maturity: string;
}

export interface AtlasManifest {
  readonly version: 1;
  readonly title: string;
  readonly description?: string;
  readonly routes: readonly ManifestRoute[];
}

export interface GeneratedOutputs {
  /** Pretty-printed `manifest.json` content (trailing newline, no timestamps). */
  readonly manifest: string;
  /** Generated `llms.txt` index content. */
  readonly llmsTxt: string;
  /** One Markdown file per document, in document order. */
  readonly pages: readonly GeneratedPage[];
}

export interface GeneratedPage {
  /** Output-relative path, e.g. `index.md` or `guides/architecture.md`. */
  readonly path: string;
  readonly markdown: string;
}

/** Route path for a document slug: `""` is the root `/`. */
export function routePath(slug: string): string {
  return slug === "" ? "/" : `/${slug}/`;
}

/** Output file path for a document slug. */
export function pagePath(slug: string): string {
  return slug === "" ? "index.md" : `${slug}.md`;
}

/**
 * Build all generated outputs from validated documents. Pure and
 * deterministic: identical inputs always produce byte-identical outputs
 * (no timestamps, fixed key order, 2-space JSON).
 */
export function buildOutputs(config: AtlasConfig, documents: readonly AtlasDocument[]): GeneratedOutputs {
  const routes: ManifestRoute[] = documents.map((doc) => ({
    path: routePath(doc.slug),
    title: doc.meta.title,
    description: doc.meta.description,
    maturity: doc.meta.maturity ?? "draft",
  }));
  const manifest: AtlasManifest = {
    version: 1,
    title: config.title,
    ...(config.description !== undefined ? { description: config.description } : {}),
    routes,
  };

  const lines = [`# ${config.title}`, ""];
  if (config.description !== undefined) lines.push(`> ${config.description}`, "");
  lines.push("## Documents", "");
  for (const route of routes) {
    lines.push(`- ${route.path} — ${route.title}: ${route.description}`);
  }
  const llmsTxt = `${lines.join("\n")}\n`;

  const pages = documents.map((doc) => ({
    path: pagePath(doc.slug),
    markdown: `# ${doc.meta.title}\n\n> ${doc.meta.description}\n\n${doc.body}\n`,
  }));
  return { manifest: `${JSON.stringify(manifest, null, 2)}\n`, llmsTxt, pages };
}
