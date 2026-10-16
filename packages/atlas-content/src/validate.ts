import type { AtlasDiagnostic, DocumentMaturity, ValidatedMeta } from "@xoroh/atlas-core";

const MATURITIES: readonly DocumentMaturity[] = ["draft", "stable", "deprecated"];

export type MetaResult =
  | { readonly ok: true; readonly meta: ValidatedMeta }
  | { readonly ok: false; readonly diagnostics: AtlasDiagnostic[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate parsed frontmatter into {@link ValidatedMeta}. `title` and
 * `description` are required non-empty strings; `order` and `maturity` are
 * optional and checked when present.
 */
export function validateMeta(file: string, data: unknown): MetaResult {
  const diagnostics: AtlasDiagnostic[] = [];
  const at = (message: string): AtlasDiagnostic => ({ severity: "error", file, message });

  if (!isRecord(data)) {
    return { ok: false, diagnostics: [at("Missing or invalid frontmatter: expected a YAML mapping.")] };
  }

  let title = "";
  if (typeof data["title"] !== "string" || data["title"].trim() === "") {
    diagnostics.push(at('Frontmatter requires a non-empty string "title".'));
  } else {
    title = data["title"].trim();
  }

  let description = "";
  if (typeof data["description"] !== "string" || data["description"].trim() === "") {
    diagnostics.push(at('Frontmatter requires a non-empty string "description".'));
  } else {
    description = data["description"].trim();
  }

  let order: number | undefined;
  if (data["order"] !== undefined) {
    if (typeof data["order"] !== "number" || !Number.isFinite(data["order"]) || data["order"] < 0) {
      diagnostics.push(at('Frontmatter "order", when set, must be a finite number >= 0.'));
    } else {
      order = data["order"];
    }
  }

  let maturity: DocumentMaturity | undefined;
  if (data["maturity"] !== undefined) {
    if (typeof data["maturity"] !== "string" || !MATURITIES.includes(data["maturity"] as DocumentMaturity)) {
      diagnostics.push(at(`Frontmatter "maturity", when set, must be one of: ${MATURITIES.join(", ")}.`));
    } else {
      maturity = data["maturity"] as DocumentMaturity;
    }
  }

  if (diagnostics.length > 0) return { ok: false, diagnostics };
  return { ok: true, meta: { title, description, order, maturity } };
}
