# Atlas

Atlas is Xoroh's open-source documentation engine, organized as a Bun workspace monorepo.

> **Status:** Core-first implementation. `packages/atlas-core`,
> `packages/atlas-content`, and `packages/atlas-build` form a tested
> configuration-to-output engine with no website dependency. A documentation
> site is a future consumer, not the foundation. See
> `docs/adr/0003-atlas-core-first.md` for the approved architecture and
> `docs/roadmap.md` for the incremental plan (phases A–E).

## Workspace layout

- `packages/atlas-core` — contracts: configuration, document model, types, diagnostics
- `packages/atlas-content` — Markdown discovery, parsing, validation, normalized documents
- `packages/atlas-build` — pipeline orchestration and deterministic output generation
- `apps/*` — reserved for future consumer applications (none exist yet)

## Development

Requirements: Bun 1.4.2 or newer.

```sh
bun install --frozen-lockfile
bun test
bun run check
```

## Community

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)

## Releases

There is no package publisher or deployment workflow. Any future package release will be a deliberate manual action; see [docs/RELEASING.md](docs/RELEASING.md).

## License

Atlas is licensed under the [MIT License](LICENSE). Workspace packages should retain MIT unless the owner changes that decision.
