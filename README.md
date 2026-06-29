# Mineradio Tauri Rewrite

Mineradio Tauri Rewrite 是基于原 Mineradio 的 GPL-3.0 二开迁移主线。当前目标是把旧 Electron/Node/单体 HTML 项目迁移到 `Tauri 2 + Rust + WebView2`、Bun workspace、`Vite + TypeScript + React + Zustand`、Bun sidecar runtime、shared types + zod 和 Tauri updater。

本仓库的新 Tauri 主线使用新的 fork/release identity：公开仓库和 updater channel 指向 `zzstar101/Mineradio`。旧 Electron 代码仍保留为视觉、行为和能力参考基线，但不是新 Tauri 主线的运行时兼容对象。

## 当前状态

当前 Tauri 主线仍在迁移中，尚未达到公开发布条件。

- 旧 Electron baseline 只作为对照参考。
- Tauri 主线不承诺读取或自动迁移旧 Electron 安装用户数据。
- 公开发布前必须通过 capability parity、Windows 安装/更新/卸载、视觉对齐和 license gate。
- 旧 Electron updater、轻量 patch JSON 和 NSIS 发布流程不会迁入 Tauri 主线。

迁移总控文档见：

- `docs/migration/PRD_TAURI_REWRITE.md`
- `docs/migration/CAPABILITY_PARITY_CHECKLIST.md`
- `docs/migration/DEFERRED_CAPABILITIES.md`
- `docs/migration/LICENSE_GATE.md`
- `docs/migration/MIGRATION_INVENTORY.md`
- `docs/migration/MIGRATION_TAURI_PLAN.md`

## 目标架构

- 桌面壳：Tauri 2 + Rust + WebView2，负责窗口、系统能力、登录 webview、sidecar 生命周期和 updater。
- 前端：Vite + TypeScript + React + Zustand，负责 UI、状态和 typed runtime bridge。
- 本地服务：Bun sidecar runtime，负责 provider、音乐 API、天气、音频代理、缓存和诊断。
- 契约：shared types + zod，固定跨层 API 和持久化数据形状。
- 视觉：Canvas/WebGL/GSAP visual engine，React 只传状态快照和回调。

目标目录以 `docs/migration/MIGRATION_TAURI_PLAN.md` 为准。旧 `public/index.html` 只能作为迁移参考，不能作为最终 iframe/webview 套壳方案。

## 开发命令

Electron baseline 的最小检查仍可用于确认旧线没有被破坏：

```powershell
git diff --check
node --check server.js
```

Tauri 主线开发命令会随迁移阶段补齐，目前以仓库脚本和阶段计划为准：

```powershell
bun run tauri:dev
bun run web:build
bun run sidecar:dev
```

不要把旧 Electron `npm start`、`npm run build:win` 或 `package.json` 的 electron-builder 配置当成新 Tauri 主线的发布验收。

## 更新与发布

Tauri 主线使用 Tauri updater，endpoint 当前配置为：

```text
https://github.com/zzstar101/Mineradio/releases/latest/download/latest.json
```

本地可用 `bun run release-manifest:generate` 生成 Tauri 2 static `latest.json` 草案；B2 未签名时该 manifest 仅用于 detection-only 检测，不下载或安装更新。

安装更新仍有签名、公钥、真实 GitHub Release 上传、低版本升级、Windows 安装/卸载和 release notes 等人工 gate。当前 README 不代表项目已经可以公开发布。

## 第三方音乐平台说明

Mineradio Tauri Rewrite 不是网易云音乐、QQ 音乐或腾讯音乐娱乐集团的官方客户端，也不隶属于任何音乐平台。

项目中的第三方平台接入仅用于个人学习、本地客户端体验和用户自有账号的播放辅助。请遵守对应平台的用户协议、版权规则和会员权益规则。项目不会提供绕过付费、绕过会员、破解音质或重新分发音乐内容的能力。

## 用户数据与隐私

新 Tauri 主线使用新的 app id、数据目录和 updater channel，不承诺读取旧 Electron 安装用户数据。登录 Cookie、搜索历史、自定义封面、自定义歌词、节奏分析缓存等数据只应保存在本机新项目数据目录或浏览器本地存储中，不应提交到仓库。

更多说明见 `PRIVACY.md`。

## 版权与授权

原 Mineradio 由 XxHuberrr 主要设计与打造。MR Logo、Mineradio 名称、界面视觉设计与原创视觉表达归原作者所有；第三方依赖和第三方服务分别遵循其各自授权与服务条款。

本 fork 继续采用 GPL-3.0 授权。详见 `LICENSE`、`NOTICE.md` 和 `THIRD_PARTY_NOTICES.md`。
