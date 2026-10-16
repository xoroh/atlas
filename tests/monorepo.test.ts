import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "bun:test";

const root = resolve(import.meta.dir, "..");
const readPackage = (path: string) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8")) as Record<string, unknown>;

test("root package declares a private MIT Bun workspace", () => {
  const manifest = readPackage("package.json");

  expect(manifest.name).toBe("atlas-monorepo");
  expect(manifest.private).toBe(true);
  expect(manifest.license).toBe("MIT");
  expect(manifest.packageManager).toBe("bun@1.4.2");
  expect(manifest.workspaces).toEqual(["apps/*", "packages/*"]);
});

test("docs app remains private and MIT licensed until implementation", () => {
  const manifest = readPackage("apps/docs/package.json");

  expect(manifest.name).toBe("@xoroh/atlas-docs");
  expect(manifest.private).toBe(true);
  expect(manifest.license).toBe("MIT");
});

test("docs app builds and type-checks with the Astro toolchain", () => {
  const manifest = readPackage("apps/docs/package.json");
  const scripts = manifest.scripts as Record<string, string>;
  const deps = {
    ...(manifest.dependencies as Record<string, string>),
    ...(manifest.devDependencies as Record<string, string>),
  };

  for (const script of ["dev", "build", "check"]) {
    expect(typeof scripts[script]).toBe("string");
  }
  for (const dep of ["astro", "@astrojs/starlight", "typescript"]) {
    expect(typeof deps[dep]).toBe("string");
  }
});
