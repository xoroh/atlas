# @xoroh/atlas-core

Contracts for the Atlas documentation engine: configuration model,
document representation, public types, and diagnostics. Zero runtime
dependencies by design — everything in the engine depends on these
contracts, and they depend on nothing.

## API

- `loadConfig(input: unknown): ConfigResult` — validate unknown input into
  an `AtlasConfig` (`title`, `contentDir` required; `description`,
  `exclude` optional). Never throws for invalid input; problems come back
  as `AtlasDiagnostic[]`.
- Types: `AtlasConfig`, `AtlasDocument`, `ValidatedMeta`,
  `DocumentMaturity` (`"draft" | "stable" | "deprecated"`),
  `DocumentHeading`, `AtlasDiagnostic`.
- `hasErrors`, `formatDiagnostic`, `formatDiagnostics` — diagnostic helpers.
- `toSlug(value)` — shared slug helper.

## Develop

```sh
bun test                 # from the repository root, or this directory
bun run check            # strict typecheck (via root script)
```
