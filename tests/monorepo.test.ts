import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(root, rel), "utf8")) as Record<string, unknown>;

/** Frameworks and site toolchains the engine must never depend on. */
const FORBIDDEN_DEP_PATTERN = /^(astro|@astrojs\/|@tanstack\/|react(-dom)?|vite|sharp)/;
const FORBIDDEN_IMPORT_PATTERN =
  /(?:from\s+|require\()\s*["'](astro|@astrojs\/[^"']+|@tanstack\/[^"']+|react(-dom)?|vite)[^"']*["']/;

const ENGINE_PACKAGES = ["packages/atlas-core", "packages/atlas-content", "packages/atlas-build"] as const;

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full));
    } else if (entry.endsWith(".ts")) {
      found.push(full);
    }
  }
  return found;
}

test("root package declares a private MIT Bun workspace", () => {
  const manifest = readJson("package.json");

  expect(manifest["name"]).toBe("atlas-monorepo");
  expect(manifest["private"]).toBe(true);
  expect(manifest["license"]).toBe("MIT");
  expect(manifest["packageManager"]).toBe("bun@1.4.2");
  expect(manifest["workspaces"]).toEqual(["apps/*", "packages/*"]);
});

test("website scaffold is gone; apps/ is reserved for future consumers", () => {
  expect(existsSync(join(root, "apps", "docs"))).toBe(false);
});

test("engine packages declare private MIT manifests with explicit entry points", () => {
  for (const pkg of ENGINE_PACKAGES) {
    const manifest = readJson(join(pkg, "package.json"));
    expect(manifest["license"]).toBe("MIT");
    expect(manifest["private"]).toBe(true);
    expect(typeof manifest["version"]).toBe("string");
    const exports = manifest["exports"] as Record<string, string>;
    expect(typeof exports?.["."]).toBe("string");
  }

  expect(readJson("packages/atlas-core/package.json")["name"]).toBe("@xoroh/atlas-core");
  expect(readJson("packages/atlas-content/package.json")["name"]).toBe("@xoroh/atlas-content");
  expect(readJson("packages/atlas-build/package.json")["name"]).toBe("@xoroh/atlas-build");
});

test("engine packages have no framework or website dependencies", () => {
  for (const pkg of ENGINE_PACKAGES) {
    const manifest = readJson(join(pkg, "package.json"));
    const deps = {
      ...((manifest["dependencies"] as Record<string, string> | undefined) ?? {}),
      ...((manifest["devDependencies"] as Record<string, string> | undefined) ?? {}),
    };
    for (const name of Object.keys(deps)) {
      expect(
        FORBIDDEN_DEP_PATTERN.test(name),
        `${pkg} must not depend on ${name}`,
      ).toBe(false);
    }
  }
});

test("engine sources import no framework or website modules", () => {
  for (const pkg of ENGINE_PACKAGES) {
    for (const file of sourceFiles(join(root, pkg, "src"))) {
      const content = readFileSync(file, "utf8");
      expect(
        FORBIDDEN_IMPORT_PATTERN.test(content),
        `${file} must not import a framework module`,
      ).toBe(false);
    }
  }
});

test("dependency direction flows toward atlas-core only", () => {
  const core = readJson("packages/atlas-core/package.json");
  const coreDeps = {
    ...((core["dependencies"] as Record<string, string> | undefined) ?? {}),
  };
  expect(Object.keys(coreDeps)).toEqual([]);

  const content = readJson("packages/atlas-content/package.json");
  const contentDeps = Object.keys(
    (content["dependencies"] as Record<string, string> | undefined) ?? {},
  );
  expect(contentDeps).not.toContain("@xoroh/atlas-build");

  const build = readJson("packages/atlas-build/package.json");
  const buildDeps = Object.keys((build["dependencies"] as Record<string, string> | undefined) ?? {});
  expect(buildDeps).toContain("@xoroh/atlas-core");
  expect(buildDeps).toContain("@xoroh/atlas-content");
});
