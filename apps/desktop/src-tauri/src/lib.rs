#[derive(serde::Serialize)]
struct RuntimeConfig {
    sidecar_base_url: Option<String>,
    app_version: &'static str,
}

#[tauri::command]
fn runtime_config() -> RuntimeConfig {
    RuntimeConfig {
        sidecar_base_url: None,
        app_version: env!("CARGO_PKG_VERSION"),
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![runtime_config])
        .run(tauri::generate_context!())
        .expect("failed to run Mineradio Tauri shell");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runtime_config_starts_without_sidecar_url() {
        let config = runtime_config();
        assert_eq!(config.sidecar_base_url, None);
        assert_eq!(config.app_version, "0.1.0");
    }
}
