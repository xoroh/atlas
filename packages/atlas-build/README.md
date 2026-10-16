# @xoroh/atlas-build

Pipeline orchestration and deterministic output generation for the Atlas
engine. Depends on `@xoroh/atlas-core` and `@xoroh/atlas-content`. Owns
the end-to-end lifecycle and generated artifacts — nothing about parsing.

## API

- `buildAtlas(configInput: unknown): BuildResult` — validate config →
  load documents → generate outputs. `{ ok: true, documents, outputs }`
  or `{ ok: false, diagnostics }`. Never throws for invalid input.
- `buildOutputs(config, documents): GeneratedOutputs` — pure,
  deterministic: `manifest` (`manifest.json`: version, title, routes),
  `llmsTxt` (`llms.txt` index), `pages` (per-document Markdown). No
  timestamps; fixed key order.
- `writeOutputs(outDir, outputs): WrittenOutputs` — writes `manifest.json`,
  `llms.txt`, and one Markdown file per document; returns written paths.
- `routePath(slug)`, `pagePath(slug)` — slug ↔ output path mapping
  (`""` is `/` / `index.md`).

## Develop

```sh
bun test                 # includes lifecycle integration tests against
                         # atlas-content fixtures (test-only reuse)
bun run check
```
