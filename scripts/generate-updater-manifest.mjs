import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_REPO = "zzstar101/Mineradio";
const DEFAULT_TARGETS = ["windows-x86_64-nsis", "windows-x86_64"];
const DESKTOP_PACKAGE_PATH = "apps/desktop/package.json";
const TAURI_CONFIG_PATH = "apps/desktop/src-tauri/tauri.conf.json";

export function updaterArtifactUrl({ repo = DEFAULT_REPO, artifactName }) {
  const cleanRepo = String(repo ?? "").trim();
  const cleanArtifact = String(artifactName ?? "").trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cleanRepo)) {
    throw new Error("repo must use owner/name form");
  }
  if (!cleanArtifact) throw new Error("artifactName is required");
  return `https://github.com/${cleanRepo}/releases/latest/download/${encodeURIComponent(cleanArtifact)}`;
}

export function buildTauriUpdaterManifest({
  version,
  notes = "",
  pubDate,
  artifactName,
  signature = "",
  repo = DEFAULT_REPO,
  targets = DEFAULT_TARGETS
}) {
  const cleanVersion = String(version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(cleanVersion)) {
    throw new Error("version must be a semver string");
  }
  const url = updaterArtifactUrl({ repo, artifactName });
  const platform = { signature: String(signature ?? ""), url };
  return {
    version: cleanVersion,
    notes: String(notes ?? ""),
    pub_date: pubDate ?? new Date().toISOString(),
    platforms: Object.fromEntries(targets.map((target) => [target, { ...platform }])),
    "x-mineradio-policy": String(signature ?? "").trim()
      ? { updater: "signed", reason: "tauri-updater-signature-present" }
      : { updater: "detection-only", reason: "tauri-updater-signature-key-missing" }
  };
}

export function evaluateUpdaterManifestPolicy({ manifest, pubkey }) {
  const errors = [];
  const platforms = manifest?.platforms && typeof manifest.platforms === "object"
    ? manifest.platforms
    : {};
  const unsigned = String(pubkey ?? "").trim() === "";
  for (const target of DEFAULT_TARGETS) {
    if (!platforms[target]) {
      errors.push(target === "windows-x86_64-nsis"
        ? "updater manifest must include windows-x86_64-nsis"
        : "updater manifest must include windows-x86_64 fallback");
    }
  }
  for (const platform of Object.values(platforms)) {
    const url = String(platform?.url ?? "");
    if (!url.startsWith(`https://github.com/${DEFAULT_REPO}/releases/`)) {
      errors.push("updater manifest URLs must stay on zzstar101/Mineradio");
      break;
    }
  }
  if (unsigned) {
    if (Object.values(platforms).some((platform) => String(platform?.signature ?? "").trim() !== "")) {
      errors.push("unsigned detection-only manifests must keep platform signatures empty");
    }
    if (manifest?.["x-mineradio-policy"]?.updater !== "detection-only") {
      errors.push("unsigned detection-only manifests must carry x-mineradio-policy.updater=detection-only");
    }
  }
  return { ok: errors.length === 0, errors };
}

function readJson(rootDir, relativePath) {
  return JSON.parse(readFileSync(resolve(rootDir, relativePath), "utf8"));
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function generateUpdaterManifestFromWorkspace(rootDir = process.cwd(), overrides = {}) {
  const desktopPackage = readJson(rootDir, DESKTOP_PACKAGE_PATH);
  const tauriConfig = readJson(rootDir, TAURI_CONFIG_PATH);
  const version = overrides.version ?? desktopPackage.version;
  const artifactName = overrides.artifactName
    ?? `${tauriConfig.productName}_${version}_x64-setup.exe`;
  return buildTauriUpdaterManifest({
    version,
    notes: overrides.notes ?? "Mineradio Tauri Rewrite detection-only update manifest.",
    pubDate: overrides.pubDate,
    artifactName,
    signature: overrides.signature ?? "",
    repo: overrides.repo ?? DEFAULT_REPO
  });
}

if (import.meta.main) {
  const args = parseArgs(process.argv.slice(2));
  const manifest = generateUpdaterManifestFromWorkspace(process.cwd(), {
    version: args.version,
    notes: args.notes,
    pubDate: args.pubDate,
    artifactName: args.artifactName,
    signature: args.signature,
    repo: args.repo
  });
  const tauriConfig = readJson(process.cwd(), TAURI_CONFIG_PATH);
  const result = evaluateUpdaterManifestPolicy({
    manifest,
    pubkey: tauriConfig?.plugins?.updater?.pubkey
  });
  if (!result.ok) {
    console.error("Updater manifest generation failed policy checks:");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  if (args.out) {
    const out = resolve(process.cwd(), args.out);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, json, "utf8");
  } else {
    process.stdout.write(json);
  }
}
