import type { AtlasDiagnostic } from "./diagnostics.js";

/**
 * Validated Atlas configuration. Paths are resolved by the caller against
 * the repository root; the engine never assumes a website layout.
 */
export interface AtlasConfig {
  /** Human-readable documentation-set title. Required, non-empty. */
  readonly title: string;
  /** Short description used by generated indexes. Optional. */
  readonly description?: string;
  /** Directory containing Markdown documentation source, relative or absolute. Required. */
  readonly contentDir: string;
  /** Relative-path prefixes excluded from discovery. Optional. */
  readonly exclude?: readonly string[];
}

export type ConfigResult =
  | { readonly ok: true; readonly config: AtlasConfig }
  | { readonly ok: false; readonly diagnostics: AtlasDiagnostic[] };

function err(message: string): AtlasDiagnostic {
  return { severity: "error", message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate unknown input into an {@link AtlasConfig}. Never throws for
 * invalid input — all problems are returned as diagnostics.
 */
export function loadConfig(input: unknown): ConfigResult {
  const diagnostics: AtlasDiagnostic[] = [];
  if (!isRecord(input)) {
    return { ok: false, diagnostics: [err("Atlas configuration must be an object.")] };
  }

  let title = "";
  if (typeof input["title"] !== "string" || input["title"].trim() === "") {
    diagnostics.push(err('Atlas configuration requires a non-empty string "title".'));
  } else {
    title = input["title"].trim();
  }

  let description: string | undefined;
  if (input["description"] !== undefined) {
    if (typeof input["description"] !== "string" || input["description"].trim() === "") {
      diagnostics.push(err('Atlas configuration "description", when set, must be a non-empty string.'));
    } else {
      description = input["description"].trim();
    }
  }

  let contentDir = "";
  if (typeof input["contentDir"] !== "string" || input["contentDir"].trim() === "") {
    diagnostics.push(err('Atlas configuration requires a non-empty string "contentDir".'));
  } else {
    contentDir = input["contentDir"];
  }

  let exclude: readonly string[] | undefined;
  if (input["exclude"] !== undefined) {
    if (
      !Array.isArray(input["exclude"]) ||
      input["exclude"].some((e) => typeof e !== "string" || e === "")
    ) {
      diagnostics.push(err('Atlas configuration "exclude", when set, must be an array of non-empty strings.'));
    } else {
      exclude = [...(input["exclude"] as string[])];
    }
  }

  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }
  return { ok: true, config: { title, description, contentDir, exclude } };
}
