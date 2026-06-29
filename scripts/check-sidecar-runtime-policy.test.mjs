import { describe, expect, test } from "bun:test";

import {
  evaluateSidecarRuntimePolicy,
  extractSidecarRuntimePolicy
} from "./check-sidecar-runtime-policy.mjs";

describe("sidecar runtime policy check", () => {
  test("passes when Rust allocates a random sidecar port, starts sidecar, and exposes runtime config/status", () => {
    const policy = extractSidecarRuntimePolicy({
      libRs: `
let port = sidecar::allocate_port();
let base_url = format!("http://127.0.0.1:{}", port);
let state = AppState::new(base_url.clone(), app_data_dir, app_version, schema_version, false, sidecar_log_path);
tauri::Builder::default()
  .manage(state)
  .invoke_handler(tauri::generate_handler![
    commands::get_runtime_config,
    commands::get_sidecar_status
  ])
  .setup(move |app| {
    build_and_start_sidecar(&state, port, &setup_app_data, &setup_log_dir, &setup_app_version, setup_resource_dir.as_deref())?;
    start_sidecar_supervisor(app.handle().clone(), port, setup_app_data, setup_log_dir, setup_app_version, setup_resource_dir);
    Ok(())
  });
`,
      sidecarRs: `
pub fn allocate_port() -> u16 {
  let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
  listener.local_addr().unwrap().port()
}
cmd.env("MINERADIO_SIDECAR_PORT", port.to_string());
cmd.env("MINERADIO_APP_DATA_DIR", app_data_dir);
cmd.env("MINERADIO_APP_VERSION", app_version);
cmd.env("MINERADIO_SIDECAR_LOG_FILE", log_file);
spawn_sidecar_into_runtime(&mut runtime, cmd, Duration::from_secs(2));
wait_for_health(&runtime.base_url, timeout)?;
`,
      commandsRs: `
#[tauri::command]
pub fn get_runtime_config(state: tauri::State<'_, AppState>) -> crate::RuntimeConfig {
  state.config.clone()
}

#[tauri::command]
pub fn get_sidecar_status(state: tauri::State<'_, AppState>) -> Result<sidecar::SidecarRuntimeSnapshot, String> {
  Ok(state.sidecar.lock().unwrap().snapshot())
}
`
    });

    expect(evaluateSidecarRuntimePolicy(policy)).toEqual({ ok: true, errors: [] });
  });

  test("fails when sidecar port is hard-coded or runtime config is not exposed", () => {
    const policy = extractSidecarRuntimePolicy({
      libRs: `
let port = 31622;
let base_url = "http://127.0.0.1:31622".to_string();
tauri::Builder::default().setup(move |_| Ok(()));
`,
      sidecarRs: `
cmd.env("MINERADIO_APP_DATA_DIR", app_data_dir);
`,
      commandsRs: ""
    });

    const result = evaluateSidecarRuntimePolicy(policy);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("lib.rs must allocate a random sidecar port through sidecar::allocate_port()");
    expect(result.errors).toContain("commands.rs must expose get_runtime_config as a Tauri command");
  });
});
