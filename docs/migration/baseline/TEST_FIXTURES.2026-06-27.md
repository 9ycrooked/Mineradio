# Baseline Test Fixtures

更新时间：2026-06-27

本文记录 Electron baseline freeze 期间已经确认的测试素材和待补齐项。

## Window Sizes

- `1920x1080`：`home-idle-window.png`
- `1280x720`：`home-idle-1280x720.png`、后续主界面和控制台截图

## Search Fixture

- 搜索词：`遇见`
- 搜索模式：`All`
- 截图：`verification\baseline\2026-06-27-ced5ec61\search-results-yujian-1280x720.png`
- 观察到的候选结果：
  - `遇见（纯音乐）`，来源标记 `NE`
  - `遇见`，月楠，来源标记 `NE`
  - `遇见`，零零，来源标记 `NE`
  - `遇见（R&B）`，韩棒，来源标记 `NE`
  - `遇见（陕西话）`，陕西燕子，来源标记 `NE`
  - `遇见`，孙燕姿，来源标记 `NE`，`VIP`

## Visual Archive Fixture

- localStorage 快照：`verification\baseline\2026-06-27-ced5ec61\visual-localstorage-snapshot.json`
- 已记录 key：
  - `mineradio-lyric-layout-v1`
  - `mineradio-user-fx-archives-v1`
  - `mineradio-diy-player-mode-v1`
  - `skull-preset-v2`
- 内置用户视觉存档名称：`默认测试`

## 3D Shelf Static Fixture

- 静态截图：`verification\baseline\2026-06-27-ced5ec61\playlist-shelf-side-1280x720.png`
- 状态：已采集侧边 3D 歌单架静态证据。
- 仍缺：hover、滚动、详情页、点击播放的连续录屏。

## Pending Final Parity Fixtures

- Home startup shell 还未补齐：splash ready、splash dismissed Home、search focused/history、bottom handle hover、bottom bar visible/hidden 的最终 WebView2 对照证据。
- 还未选择最终用于全量 parity 的固定测试歌曲。
- 还未确认固定测试歌曲的 provider、id、封面源、歌词源、歌词类型和逐字歌词可用性。
- 还未完成真实播放链路：proxied audio src、播放、暂停、seek、下一首、ended、歌词同步。
- 还未采集 Netease/QQ 匿名与 B1 凭证门控证据；账号态、高音质、VIP/版权/登录失败分类不能从代码侧说明直接勾选。
- 还未采集 HomeVisual、stage lyrics、3D shelf flow、resize/camera、visual-host nonblank 的最终视觉证据。
- 还未采集桌面歌词白底/黑底可读性、中键锁定/解锁、click-through 和拖动录屏。
- 还未采集 sidecar crash/restart、rolling logs、diagnostics no-cookie 的运行时证据。
- 还未采集 login cookie extraction、sidecar session injection、logout clearing 的端到端证据。
- 还未采集 Windows installer install/launch、updater check/install 或签名策略决策、uninstall 证据。
