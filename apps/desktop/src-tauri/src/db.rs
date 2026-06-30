//! SQLite local storage module.
//!
//! Provides database initialization, schema migrations, and basic read/write
//! helpers for the Tauri runtime. The database file lives under the resolved
//! app data directory and is managed exclusively by this module.

use std::path::{Path, PathBuf};

/// Resolve the SQLite database path from the app data directory.
///
/// The file will be created lazily by `rusqlite::Connection::open` on first
/// access; this function only computes the target path.
pub fn resolve_db_path(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("mineradio.db")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn resolve_db_path_appends_filename() {
        let base = PathBuf::from("/tmp/app-data");
        assert_eq!(resolve_db_path(&base), PathBuf::from("/tmp/app-data/mineradio.db"));
    }
}
