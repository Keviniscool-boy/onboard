# onboard

[![skills.sh](https://skills.sh/b/Keviniscool-boy/onboard?style=for-the-badge)](https://skills.sh/b/Keviniscool-boy/onboard)

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

安装：

```bash
git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard
```

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

## 适合什么时候用

适合：

- 接手一个没有人带的代码仓库
- 入职后快速了解业务和内部流程
- 面对 PDF、Word、Excel、PPT 和代码混在一起的资料
- 想把项目讲清楚、写好 README 或准备项目汇报

不适合只查一个文件或直接写一个小函数。

## 真实案例

[查看一次完整拆解的节选](examples/agents-on-duty.md)：它帮助一个多 Agent 客服项目发现启动密钥缺失、错误示例数据和被跳过的数据库测试，并据此修正 README。

## English

**onboard** turns an unfamiliar project into a clear, goal-driven path to understanding. It explains what matters now, what to look up later, and what evidence is still missing. Use it for project handover, onboarding, mixed documentation, README work, and project presentations.

Install: `git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard`

Advanced workflow and evaluation notes: [SKILL.md](SKILL.md) · [evals](evals/README.md)

MIT License.
