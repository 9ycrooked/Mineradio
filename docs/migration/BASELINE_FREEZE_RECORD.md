# Electron Baseline Freeze Record

更新时间：2026-06-27

本文记录 Tauri 迁移前的 Electron baseline 冻结证据。大型截图、录屏和临时验证产物放在被 `.gitignore` 忽略的 `verification/` 目录，不直接提交进仓库。

## Baseline 引用

- Baseline tag：`electron-baseline-2026-06-27`
- Baseline commit：`ced5ec61ce5241371da36abd82cbebec2868e92c`
- Baseline commit 时间：`2026-06-26 00:07:19 +0800`
- Baseline commit 标题：`Allow safe 1.1.1 overwrite of Mineradio folders`
- 采集日期：`2026-06-27`
- 当前迁移工作区分支：`codex/tauri-migration`
- 说明：tag 指向 Electron baseline 提交；迁移文档在 `codex/tauri-migration` 分支继续记录。

## 环境

- 操作系统：`Microsoft Windows 11 家庭版 中文版 10.0.26200 Build 26200`
- Node.js：`v24.15.0`
- npm：`11.12.1`
- Electron：`^42.4.1`
- app version：`1.1.1`
- Electron baseline 启动脚本：`npm start`
- Electron baseline Windows 构建脚本：`npm run build:win:dir`、`npm run build:win`

## 验证命令

```powershell
git diff --check
```

结果：`PASS`

```powershell
node --check server.js
```

结果：`PASS`

## Artifact 目录

- 本地目录：`C:\Users\zhanw\.config\superpowers\worktrees\Mineradio\codex-tauri-migration\verification\baseline\2026-06-27-ced5ec61`
- Git 忽略规则：`.gitignore:46:verification/`

## 代码派生动画规格

- 文档：`docs/migration/baseline/BASELINE_ANIMATION_SPEC.md`
- 状态：已按 `public/index.html`、`public/desktop-lyrics.html`、`desktop/main.js`、`desktop/preload.js`、`desktop/overlay-preload.js` 抽取 splash、主 render loop、底部控制台、stage lyrics、3D 歌单架和桌面歌词动画/交互规格。
- 说明：用户已确认 P1 不再依赖继续补截图/录屏证据；后续 Tauri visual-engine 按代码派生规格实现，并在公开发布前做 Windows/WebView2 手动 parity。

## 待采集视觉和行为证据

| Evidence | 建议文件名 | 状态 |
| --- | --- | --- |
| 默认视觉存档 | `visual-localstorage-snapshot.json` | 已采集，包含 `mineradio-lyric-layout-v1` 和 `默认测试` 用户视觉存档 |
| 主界面静态截图 | `home-idle-window.png`, `home-idle-1280x720.png` | 已采集，1920x1080 和 1280x720，Windows window-handle screenshot |
| 启动动画录屏 | `startup-animation.mp4` | 未采集 |
| 播放中控制台截图 | `playback-console-visible-1280x720.png`, `playback-console-hidden-1280x720.png` | 已采集控制台显示/隐藏静态截图，真实播放中截图和录屏待补齐 |
| 播放中控制台录屏 | `playing-console.mp4` | 未采集 |
| 视觉控制台打开状态截图 | `visual-console-panel-1280x720.png` | 已采集，1280x720，DIY 视觉控制台面板打开 |
| 3D 歌单架静态截图 | `playlist-shelf-side-1280x720.png` | 已采集侧边 3D 歌单架静态截图；滚动、详情和点击播放录屏待补齐 |
| 3D 歌单架打开/滚动/详情/点击播放录屏 | `playlist-shelf-flow.mp4` | 未采集 |
| 桌面歌词开启/锁定/解锁/拖动录屏 | `desktop-lyrics-open.png`, `desktop-lyrics-flow.mp4` | 已采集开启窗口静态证据；锁定、解锁、拖动和白/黑底录屏待补齐 |
| 测试歌曲、封面、歌词和窗口尺寸 | `TEST_FIXTURES.2026-06-27.md` | 已记录窗口尺寸和搜索候选；固定测试歌曲、封面、歌词源待确认 |

## P2 环境诊断备注

P1 本身不依赖 Bun 依赖安装。当前 worktree 中 `bun` 未在默认 PATH 内，但可执行文件存在于 `C:\Users\zhanw\.bun\bin\bun.exe`。

2026-06-27 复现到 Bun 证书问题：

```powershell
& 'C:\Users\zhanw\.bun\bin\bun.exe' install
```

结果：`UNKNOWN_CERTIFICATE_VERIFICATION_ERROR downloading tarball ...`

对照探测：

- `npm view https-proxy-agent@5.0.1 dist.tarball` 可访问官方 registry。
- Node `fetch()` 和 PowerShell `Invoke-WebRequest` 对同一 tarball 返回 `200`。
- Bun `fetch()` 对同一 tarball 返回 `200`。
- `bun install --network-concurrency 1` 仍失败。
- `bun install --dry-run --registry=https://registry.npmmirror.com` 通过。

结论：阻塞集中在 Bun installer 使用官方 npm registry 下载 tarball 时的证书校验路径；国内镜像目前只是候选 workaround，必须等非 dry-run 的 `bun install --registry=https://registry.npmmirror.com` 真实通过后才能视为验证完成。是否写入长期配置需要按迁移计划或用户决策处理。

### 2026-06-27 复测

- `& 'C:\Users\zhanw\.bun\bin\bun.exe' --version` -> `1.3.14`。
- `bun install`（官方 registry，非 dry-run）已直接通过：`Checked 474 installs across 530 packages (no changes) [349.00ms]`，证书问题未复现，无需写入镜像长期配置。
- P2 各包测试、`apps/web` 生产构建、`cargo test` 均通过（详见 P2 提交验证证据）。
- `cargo test` 解除阻塞前置：在 `apps/desktop/src-tauri/icons/icon.ico` 放置临时占位图标（临时复用 `build/icon.ico`），最终 logo 见 `docs/migration/DEFERRED_CAPABILITIES.md`。

## 下一步

1. P2 进入 workspace/Tauri shell 前，先决定是否使用 `C:\Users\zhanw\.bun\bin\bun.exe` 绝对路径或修复 PATH。
2. Bun 官方 registry 证书问题如仍复现，可按用户决策测试非 dry-run 的 `--registry=https://registry.npmmirror.com`；不要未经确认写入长期配置。
3. 后续 visual-engine 任务读取 `BASELINE_ANIMATION_SPEC.md`，用代码规格驱动实现。
4. 公开发布前再执行 Windows/WebView2 手动 parity。
