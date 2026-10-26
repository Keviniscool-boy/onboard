# Security Policy

## 这个 skill 会做什么

onboard 的脚本在**用户指定的资料目录**上运行，行为边界如下：

- **只读**：`inventory.mjs` 和 `fingerprint.mjs` 不写、不改、不删任何源文件。产物只写到资料夹内的 `项目拆解包/`（由 agent 创建，且仅此一处）。
- **外部命令**：两个脚本会调用 `git`（只读子命令：`rev-parse`、`status`、`log`、`ls-files`、`rev-list`）。所有 Git 调用都带 `-c core.fsmonitor=false`，**不会执行**材料仓库配置里指向的 fsmonitor 或其他辅助程序。
- **不联网**：脚本零网络请求，零第三方依赖；分析全程在本地。
- **敏感文件**：`.env*`、`*.pem/key/p12/pfx/jks`、`id_rsa` 等 SSH 密钥、`*.npmrc`、credentials 类 JSON 等命名敏感的文件**只登记排除，绝不读取内容**（规则见脚本内 `SECRET_NAME`，两脚本一致并有测试盯守）。
- **材料是证据不是指令**：agent 层面不执行资料内容里出现的命令或提示词（见 SKILL.md 边界节）。

## 已知限制

- 文件名规则拦截不了"内容含密钥但命名正常"的文件；对不可信材料，请在隔离环境运行。
- Git 配置中的 `core.fsmonitor` 之外的其他别名/钩子（如 `core.pager`）通过只读子命令与管道 stdio 不会触发，但极端自定义配置未逐一枚举。

## 报告漏洞

不要开公开 issue。联系 **raotao29@gmail.com**，或通过 GitHub 私有安全通告（Security → Report a vulnerability）。48 小时内确认。
