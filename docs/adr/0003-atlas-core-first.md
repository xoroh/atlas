# ADR-0003: Atlas Core-first engine architecture

- Status: accepted (owner-directed, 2026-10-16)
- Date: 2026-10-16
- Deciders: repository owner. The core-first objective is settled by owner
  direction; this ADR records it and its consequences.
- Supersedes: ADR-0002 (TanStack Start as the immediate foundation —
  withdrawn; see §2). Confirms: ADR-0001 §D3 withdrawal stands.

## 1. Context

Previous planning framed TanStack Start as the immediate Atlas foundation
(ADR-0002) and centered the roadmap on migrating the `apps/docs` website.
The owner has corrected the objective: **the Atlas documentation engine
and its packages are the immediate product; a website is a future consumer,
not the foundation.** Building or migrating a site before the engine is
useful creates maintenance burden without producing the actual product.

## 2. Relationship to earlier ADRs

- **ADR-0002 is superseded in full** as an implementation program. Its
  durable content is preserved, not deleted: the static-output verification
  discipline (explicit route inventory, no-backend proof, measured client
  cost) and the bounded-spike rule for undecided selections remain valid
  requirements for any future consumer, and are referenced by
  `docs/migration-plan.md`. What is withdrawn: TanStack Start as the
  immediate foundation, and the website-migration roadmap.
- **TanStack Start is not the engine's foundation.** It may be used for a
  future Atlas website; Atlas Core must not depend on it (nor on Astro,
  Starlight, React, or any rendering framework). No earlier framework
  decision was owner-approved, and none is implied here.
- **ADR-0001:** the D3 withdrawal stands. D1 (engine/site seam, extraction
  deferred until a second consumer) is refined by §4 below: the seam now
  separates engine packages from each other and from future consumers.
  D2 (file-based content in-repo), D4 (URL reservations), D5-intent (static
  AI surfaces first) remain valid; their website-shaped mechanisms are
  future-consumer concerns.

## 3. Decision

Build **Atlas Core** first, inside the existing Bun monorepo, as a small set
of justified packages (§4) proven by a working content-to-output vertical
slice (§5) and automated tests. The engine must be useful and testable with
no website present. The Astro + Starlight scaffold in `apps/docs` is removed
as part of this transition (its prose survives in git history; valid
governance/CI/monorepo infrastructure is retained and repointed at the
engine).

## 4. Package principles (decided)

- Each package has a stated purpose, public API, explicit ownership
  boundary, permitted dependency direction, and independent tests. A package
  is created only for a demonstrated responsibility — never for diagram
  symmetry or hypothetical integrations.
- Dependency direction flows one way toward stability: adapters/build depend
  on content and core; content depends on core; **core depends on nothing
  except the language runtime.** No cycles, verified by a checked test.
- Framework adapters (MDX, search engines, themes, site generators) are
  separate packages only when a real requirement justifies them. None are
  created now.
- Initial packages (rationale recorded in `docs/target-architecture.md`):
  `@xoroh/atlas-core` (contracts: configuration, document model, public
  types, diagnostics), `@xoroh/atlas-content` (discovery, parsing,
  validation, normalized representation), `@xoroh/atlas-build` (pipeline
  orchestration and deterministic output generation).

## 5. First vertical slice (decided scope)

Load an Atlas configuration → discover fixture documentation → parse the
initial content format → validate required metadata with useful errors →
normalized document representation → at least one deterministic generated
output → automated tests for success and meaningful failure cases. The slice
must be consumable by a future site or CLI, not only inside a framework
application. Initial format: Markdown with YAML frontmatter (real
requirement: text authoring with metadata; MDX stays a future adapter until
justified).

## 6. What is explicitly not decided here

Search implementation, hosting, site framework for a future website,
additional packages or adapters, publish/release timing. Future consumers
(static sites, navigation/search indexes, SEO artifacts, `llms.txt`
generation at site level, CLIs, agent workflows) are evaluated only when
Atlas Core is ready and a consumer genuinely needs them (roadmap Phase E).

## 7. Consequences

Planning documents are revised to the core-first phase plan (A: contracts
and boundaries; B: working engine; C: developer experience; D:
stabilization; E: future consumers). CI and root scripts validate the
engine, not a website. The core-first constraint joins the skill's
boundaries: no website work, no speculative packages, no framework
dependencies in the engine.
