# Implementation plan — TanStack Start migration

Follows `docs/migration-plan.md` phases. Starts only after the owner has
reviewed the Phase-0 document set. The implementer works in `xoroh/atlas`
only, on feature branches targeting `development`, for review via PR.

## Workstreams and order

1. **Search spike** (migration Phase 1). Inputs: candidate list, evaluation
   criteria (ADR-0002 §8). Output: selection + evidence matrix + pinned
   versions. Blocks: search-UI and index wiring only — pipeline skeleton may
   proceed behind the seam.
2. **Scaffold** (Phase 2). TanStack Start + Router + Vite config with
   prerender settings verified against the installed schema; `__root`,
   layout, five routes, 404 route; theme/SEO shell; hosting (base-URL) seam.
   Done when: static output serves locally with all five routes.
3. **Content pipeline** (Phase 2–3). `lib/content.*`: inventory enumerator,
   frontmatter schema + validator, navigation config + orphan check,
   Markdown/sitemap/`manifest.json`/`llms.txt` generators. Done when:
   gates 1, 6, 7 pass.
4. **Content rewrite** (Phase 3). Five MDX pages ported to Atlas schema
   (no Starlight frontmatter). Done when: rendered pages reviewed for
   content fidelity; gate 9 parity items checked.
5. **Search wiring** (Phase 3). Index build + UI slot per spike outcome.
   Done when: gate 3 passes.
6. **Assets/hosting validation** (Phase 3). Asset audit, 404 mechanism per
   host docs, no-server proof, JS measurement. Done when: gates 4, 5, 8, 9
   pass.
7. **Cutover** (Phase 4). Ordered removal per migration plan; CI/test/docs
   updates. Done when: CI green, gates re-run green.
8. **Hygiene** (Phase 5). Changeset if warranted, CHANGELOG, consistency
   pass.

Dependencies: 1 → 5; 2 → 3, 4, 6; 3 → 6; 4 → 6; 6 → 7 → 8. Workstreams 2–4
can overlap once interfaces (route slugs, frontmatter schema, search seam)
are agreed.

## Definition of done (whole migration)

All nine acceptance gates green, CI green, no Astro/Starlight remnants
(`grep` clean for `astro`, `starlight` outside historical ADR text and this
plan set), skill/READMEs/`llms.txt` accurate, lockfile diff reviewed,
rollback path stated in the cutover PR.

## Explicitly out of scope

New workspace packages; engine extraction; versioning/i18n content;
API-reference generation; MCP/CLI; SSR/hosted runtimes; renaming
`apps/docs`; Dependabot upgrades (separate PRs); changes to `xoroh/xoroh`
or any other repository; Fumadocs references in product docs.

## Notes to the implementer

- Pin and record exact framework versions; cite installed-schema behavior,
  not remembered docs.
- Keep migration commits separate from maintenance commits.
- If any gate proves unpassable with the chosen stack, stop and report —
  do not weaken the gate silently.
