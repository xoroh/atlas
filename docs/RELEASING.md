# Manual package releases

Atlas currently has no publishable packages. The monorepo root and `@xoroh/atlas-docs` workspace are private; there is no GitHub Actions publish workflow.

Before a future package release, add real implementation and entry points, review its MIT license and packed contents with `npm pack --dry-run`, and obtain an explicit human release approval. Publish manually only after confirming the account can publish to the `@xoroh` scope. Never commit npm tokens.
