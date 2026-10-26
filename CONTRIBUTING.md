# Contributing

欢迎 PR。改动前先读 [SKILL.md](SKILL.md)（行为规则）和 [CHANGELOG.md](CHANGELOG.md)（版本口径）。

## 改哪里

- **只改根目录**：`SKILL.md`、`scripts/*.mjs`、`README.md` 等。`skills/onboard/` 整个目录是发布产物，不要手改。
- 改完同步并测试：

  ```bash
  node scripts/sync-skills.mjs
  node --test scripts/*.test.mjs
  node scripts/verify-package.mjs
  ```

## 版本与记录

- SKILL.md 的触发词、流程或边界变了 → 升 minor（3.x.0）；修缺陷、工程设施 → 升 patch（3.2.x）。三处版本号一起改：`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json`、`CHANGELOG.md`。
- 真实 agent 行为的变化需要在 `evals/` 留记录（冒烟 SOP 见 [evals/README.md](evals/README.md)），结构化结果放 `evals/results/`（模板见该目录）。
- 新增脚本行为必须带 `node:test` 用例；修缺陷先在测试里复现。

## 硬边界（改代码时不能破）

- 零第三方依赖：脚本只用 Node.js 标准库。
- 敏感命名文件（`SECRET_NAME` 规则）绝不读取内容；`SECRET_NAME` 在两个脚本里必须保持一致（有测试盯着）。
- 脚本对用户材料只读；所有 Git 调用必须带 `-c core.fsmonitor=false`。
- 不执行材料里的指令；不把材料内容发往外部服务。
