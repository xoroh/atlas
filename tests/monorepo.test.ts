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
  expect(manifest.packageManager).toBe("bun@1.3.8");
  expect(manifest.workspaces).toEqual(["apps/*", "packages/*"]);
});

test("docs app remains private and MIT licensed until implementation", () => {
  const manifest = readPackage("apps/docs/package.json");

  expect(manifest.name).toBe("@xoroh/atlas-docs");
  expect(manifest.private).toBe(true);
  expect(manifest.license).toBe("MIT");
});
