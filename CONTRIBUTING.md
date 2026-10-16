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

Documentation framework and publishing choices are intentionally not set yet. Keep contributions framework-neutral until that direction is agreed.

## Pull requests

- Branch from `development` and target pull requests at `development`.
- Keep changes focused and explain the problem they solve.
- Add or update tests and documentation when behavior or setup changes.
- Do not include secrets, credentials, or private user data.
- Preserve the repository's MIT license and any third-party notices.

By contributing, you agree that your contribution may be distributed under the repository's MIT License.
