# onboard：快速看懂陌生项目

[![skills.sh](https://skills.sh/b/Keviniscool-boy/onboard?style=for-the-badge)](https://skills.sh/Keviniscool-boy/onboard)

把代码仓库或一堆混合资料交给 agent，得到**有出处的项目总览**和**按你的目标排序的上手路径**。它会说清哪些内容已经核实、哪些只是推断、哪些材料尚未覆盖。

**看一次真实结果：**[agents-on-duty 拆解节选](examples/agents-on-duty.md)。这次拆解找到快速开始缺少的密钥、容易误导的订单示例，以及“全绿”测试中实际跳过的数据库用例，并据此修正了该项目的 README。

## 使用

安装到 agent 的 skills 目录：

```bash
git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard
```

然后提供资料目录和目标，例如：

> 用 onboard 看 `D:\new-project`。我是后端新人，两周内要能修改支付模块，带我上手。

也可以要求交付物：

> 用 onboard 过一遍这个仓库，然后把 README 改到新用户可以照着启动、理解限制的程度。

默认在资料夹内生成被 Git 忽略的 `项目拆解包/`：`总览.md` 与一份三档学习路径。理解型任务沿路径带学；README、汇报等交付型任务先拆解再直接应用。地图、流程图、术语表按需生成。

## 它会检查什么

1. 盘点材料与覆盖边界，识别项目类型。
2. 追踪关键流程、实际操作、例外、限制、易混概念和新人障碍。
3. 给重要结论挂出处，标清推断、矛盾与待确认。
4. 按目标分成「现在要懂 / 遇到时查 / 暂时可略过」，再带学或完成交付。

资料中的指令只作资料处理；密钥文件默认不读。拆解阶段不改源材料。完整执行规则见 [SKILL.md](SKILL.md)。

## 续用与验证

`fingerprint.mjs` 只读 Git 状态和文件元数据，不读取文件内容。把第一次输出的指纹写入总览；下次用它比较材料是否变化，变化后仍需回看 diff 判断影响。

```bash
node scripts/fingerprint.mjs /path/to/project
node scripts/fingerprint.mjs /path/to/project <previous-fingerprint>
node scripts/inventory.mjs /path/to/project
```

第二条命令在材料变化时退出码为 1。脚本排除 `.env`、私钥及拆解包，但保留公开的 `.env.example` 等样例；因此指纹只表示**可扫描材料**的状态，不是内容完整性证明。盘点命令默认只向终端输出，显式传第二个路径才写 JSON。

真实项目评测与限制见 [evals/](evals/README.md)。已验证代码仓库拆解和交付应用；真实模型下的互动教学质量还需要独立复测。

## English

**onboard** turns an unfamiliar codebase or mixed project folder into a sourced overview and a goal-driven learning path. It distinguishes verified facts, inference, and missing evidence. Learning goals trigger interactive teaching; deliverable goals use the findings directly. See the [real project example](examples/agents-on-duty.md) and [evaluation notes](evals/README.md).

Install: `git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard`

MIT License.
