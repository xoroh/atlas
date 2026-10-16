# Contributing to Atlas

Atlas is an early-stage open-source documentation project. For a substantial change, open an issue first so its scope can be discussed.

## Development setup

Requirements: Bun 1.4.2 or newer.

```sh
git clone https://github.com/xoroh/atlas.git
cd atlas
bun install --frozen-lockfile
bun test
```

Documentation framework choices follow `docs/adr/0003-atlas-core-first.md`: a framework-independent engine with Markdown sources. Keep contributions within that direction until the owner agrees a new one.

## Pull requests

- Branch from `main` and target pull requests at `main`.
- Keep changes focused and explain the problem they solve.
- Add or update tests and documentation when behavior or setup changes.
- Do not include secrets, credentials, or private user data.
- Preserve the repository's MIT license and any third-party notices.

By contributing, you agree that your contribution may be distributed under the repository's MIT License.
