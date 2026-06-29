import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const TARGET_PACKAGE_MANIFESTS = [
  "apps/desktop/package.json",
  "apps/web/package.json",
  "packages/shared/package.json",
  "packages/visual-engine/package.json",
  "sidecars/api/package.json"
];

const TARGET_CARGO_MANIFEST = "apps/desktop/src-tauri/Cargo.toml";

const GPL_COMPATIBLE_LICENSES = new Set([
  "GPL-3.0",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "LGPL-2.1-or-later",
  "MIT",
  "MIT-0",
  "MIT/X11",
  "X11",
  "Apache-2.0",
  "LLVM-exception",
  "BSD",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BlueOak-1.0.0",
  "ISC",
  "MPL-2.0",
  "0BSD",
  "Unlicense",
  "CC0-1.0",
  "CC-BY-4.0",
  "CDLA-Permissive-2.0",
  "Zlib",
  "Unicode-3.0",
  "Unicode-DFS-2016"
]);

const PACKAGE_LICENSE_OVERRIDES = new Map([
  ["gsap", "Standard no-charge license"],
  ["qq-music-api", "GPL-3.0"],
  ["uglify-js", "BSD-2-Clause"],
  ["css", "MIT"],
  ["css-parse", "MIT"],
  ["css-stringify", "MIT"],
  ["@mineradio/shared", "GPL-3.0"],
  ["@mineradio/visual-engine", "GPL-3.0"],
  ["@mineradio/web", "GPL-3.0"],
  ["@mineradio/desktop", "GPL-3.0"],
  ["@mineradio/sidecar-api", "GPL-3.0"]
]);

const STANDARD_NO_CHARGE_ALLOWLIST = new Set(["gsap"]);

export function normalizeLicenseExpression(license) {
  if (!license) return [];
  if (typeof license === "object") {
    if (typeof license.type === "string") return normalizeLicenseExpression(license.type);
    if (typeof license.license === "string") return normalizeLicenseExpression(license.license);
    return [];
  }
  return String(license)
    .replace(/[()]/g, " ")
    .replace(/\bOR\b|\bAND\b|\bWITH\b|\/|,/g, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function resolveNpmPackageLicense(pkg) {
  if (!pkg || typeof pkg !== "object") return "";
  if (typeof pkg.license === "string") return pkg.license;
  if (pkg.license && typeof pkg.license === "object") {
    return pkg.license.type ?? pkg.license.license ?? "";
  }
  if (Array.isArray(pkg.licenses) && pkg.licenses.length > 0) {
    return pkg.licenses
      .map((entry) => resolveNpmPackageLicense({ license: entry }))
      .filter(Boolean)
      .join(" OR ");
  }
  return "";
}

export function evaluateLicenseEntries(entries) {
  const errors = [];
  for (const entry of dedupeEntries(entries)) {
    const license = PACKAGE_LICENSE_OVERRIDES.get(entry.name) ?? entry.license ?? "";
    if (!String(license).trim()) {
      errors.push(`${entry.ecosystem} ${entry.name}@${entry.version} has no license metadata`);
      continue;
    }
    if (STANDARD_NO_CHARGE_ALLOWLIST.has(entry.name) && /standard no-charge/i.test(license)) {
      continue;
    }
    if (normalizeLicenseExpression(license).length === 0) {
      errors.push(`${entry.ecosystem} ${entry.name}@${entry.version} has unparsable license: ${license}`);
      continue;
    }
    if (!isLicenseExpressionAllowlisted(license)) {
      errors.push(`${entry.ecosystem} ${entry.name}@${entry.version} uses non-allowlisted license: ${license}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function isLicenseExpressionAllowlisted(license) {
  const text = String(license).trim();
  const orParts = text.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    return orParts.some((part) => licenseTokensAllowlisted(normalizeLicenseExpression(part)));
  }
  return licenseTokensAllowlisted(normalizeLicenseExpression(text));
}

function licenseTokensAllowlisted(tokens) {
  return tokens.length > 0 && tokens.every((token) => GPL_COMPATIBLE_LICENSES.has(token));
}

export function parseCargoMetadataPackages(metadata) {
  const packages = Array.isArray(metadata?.packages) ? metadata.packages : [];
  return packages.map((pkg) => ({
    ecosystem: "Rust",
    name: pkg.name,
    version: pkg.version ?? "",
    license: pkg.license ?? pkg.license_file ?? ""
  }));
}

export function collectNpmDependencyClosure(startNames, opts) {
  const readPackageJson = opts?.readPackageJson ?? readInstalledPackageJson;
  const entries = [];
  const seen = new Set();
  const queue = startNames.map((name) => ({ name, optional: false }));
  while (queue.length > 0) {
    const item = queue.shift();
    const name = typeof item === "string" ? item : item?.name;
    const optional = typeof item === "object" && item?.optional === true;
    if (!name || isWorkspaceDependency(name)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    const pkg = readPackageJson(name);
    if (!pkg) {
      if (!optional) entries.push({ ecosystem: "npm", name, version: "missing", license: "" });
      continue;
    }
    entries.push({
      ecosystem: "npm",
      name: pkg.name ?? name,
      version: pkg.version ?? "",
      license: resolveNpmPackageLicense(pkg)
    });
    for (const depName of Object.keys(pkg.dependencies ?? {})) {
      if (!isWorkspaceDependency(depName)) queue.push({ name: depName, optional: false });
    }
    for (const depName of Object.keys(pkg.optionalDependencies ?? {})) {
      if (!isWorkspaceDependency(depName)) queue.push({ name: depName, optional: true });
    }
  }
  return dedupeEntries(entries);
}

export function collectTargetNpmDependencyNames(rootDir = process.cwd()) {
  const names = [];
  for (const manifest of TARGET_PACKAGE_MANIFESTS) {
    const path = resolve(rootDir, manifest);
    if (!existsSync(path)) continue;
    const json = JSON.parse(readFileSync(path, "utf8"));
    for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      for (const name of Object.keys(json[section] ?? {})) {
        if (!isWorkspaceDependency(name)) names.push(name);
      }
    }
  }
  return [...new Set(names)].sort();
}

export function collectRustLicenseEntries(rootDir = process.cwd()) {
  const manifestPath = resolve(rootDir, TARGET_CARGO_MANIFEST);
  const stdout = execFileSync("cargo", [
    "metadata",
    "--format-version",
    "1",
    "--locked",
    "--manifest-path",
    manifestPath
  ], {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"]
  });
  return parseCargoMetadataPackages(JSON.parse(stdout));
}

export function checkTransitiveLicenses(rootDir = process.cwd()) {
  const npmStart = collectTargetNpmDependencyNames(rootDir);
  const npmEntries = collectNpmDependencyClosure(npmStart, {
    readPackageJson: (name) => readInstalledPackageJson(name, rootDir)
  });
  const rustEntries = collectRustLicenseEntries(rootDir);
  const entries = [...npmEntries, ...rustEntries];
  return {
    ...evaluateLicenseEntries(entries),
    entries
  };
}

function readInstalledPackageJson(name, rootDir = process.cwd()) {
  const parts = name.startsWith("@") ? name.split("/") : [name];
  const path = resolve(rootDir, "node_modules", ...parts, "package.json");
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  const bunPath = findBunInstalledPackageJson(name, rootDir);
  if (!bunPath) return null;
  return JSON.parse(readFileSync(bunPath, "utf8"));
}

function findBunInstalledPackageJson(name, rootDir) {
  const bunDir = resolve(rootDir, "node_modules", ".bun");
  if (!existsSync(bunDir)) return null;
  const encodedPrefix = `${name.replace("/", "+")}@`;
  let entries = [];
  try {
    entries = readdirSync(bunDir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(encodedPrefix)) continue;
    const packageParts = name.startsWith("@") ? name.split("/") : [name];
    const candidate = resolve(bunDir, entry.name, "node_modules", ...packageParts, "package.json");
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function isWorkspaceDependency(name) {
  return String(name).startsWith("@mineradio/");
}

function dedupeEntries(entries) {
  const seen = new Set();
  const out = [];
  for (const entry of entries) {
    const key = `${entry.ecosystem}:${entry.name}:${entry.version}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

if (import.meta.main) {
  const result = checkTransitiveLicenses(process.cwd());
  if (!result.ok) {
    console.error("Transitive license check failed:");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`Transitive license check passed for ${result.entries.length} packages.`);
}
