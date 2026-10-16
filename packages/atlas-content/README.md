# @xoroh/atlas-content

File discovery, Markdown+frontmatter parsing, metadata validation, and
normalized document loading for the Atlas engine. Depends on
`@xoroh/atlas-core` (plus `gray-matter` for frontmatter). Owns everything
about turning files into validated `AtlasDocument`s — nothing about
outputs.

## API

- `loadDocuments(contentDir, exclude?): LoadResult` — discover `.md`
  files, parse frontmatter, validate metadata, detect duplicate slugs.
  Returns `{ documents, diagnostics }` sorted by (`order`, `slug`).
  One bad file never hides another.
- `discoverDocuments`, `slugForFile`, `isExcluded` — discovery primitives.
- `parseDocument`, `validateMeta`, `extractHeadings` — pipeline stages,
  also usable independently.
- Frontmatter schema: required non-empty `title` / `description`;
  optional `order` (finite number ≥ 0), `maturity` (`draft` (default) |
  `stable` | `deprecated`).
- Headings: ATX (`#`, up to 3 leading spaces) and single-line setext
  (`===`/`---` underlines) are extracted with unique anchor ids; fenced
  code is never scanned. Blockquote-prefixed headings are not extracted.
- Links: Markdown link syntax passes through verbatim. Atlas v1 does not
  resolve, rewrite, or validate links — link checking belongs to a future
  consumer.

## Notes

- gray-matter is always called with an explicit options object to bypass
  its input cache (a throwing parse would otherwise poison the cache and
  make repeat parses non-deterministic). The options argument is typed as
  required in `src/vendor.d.ts` to enforce this. Re-verify against the
  installed gray-matter version on upgrade.
- Fixtures in `fixtures/` (`docs/` valid, `invalid/` per-error cases,
  `duplicates/` slug collision). Keep them small and purpose-built.

## Develop

```sh
bun test
bun run check
```
