import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_MANIFEST = "package.json";
const EXPECTED_PRODUCT_NAME = "Mineradio Tauri Rewrite";
const REQUIRED_WORKSPACES = ["apps/*", "packages/*", "sidecars/*"];
const REQUIRED_SCRIPTS = {
  start: "bun run tauri:dev",
  dev: "bun run tauri:dev",
  build: "bun run tauri:build",
  "tauri:dev": "bun run --filter ./apps/desktop tauri dev",
  "tauri:build": "bun run --filter ./apps/desktop tauri build",
  "web:build": "bun run --filter ./apps/web build",
  "sidecar:dev": "bun run --filter ./sidecars/api dev"
};
const REQUIRED_SIDECAR_DEPENDENCIES = new Set([
  "hana-music-api",
  "NeteaseCloudMusicApi",
  "qq-music-api"
]);
const LEGACY_RUNTIME_DEPS = new Set([
  "electron",
  "electron-builder",
  "rcedit",
  "mpg123-decoder",
  "NeteaseCloudMusicApi"
]);

export function evaluateTauriStackPolicy(input) {
  const pkg = input.rootPackage ?? {};
  const errors = [];

  if (pkg.productName !== EXPECTED_PRODUCT_NAME) {
    errors.push(`root package.json productName must be ${EXPECTED_PRODUCT_NAME}`);
  }
  if (pkg.main === "desktop/main.js" || typeof pkg.main === "string" && /(^|[\\/])desktop[\\/]main\.js$/i.test(pkg.main)) {
    errors.push("root package.json must not expose desktop/main.js as the app entry");
  }
  if (pkg.build && typeof pkg.build === "object") {
    errors.push("root package.json must not keep electron-builder build config in the Tauri mainline manifest");
  }
  if (pkg.mineradio?.update) {
    errors.push("root package.json must not keep legacy Electron updater metadata");
  }

  const workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : [];
  for (const workspace of REQUIRED_WORKSPACES) {
    if (!workspaces.includes(workspace)) {
      errors.push(`root package.json workspaces must include ${workspace}`);
    }
  }

  const scripts = pkg.scripts ?? {};
  for (const [name, expected] of Object.entries(REQUIRED_SCRIPTS)) {
    if (scripts[name] !== expected) {
      errors.push(`root package.json scripts.${name} must run the ${scriptLabel(name)} entry`);
    }
  }
  for (const [name, command] of Object.entries(scripts)) {
    if (/\belectron(\b|-builder\b)/i.test(String(command))) {
      errors.push(`root package.json scripts.${name} must not invoke Electron tooling`);
    }
  }

  for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    const deps = pkg[section] ?? {};
    for (const dep of Object.keys(deps)) {
      if (LEGACY_RUNTIME_DEPS.has(dep)) {
        errors.push(`root package.json ${section} must not include ${dep}`);
      }
    }
  }

  const sidecarDeps = input.sidecarPackage?.dependencies ?? {};
  for (const dep of REQUIRED_SIDECAR_DEPENDENCIES) {
    if (!sidecarDeps[dep]) {
      errors.push(`sidecars/api/package.json dependencies must include ${dep} because sidecar services import it`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function checkTauriStackPolicy(rootDir = process.cwd()) {
  const path = resolve(rootDir, ROOT_MANIFEST);
  if (!existsSync(path)) throw new Error(`${ROOT_MANIFEST} is missing`);
  const sidecarPath = resolve(rootDir, "sidecars/api/package.json");
  if (!existsSync(sidecarPath)) throw new Error("sidecars/api/package.json is missing");
  return evaluateTauriStackPolicy({
    rootPackage: JSON.parse(readFileSync(path, "utf8")),
    sidecarPackage: JSON.parse(readFileSync(sidecarPath, "utf8"))
  });
}

function scriptLabel(name) {
  if (name === "start" || name === "dev") return "Tauri dev";
  if (name === "build") return "Tauri build";
  if (name === "web:build") return "web build";
  if (name === "sidecar:dev") return "sidecar dev";
  return name;
}

if (import.meta.main) {
  const result = checkTauriStackPolicy(process.cwd());
  if (!result.ok) {
    console.error("Tauri stack policy check failed:");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("Tauri stack policy check passed.");
}
