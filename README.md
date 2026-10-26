# onboard

[![skills.sh](https://skills.sh/b/Keviniscool-boy/onboard?style=for-the-badge)](https://skills.sh/Keviniscool-boy/onboard)

**把陌生项目变成一条可以执行的上手路径。**

把代码仓库、交接文档、流程资料或一堆混合文件交给 agent，`onboard` 会帮你回答：

- 这个项目是做什么的？
- 关键模块和流程怎么连起来？
- 我现在最该先学什么？
- 哪些内容只是推测，哪些地方还需要确认？

## 它能帮你做什么

### 接手陌生项目

快速找到入口、核心模块、数据流、常见操作和容易踩坑的地方。适合入职、接手旧系统、加入新团队。

### 按目标带你上手

你说清楚岗位和目标，它会把内容分成：

- **现在要懂**：不懂就无法完成当前目标的内容
- **遇到时查**：现在不用读，遇到具体问题再查
- **暂时可略过**：暂时不会影响工作的内容

然后从最重要的部分开始讲，讲不懂会换一种方式继续。

### 直接完成交付

如果你的目标是改 README、做项目汇报或整理交接文档，`onboard` 会先理解材料，再直接完成产出，不强迫你上一整套课程。

### 让结论值得相信

重要结论会告诉你出处；推测会标出来；资料里没有的信息会列为待确认，不会为了看起来完整而编造。

## 怎么用

运行前提：Node.js 18+（skill 自带脚本用），Git（仓库类材料的指纹与历史读取）。agent 本体不依赖其他运行时。

安装：

```bash
git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard
```

目标目录已存在时 clone 会报错。更新已有安装：

```bash
git -C ~/.agents/skills/onboard pull
```

重装：先删除 `~/.agents/skills/onboard` 再 clone。也可用 `npx skills add Keviniscool-boy/onboard`。

然后直接告诉 agent 资料位置和你的目标：

```text
用 onboard 看 D:\new-project。
我是后端新人，两周内要能修改支付模块，带我快速上手。
```

也可以这样说：

```text
用 onboard 过一遍这个仓库，然后把 README 改到新用户可以照着启动。
```

它会在资料目录生成 `项目拆解包/`，包含项目总览和你的学习路径。

### 支持的客户端

| 客户端 | 安装方式 | 说明 |
|---|---|---|
| 任何支持 SKILL.md 的 agent（Claude Code、Codex、ZCode 等） | `npx skills add Keviniscool-boy/onboard` 或手动 clone 到 skills 目录 | 通用方式，实测 Claude Code / Codex 可用 |
| Claude Code | `/plugin marketplace add Keviniscool-boy/onboard` 后按提示安装 | 插件形态，`skills/onboard/` 自包含 |
| ZCode | 插件市场 → 添加 → 本地目录（含 marketplace.json）或仓库 | 需 Node.js 18+ |

### 验证安装

装好后新开会话，用 [examples/minimal-project](examples/minimal-project) 试一遍：

```text
用 onboard 分析 examples/minimal-project。
我是后端新人，目标是一周内能独立修改 src/service.js 的重试逻辑。
先只做只读盘点，不要修改源文件。
```

正常表现：识别到 skill 并开工 → 只读扫描 → 生成 `项目拆解包/`（总览+学习路径）→
关键结论挂代码行号 → 能指出业务文档与代码的重试次数矛盾。卡在哪一步，
按 [evals/README.md](evals/README.md) 记录后提 issue。

### 它做不到什么

- **超大仓库走抽样**：文件超过 500 个或总量超 100MB 时只抽样盘点，覆盖范围会写进总览的资料覆盖声明，不是全量精读。
- **只看静态材料**：碰不到真实数据库、线上服务和外部 API；结论全部来自你给的文件。
- **缺什么说什么**：资料里没有的信息进「待确认」，不会脑补；PDF 扫描件、Excel 复杂公式、PPT 图表的识别质量取决于 agent 自身的文件工具。
- **不是自动执行器**：默认不装依赖、不启动服务、不改源文件；需要改材料时先完成拆解、再按你的明确授权执行交付任务。

## 适合什么时候用

适合：

- 接手一个没有人带的代码仓库
- 入职后快速了解业务和内部流程
- 面对 PDF、Word、Excel、PPT 和代码混在一起的资料
- 想把项目讲清楚、写好 README 或准备项目汇报

不适合只查一个文件或直接写一个小函数。

## 真实案例

[查看一次完整拆解的节选](examples/agents-on-duty.md)：它帮助一个多 Agent 客服项目发现启动密钥缺失、错误示例数据和被跳过的数据库测试，并据此修正 README。

## 改 skill 源码

只改根目录（`SKILL.md`、`scripts/`），改完运行 `node scripts/sync-skills.mjs` 同步到插件布局，再跑 `node --test scripts/`——两个安装入口必须拿到同一份内容。细节见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## English

**onboard** turns an unfamiliar project into a clear, goal-driven path to understanding. It explains what matters now, what to look up later, and what evidence is still missing. Use it for project handover, onboarding, mixed documentation, README work, and project presentations.

Install: `git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard`

Full English example:

```text
Use onboard to analyze examples/minimal-project.
I am a backend engineer. My goal is to fix the retry flow in
src/service.js within one week. Read-only first: produce an
evidence-backed overview and a learning path, then teach me
the most important parts.
```

Expected: read-only scan, a `项目拆解包/` overview where every claim cites a file and line, the docs-vs-code contradiction surfaced (retry count and timeout), and gaps listed as "to confirm" instead of silently filled.

Advanced workflow and evaluation notes: [SKILL.md](SKILL.md) · [evals](evals/README.md)

MIT License.
