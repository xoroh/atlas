/** Severity of an engine diagnostic. */
export type DiagnosticSeverity = "error" | "warning";

/** A structured, file-aware diagnostic for configuration and content problems. */
export interface AtlasDiagnostic {
  severity: DiagnosticSeverity;
  message: string;
  /** Repository- or content-relative file path, when the problem has a location. */
  file?: string;
  /** 1-based line number, when known. */
  line?: number;
}

/** True when at least one diagnostic is an error. */
export function hasErrors(diagnostics: readonly AtlasDiagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === "error");
}

/** Render one diagnostic as a single human-readable line. */
export function formatDiagnostic(d: AtlasDiagnostic): string {
  const location = d.file ? `${d.file}${d.line !== undefined ? `:${d.line}` : ""}` : "<config>";
  return `${d.severity}: ${location}: ${d.message}`;
}

/** Render diagnostics for CLI / log output, one per line. */
export function formatDiagnostics(diagnostics: readonly AtlasDiagnostic[]): string {
  return diagnostics.map(formatDiagnostic).join("\n");
}
