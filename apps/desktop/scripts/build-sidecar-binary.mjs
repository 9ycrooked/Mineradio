import { mkdir, rename } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, "..");
const repoRoot = resolve(desktopDir, "../..");
const srcTauriDir = join(desktopDir, "src-tauri");
const binariesDir = join(srcTauriDir, "binaries");
const sidecarEntry = join(repoRoot, "sidecars/api/src/server.ts");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function rustHostTriple() {
  const result = spawnSync("rustc", ["-Vv"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error("rustc -Vv failed; cannot infer Tauri sidecar target triple");
  }
  const hostLine = result.stdout.split(/\r?\n/).find((line) => line.startsWith("host:"));
  const triple = hostLine?.slice("host:".length).trim();
  if (!triple) {
    throw new Error("rustc -Vv did not report a host target triple");
  }
  return triple;
}

await mkdir(binariesDir, { recursive: true });

const targetTriple = process.env.TAURI_TARGET_TRIPLE?.trim() || process.env.TARGET?.trim() || rustHostTriple();
const exe = process.platform === "win32" ? ".exe" : "";
const baseBinary = join(binariesDir, `mineradio-sidecar-api${exe}`);
const tauriBinary = join(binariesDir, `mineradio-sidecar-api-${targetTriple}${exe}`);

run("bun", [
  "build",
  "--compile",
  "--target=bun",
  "--no-compile-autoload-dotenv",
  "--no-compile-autoload-bunfig",
  "--outfile",
  baseBinary,
  sidecarEntry,
]);

await rename(baseBinary, tauriBinary);
