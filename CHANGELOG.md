# Changelog

版本只增不改；行为变化对应 SKILL.md 或脚本的实际改动，工程与文档变化单独列出。
发布节奏：改动 SKILL.md 的触发词、流程或边界 → 升 minor；修缺陷、补工程设施 → 升 patch。

## 3.2.5 - 2026-10-27

- 复审观察项：fingerprint 输出标签 `changed files/bytes` 改为 `fingerprinted files/bytes`——该计数实为「纳入指纹的文件数」，原名称在 git 模式对干净仓库也会打印非零值，有误导
- 补齐体验阶段证据：`evals/results/2026-10-27-minimal-project-understand.json` 与 `-deliver.json`——两个零上下文陌生 agent 在 minimal-project 上的双角色端到端冒烟（理解型：全流程+带学；交付型：实跑验证+README 交付），均通过判卷七项，边界经 diff 验证

## 3.2.4 - 2026-10-26

第二轮审核（对象 3.2.1）处置；U1 阻断项已由 3.2.3 修复，本版处理其余各项：

- U2（中）两脚本目录排除集合统一（fingerprint 采用 inventory 的 23 项清单）——构建产物目录（target/.next/.gradle/Pods 等）的变化不再误触发「材料已变」；package.test 新增目录边界一致性断言
- U5 大文件（≥512KB）未计行数时不再静默：仓库记录 `langLinesSkipped` 并在摘要提示
- U6 敏感命名文档不再同时出现在文档清单与敏感排除清单（只登记排除）
- U7 嵌套仓库超过深度上限时明确提示「未纳入指纹」，不再静默跳过
- U4（部分）盘点结果新增 `totals.totalBytes`；抽样节奏按 SKILL.md 仍属 agent 层职责
- U3 README 新增「改 skill 源码」节（单源同步工作流）
- U8 新增 `evals/results/2026-10-26-v3.2.4-fingerprint-fix.json`（本轮验证记录，只含实跑内容）

## 3.2.3 - 2026-10-26

- H2 补全（CI 实测抓到）：git 的 stat 缓存会把「等长改写且 mtime 恢复到与索引一致」的 tracked 文件判定为未变化，`git status` 看不见。指纹现在对**所有** ≤512KB 的 tracked 文件做内容哈希（untracked/ignored 此前已覆盖）；SKILL.md 指纹说明同步。此前的 H2 修复只覆盖了未跟踪与忽略文件。
- CI 修复：isRepo 改用 `rev-parse --show-prefix` 原语判断（路径字符串比对在 CI 的 8.3 短路径/大小写下不可靠）；测试步骤改 bash shell 展开 glob（Node 22 的目录参数不发现用例）。

## 3.2.2 - 2026-10-26

工程与文档（skill 行为不变）：

- 新增 GitHub Actions：ubuntu/windows × Node 18/20/22 跑全部测试 + 打包一致性校验
- 新增 `scripts/verify-package.mjs`：发布前离线检查（版本号一致、SKILL.md frontmatter、脚本引用可解析、CHANGELOG 对齐）
- 新增 CHANGELOG、CONTRIBUTING、SECURITY
- README 新增：安装后验证、支持的客户端矩阵、「它做不到什么」、英文完整示例
- 新增 `examples/minimal-project/` 最小可复制资料集
- 新增 `evals/results/` 结构化评测结果模板（往后的评测按此归档）

## 3.2.1 - 2026-10-26

第三方审计修复（H1–H4 全部复现后修复，M/L 级按源码确认修复）：

- 指纹（fingerprint.mjs）：
  - H1 被 `.gitignore` 忽略的普通资料纳入指纹（`ls-files --others --ignored`）
  - H2 未跟踪/普通文件改用内容哈希（≤512KB），等长改写且保留 mtime 也能检出
  - H3 嵌套仓库递归指纹混入父指纹（≤5 层）
  - M1 空仓库（unborn HEAD）不再崩溃；M4 status 加 maxBuffer/timeout，Git 失败退出码 2
  - M6 改名跨敏感过滤边界仍入指纹；M7 realpath + Windows 大小写归一
  - M19 所有 Git 调用挂 `-c core.fsmonitor=false`，不执行材料携带的 fsmonitor 命令
- 盘点（inventory.mjs）：
  - M2 非目录输入退出码 2；M13 Git 失败不再伪装 0 commits；M12 用 `--is-shallow-repository` 判浅克隆
  - M3/M17 敏感命名文件统一登记排除、绝不读取；M8/M9 截断结构化并如实标注
  - M5 目录排序；M10 读取失败记警告；M11 删除未用统计、语言扫描跳过嵌套仓库
  - M14 输出文件不计入材料；M15 `quotePath=false` 中文名不转义；M16 终端输出控制字符消毒
  - L1 行数对齐 wc -l；L2 扩展名小写分组；L3 热点表防原型污染；L4 `.git` 文件按 gitdir 校验
- 布局与文档：
  - H4 `skills/onboard/` 改为自包含（SKILL.md + scripts/），插件宿主可直接解析 `scripts/…` 引用
  - 新增 `scripts/sync-skills.mjs` 单源发布；M18 只读边界与 `.gitignore` 矛盾改为提示用户自行处理
  - README 徽章外链修正、安装/更新/重装说明、运行前提；测试从 4 个扩到 18 个

## 3.2.0 - 2026-10-25

- SKILL.md 精简重写（边界前置、五步流程、理解/交付双目标）
- 新增材料指纹与续用检测（`scripts/fingerprint.mjs`，SHA-256 元数据方案）
- README 聚焦用户结果；新增 `examples/agents-on-duty.md` 真实案例节选

## 3.1.1 - 2026-10-24

- 结课/PPT/规模档（703 文件抽样）三场补考通过；PPT 出处约定采纳进规范；4 处小修

## 3.1.0 - 2026-10-24

- 敌意评审 15 缺陷 + 三场分支考（指纹失配/自检负例/路径终点），20 项加固
- 指纹重做（排除拆解包）、失配默认动作、总览 O-N 编号锚点、规模档抽样、六清单每网 10 条上限

## 3.0.0 - 2026-10-24

- 产品方向定为「大型项目快速理解与上手」：拆解中心 + 七条边界（目标定重要性/不求全量/标清资料边界/不装领域专家/学法灵活/默认只读/产物按需）
- 陌生 agent 冒烟法固化进 evals/
