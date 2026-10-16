/**
 * Minimal local declarations for `gray-matter@4`, covering exactly the
 * surface Atlas uses. There is no `@types/gray-matter` on the registry, so
 * Atlas declares the used subset here rather than typing the whole library.
 * Re-verify against the installed version when upgrading gray-matter.
 *
 * The `options` argument is deliberately REQUIRED here (upstream it is
 * optional): calling gray-matter without options enables an input-keyed
 * result cache, and a throwing parse poisons that cache — repeat calls
 * with the same malformed input then return empty data instead of
 * throwing. Atlas always passes at least `{}` to bypass the cache.
 */
declare module "gray-matter" {
  interface GrayMatterFile {
    data: { [key: string]: unknown };
    content: string;
    excerpt?: string;
    [key: string]: unknown;
  }

  function matter(
    input: string | Uint8Array,
    options: Record<string, unknown>,
  ): GrayMatterFile;

  export default matter;
}
