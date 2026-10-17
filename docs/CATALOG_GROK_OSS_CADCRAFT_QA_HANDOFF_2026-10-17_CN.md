# Grok Voice 3.0 / Anthropic OSS Scanner / CADCraft Catalog 批次

日期：2026-10-17。状态：`QA_PASS_ASSET_DEPLOY_REQUIRED`。本文件是三项合并的选择与审计记录；权威机会和编辑快照为 [CATALOG_GROK_OSS_CADCRAFT_2026-10-17.json](./CATALOG_GROK_OSS_CADCRAFT_2026-10-17.json)。独立 QA `01a1490f-6194-7942-b065-ec31e23818c4`（`gpt-6-luna`，medium）确认三项均可公开为 `published + monitor/noindex`；本结论不批准 index 或 sitemap。

## 实际结果与边界

- 生产只读查重：三项已有各一条 web.cafe 发现候选，原本均为 `new`，没有关联 Tool ID；工具表无同名或同 canonical 实体。本批复用原候选 ID，没有重复入池。
- 对三条原候选做了精确 `raw_payload` 前像保护的结构化 enrichment。保留原发现来源和相对热度，原有 `50/50` 未评估分改为编辑资料完整性 `80/90`；机会分单独记录，不把相对热度当月搜索量。
- 三条候选均通过通用 `candidate` preflight、事务 rollback、`internal_preparation` commit 和零写 postcheck，生成唯一 `draft` Tool ID。三条工具均通过通用 `tool` preflight 与事务 rollback；**没有执行公开 commit**。
- 目前没有公开新页面、索引或 sitemap 变更，也没有关系数据写入。未创建专属 runtime/release 脚本、专属测试、数据库表或比较 URL。
- 三张媒体是本站原创的非品牌示意 SVG，文件已在本地但**尚未部署**。独立 QA 通过后，应先提交并部署媒体，确认三条媒体生产返回 200，再按日发布上限做公开 commit。

| 工具 | 候选 ID | draft Tool ID | candidate preimage | tool preimage | 机会/索引层级 |
| --- | --- | --- | --- | --- | --- |
| Grok Voice 3.0 | `936df4c3-1e86-47c6-8ff1-e753a9b3706c` | `a5691eb1-64d8-45d0-ba4d-b991c0018bfd` | `7082703bedafb88dc3b7fbc99a14fe066ccb3c8800966a3129e730d047e66339` | `69e3d87d3104f8f23d7b4b619e99a5ccdf90e73893ed68c7a3c685ff9399a05a` | `77 / B` |
| Anthropic OSS Scanner | `fd369271-a175-41c1-9c81-8f4912361673` | `842b7f31-49b9-4d1b-996e-89a7ffa70c9a` | `a694d2e5272359efaa123fb36c26a45d78a69ce59d34ce0da564b988040157b6` | `1a3cdc83b41463533b5f1a4e17c232eafcf4ca4b9209ea46436e4cae739b617d` | `67 / B` |
| CADCraft | `0ce0d5bc-c055-4e5c-ae15-d3126b2d65b0` | `fa2452c4-aa11-4c59-b2e9-411d316bec92` | `5b305f3a3005f8892b34f59ea083619565c45c09864139c3b07cc289f09dd51d` | `2a88afd2fc72b608a9830805788afdd0249f386951f433624f4a856d18ec31a3` | `47 / C` |

`77/67/47` 是轻量机会优先级，不是事实质量分。OSS Scanner 和 CADCraft 原本不应由无人值守选择器占用本周快速队列；本次准备源自 Owner 直接点名，不改变今后的自动选品或索引规则。日常自动 Catalog 公开上限仍是 1-2 个：若 QA 全部通过，先按优先级发布 Grok Voice 3.0 与 OSS Scanner；CADCraft 留在同一交付单元的 draft，下一运营日再复核精确前像后发布。低机会分不得被解释为假冒 AI 能力，也不得由此自动批准索引。

## 独立 QA 精确差分

1. **Grok Voice 3.0**：确认唯一模型/API 身份与通用 Grok 聊天意图分离；[模型文档](https://docs.x.ai/developers/models/grok-voice-3.0)、[发布公告](https://x.ai/news/grok-voice-3)及[Voice API](https://x.ai/api/voice)在本次复核均支持实时 speech-to-speech，后两者公开列出每分钟 0.08 美元。页面只把公开价格当有日期的证据，账户结账仍为 conditional；没有独立延迟、基准或账单实测。
2. **Anthropic OSS Scanner**：确认 canonical 是 [Anthropic 服务页](https://red.anthropic.com/oss-scanner/)，不是同名第三方站。核[官方申请仓库](https://github.com/anthropics/oss-scanner)和[发布文章](https://www.anthropic.com/research/launching-opt-in-vuln-finding-service-for-open-source)：合资格关键开源项目通过 PR 申请，申请身份会人工核对，但快速扫描报告本身由模型生成且未经人工审核；与 Claude Security 分开。
3. **CADCraft**：确认 [ArtCraft 产品页](https://getartcraft.com/apps/cadcraft)与[storytold 仓库](https://github.com/storytold/cadcraft)双向链接；`cadcraft.org` 不是 canonical。定位为供外部 Agent 使用的 CAD/MCP/CLI 工具，不宣传自带生成式模型；对早期版本、DXF/DWG 文件保存损失与本站未实测做醒目披露。与已收录 ArtCraft 是父品牌/不同产品意图。
4. 只审查本批 JSON、三张自有 SVG 和生产三个 draft 的 EN/CN/TW 字段、来源与限制。保留原发现 provenance；`candidate` 回读三项 `draft`，`tool` rollback 全为零持久写。核媒体哈希和纯本地 SVG，无外链/嵌入脚本。不要机械重跑未受影响的全站测试、TypeScript 或 build。
5. 复核公开节奏与权限：QA PASS 之前不得公开；媒体部署生产 200 之前不得公开。QA PASS 后公开仍固定 `published + monitor/noindex`、sitemap 0；`continue_index` 和 sitemap 需要独立 Owner 授权，不能因本次点名收录而自动改变。

## 下一步

独立 QA 已给出批次级 PASS。总控随后仅提交本批 JSON、审计和三张媒体，等待媒体部署 200，再使用现有通用 bridge 对符合每日配额的 draft 做 exact-hash commit/postcheck；另做一次生产 SEO 回读。2026-10-17 优先公开 Grok Voice 3.0 与 Anthropic OSS Scanner；CADCraft 保持已验收 draft，下一运营日可复用本次 PASS 和当前前像直接发布，不重复资料审核。

QA 额外记录：CADCraft 产品页仍显示 `v0.5.0`，仓库最新 release 为 `v0.7.0`。本批用户文案没有声称具体版本，因此不构成发布阻塞；后续 freshness 不得仅依据产品页推断当前版本。
