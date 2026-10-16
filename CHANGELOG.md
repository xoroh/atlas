# Changelog

Notable changes to Atlas will be documented here.

## Unreleased

- Establish the MIT-licensed Bun monorepo and open-source project scaffold.
- Adopt the core-first objective (ADR-0003, superseding ADR-0002): implement
  the tested Atlas Core engine packages (`atlas-core`, `atlas-content`,
  `atlas-build`) and remove the Astro + Starlight website scaffold
  (`apps/docs`; prose preserved in git history).
- Validate the engine against a realistic corpus (Phase D): fix dropped
  setext/indented headings and `writeOutputs` directory containment;
  document verbatim link pass-through.
- Close out Phase D: empty corpus succeeds with a deterministic warning
  (`BuildResult.warnings`); portability review on Linux (ordering,
  containment, CRLF, Unicode, leak-free artifacts); cross-machine
  comparison and real Xoroh documents outstanding.
- Consolidate the engine workstream to `main` (`9dd6f7a`): 47 tests
  passing, strict typecheck clean, remote CI green on the consolidated
  commit (2026-10-16). External package installation, publishing, and
  real-consumer validation remain deferred and unproven; nothing was
  published, tagged, or released.
