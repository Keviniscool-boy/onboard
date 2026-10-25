# agents-on-duty 实战评测（2026-10-25）

任务：用 onboard 理解 `Keviniscool-boy/agents-on-duty`，再改善面向 GitHub 读者的 README。资料为 87 文件的代码仓库；目标为交付物，故执行拆解和应用，不启动互动带学。

## 结果

| 判项 | 结果 | 证据 |
|---|---|---|
| 六清单覆盖 | 通过 | 总览六类均有结论；找出 DashScope key、mock 订单 ID、8080 冲突和 MySQL 条件测试 |
| 出处抽查 | 通过 | `create_supervisor_graph`、`LongTermMemory.__init__`、`lifespan`、`mock_data.py`、`test_mysql_store_roundtrip` 均支持对应结论 |
| 证据边界 | 通过 | 真实模型链路和历史质量指标标为未复现；未把 mock 数据或条件测试写成生产能力 |
| 产物数量 | 通过 | 仅总览和 README 维护者学习路径两份，位于被 Git 忽略的拆解包 |
| 只读边界 | 修复后通过 | 原盘点脚本默认写 `inventory.json`，与 B6 矛盾；现默认只输出终端摘要，显式传路径才写文件 |
| 目标匹配 | 通过 | 交付物任务直接应用 README，无多余带学；学习路径按维护者任务排序 |
| 指纹续用 | 修复后通过 | 原文同时要求忽略拆解包和“首次落盘并提交后”计算指纹；现按被忽略的拆解包和应用阶段预期改动处理 |

## 实测与限制

- 后端首次 `pytest` 在缺少 `DASHSCOPE_API_KEY` 时导入失败；按 CI 的 dummy key 复跑通过。MySQL 往返用例在本机打印 `SKIP`，未做真实读写。
- `npm ci` 后 Windows 前端构建缺少 Lightning CSS 原生模块；定位到锁文件对应包使用 `npmmirror` 地址。将该条改为官方 registry 后，干净 `npm ci` 与 `npm run build` 均通过。
- Compose 配置在临时 `.env` 和 `FRONTEND_PORT=8081` 下通过 `docker compose config --quiet`。
- 更新前端锁文件到 Vite 8.3.5 等修复版本后，干净安装、生产构建和 `npm audit` 均通过；审计为 0 个漏洞。
- 未持有有效聊天模型与 DashScope key，故未声称真实端到端回答质量；历史评测数字只作为仓库材料引用。

结论：核心拆解方法能找到 README 的关键错配，最有价值的是把读者实际启动会遇到的前置条件与示例数据查出来。脚本默认写盘和指纹描述矛盾是本次发现的 skill 缺陷，已修。
