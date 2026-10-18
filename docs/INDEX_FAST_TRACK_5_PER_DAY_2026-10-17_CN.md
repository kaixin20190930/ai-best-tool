# A 级工具快速索引：开发与 QA 交接

日期：2026-10-17（Asia/Shanghai）
单元：`INDEX-FAST-TRACK-5-PER-DAY-2026-10-17`
状态：`COMPLETE_QA_PASS_GROK_INDEX_APPROVED_PRODUCTION_VERIFIED`

## 结论与边界

- 当前 101 个 Tool ID 中，76 个 published；57 个 published+monitor、17 个 published+continue_index、2 个 published+archive。57 个公开 monitor 均经统一只读 selector 扫描，只有 Grok Voice 3.0 在本次 staged 证据补充后满足全部 A 级检查。没有为了每天 5 项补数。
- Grok Tool ID `a5691eb1-64d8-45d0-ba4d-b991c0018bfd`，现仍为 `published + monitor/noindex`，三语言页面 200/self-canonical/noindex；生产 sitemap 实时回读为 126 URLs，Grok 匹配 0。站点级 GSC 最新完整日 2026-10-14，健康为 warning；这不是 Grok 页面自身的搜索量证据。
- 当前生产 policy 仍是 `paused=false, daily_limit=1, weekly_limit=5`；本日和本周非 baseline release log 均为 0。Grok 证据已在独立 QA 后写入一行；本次修复没有再次写入生产，也没有改变工具索引、sitemap 或审批日志。
- Grok 的 `marketValidation.score=80` 是编辑成熟度判断，不是搜索量预测。快速资格现在单独记录 `fastTrackEligibility` 的依据、来源、类型、核查日与非重复说明，绝不由质量分或 Owner 意愿推导。本次走 **established xAI/Grok Voice 品牌 + 明确 API/价格/对比意图 + 两类独立信号**，不是“已验证搜索量”。[Artificial Analysis 语音代理榜单](https://artificialanalysis.ai/speech-to-speech/arena)在核查时列出 Grok Voice 3.0 的 637 个 Arena samples，这是唯一计入的独立 benchmark。[eesel 部署评测](https://www.eesel.ai/blog/grok-voice-3-review)与另一无隶属关系的出版者 [SiliconANGLE 报道](https://siliconangle.com/2026/10/14/grok-voice-3-0-from-spacexsi-outscores-openai-and-google-on-speech-to-speech-index/)是跨域编辑/买方关注，不是第二、第三次实测；两者的 benchmark 数字均源自 Artificial Analysis。本站未实测性能、账单或账户权益。官方来源为 [xAI 模型文档](https://docs.x.ai/developers/models/grok-voice-3.0)、[发布公告](https://x.ai/news/grok-voice-3)、[Voice API 页](https://x.ai/api/voice)。

## 通用变更

1. `deriveIndexReviewEvidence` 同时读取历史 `audience.*` 与 OPS2 顶层 `bestFit/notIdealFor`；独立来源按不同 URL 去重，不把市场信号文字或官方 URL 冒充独立来源。
2. OPS2 candidate→draft 保留多官方来源、公开 Claim 边界、audience 和重复意图审查；不写入原始 `claimGate` 的账户级私有引用，已有 draft 的 independent evidence 不被重导入覆盖。
3. 现有工具证据走通用 manifest/executor，限定 `evidence/audience/indexIdentity/marketValidation`，支持 preflight、rollback、QA 后 commit、postcheck。`evidence.official/independent` 按规范化 URL 去重深合并，保留既有条目而非用 manifest 数组覆盖；已有条目和新条目的幂等测试通过。Grok manifest 只是数据，不是工具专属脚本。
4. 统一索引批次只从 published+monitor 选择，按现有判定器复查质量、真实媒体、市场、至少 2 官方和 2 独立来源、决策内容与日期、canonical/意图、生产三语言 SEO、GSC、健康、policy 和额度。`mature_high_demand` 仅由严格验证的显式快速资格授予；其他候选是 `standard`，只有真实 `observationComplete=true` 才满足观察期。不能用分数、Owner 意愿或默认值伪造。满足条件最多 5；无合格返回 0。共享数据库 trigger 仍负责原子额度和审批日志；新迁移把日/周上限变为 5/25。
5. 重复意图不接受空 `checkedToolIds` + 说明文字直接 PASS。manifest 记录 `checkedAt/checkedScope/productionMatchCount`；执行时重查 Neon 全状态工具的名称/标题/URL、非本工具候选，以及 Supabase 同 Task 的 published Fits，三组均为零且范围/计数与 manifest 一致才通过。跨库任一查询失败即 HOLD。本次 Grok 实际三组命中 `0/0/0`，并非手填数组的证明。

## 精确前像与演练

- Grok 证据 manifest SHA-256：`f04a8e98b8d41fb756cbd472e7c4ecad082e1b1b1248af565788ca74301154d1`。
- Grok 证据前像：`updated_at=2026-10-17 08:58:37.021309+00`，`features_md5=cd2c8d39df7411d7bd2e0d940d83e930`。
- 证据提交前工具索引前像 SHA-256：`65a96687b7b24020e1f8291d819a22382560fcee89acea98b0a306d2a893e9da`。
- 以 staged 证据及 2026-10-14 GSC 快照得到的历史批次 hash：`ace1388e93b71a01be86ad0da1d83b90b098d225fc69f77e4868264e1c1ed8ec`，**已过期，不得复用**。证据落库后的生产只读 selector 得到新工具前像 `407f017d56b73c22c75c8efab8e11e6f5a2ae91f3a28e9c876c7867f427da2f4` 和批次 hash `6ad4306172ec644c8bec6df749ae859b8cd162a629648665ae6205206206a106`。后续任何索引操作仍须重新校验当时前像。
- 本次最小返工后：证据与统一索引事务 rollback 再次通过，均 `productionWrites=0`；Grok 全部生产近似意图查询 `tool=0, candidate=0, published Fit=0`。回读 policy 仍 1/5、Grok monitor、原 features MD5、审批日志 0。
- 本次只运行 `scripts/test-index-fast-track-evidence.ts`（深合并、无显式资格、缺出版者、无观察期、空数组伪 PASS 等负向）及必要 rollback；此前通过的 `test:tool-index-review`、`test:ops2-enqueue`、`test:index-release-guard`、TypeScript 与一次完整 build 未因本次非运行时差分机械重跑。无部署，不跑生产 smoke。

## 证据提交后的 postcheck 假漂移修复

- 独立 QA 后，Grok evidence commit 已成功写入 1 行，但原 postcheck 以 `SHA256(JSON.stringify(merge(current, patch)))` 对比 `SHA256(JSON.stringify(current))`，错误报告后像缺失。只读生产结构比对结果：原始哈希不同，规范化结构哈希相同，差异路径为空，官方/独立来源各 3 条；`jsonb` 回读键顺序是唯一差异。生产当前 `features_md5=f97bafcfa3cba96589a36be281412a0a`、`updated_at=2026-10-17 09:55:35.066929+00`。证据本身正确，不回滚。
- Executor 只把“已应用”判断换成对象结构深等；manifest SHA、字段白名单、精确前像和写入条件不变。新增键顺序变化仍 PASS、事实值或来源数组变化必须 FAIL 的回归测试。修复后生产只读 `postcheck` 与 `preflight` 均返回 `alreadyApplied=true, productionWrites=0`，未实际重复 commit；定点测试通过，未重跑 build。
- 当前 Grok 仍是 `published + monitor/noindex`；政策仍 `paused=false, daily_limit=1, weekly_limit=5`，当天/当周非 baseline 索引审批日志均为 0。索引/sitemap 尚未执行。

## 下批候选

全量只读扫描 57 个公开 monitor，staged 后仅 Grok 通过。Glean、Fireflies、Descript、HeyGen、Lovable 各自当前主要缺独立可回溯的重复意图判定，可作为后续一批优先核查对象；**它们现在不是 A 级批准项**。其余工具还缺官方/独立来源、市场验证、内容或日期等，不得只补一个形式字段就批准。

## QA 后唯一执行顺序

1. 独立 QA 核对 diff、官方/第三方来源真实性、市场信号非重复、公开字段无账户私密引用、生产前像和负向门禁。
2. 若 QA PASS，先以 manifest 的精确前像提交 Grok 证据并 postcheck；随后重新运行生产只读全量 selector/SEO/GSC，生成新 batch hash。
3. 对新 hash 执行一次统一批次 rollback。仍为 A 级且额度可用时，单次事务提交 5/25 迁移、索引状态与审批审计，并 postcheck；失败则保持 monitor。
4. 部署后一次 production SEO smoke，核对 EN/CN/TW `index,follow`、self-canonical、sitemap 仅增加预期 URL、审批账本及远端 SHA。Google 实际编入索引由后续 GSC/Coverage 观察，不能宣称当天保证收录。

上述顺序已在同一交付单元内完成；受保护的两份 SQL 和一份未跟踪 freshness JSON 保持原样。

## 生产收口

- 批次级独立 QA `01a14932-f2f6-7921-a4b5-5705383d4d77` 对最终 hash `6ad4306172ec644c8bec6df749ae859b8cd162a629648665ae6205206206a106` 返回 `QA_PASS`；机器凭证见 `INDEX_FAST_TRACK_BATCH_QA_2026-10-17.json`。
- 单一事务写入 Grok 索引批准 1 次，并把共享 policy 从每日/每周 `1/5` 迁移为 `5/25`。幂等 postcheck 为零写；审批账本显示 2026-10-17 已用 `1/5`、本周 `1/25`。
- 生产英文与简中页面返回 200、自指 canonical，已无 robots noindex；繁中按现有语言索引政策继续 `noindex, follow`。sitemap 从 126 增至 128，且只新增 Grok 的 EN/CN URL。全站 production SEO smoke 通过。
- GSC sitemap 自动提交没有伪报成功：生产 monitor API 因本地缺少匹配的 `MONITOR_API_TOKEN` 返回 401；直接使用当前本地 OAuth 刷新令牌返回 400。页面与 sitemap 已公开可抓取，但 GSC 主动重提暂为凭据阻塞，需修复 token 后重试。普通页面不使用 Google Indexing API。
- 全量 57 个 `published + monitor` 工具本日只有 Grok 通过 A 级；额度上限不是发布 KPI，其余 56 个保持原状态。

## 2026-10-18 后续规则说明

以上 Grok 的三条独立信号及当日 QA/生产结果是历史记录，不是所有成熟品牌的最低模板。此后 `brand_decision_signals` 按 [现行索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)接受成熟 SaaS/消费产品的其他真实决策意图和独立市场信号；最低为两种受控决策意图、两个不同非官方域名的非重复信号，不强制 API+价格、benchmark、两家媒体和三域名。通用 A 级硬门槛与 `measured_search_demand` 不变。本规则修订本身没有重判历史候选、写入生产或执行索引提交。
