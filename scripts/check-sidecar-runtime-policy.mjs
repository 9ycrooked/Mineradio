import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const FILES = {
  libRs: "apps/desktop/src-tauri/src/lib.rs",
  sidecarRs: "apps/desktop/src-tauri/src/sidecar.rs",
  commandsRs: "apps/desktop/src-tauri/src/commands.rs"
};

export function extractSidecarRuntimePolicy(input) {
  return {
    libRs: input?.libRs ?? "",
    sidecarRs: input?.sidecarRs ?? "",
    commandsRs: input?.commandsRs ?? ""
  };
}

export function evaluateSidecarRuntimePolicy(policy) {
  const errors = [];
  const libRs = String(policy?.libRs ?? "");
  const sidecarRs = String(policy?.sidecarRs ?? "");
  const commandsRs = String(policy?.commandsRs ?? "");

  if (!/\blet\s+port\s*=\s*sidecar::allocate_port\(\)\s*;/.test(libRs)) {
    errors.push("lib.rs must allocate a random sidecar port through sidecar::allocate_port()");
  }
  if (!/format!\(\s*"http:\/\/127\.0\.0\.1:\{\}"\s*,\s*port\s*\)/.test(libRs)) {
    errors.push("lib.rs must derive the sidecar base URL from the allocated port");
  }
  if (!/AppState::new\(\s*base_url\.clone\(\)/s.test(libRs)) {
    errors.push("lib.rs must inject the allocated sidecar base URL into AppState runtime config");
  }
  if (!/\.manage\(\s*state\s*\)/.test(libRs)) {
    errors.push("lib.rs must manage AppState before Tauri command handlers run");
  }
  if (!/build_and_start_sidecar\([\s\S]*?\bport\b/.test(libRs)) {
    errors.push("lib.rs setup must start the sidecar with the allocated port");
  }
  if (!/start_sidecar_supervisor\([\s\S]*?\bport\b/.test(libRs)) {
    errors.push("lib.rs setup must supervise the sidecar on the same allocated port");
  }
  if (!/commands::get_runtime_config/.test(libRs)) {
    errors.push("lib.rs must register get_runtime_config in the Tauri invoke handler");
  }
  if (!/commands::get_sidecar_status/.test(libRs)) {
    errors.push("lib.rs must register get_sidecar_status in the Tauri invoke handler");
  }

  if (!/TcpListener::bind\(\s*"127\.0\.0\.1:0"\s*\)/.test(sidecarRs)) {
    errors.push("sidecar.rs allocate_port must bind 127.0.0.1:0 for an ephemeral local port");
  }
  if (!/MINERADIO_SIDECAR_PORT/.test(sidecarRs)) {
    errors.push("sidecar.rs must pass MINERADIO_SIDECAR_PORT to the sidecar process");
  }
  if (!/MINERADIO_APP_DATA_DIR/.test(sidecarRs)) {
    errors.push("sidecar.rs must pass the Tauri app data directory to the sidecar process");
  }
  if (!/MINERADIO_APP_VERSION/.test(sidecarRs)) {
    errors.push("sidecar.rs must pass the app version to the sidecar process");
  }
  if (!/MINERADIO_SIDECAR_LOG_FILE/.test(sidecarRs)) {
    errors.push("sidecar.rs must pass the rolling sidecar log file path to the sidecar process");
  }
  if (!/spawn_sidecar_into_runtime/.test(sidecarRs)) {
    errors.push("sidecar.rs must spawn the sidecar into retained runtime state");
  }
  if (!/wait_for_health/.test(sidecarRs)) {
    errors.push("sidecar.rs must wait for sidecar health before marking runtime ready");
  }

  if (!/#\[tauri::command\][\s\S]*get_runtime_config/.test(commandsRs)) {
    errors.push("commands.rs must expose get_runtime_config as a Tauri command");
  }
  if (!/#\[tauri::command\][\s\S]*get_sidecar_status/.test(commandsRs)) {
    errors.push("commands.rs must expose get_sidecar_status as a Tauri command");
  }

  return { ok: errors.length === 0, errors };
}

export function checkSidecarRuntimePolicy(rootDir = process.cwd()) {
  return evaluateSidecarRuntimePolicy(extractSidecarRuntimePolicy({
    libRs: readRequired(rootDir, FILES.libRs),
    sidecarRs: readRequired(rootDir, FILES.sidecarRs),
    commandsRs: readRequired(rootDir, FILES.commandsRs)
  }));
}

function readRequired(rootDir, relativePath) {
  const path = resolve(rootDir, relativePath);
  if (!existsSync(path)) throw new Error(`${relativePath} is missing`);
  return readFileSync(path, "utf8");
}

if (import.meta.main) {
  const result = checkSidecarRuntimePolicy(process.cwd());
  if (!result.ok) {
    console.error("Sidecar runtime policy check failed:");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("Sidecar runtime policy check passed.");
}
