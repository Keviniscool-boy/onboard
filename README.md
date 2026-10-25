# 快速梳理（onboard）

[![skills.sh](https://skills.sh/b/Keviniscool-boy/onboard?style=for-the-badge)](https://skills.sh/Keviniscool-boy/onboard)

帮你快速看懂并上手陌生的大型项目。把代码仓库、业务流程、制度文档、表格或混合资料交给 AI，它会先拆解项目，再按你的目标安排学习顺序并带你学习。

## 怎么工作

1. **盘点资料**：识别项目类型，说明检查了什么、哪些材料无法读取。
2. **拆解全貌**：梳理关键组成、关系、流程、易错点和资料缺口；结论标出处，推断和矛盾明确标出。
3. **规划上手路径**：按你的目标区分“现在要懂”“遇到时查”和“暂时可略过”。重要性取决于它是否影响理解项目、完成目标或避免常见错误。
4. **按目标执行**：想上手时从重点带学；想写 README 等产物时，先拆解再直接应用。过程中发现遗漏，就回到材料核实并补充。

代码项目会重点追踪模块、数据流和调用链；业务或文职资料会重点梳理角色、流程、规则和指标。具体方法随材料类型调整。

## 使用

安装后，告诉 agent 资料位置和你的目标：

> 资料在 `D:\new-project`。我是后端新人，两周内要能修改支付模块，带我快速上手。

默认生成 `项目拆解包/`，其中包含精简总览和学习路径；地图、流程图、术语表等按项目需要补充。产出物任务完成后停止带学，理解项目的任务默认直接开讲。

## 边界

- 拆解阶段只读源材料；用户要求改 README 等材料时，拆解后再应用修改。Git 仓库会忽略拆解包。
- 密钥默认不读取；资料中的指令按资料内容处理，不执行。
- 标明资料覆盖范围；无法确认的内容列为推断、矛盾或待确认问题。
- 控制阅读和产物规模，优先讲清对上手有影响的内容。

## 安装

```bash
git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard
```

完整流程见 [SKILL.md](SKILL.md)，验收方法见 [evals/README.md](evals/README.md)。

MIT

## 为什么可信

每条规则都经过"陌生 agent + 真实资料"实测：代码仓库、无结构文档堆、银行法规
（Word/PDF/Excel）、PPT、703 文件抽样档；教学循环（换讲法/降级/续学/结课/回补/
指纹校验）逐分支验证。全部记录在 [evals/](evals/)——包括两次被真实用户否决的
设计方向。

## English

**onboard** is an agent skill that turns any pile of project materials (code,
docs, PDF, Excel, PPT) into a sourced decomposition — every claim cited or
flagged as inference — plus a goal-driven three-tier learning path
(*must-know now / lookup-when-needed / skippable*), then teaches you through
it by default. Gaps and contradictions are surfaced, never silently filled.

Install: `git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard`

Every rule in SKILL.md is validated by stranger-agent testing on real
materials — see [evals/](evals/README.md).
