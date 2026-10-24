# 快速梳理（onboard）

**快速梳理：不生成文档堆，AI 直接当导师带你啃公司业务。**
An agent skill that tutors you through your company's business — code, docs, PDFs — station by station, quiz included. No document piles.

## 它解决什么问题

入职新公司 / 接手大项目，手里是一坨：代码仓库、飞书导出的 PDF、PPT、Excel、
新人手册——没人带你，自己啃到天黑。

`onboard` 是一个 [agent skill](https://code.claude.com/docs/en/skills)（SKILL.md +
可选脚本）：把资料文件夹和一句角色卡（"我是后端新人，两周内要能改支付模块"）
交给 agent，它 2 分钟扫完资料，**直接开课**：

- **开场白 3 分钟**：这门生意怎么赚钱、你站在哪、课程表几站；
- **逐站带学**：从用户动作讲起（"一个用户在聊天框发了句话"），沿真实文件走链路，
  每步挂出处；**讲完一段考一段**，答错换个讲法重讲，不进下一站；
- **结课**：你复述全景，它对照原文查漏补正，交给你一份"该问导师的问题清单"；
- **跨天续课**：进度卡记着你学到哪、哪站薄弱，下次会话接着来。

全程是对话，不是文档堆——学习过程是产品，文件最多留一张进度卡。

## 和 DeepWiki 这类工具的区别

DeepWiki 生成参考 wiki，没人看完。`onboard` 的定位是**导师**：互动、有提问、
有出处、按你的角色决定讲什么考什么；公司代码不出本地。设计依据见
[NOTES-steal-list.md](NOTES-steal-list.md)（对 deepwiki-open 的逐行研读笔记）。

## 安装

```bash
git clone https://github.com/Keviniscool-boy/onboard ~/.agents/skills/onboard
```

然后对 agent 说：

> 资料都在 `D:\new-company`，我是后端新人，两周内要能改支付模块，开始带我学。

## 状态

v2（导师模式）。v1 是文档生成流（资料地图/阅读路径/自测题八件套），实测后被
否决——**用户要的是学习过程，不是学习材料**，全部重构为对话教学。v2 已在
Dify（14,905 文件的真实仓库）上开考。

## 红线

- 每条具体结论挂 `Sources: [路径:行]()`，推不出来直说"材料里看不到"，不许编——
  入职工具编造业务逻辑，新人会拿着错误认知去开会。
- 公司材料只留本地，进度卡别推公开仓库。

## License

MIT
