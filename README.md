# Atlas

Atlas is Xoroh's open-source documentation project, organized as a Bun workspace monorepo.

> **Status:** Early implementation. `apps/docs` is a working Astro + Starlight
> documentation site; reusable engine extraction (`packages/`) waits for a
> second consumer. See `docs/adr/0001-atlas-foundation.md` for the recorded
> architecture decisions.

## Workspace layout

- `apps/docs/` — the Xoroh Atlas documentation site (Astro + Starlight)
- `packages/*` — future shared documentation tooling or components

## Development

Requirements: Bun 1.4.2 or newer.

```sh
bun install --frozen-lockfile
bun test
bun run check
bun run build
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
