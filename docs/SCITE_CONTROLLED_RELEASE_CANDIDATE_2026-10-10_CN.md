# SCITE-FAST-CONTROLLED-RELEASE-01：本地受控发布候选

核验日：2026-10-10（Asia/Shanghai）。状态：**本地 READY_MONITOR 候选；生产未发布，productionWrites=0**。唯一拟发布实体为
Scite，固定 ID `13aa730f-4a82-4fc6-b9fa-93855aa8d921`，canonical `/ai/scite`（CN `/cn/ai/scite`，TW `/tw/ai/scite`）。目
标仅为 `published + monitor/noindex`；sitemap、Task、Capability、Fit 与 `continue_index` 均不获批准。

## 候选队列与继承边界

`mature-candidate-buffer-2026-10-06.json` 是审计历史快照，其 15 项和当日 HOLD 不改写。当前读取方应使用
`mature-candidate-current-state-2026-10-10.json` 及 `readCurrentCandidateQueue()`：Elicit、Murf、Pika 为已发布
monitor/noindex，不再进入新工具队列；ChatGPT 为快照外的独立后续发布实体。Scite 在当前层仅为本地开发候选，未伪装为生产已
发布。

继承 10-07 prerelease 对身份、核心功能、实际可用、独立市场、决策价值和可维护性的范围限定 PASS；没有重跑其历史研究。今日
重新阅读
[Scite 官网](https://scite.ai/)、[功能](https://scite.ai/features)、[定价](https://scite.ai/pricing)、[API](https://scite.ai/api)、[隐私](https://scite.ai/policy)与[条款](https://scite.ai/terms)。
身份、Smart Citations 引文语境、Search、Assistant 与 Reference Check 仍成立。官网语料数和“答案不会幻觉”等供应商说法未被
本站外推为完整覆盖或准确率保证。独立市场证据沿用 [PolyU 图书馆数据库页](https://www.lib.polyu.edu.hk/databases/scite)与
[Charles University MFF 图书馆公告](https://www.mff.cuni.cz/en/library/news/permanent-access-to-scite)，只证明相应范围的
机构采用。2023 年独立评估仅为有边界的历史准确性风险线索。

旧包的 official HOLD 涉及套餐结账、API/MCP 权益、导出/再分发、目标学科覆盖和账户数据保留。这些逐条转入
[Claim 门禁 manifest](../data/collection/scite-controlled-release-preaudit-2026-10-10.json) 的 `conditional/unknown`，均
有公开限制、官方来源与复核日；[三语公开稿](../data/collection/scite-release.json)没有精确价格、额度、覆盖率或采购承诺。
实体身份、唯一 canonical、重复意图、核心功能、素材权利/法律安全、误导性与页面完整性七项均 PASS，计算结果
`READY_MONITOR`，五条 Claim 保持 HOLD。

旧 content HOLD 通过本站原创的[中性引文示意图](../public/images/tool-media/scite-editorial-cover.svg)及三语正文解除。素
材 SHA-256 锁定于 manifest；该图不是 Scite logo、截图或实测界面。公开稿提供真实 Best for、Not ideal、限制、官方和独立来
源、核验日、逐 Claim 复核日。数据库实体页面现有的评论纠错与 “Claim or maintain this listing” Owner 入口可见；上线后须回
验实际渲染。本站没有联系厂商，没有复用未知许可媒体。

## 生产只读与本地发布路径

2026-10-10T02:21:47Z 的生产只读身份复核：`tools` 产品/上下文字段匹配 0，`product_intelligence_profiles` 匹配
0；`/ai/scite`、`scite-ai`、`sciteai` 九个三语壳均 200/self-canonical/noindex，sitemap 126 loc、Scite
0。`scite-ai`/`sciteai` 未获 alias/redirect 批准；Guide 中的 Scite 提及不是额外实体。范围是脚本所查字段、profile、这些路
由与 sitemap，不代表全站无任何文本提及。

统一发布器 `--candidate=scite --phase=validate` 已通过。生产只读 `--phase=preflight --online` 已通过：无重复实体或固定
ID 占用，预留 EN/CN/TW 路由仍 self-canonical/noindex 且 sitemap 0。随后 `--phase=release` **未带 `--commit`** 的事务插入、
三语读回、受保护旧行比较和 `ROLLBACK` 通过；返回 `transaction=ROLLBACK`，`productionWrites=0`。回滚后再次只读核查仍为实
体/profile 零匹配、sitemap Scite 零匹配。[发布 manifest](../data/collection/scite-release-manifest-2026-10-10.json)记录
四步和未执行的生产提交；本地源码提交不会发布数据库实体或部署 SVG。

发布前剩余动作：独立 QA 检查精确差分；将本站 SVG 部署至线上并验证 200/hash；总控再跑 fresh preflight 与回滚，并确认实体
/alias 无变化；只有总控明确授权时才可用统一发布器显式 `--commit`。生产提交后另跑 `verify --online`，检查三语真实正文、唯
一 ID、monitor/noindex、sitemap 0 与 Task/Capability/Fit 0。**本交付没有生产 commit、push、deploy 或 production
smoke。**

## 验证与回滚

- `test-mature-candidate-current-state`：PASS，历史快照不变，四个已发布实体不得回流新工具队列。
- `test-scite-controlled-release`：PASS，实体/Claim 负例、固定 ID、重复身份、素材 hash、三语内容与公开精确断言边界。
- `test:candidate-release`、`tsc --noEmit`：PASS。
- 完整 `pnpm run build`：PASS；因新公开实体和发布路径执行一次。
- 数据库回滚为事务 `ROLLBACK`；未来若总控提交后需要撤回，先用固定 ID、slug 与状态做只读核验，再经独立决策执行受控撤稿/回
  滚，绝不复用此开发命令直接改生产。
