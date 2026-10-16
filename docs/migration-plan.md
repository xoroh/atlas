# Migration plan — Astro/Starlight → TanStack Start

Decisions: `docs/adr/0002-tanstack-foundation.md`. Target shape:
`docs/target-architecture.md`. Work breakdown: `docs/implementation-plan.md`.
Order of milestones: `docs/roadmap.md`.

## Invariants

1. The Astro application is preserved byte-identical until the replacement
   passes **all** acceptance gates (§4). No shared code, config, or
   dependencies between old and new app (workspace root only).
2. Content exists in exactly one authoritative location per phase; the other
   copy is explicitly marked the mirror.
3. Rollback is always available: before cutover, delete the new app and
   revert its commits; after cutover, `git revert` the cutover commit(s).
4. Lockfile changes stay reproducible (`bun install --frozen-lockfile`);
   `packageManager`/`engines` pins are untouched. Local Bun 1.3.8 vs
   required 1.4.2 is an environment constraint — never lower the
   requirement. CI (Bun 1.4.2) is the validation authority.
5. Dependabot maintenance stays in separate commits/PRs, never mixed with
   migration work.

## Phases

### Phase 0 — Foundation record (this task; no code)

ADRs corrected/established, planning docs written, agent instructions and
stale governance text corrected. **Gate:** owner reviews this document set.
No application, dependency, or deployment change occurs.

### Phase 1 — Search spike + dependency selection

Bounded, time-boxed evaluation: candidates compared on build-time index
generation, static-host compatibility (no backend), client-JS cost,
authoring burden, MIT-compatible licensing. Records: selection, evidence
matrix, exact versions. **Gate:** selection recorded (ADR-0002 amendment or
dated note); MDX/search-UI dependencies chosen against ADR-0002 §10.
Uses **actual installed-version schemas and docs** — upstream guides have
shipped non-existent options; verify, don't copy.

### Phase 2 — Side-by-side scaffold

New TanStack Start app scaffolded next to the untouched Astro app
(temporary workspace entry or clearly-marked directory per implementer
choice, recorded in the migration PR). Content pipeline skeleton
(inventory + schema + navigation), theme/SEO shell, 404 route, AI-artifact
generators, search seam wired to the Phase-1 selection. **Gate:** `bun run
build` emits a servable static directory; route inventory matches content.

### Phase 3 — Content migration + verification

The five MDX pages rewritten into the new pipeline (Starlight frontmatter
removed, Atlas schema applied). Full acceptance-gate run (§4), JS budgets
measured and recorded. **Gate:** all nine gates pass; parity checklist
signed off in the migration PR.

### Phase 4 — Cutover (ordered removal)

Strictly in this order: (1) switch workspace scripts/CI to the new app;
(2) delete the Astro app directory and its configs; (3) prune
dependencies/lockfile entries (`bun install`, review the diff);
(4) rewrite `tests/monorepo.test.ts` test 3 for the new toolchain;
(5) update READMEs, skill, `llms.txt` if generated. Each step keeps CI
green. **Gate:** full CI green on the final tree + acceptance gates re-run.

### Phase 5 — Release hygiene

Changeset (if the change warrants versioning under repo policy), CHANGELOG
entry, final docs consistency pass.

## Acceptance gates (all must pass before Phase 4)

1. **Route completeness:** script-enumerated expected routes from the
   content directory; every one has corresponding output HTML.
2. **Dynamic routes:** none unhandled — v1 avoids `$param` routes; any
   introduced are covered by explicit `pages` entries or proven
   `crawlLinks` reachability, with prerender `failOnError: true`.
3. **Search coverage:** search assets exist in output and cover every
   expected page (count + spot-checks).
4. **404 correctness:** output mechanism (static `404.html` and/or host
   rewrite target) validated against the chosen host's documented
   semantics; unknown paths render the designed 404, not a blank shell.
5. **Asset integrity:** CSS, fonts, images, public files present with
   correct references; homepage + one guide page load with zero 404
   sub-requests.
6. **AI artifacts:** `llms.txt`, `manifest.json`, per-page Markdown
   generated, route-complete, content-accurate (not stale copies).
7. **Link/metadata detection:** build or checked test fails on broken
   internal links and on missing/invalid required frontmatter; orphans
   (inventoried but unlisted in navigation) fail unless explicitly marked.
8. **No-server proof:** output served by a dumb static file server with no
   Atlas backend process passes the route smoke test.
9. **Functional parity + JS cost:** the five pages' content, navigation
   completeness, SEO basics, and theme behavior match the agreed
   requirements; per-route client-JS measured, budgeted, and documented
   (delta vs Starlight stated honestly).

## Rollback conditions

- Any gate failure in Phase 3 blocks Phase 4 — no partial cutover.
- CI red at any Phase 4 step: stop, fix forward only if trivially safe,
  otherwise revert to the last green commit (Astro app intact by invariant 1).
- Post-cutover regression: `git revert` the cutover commit(s).

## Risks

- Silent route omission via prerender auto-discovery gaps (mitigated: gate 1
  inventory test; param routes excluded from discovery by default).
- Host-specific 404 behavior differing from local static serving (mitigated:
  gate 4 against host docs; re-verify on first deploy).
- Search choice conflicting with static output (mitigated: static-host
  compatibility is a spike criterion, Phase 1).
- Client-JS growth vs Starlight baseline (mitigated: gate 9 budgets).
- Version drift between framework docs and installed schema (mitigated:
  Phase 1 rule — verify against installed code).
