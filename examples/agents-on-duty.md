# 实例：从客服 Agent 仓库到可执行的上手路径

资料：[agents-on-duty](https://github.com/Keviniscool-boy/agents-on-duty)，一个 LangGraph 客服学习项目。任务是理解整个仓库，再校正面向新读者的 README。以下是 2026-10-25 实际拆解包的节选；这次是交付型任务，没有进行互动带学。

## 总览节选

| 编号 | 结论 | 出处 |
|---|---|---|
| O-1 | MCP 订单工具对传入 ID 返回固定模拟状态；本地降级工具另有 `1001/1002` mock 表，均不接真实订单系统。 | `mcp_tools/order_server.py → order_query`；`tools/mock_data.py` |
| O-2 | Supervisor 将请求送往知识问答、工单工具或兜底；三个分支汇入合规检查，失败时进入重写。 | `agents/supervisor.py → create_supervisor_graph` |
| O-3 | 首次加载知识库需要 DashScope embedding key；RAG 路径还会调用聊天模型改写查询和重排。 | `api/main.py → lifespan`；`memory/long_term.py → load_knowledge_base`；`agents/knowledge_rag.py → process` |
| O-4 | MySQL 在启动时做自检；Redis 失效时上下文尝试 MySQL，再退进程内。内存兜底不跨重启。 | `api/main.py → lifespan`；`memory/short_term.py`；`memory/working_memory.py` |

六类扫描在这里找到了读者容易踩的三处：快速开始漏写 DashScope key，README 示例订单号与本地降级数据不符，MySQL 往返用例在服务不可达时会打印 `SKIP` 后返回。它们分别影响首次启动、演示理解和测试结论的可信度。

## README 维护者路径节选

| 档位 | 内容 | 动作或触发信号 |
|---|---|---|
| 现在要懂 | O-1、O-2：项目定位和主链路 | 对照 `create_supervisor_graph` 校正架构图 |
| 现在要懂 | O-3、O-4：启动前提和降级 | 对照 `.env.example` 与 `lifespan` 校正快速开始 |
| 遇到时查 | MCP 调用失败 | 查 `agents/ticket_handler.py`、`mcp_client/client.py` |
| 暂时可略过 | 每个前端样式和评测样本细节 | 本次 README 的第一屏与启动说明不依赖它们 |

## 资料边界

仓库源文件、配置、测试和文档已抽查；未逐行审阅所有前端样式及每份知识库文本。没有可用的真实聊天模型与 DashScope 凭据，端到端回答质量未验证。历史准确率来自仓库自建小样本记录，不作为本次实时结果。

本次应用结果见该仓库的 [README](https://github.com/Keviniscool-boy/agents-on-duty/blob/main/README.md)。完整实测过程与修正见 [评测记录](../evals/2026-10-25-agents-on-duty.md)。
