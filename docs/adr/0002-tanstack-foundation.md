# ADR-0002: TanStack Start as the Atlas foundation

- Status: **superseded by ADR-0003** (2026-10-16, owner-directed core-first
  objective). TanStack Start as the immediate foundation is withdrawn; it
  remains a candidate technology for a future Atlas website only. Atlas Core
  must not depend on it.
- Date: 2026-10-16
- Deciders: repository owner. The framework decision is settled by owner
  direction and is not subject to re-confirmation; this ADR records it, its
  rationale, and its consequences.
- Supersedes: ADR-0001 §D3 (Astro + Starlight). Carries forward ADR-0001
  §§D1, D2 (principle), D4, D5 (intent); see §2 below.

> Historical note: the decision body below is preserved unchanged. It was
> superseded before implementation began — no website migration was ever
> started. Durable requirements (static-output verification discipline,
> bounded spikes for undecided selections) carry forward via ADR-0003 and
> `docs/migration-plan.md`.

## 1. Context

ADR-0001 recorded Astro + Starlight as the Atlas framework with supporting
spike evidence, but that selection was never approved by the owner. The owner
has directed that Atlas be a TanStack-first application: TanStack Start is
the default application foundation, replacing the Astro/Starlight scaffold
rather than coexisting with it. The existing `apps/docs` Astro site (five MDX
pages, Starlight configuration) is a legacy implementation pending migration.

This ADR establishes the target foundation so that planning, agent
instructions, and implementation all follow one approved direction.

## 2. Relationship to ADR-0001

| ADR-0001 item | Standing after this ADR |
|---|---|
| D1 — engine/site configuration seam; extraction deferred until a second consumer | **Retained unchanged.** No `packages/atlas-engine` is created for v1. |
| D2 — file-based MDX in-repo | **Principle retained; mechanism replaced.** Content stays as MDX files in the repository, but Starlight content collections (`docsLoader`/`docsSchema`) are replaced by an Atlas-owned pipeline (§5). |
| D3 — Astro + Starlight | **Withdrawn and superseded by this ADR.** Its measurements remain factual about the old implementation only. |
| D4 — reserve `/v/{version}` and `/{locale}/`, ship neither in v1 | **Retained unchanged.** Reservations cost nothing; no routing complexity is added now. |
| D5 — static `llms.txt` + per-page Markdown + small `manifest.json` first; MCP/CLI deferred | **Intent retained; generation mechanism re-implemented** in the new pipeline (§9). MCP server and CLI stay deferred until a real consumer requires them. |

## 3. Decision

Atlas is built on **TanStack Start** (React + TanStack Router, file-based
routing) as the single application foundation:

- One documentation application in **`apps/docs`** (name retained — CI
  filters, workspace name `@xoroh/atlas-docs`, skill references, and content
  links are all keyed to it; renaming has no functional benefit).
- The Astro + Starlight application is removed only after the replacement
  passes every acceptance gate in `docs/migration-plan.md`. Until then the
  two do not share code, configuration, or dependencies beyond the Bun
  workspace root.
- Prefer the TanStack ecosystem (Router, Start, Query where a concrete need
  exists) for consistency and long-term maintenance. Each addition must still
  pass the dependency criteria in §10.

## 4. Application structure (decided)

```text
apps/docs/
  routes/        — TanStack Router file routes (one route per doc page + layout/404)
  content/docs/  — file-based MDX source (moved from src/content/docs/, rewritten)
  lib/content.*  — Atlas-owned content pipeline (inventory, schema, navigation, artifacts)
  public/        — static assets (llms.txt source or generated output, favicons, fonts)
  vite.config.ts — TanStack Start plugin + prerender configuration (§7)
```

No new workspace packages for v1 (ADR-0001 D1). Shared content utilities
live inside `apps/docs` as plain modules; they must not import TanStack
Start unless a concrete need is demonstrated — simple functions over parsed
MDX stay framework-independent where that is free, never as a speculative
abstraction layer.

## 5. Routing, content authoring, MDX, metadata, navigation, page generation

**Decided:**

- **Routing:** file-based routes mirroring documentation slugs (e.g.
  `/getting-started/`, `/guides/architecture/`). The route tree is the
  single source of URL truth; a checked-in **route-inventory module**
  enumerates every expected documentation route so generation gaps are
  detectable (see acceptance gate 1).
- **Content authoring:** MDX files in-repo. Starlight-specific frontmatter
  (`template: splash`, `hero` blocks) and Starlight sidebar slugs are
  rewritten, not mechanically ported — the five existing pages are content
  to preserve, not conventions to keep.
- **Metadata:** Atlas-owned frontmatter schema (required: `title`,
  `description`; optional: navigation weight, maturity, order). Missing or
  invalid metadata fails the build or a checked test (acceptance gate 7).
- **Navigation:** Atlas-owned navigation configuration (sidebar structure,
  ordering, grouping) replacing `astro.config.mjs`'s Starlight sidebar. Every
  inventoried route must be reachable from navigation or explicitly marked
  unlisted; orphan pages fail validation.
- **Page generation:** all documentation routes are prerendered to static
  HTML at build time. Dynamic (`$param`) routes are avoided for v1 content;
  if any are introduced, each must be covered by explicit `pages` entries or
  proven `crawlLinks` reachability, with `failOnError: true` (acceptance
  gate 2).

**Implementation detail (implementer chooses, records the choice):** the MDX
processing library, the exact frontmatter parser/validator, and the sitemap
generator — subject to §10 criteria.

**Requires prototype evidence:** the exact prerender configuration against
the **installed** `@tanstack/react-start` version's schema (option names
have changed across versions and third-party guides have documented
non-existent options — verify against the installed schema, never from
memory). The search-spike outcome (§8).

## 6. Rendering approach (decided)

Prerendered HTML-first: every documentation page ships complete static HTML;
client-side hydration is bounded to what interactive elements (theme toggle,
search UI, navigation state) actually require. Route-level code-splitting is
expected, not global bundles. The measured client-JavaScript cost per route
is recorded and reviewed at the verification gate (see §11 and
`docs/migration-plan.md`); unjustified growth beyond the documented budget
blocks cutover.

## 7. Static deployment (decided, required for v1)

Static deployment **without an Atlas-hosted backend is a required
capability** for the initial version, not an aspiration:

- The production build emits a self-contained static directory servable by
  any static file server or CDN.
- Hosting provider and site URL stay **TBD behind a configuration seam**
  (base URL / canonical host from environment or config, never hardcoded),
  continuing the current `astro.config.mjs` practice of setting no `site` URL.
- The plan requires proof, not assertion: `docs/migration-plan.md` lists the
  acceptance gates, including serving the output through a dumb static file
  server with no Atlas backend process running.
- What cannot be proven until the host is known (host-specific 404 rewrite
  semantics) is proven against the host's documented behavior at selection
  time and re-verified on first deploy — it is not hand-waved.

## 8. Search (decided: bounded evaluation, then selection)

No search implementation is chosen in this ADR. A **bounded technical spike**
selects it before the content pipeline is finalized:

- Time-boxed; candidates compared on: build-time index generation,
  static-host compatibility (no required backend), client-JS cost, authoring
  burden, license compatibility.
- The content pipeline is built behind a narrow search seam (an index-build
  step plus a search-UI slot) so pipeline work is not blocked while selection
  is open — but the pipeline is not finished until search assets cover every
  expected page (acceptance gate 3).
- The selection and its evidence are recorded (ADR-0002 amendment or
  follow-up note) before search ships.

## 9. SEO, themes, error/404 handling, AI/LLM outputs (decided)

- **SEO:** per-page `title`/`description`, semantic HTML, generated sitemap,
  canonical URLs resolved through the hosting seam once the host is known.
- **Themes:** light/dark theming via CSS with `prefers-color-scheme`
  default, persisted user preference, no-JS fallback to a readable default.
  No behavior that requires JavaScript to read the page.
- **Error/404:** a designed 404 route plus the host-appropriate static
  mechanism (static `404.html` and/or host rewrite to an SPA shell, per the
  chosen host's documented semantics — validated, acceptance gate 4).
- **AI/LLM outputs (ADR-0001 D5 carried forward):** build-generated static
  `llms.txt`, per-page Markdown artifacts, and a small `manifest.json`
  (routes, versions, maturity), each covered by file-existence and
  route-completeness checks (acceptance gate 6). MCP server and CLI remain
  deferred.

## 10. Dependency selection criteria (decided)

A dependency is added only with a named, concrete requirement it satisfies.
It must additionally be: compatible with prerendered static output; actively
maintained; license-compatible with MIT distribution; and minimal in
transitive weight (lockfile impact reviewed in the migration PR). No
framework-neutral abstraction packages, no speculative shared libraries, no
`packages/*` additions for v1. Reused third-party code keeps its legally
required attribution; compliance records live outside product-facing
architecture documentation.

## 11. Trade-offs against the existing implementation (decided context)

Honestly recorded so the migration cannot silently discard ADR-0001's
selection criteria:

- **Client JavaScript increases.** Starlight's near-zero-JS output was a
  recorded reason for its selection; a React-based app ships runtime JS.
  This is accepted under owner direction and bounded by §6 (prerender-first,
  measured budgets, documented delta at cutover).
- **Starlight built-ins are lost** (managed sidebar/i18n/versioning
  operations, built-in Pagefind wiring) and re-implemented only where v1
  needs them — sidebar/navigation and search-index generation are in scope;
  versioned snapshots and i18n content operations stay deferred per ADR-0001.
- **Gained:** the owner-directed TanStack consistency and a content pipeline
  Atlas owns outright, with no framework-owned content model to migrate off
  later.

## 12. Migration, validation, rollback (decided requirements)

- The Astro application is preserved byte-identical until the TanStack
  replacement passes **all** acceptance gates; removal follows the ordered
  sequence in `docs/migration-plan.md` (app → dependencies/lockfile → CI and
  test updates → documentation/skill updates).
- Rollback before cutover is deletion of the new app plus revert of its
  commits; after cutover it is `git revert` of the cutover commit(s). No
  migration step may destroy the only working copy of any content page —
  content exists in exactly one authoritative location at every phase, with
  the other copy explicitly marked the mirror.
- Dependency and lockfile changes stay consistent with the Bun workspace
  (`bun install --frozen-lockfile` reproducible; `packageManager`/`engines`
  pins unchanged — the local Bun 1.3.8 vs required 1.4.2 gap is an
  environment constraint, never a reason to lower the requirement).
- Dependabot maintenance stays separate from migration commits.

## 13. Future extension without premature abstraction (decided)

Engine extraction (`packages/atlas-engine`) happens if and when a second
consumer exists (ADR-0001 D1). Versioned snapshots and i18n content arrive
through the reserved URL design (ADR-0001 D4) with their own cost
justification. API-reference generation, search-service upgrades, MCP/CLI
programmatic access — each needs a real consumer first. Nothing in v1 is
shaped by these futures beyond the already-recorded seams.

## 14. What remains explicitly unresolved (not decided here)

- Search implementation (spike per §8).
- Hosting provider and site URL (TBD seam per §7).
- Exact dependency versions and prerender option names (chosen and verified
  at implementation time against installed schemas).
- Client-JS budgets in kilobytes (proposed during implementation, approved at
  the verification gate).
