# Baseline Capture

更新时间：2026-06-28

## Purpose

This document defines the Electron baseline capture required before final Tauri parity review. Tauri visual, interaction, provider, runtime, and release parity is judged against these captures plus the code-derived animation spec.

Code-derived animation spec: `docs/migration/baseline/BASELINE_ANIMATION_SPEC.md`.

## Evidence Rule

- Do not mark a capture as complete unless an artifact path is recorded in `BASELINE_METADATA.*.json` or a release-evidence document.
- Code-side implementation notes are not capture evidence.
- Credential-gated Netease/QQ checks require B1 credentials and must record the login state used during capture.
- Release/update checks must record the updater decision used for that run, especially if install is blocked by signature policy.

## Environment

- Repository commit: `ced5ec61ce5241371da36abd82cbebec2868e92c`
- Baseline tag: `electron-baseline-2026-06-27`
- Capture worktree branch: `codex/tauri-migration`
- App line: Electron baseline
- Window sizes:
  - 1280x720
  - 1920x1080
- Display scale: 100% (`AppliedDPI=96`)
- Detected display: 2560x1600
- Audio device: record during manual capture if relevant
- Network state: record during manual capture with provider login state

## Baseline Data

- Test track title: 待确认；当前仅记录搜索 fixture `遇见`
- Test provider: 待确认；搜索 fixture 当前观察到 Netease (`NE`) 结果
- Test track id: 待确认
- Cover source: 待确认
- Lyric source: 待确认
- Visual archive source: `verification\baseline\2026-06-27-ced5ec61\visual-localstorage-snapshot.json`
- Local storage state source: `verification\baseline\2026-06-27-ced5ec61\visual-localstorage-snapshot.json`
- Search fixture: `遇见` / `All`，见 `docs/migration/baseline/TEST_FIXTURES.2026-06-27.md`
- Baseline artifact directory: `verification\baseline\2026-06-27-ced5ec61`

## Capture Matrix

每个 capture 需要在 metadata 中记录：`kind`、窗口尺寸或运行环境、路径、采集方法、provider/login 状态（如相关）、观察结论和是否 nonblank。状态只允许写 `recorded`、`pending` 或 `blocked`。

### Home Startup Shell Captures

| ID | Required capture | Evidence type | Status | Artifact path |
| --- | --- | --- | --- | --- |
| `home-splash-ready` | Splash ready state before dismissal, including ready affordance and nonblank splash visual. | Screenshot + optional recording | pending | 待采集 |
| `home-splash-dismiss-flow` | Splash dismissed into Home without black screen or debug shell. | Recording | pending | 待采集 |
| `home-dismissed-empty` | Dismissed Home shell with `#empty-home`, search peek, top-right commands, bottom handle. | Screenshot at 1280x720 and 1920x1080 | pending | 待采集 |
| `home-search-focused-history` | Search focused on Home with history/recommendations or empty-query state visible. | Screenshot | pending | 待采集 |
| `home-bottom-handle-hover` | Bottom handle hover/hot-zone reveal affordance. | Screenshot or short recording | pending | 待采集 |
| `home-bottom-bar-visible` | Bottom playback bar visible after reveal. | Screenshot | recorded | `verification\baseline\2026-06-27-ced5ec61\playback-console-visible-1280x720.png` |
| `home-bottom-bar-hidden` | Bottom playback bar hidden/soft-hidden state. | Screenshot | recorded | `verification\baseline\2026-06-27-ced5ec61\playback-console-hidden-1280x720.png` |

### Playback And Provider Captures

| ID | Required capture | Evidence type | Status | Artifact path |
| --- | --- | --- | --- | --- |
| `playback-fixed-test-song` | Final fixed test song metadata: provider, id, title, artists, album, quality, account state. | Metadata | pending | 待确认 |
| `playback-cover-source` | Cover URL/source and rendered cover evidence for the fixed test song. | Metadata + screenshot | pending | 待确认 |
| `playback-lyrics-source` | Lyric provider/source, lyric type, word-timing availability, and rendered lyric evidence. | Metadata + screenshot/recording | pending | 待确认 |
| `playback-audio-proxy` | Real playback with HTMLAudioElement using proxied audio path, with play/pause/seek/next/ended evidence. | Recording + network/log note | pending | 待采集 |
| `provider-netease-anonymous` | Netease anonymous search/songUrl/lyric/playlist detail behavior for the fixed test song or fixture. | Screenshot/recording + metadata | pending | 待采集 |
| `provider-netease-credential-gated` | Netease B1 credential-gated login status, VIP/high-quality or gated failure classification. | Recording/log note | blocked | 待 B1 凭证 |
| `provider-qq-anonymous` | QQ anonymous search/songUrl/lyric/playlist detail behavior where allowed. | Screenshot/recording + metadata | pending | 待采集 |
| `provider-qq-credential-gated` | QQ B1 credential-gated login status, song URL, lyric, and playlist evidence. | Recording/log note | blocked | 待 B1 凭证 |

### Visual Captures

| ID | Required capture | Evidence type | Status | Artifact path |
| --- | --- | --- | --- | --- |
| `visual-homevisual-idle` | HomeVisual idle with visual archive loaded and current cover/depth/back-cover chain visible where applicable. | Screenshot/recording | pending | 待采集 |
| `visual-stage-lyrics` | Stage lyrics during real playback, including line/word progress and shelf-detail dimming relation if applicable. | Recording | pending | 待采集 |
| `visual-3d-shelf-flow` | 3D shelf open, hover, scroll, detail page, row click/play, and close/pinned behavior. | Recording | pending | 待采集 |
| `visual-3d-shelf-static` | Static side shelf view. | Screenshot | recorded | `verification\baseline\2026-06-27-ced5ec61\playlist-shelf-side-1280x720.png` |
| `visual-resize-camera` | Window resize and camera/DPR/aspect updates without blank, drift, or wrong framing. | Recording at 1280x720 and 1920x1080 | pending | 待采集 |
| `visual-host-nonblank` | WebView2 visual-host/canvas nonblank check after splash, after playback entry, after shelf open, after resize. | Screenshot or pixel-check report | pending | 待采集 |
| `visual-console-open` | Visual console open baseline reference. | Screenshot | recorded | `verification\baseline\2026-06-27-ced5ec61\visual-console-panel-1280x720.png` |

### Desktop, Runtime, And Release Captures

| ID | Required capture | Evidence type | Status | Artifact path |
| --- | --- | --- | --- | --- |
| `desktop-lyrics-white` | Desktop lyrics readable on white background. | Screenshot/recording | pending | 待采集 |
| `desktop-lyrics-black` | Desktop lyrics readable on black background. | Screenshot/recording | pending | 待采集 |
| `desktop-lyrics-lock-unlock` | Middle-click lock/unlock and click-through behavior. | Recording | pending | 待采集 |
| `desktop-lyrics-drag` | Unlocked desktop lyrics drag behavior and position persistence expectations. | Recording | pending | 待采集 |
| `runtime-sidecar-crash-restart` | Tauri sidecar crash, restart, recovering/recovered UI state, and preserved playback/provider recovery behavior. | Recording + log excerpt path | pending | 待采集 |
| `runtime-sidecar-rolling-logs` | Rolling log files under app data with no cookie leakage in diagnostics. | Metadata/log path | pending | 待采集 |
| `runtime-login-cookie-injection` | Netease/QQ login WebView cookie extraction, sidecar session injection, logout clearing, no cookie echo. | Recording + sanitized log note | blocked | 待 B1 凭证 |
| `release-installer-install-launch` | Windows installer install -> launch flow with new app id/data dir. | Recording/log note | pending | 待采集 |
| `release-updater` | Update check plus approved install path or explicit signature-blocked/manual-update decision. | Recording/log note | pending | 待采集 |
| `release-uninstall` | Windows uninstall removes app while preserving only expected user data policy. | Recording/log note | pending | 待采集 |

## Previously Recorded Static References

- Home idle, 1920x1080: `verification\baseline\2026-06-27-ced5ec61\home-idle-window.png`
- Home idle, 1280x720: `verification\baseline\2026-06-27-ced5ec61\home-idle-1280x720.png`
- Login modal/main UI references: `verification\baseline\2026-06-27-ced5ec61\main-ui-1280x720.png` and `verification\baseline\2026-06-27-ced5ec61\main-ui-no-modal-1280x720.png`
- Search results fixture: `verification\baseline\2026-06-27-ced5ec61\search-results-yujian-1280x720.png`
- Playback console static visible/hidden: `verification\baseline\2026-06-27-ced5ec61\playback-console-visible-1280x720.png` and `verification\baseline\2026-06-27-ced5ec61\playback-console-hidden-1280x720.png`
- Visual console static reference: `verification\baseline\2026-06-27-ced5ec61\visual-console-panel-1280x720.png`
- 3D shelf static reference: `verification\baseline\2026-06-27-ced5ec61\playlist-shelf-side-1280x720.png`
- Desktop lyrics open static reference: `verification\baseline\2026-06-27-ced5ec61\desktop-lyrics-open.png`

These static references do not close the final WebView2 parity gates by themselves. They are retained as baseline orientation and must be supplemented by the required manual captures above.

## Storage Rules

- Store large screenshots and recordings outside git unless explicitly curated.
- Suggested ignored local folder: `verification\baseline\2026-06-27-ced5ec61`.
- Suggested external backup folder: `D:\项目\工作区备份\Mineradio-tauri-baseline-20260627`.
- Commit only this document and small metadata JSON.
- When evidence is stored outside git, record both the local path and backup path in metadata.

## P1 Acceptance

Tauri migration work may proceed past P1 when commit, branch, window sizes, display scale, artifact directory, visual archive source, and code-derived animation spec are recorded.

Current status on 2026-06-27: commit, branch, window sizes, display scale, artifact directory, search fixture, visual archive source, and code-derived animation spec are recorded. Fixed playback test track, cover source, and lyric source remain open. Screenshot/recording gaps are moved to pre-public-release manual parity instead of blocking P1.

## Public Release Parity Acceptance

Before public release, the Tauri line still needs fixed playback test track metadata, cover source, lyric source, Windows/WebView2 startup shell evidence, proxied playback evidence, provider credential-gated evidence, visual-host nonblank evidence, 3D shelf flow evidence, desktop lyrics lock/unlock/drag evidence, sidecar lifecycle evidence, login cookie injection evidence, and installer/update/uninstall evidence.

The release gate remains open until every required row above is either recorded with artifact paths or explicitly blocked by a named decision in `docs/migration/CAPABILITY_PARITY_CHECKLIST.md`, `docs/migration/DEFERRED_CAPABILITIES.md`, or `docs/migration/LICENSE_GATE.md`.
