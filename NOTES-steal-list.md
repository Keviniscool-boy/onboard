# 偷什么清单 —— deepwiki-open 研读笔记

> 研读对象：[AsyncFuncAI/deepwiki-open](https://github.com/AsyncFuncAI/deepwiki-open)（本地克隆于 workspace/default/deepwiki-open）
> 日期：2026-10-24。结论已对照源码核实，标注了文件和行号。

## 它的管线其实只有三段

1. **取料**：克隆仓库（`--depth 1 --single-branch`，`api/repository.py:202`）→ 遍历文件树（带排除规则）+ 抓 README（`api/services/wiki/structure.py:20`）。
2. **定结构**：**只喂文件树 + README** 给 LLM，不读任何代码内容 → 输出 XML：4-6 页（简洁）或 8-12 页（全面），每页带 title / description / **importance（high/medium/low）** / relevant_files / related_pages（`api/services/wiki/prompts.py:213`）。
3. **逐页生成**：每页拿自己的 relevant_files 做上下文，带强 grounding 约束生成页面（`build_page_prompt`）。

对我们的启发：**贵的不是"理解仓库"，是"决定读什么"**。deepwiki 用最便宜的输入（树+README）做结构决策，把贵_tokens 的阅读留给每页的定点爆破。我们的五步流程同构：盘点（脚本，零 LLM）→ 定向（薄读）→ 深读（厚读，按需）。

## 值得偷的 7 件东西

1. **结构决策用便宜输入**。定学习包目录时只看资料地图 + README 级别的薄材料，别在没定结构前就扎进代码。
2. **重要性分级**。每页 high/medium/low → 直接映射我们的阅读路径：high=第 1 天，medium=第 1 周，low=第 1 月/按需。
3. **出处格式强制**（`build_page_prompt:38-49, 108-118`）：
   - 每页**开头**必须是 `<details>` 块列出全部来源文件（≥5 个，不够就去找，"format reproducing it verbatim"）；
   - 每条重要结论后挂 `Sources: [完整路径:起-止行]()`，多来源逗号并列，路径必须全路径不许裸文件名。
   我们的"每条结论带 file:line"直接抄这套格式。
4. **反编造三连**（`build_page_prompt:120` + `prompts.py:208-214` grounding_rules）：
   - "信息必须 SOLELY 来自给定文件，不许用外部知识补"；
   - "材料不够就少写几节，不要编"（produce fewer sections rather than fabricating）；
   - "缺失就明说缺失"（explicitly state its absence）。
5. **两段式生成**（`CODEMAP_SKELETON_PROMPT` → `CODEMAP_ENRICH_PROMPT`）：先出骨架（结构+引用，散文留空），第二段只填散文和图、"其他字段一字不动"。防跑偏、可中断、骨架错了早死早超生。我们的流程卡（时序图+文件清单）用同样的两段式。
6. **mermaid 严格语法规则**（`build_page_prompt:61-95`）：他们被渲染失败的 mermaid 毒打过——箭头 8 种写法、只用 graph TD、参与者先声明、`box` 分组、`loop/alt/opt/par` 结构块、标签必须用冒号不用 `|--|`。整段抄进我们的附录当"画图守则"。
7. **结构化输出必须有 fallback**（`structure.py:179-250`）：截断就 Salvage、严格解析失败就正则回退、裸 `&` 转义。agent 场景的对应物：要求模型输出固定格式时，解析失败不要死磕，降级为自由文本照样走流程。

## 明确不偷的

- **RAG/embedding 检索**（`api/rag/`）：为无状态 Web 服务设计的；在 agent 里模型自己会 grep/read，向量库是负资产。
- **Web UI / 多语言界面 / Docker**：v1 全砍。
- **"帮你读"的定位本身**：它生成完就完了，没有阅读路径、没有自测、没有验收、没有给 agent 的项目地图。这四样是我们的差异化——**偷结构，不偷定位**。

## 我们的定位差异（防克隆提醒）

deepwiki 输出 = 参考仓库；我们输出 = 学习包（阅读路径 + 自测题 + 考核模式 + agent 项目地图）。
一句话检验：deepwiki 的产物是"没人看完的 wiki"，我们的产物是"能验收的学习包"。
