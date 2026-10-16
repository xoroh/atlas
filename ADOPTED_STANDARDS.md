# Adopted standards record — Atlas

- Canonical source repository: `https://github.com/xoroh/xoroh`.
- Standards tag: none yet (`STANDARDS-v*` tags do not exist; see ADR-002 in
  the governance repository).
- Pinned Xoroh revision: `c4fd5f7` (merged `main`; only already-merged
  standards adopted — the governance working copy's uncommitted skill-system
  additions are excluded until integrated).
- Previous pin: none (initial adoption).
- Adoption date: 2026-10-16.
- Adopted (adapted copies; Xoroh is never a dependency):
  - `AGENTS.md` (agent scope, prohibitions, reporting; Atlas scope).
  - `.agents/skills/atlas/SKILL.md` (new Atlas governing skill following
    Xoroh skill conventions; project-specific content).
  - Contribution/security/support/conduct conventions (already present in
    this repository; aligned, not copied).
  - Changesets + manual-release discipline (already present; retained).
- Validation: `bun test` (existing scaffold tests), recorded per change.
- Deviations: Bun 1.4.2 alignment recorded below; secret scanning and push
  protection enabled for this repository (verified via API).
