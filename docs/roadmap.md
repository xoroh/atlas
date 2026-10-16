# Roadmap — Xoroh Atlas

Ordering is by dependency and exit criteria, not calendar dates. No milestone
is scheduled until its prerequisites are met; no milestone is skipped.

## M0 — Foundation record (this task)

ADRs corrected and established (0001 corrected, 0002 accepted), planning
docs written (`repository-audit`, `target-architecture`, `migration-plan`,
`implementation-plan`, this roadmap), agent instructions and stale
governance text corrected. **Exit:** owner reviews the document set.
No code, dependency, or deployment change.

## M1 — Search selection + scaffold

Search spike concluded and recorded; TanStack Start app scaffolded
side-by-side with a servable static build of stub routes; route inventory
matches content. **Exit:** migration-plan Phase 1–2 gates pass. Astro app
untouched.

## M2 — Verified replacement

Content rewritten, all nine acceptance gates pass, JS budgets measured and
documented, parity checklist signed off in the migration PR. **Exit:**
reviewer approves; cutover authorized. Astro app still present (rollback
intact).

## M3 — Cutover

Ordered Astro removal complete; CI green on the final tree; gates re-run
green; hygiene (changeset if warranted, CHANGELOG, consistency pass) done.
**Exit:** `development` is TanStack-only with a clean `grep` for framework
remnants. Rollback thereafter is `git revert`.

## M4 — Post-v1 evolution (as real requirements emerge)

Search hardening from usage; hosting selection finalized with host-verified
404 semantics; second consumer → engine extraction; versioning/i18n via
reserved URL design; API-reference generation; MCP/CLI programmatic access.
Each item needs its own consumer and cost justification — none is designed
or built in v1.

## Non-roadmap items (explicitly excluded)

Framework re-selection (decided: ADR-0002), `apps/docs` renaming, new v1
packages, Dependabot upgrades (handled as separate maintenance).
