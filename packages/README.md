# Packages

Atlas engine packages. Each package has a stated purpose, public entry
point (`src/index.ts`), explicit dependency direction (toward
`atlas-core`), and independent tests. Add a package only for a
demonstrated responsibility with an explicit contract — see
`docs/adr/0003-atlas-core-first.md` §4.

- `atlas-core` — contracts: configuration, document model, types, diagnostics.
- `atlas-content` — discovery, Markdown+frontmatter parsing, validation.
- `atlas-build` — pipeline orchestration and deterministic output generation.
