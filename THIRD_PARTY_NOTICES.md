# Third-party Notices

MineRadio-Tauri is a GPL-3.0 desktop music player. This file summarizes the main third-party software, services, and assets used by the project. Exact versions are defined by `bun.lock`, `package.json`, and `apps/desktop/src-tauri/Cargo.lock`.

## Project License

| Item | License | Use |
| --- | --- | --- |
| MineRadio-Tauri source code | GPL-3.0 | Application source code, build scripts, and project documentation. |

## Desktop And Build Stack

| Item | License | Use |
| --- | --- | --- |
| Tauri 2 | MIT / Apache-2.0 | Desktop shell, window management, commands, updater, and sidecar lifecycle. |
| Rust crates used by the Tauri app | See `apps/desktop/src-tauri/Cargo.lock` | Serialization, filesystem paths, time handling, build integration, and Tauri plugins. |
| Bun | MIT | Workspace package manager, script runner, tests, and sidecar runtime. |
| Vite | MIT | Web app development and production build. |
| TypeScript | Apache-2.0 | Type checking for the web app, shared package, visual engine, and sidecar. |

## Web And Runtime Stack

| Item | License | Use |
| --- | --- | --- |
| React / React DOM | MIT | Frontend UI rendering. |
| Zustand | MIT | Frontend state management. |
| zod | MIT | Shared runtime schemas and API payload validation. |
| Three.js | MIT | WebGL scenes and 3D visual effects. |
| GSAP | Standard no-charge license | Animation timing and visual motion. |
| happy-dom | MIT | DOM-like test environment. |

## Model And Provider Dependencies

| Item | License | Use |
| --- | --- | --- |
| @xenova/transformers | Apache-2.0 | Local model runtime for depth-related visual effects. |
| Xenova/depth-anything-small-hf | Apache-2.0 | Local depth model used by visual features. |
| hana-music-api | MIT | Netease provider integration. |
| NeteaseCloudMusicApi fallback | ISC | Netease provider fallback path. |
| qq-music-api (`jsososo/QQMusicApi`) | GPL-3.0 | QQ Music provider integration. |

## Service Disclaimer

MineRadio-Tauri is not an official client of NetEase Cloud Music, QQ Music, Tencent Music Entertainment, or any other music platform.

Third-party platform integration is intended for personal learning, local desktop use, and playback assistance for accounts controlled by the user. Users and contributors should follow the terms, copyright rules, and membership rules of the relevant platforms. The project must not include code or documentation that bypasses payment, membership restrictions, audio quality restrictions, or content redistribution limits.
