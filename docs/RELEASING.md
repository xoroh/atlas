# Manual package releases

Atlas has no published packages and no publish workflow. The monorepo root
and engine workspace packages (`@xoroh/atlas-core`, `@xoroh/atlas-content`,
`@xoroh/atlas-build`, all `0.1.0`) are private with explicit entry points
(`src/index.ts` via `exports`), MIT licensed, and versioned through
Changesets (config in `.changeset/config.json`, base branch `main`).

No package is installed by external consumers today, and that path is
untested — do not claim otherwise. A future deliberate release requires,
in order:

1. Owner approval to publish, including the target registry and whether
   packages stay in the `@xoroh` scope.
2. Un-privating the intended packages and deciding versions (Changesets
   `changeset` + `version-packages` flow; CHANGELOG is maintained by hand).
3. Reviewing MIT license and packed contents with `npm pack --dry-run`.
4. Verifying the packed package installs and type-checks from a clean,
   non-workspace consumer (unproven until done).
5. Manual `npm publish` with two-person review of steps 1–4. Never commit
   npm tokens. CI must never publish.

Before a future package release, add real implementation and entry points, review its MIT license and packed contents with `npm pack --dry-run`, and obtain an explicit human release approval. Publish manually only after confirming the account can publish to the `@xoroh` scope. Never commit npm tokens.
