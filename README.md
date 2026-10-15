# Atlas

Atlas is Xoroh's open-source documentation project, organized as a Bun workspace monorepo.

> **Status:** This repository currently contains the project scaffold only. The documentation framework, content model, and site implementation have not been selected or added yet.

## Workspace layout

- `apps/docs/` — the planned documentation site
- `packages/*` — future shared documentation tooling or components

## Development

Requirements: Bun 1.3.8 or newer.

```sh
bun install --frozen-lockfile
bun test
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
