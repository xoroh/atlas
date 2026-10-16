/** Lifecycle maturity of a document, for consumers to filter or badge. */
export type DocumentMaturity = "draft" | "stable" | "deprecated";

/** Validated document metadata. `title` and `description` are always required. */
export interface ValidatedMeta {
  readonly title: string;
  readonly description: string;
  /** Explicit ordering weight; documents without one sort after ordered ones. */
  readonly order?: number;
  /** Defaults to `"draft"` when absent. */
  readonly maturity?: DocumentMaturity;
}

/** A single extracted Markdown heading. */
export interface DocumentHeading {
  /** ATX depth, 1–6. */
  readonly depth: number;
  /** Heading text with trailing `#` closers removed. */
  readonly text: string;
  /** URL-friendly anchor derived from the text. */
  readonly id: string;
}

/**
 * Normalized document representation: the single unit future consumers
 * (sites, CLIs, agents) build on. Framework-agnostic by construction.
 */
export interface AtlasDocument {
  /** URL-style slug without leading/trailing slashes; `""` is the root document. */
  readonly slug: string;
  /** Content-relative POSIX path of the source file. */
  readonly file: string;
  readonly meta: ValidatedMeta;
  /** Raw Markdown body without frontmatter. */
  readonly body: string;
  readonly headings: readonly DocumentHeading[];
}
