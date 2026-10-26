# Changelog

版本只增不改；行为变化对应 SKILL.md 或脚本的实际改动，工程与文档变化单独列出。
发布节奏：改动 SKILL.md 的触发词、流程或边界 → 升 minor；修缺陷、补工程设施 → 升 patch。

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
