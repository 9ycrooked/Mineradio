import { describe, expect, test } from "bun:test";

import {
  collectNpmDependencyClosure,
  evaluateLicenseEntries,
  normalizeLicenseExpression,
  parseCargoMetadataPackages,
  resolveNpmPackageLicense
} from "./check-transitive-licenses.mjs";

describe("transitive license check", () => {
  test("normalizes common GPL-compatible license expressions", () => {
    expect(normalizeLicenseExpression("MIT")).toEqual(["MIT"]);
    expect(normalizeLicenseExpression("MIT/Apache-2.0")).toEqual(["MIT", "Apache-2.0"]);
    expect(normalizeLicenseExpression("(MIT OR Apache-2.0)")).toEqual(["MIT", "Apache-2.0"]);
    expect(normalizeLicenseExpression("BSD-2-Clause AND MIT")).toEqual(["BSD-2-Clause", "MIT"]);
    expect(normalizeLicenseExpression({ type: "ISC" })).toEqual(["ISC"]);
  });

  test("evaluates entries against the GPL-compatible allowlist and package overrides", () => {
    const result = evaluateLicenseEntries([
      { ecosystem: "npm", name: "react", version: "19.0.0", license: "MIT" },
      { ecosystem: "npm", name: "gsap", version: "3.15.0", license: "Standard no-charge license" },
      { ecosystem: "Rust", name: "bad", version: "1.0.0", license: "UNLICENSED" },
      { ecosystem: "npm", name: "missing", version: "1.0.0", license: "" }
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Rust bad@1.0.0 uses non-allowlisted license: UNLICENSED");
    expect(result.errors).toContain("npm missing@1.0.0 has no license metadata");
    expect(result.errors.some((error) => error.includes("gsap"))).toBe(false);
  });

  test("allows GPL-compatible choices in OR license expressions", () => {
    const result = evaluateLicenseEntries([
      { ecosystem: "npm", name: "node-forge", version: "1.4.0", license: "(BSD-3-Clause OR GPL-2.0)" }
    ]);

    expect(result).toEqual({ ok: true, errors: [] });
  });

  test("parses cargo metadata package licenses", () => {
    const entries = parseCargoMetadataPackages({
      packages: [
        { name: "mineradio-tauri", version: "0.1.0", license: "GPL-3.0" },
        { name: "serde", version: "1.0.0", license: "MIT OR Apache-2.0" }
      ],
      workspace_members: ["path+file:///repo/apps/desktop/src-tauri#mineradio-tauri@0.1.0"]
    });

    expect(entries).toEqual([
      { ecosystem: "Rust", name: "mineradio-tauri", version: "0.1.0", license: "GPL-3.0" },
      { ecosystem: "Rust", name: "serde", version: "1.0.0", license: "MIT OR Apache-2.0" }
    ]);
  });

  test("resolves npm package licenses from package metadata", () => {
    expect(resolveNpmPackageLicense({ license: "MIT" })).toBe("MIT");
    expect(resolveNpmPackageLicense({ licenses: [{ type: "BSD-3-Clause" }] })).toBe("BSD-3-Clause");
    expect(resolveNpmPackageLicense({ name: "local", private: true })).toBe("");
  });

  test("collects npm dependency closure from package metadata and skips workspace packages", () => {
    const packages = new Map([
      ["app", { name: "app", version: "0.1.0", private: true, dependencies: { react: "^19", "@mineradio/shared": "workspace:*" } }],
      ["react", { name: "react", version: "19.0.0", license: "MIT", dependencies: { loose: "^1" } }],
      ["loose", { name: "loose", version: "1.0.0", license: "ISC" }]
    ]);
    const entries = collectNpmDependencyClosure(["react", "@mineradio/shared"], {
      readPackageJson(name) {
        return packages.get(name) ?? null;
      }
    });

    expect(entries).toEqual([
      { ecosystem: "npm", name: "react", version: "19.0.0", license: "MIT" },
      { ecosystem: "npm", name: "loose", version: "1.0.0", license: "ISC" }
    ]);
  });

  test("skips missing optional platform packages in the npm dependency closure", () => {
    const packages = new Map([
      ["rollup", { name: "rollup", version: "4.0.0", license: "MIT", optionalDependencies: { "@rollup/rollup-linux-x64-gnu": "4.0.0" } }]
    ]);
    const entries = collectNpmDependencyClosure(["rollup"], {
      readPackageJson(name) {
        return packages.get(name) ?? null;
      }
    });

    expect(entries).toEqual([
      { ecosystem: "npm", name: "rollup", version: "4.0.0", license: "MIT" }
    ]);
  });
});
