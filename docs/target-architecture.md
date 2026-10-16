# Target architecture — Atlas Core engine

Authoritative decisions: `docs/adr/0003-atlas-core-first.md` (accepted,
owner-directed; supersedes ADR-0002). ADR-0002's verification discipline
(route inventories, no-backend proofs, bounded spikes) carries forward for
future consumers. On any conflict, the ADR prevails.

## System shape

Atlas Core is a set of Bun-workspace packages with one-way dependencies.
No website, no framework runtime, no hosted backend in the immediate
product.

```text
packages/atlas-core/       contracts: config model, document model,
                           public types, diagnostics, lifecycle interfaces.
                           Depends on: nothing (language runtime only).
packages/atlas-content/    discovery, Markdown+frontmatter parsing,
                           metadata validation, normalized representation.
                           Depends on: atlas-core (+ frontmatter library).
packages/atlas-build/      pipeline orchestration + deterministic output
                           generation (manifest, llms.txt, per-page
                           Markdown). Depends on: atlas-core, atlas-content.
```

## Package rationale (one package per demonstrated responsibility)

- **atlas-core** exists so every present and future package shares one
  configuration model, one document representation, and one diagnostic
  shape — without inheriting parsing or generation behavior. Zero runtime
  dependencies keeps it stable and trivially testable.
- **atlas-content** exists because file discovery, Markdown parsing, and
  metadata validation change together and for different reasons than
  contracts. It owns everything about turning files into validated
  `AtlasDocument`s and nothing about outputs.
- **atlas-build** exists because orchestration (load → discover → validate →
  generate) and output formats change for consumer-driven reasons,
  independent of parsing. It owns the end-to-end lifecycle and generated
  artifacts, and nothing about parsing.
- **Not created:** MDX adapter (no justified requirement; Markdown suffices
  for the slice), search package (future consumer concern), theme/SEO/site
  packages (presentation belongs to consumers), engine-extraction packages
  beyond these three (no second engine consumer exists).

## Content pipeline (the vertical slice)

Configuration → discovery (`.md` files under a content directory) →
frontmatter parsing → metadata validation (required `title`,
`description`; duplicate-slug and orphan detection) → normalized
`AtlasDocument` (slug, metadata, body, extracted headings) → deterministic
outputs: `manifest.json` (routes, titles, maturity), `llms.txt` (index),
per-page Markdown. Every stage reports structured diagnostics; invalid
configuration or content fails loudly with file, line, and reason.

## What stays internal vs public

Public: config loader, document loader, pipeline entry, output writers,
all types/diagnostics needed to consume them. Internal: heading
extraction details, file-walk mechanics, output string templates —
exposed only through their tested public functions until a consumer needs
otherwise.

## Boundaries

- Engine packages never import Astro, Starlight, TanStack Start, React, or
  any rendering framework — enforced by a checked test.
- The engine produces validated documents and outputs; future consumers
  decide presentation and deployment (static sites, search indexes, SEO
  artifacts, CLIs, agent workflows — roadmap Phase E, none implemented now).
- Determinism: identical inputs produce byte-identical outputs (verified by
  test); builds are reproducible from a frozen lockfile.
