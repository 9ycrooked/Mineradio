# Security Policy

## Supported Versions

当前只维护 MineRadio-Tauri 主线的最新公开版本。

## Reporting a Vulnerability

如果你发现安全问题，请通过 GitHub Issues 或仓库作者主页联系维护者。

请不要在公开 Issue 中直接贴出 Cookie、Token、账号信息、私密链接或可复现的敏感数据。可以先提交脱敏后的影响描述、系统环境和复现范围。

## Sensitive Data

MineRadio-Tauri 不应收集或上传用户 Cookie。用户登录状态、缓存、诊断日志和播放偏好应保存在本机应用数据目录中。

提交问题反馈前，请确认没有附带：

- `.cookie`
- `.qq-cookie`
- `.env`
- 本地音乐文件
- 用户账号截图
- 调试日志中的 Cookie、Token 或隐私路径
