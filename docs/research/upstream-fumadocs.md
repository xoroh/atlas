# Upstream research: Fumadocs (engineering reference)

Scope note: this is a **research record**, not product architecture. It
names the upstream project only to record what was studied, what was
reused (with provenance), and what was deliberately left out. It does not
make Fumadocs an architectural authority, product reference, or dependency
of Atlas. No product-facing ADR or plan cites it.

## 1. Upstream identity, revision, license

- Repository: `https://github.com/fuma-nama/fumadocs` (public, open-source).
- Audited revision: `daa7d4cf42d450c6d4af16675055f242ab9df517` on branch
  `dev` (shallow clone, 2026-10-16), kept at `/tmp/opencode/upstream/fumadocs`
  (temporary workspace, separate from Atlas; not a submodule, remote, or
  dependency; nothing copied wholesale).
- License: **MIT**, Copyright (c) 2023 Fuma (root `LICENSE`). MIT permits
  reuse with the copyright + permission notices preserved. Nested LICENSE
  files exist for some vendored pieces (`core/src/mdx-plugins/rehype-code`,
  `tailwind/src/typography`, `local-md/src/eval-estree-expression`,
  `image-size`, `vite/vitefu`) — anything under those paths needs
  per-file provenance before reuse. No adapted code in this task comes from
  those paths.
- Dependency licenses checked for the one runtime dep Atlas already uses:
  `gray-matter@4` (MIT) + `js-yaml@3` (MIT). No new dependency was added
  by this task.

## 2. Architectural map (concise)

~40 packages; the engine-relevant ones:

- `fumadocs-core` (~50 export subpaths, React-coupled): `source/` layer
  (VirtualFile in-mem FS, Static/DynamicSource, content storage builder,
  `loader()` producing page index + page trees, LoaderPlugin pipeline),
  `page-tree/` (typed Root/Item/Folder/Separator with `$id`/`$ref`),
  `mdx-plugins/` (remark/rehype: heading, TOC, structure, code, image,
  llms, admonition…), `search/` (server index builders + static export,
  hosted adapters, React clients), `source/llms.ts` (`llms()` index/page/full
  renderers), `mcp.ts` (search/list_pages/get_page tools), `server.ts`
  (RSC→Markdown rendering).
- `fumadocs-mdx`: build-time MDX compiler (Vite plugin, `@mdx-js/mdx`,
  preset system, `<include>` directives, line-offset-preserving
  frontmatter stripping, structured-data export for search).
- `local-md` / `local-content`: runtime md/mdx compilation to HAST/JS +
  filesystem discovery (`tinyglobby`), caches, dev watch adapters.
- `cli`: feature-registry scaffolder (`docs, ai, llms, mcp, search, …`
  per-framework templates), route/file codemods, `epub` export.
- UI (`base-ui`, `radix-ui`, `tailwind`, `shadcn`), docs app, examples:
  presentation layer — out of scope for Atlas Core.

## 3. Most valuable patterns discovered

1. **Loader = index over virtual files.** Content is normalized to
   `VirtualFile`s first; slugs, trees, search, and llms outputs all derive
   from that model — never directly from the filesystem. (Atlas already
   follows this shape via `AtlasDocument`.)
2. **Structured search input.** `remark-structure` emits
   `StructuredData{headings[], contents[]}` (tables expanded per-row);
   `build-index` joins it with breadcrumbs into `SharedIndex`. Search stays
   decoupled from rendering. Directly informs the future Atlas search spike.
3. **AI outputs as render functions over the model.** `llms()` takes the
   loader + `renderPage`; MCP tools reuse the same renderers. (Atlas's
   `buildOutputs` is the same idea at smaller scale.)
4. **Self-contained path utilities** (`core/src/source/path.ts`):
   `normalize()` rejects leading `./`/`../` — traversal safety at the
   model boundary, not the filesystem. Informed Atlas hardening (§6).
5. **Slug rules** (`source/plugins/slugs.ts`): strip route groups `(x)`,
   `index`→directory, URI-encode, duplicates throw. Atlas matches except
   group-stripping (no route groups in Atlas — correctly absent).
6. **Snapshot + per-feature fixtures for compiler output**
   (`toMatchFileSnapshot`, `test/fixtures/`) — matches Atlas's existing
   fixture approach; no change needed.
7. **Bounded framework surface**: `framework/{next,astro,react-router,tanstack,waku}`
   adapters isolate framework concerns from the source layer — the same
   seam Atlas's consumer boundary requires.

## 4. Capability matrix (Atlas vs Fumadocs)

| Fumadocs capability | Verdict | Notes |
|---|---|---|
| Virtual-file loader + page index | (1) already adequate | Atlas `AtlasDocument` + `loadDocuments` cover the v1 need |
| Page tree from `meta.json` ordering | (4) future consumer | No Atlas consumer needs navigation yet; record shape for Phase E |
| Slug rules (groups/index/dupes) | (1)/(3) | Atlas matches; group-stripping not justified without route groups |
| Frontmatter validation (zod schemas) | (6) independent simpler design wins | Atlas hand validation keeps core zero-dep; zod would add weight for no v1 benefit |
| TOC extraction (remark-based) | (1) adequate | Atlas regex headings suffice for Markdown; AST version belongs with a future MDX adapter |
| Custom heading IDs `[#id]` | (3) not now | Authoring syntax without a consumer; revisit with MDX adapter |
| Anchor-id dedup (github-slugger style) | (7) adapted | Implemented in `extractHeadings` (own code; §6) |
| Path traversal safety (`normalize`) | (7) adapted | Implemented in `slugForFile` (own code; §6) |
| Deterministic static outputs | (1) adequate | Atlas manifest/llms/pages already deterministic + tested |
| `llms-full.txt`, MCP tools | (4) future consumer | Trivial later on top of `renderPageMarkdown`; MCP needs a host |
| Search index builders + adapters | (4) future consumer | Shapes recorded for the search spike; no engine code now |
| MDX compilation pipeline | (5)/(3) unsuitable now | React/MDX toolchain; Atlas stays Markdown until an adapter is justified |
| CLI scaffolder | (3)/(4) not now | No consumer project exists to scaffold; revisit in Phase E |
| UI/theme packages | (5) unsuitable for Core | Presentation belongs to consumers, never the engine |
| `source/path.ts` direct copy | deliberately avoided | Node `path` + targeted sanitization suffice; a parallel path API adds surface without benefit |

## 5. Now / later / never

- **Now (done, §6):** anchor-id dedup, slug traversal hardening, CRLF normalization.
- **Later (Phase D/E):** navigation model (study page-tree builder + `meta.json` semantics when a consumer needs it); search spike informed by `StructuredData`/`SharedIndex` shapes; `llms-full` concatenation; MDX adapter (only on a real requirement); description/title fallbacks (Fumadocs auto-titles from h1 — Atlas stays strict until a consumer justifies leniency).
- **Never (for Core):** UI/theme code, framework adapters inside engine packages, zod (weight without v1 benefit), wholesale pipeline transplantation, `source/path.ts` copy.

## 6. Adapted implementations + provenance

No upstream code was copied. All three changes are independently written,
idea-level adaptations (no license-notice obligation triggered; recorded
here for provenance):

1. **`extractHeadings` id dedup** (`packages/atlas-content/src/headings.ts`) —
   pattern observed in `github-slugger` usage via
   `packages/core/src/mdx-plugins/remark-heading.ts` (repeat slugs get
   `-1`, `-2` suffixes). Atlas implementation is original (~10 lines).
2. **Slug traversal hardening** (`slugForFile`, `discover.ts`) — concept
   from `packages/core/src/source/path.ts:normalize()` (reject `.`/`..`
   at the model boundary). Atlas implementation is original (filter +
   `toSlug` fallback); verified hostile inputs (`..md`, `a/../b.md`)
   now stay contained.
3. **CRLF normalization** (`parseDocument`, `parse.ts`) — standard
   determinism practice (same logical content → same bytes regardless of
   platform/VCS settings); verified `\r\n` fixtures parse to LF bodies
   with unchanged diagnostic lines.

## 7. Dependencies: added / removed / avoided

- Added: none. Removed: none. Avoided with reason: `zod` (validation
  weight; hand validation adequate and tested), `remark`/`unified` stack
  (needed only for MDX/AST work Atlas defers), `github-slugger`
  (10-line local equivalent), search engines/DBs (future spike),
  `source/path.ts` copy (no benefit over targeted sanitization),
  `@types/gray-matter` (does not exist on the registry — local
  `vendor.d.ts` retained).

## 8. Changes made and reasoning

Engine hardening only; public boundaries unchanged (`loadDocuments`,
`buildAtlas`, `buildOutputs`, `writeOutputs` signatures identical;
`slugForFile` behavior identical for all legitimate paths). Each change
has a regression test; product docs/ADRs untouched (no Fumadocs references
added to product-facing documentation, per skill constraint).

## 9. Tests executed and results (Bun 1.4.3, required ≥1.4.2)

- `bun install --frozen-lockfile`: clean.
- `bun test`: **35 pass / 0 fail** (was 32; +3 new regression tests).
- `bun run check` (strict tsc, engine + root tests): exit 0.
- Manual edge probes: CRLF fixtures, dot-segment filenames, duplicate
  headings, repeated-build determinism — all verified before/after.
- No failures, no skipped checks, no environment limitations.

## 10. Remaining gaps, risks, next steps

- Highest-value next step: **Phase D real-content round-trip** (unchanged
  by this task — run 2–3 real Xoroh documents through the hardened engine).
- Risk to watch: `gray-matter@4` depends on `js-yaml@3` (old major); its
  input cache forced the explicit-options workaround (documented in
  `parse.ts`/`vendor.d.ts` + regression-tested). If further parser
  surprises appear, evaluate the modern `yaml` package (what Fumadocs uses)
  with a local delimiter splitter — documented option, not action.
- Unresolved (no action): navigation model shape, search selection, MDX
  adapter trigger criteria — all Phase E with the shapes recorded above.
