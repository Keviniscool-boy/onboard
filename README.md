# 快速梳理（onboard）

**快速梳理：把一堆公司资料，啃成能验收的学习包。**
Turn a folder of company materials (code + docs) into a verifiable onboarding learning pack.

## 它解决什么问题

入职新公司 / 接手大项目时，你手里通常是一坨：几个代码仓库、一批飞书或 Confluence
导出的 PDF、PPT、Excel、数据库 schema、新人手册——没人告诉你从哪读起，读完也不
知道自没自己真的懂了。

`onboard` 是一个 [agent skill](https://code.claude.com/docs/en/skills)（SKILL.md +
脚本，无其他依赖）：把资料文件夹和一句角色卡（"我是后端新人，两周内要能改支付模块"）
交给 agent，它走完五步——

1. **盘点**（纯脚本）：语言构成、git 热点文件、文档清单及过期标记；
2. **定向**：业务一句话 + 系统边界图 + 术语表，**停下问你"对得上吗"**，并生成"该问导师的问题清单"；
3. **深读**：3-5 张流程卡（时序图 + 涉及文件 + 影响面），按需深挖；
4. **组装**：`onboarding-pack/` —— 阅读路径（第 1 天/1 周/1 月）、自测题、给 agent 自己用的项目地图；
5. **验收**：说"考我"，出题判卷，每个判断挂出处，错的指回具体文件。

## 和 DeepWiki 这类工具的区别

DeepWiki 生成参考 wiki，读完就完了。`onboard` 输出的是**教学材料 + 验收闭环**：
阅读路径、自测题、考核模式、以及一份让 agent 之后每次会话开局自带上下文的项目地图。
另外它跑在本地 agent 里，公司代码不出内网。设计依据见
[NOTES-steal-list.md](NOTES-steal-list.md)（对 deepwiki-open 的逐行研读笔记）。

## 安装

把本目录复制/克隆到 agent 的 skills 目录，例如：

```bash
git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard
```

然后对 agent 说：

> 资料都在 `D:\new-company`，我是后端新人，两周内要能改支付模块，开始。

## 状态

v1。盘点脚本已在真实仓库实测；五步全流程正在用 Dify（大型真实项目）做验收。
纯文档向（运营/产品等角色）已有预设设计，待真实资料堆校准。

## 红线

- 每条结论必须挂 `Sources: [路径:行]()`，推不出来标"未知"，不许编——入职工具编造业务逻辑，新人会拿着错误认知去开会。
- 学习包可能含公司机密：只留本地或进公司内网，不要推公开仓库。

## License

MIT
