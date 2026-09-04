# 维护审计记录（2026-09-04）

归属：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)。本文件是审计快照，不替代主计划或索引政策。

## 本轮结论

- 生产只读查询：37 个 published 工具，28 个 continue_index、9 个 monitor。continue_index 不代表必然进入 sitemap，还受内容质量门槛约束。
- 生产 SEO smoke：全部断言通过，sitemap 共 162 个 URL；核心页面、canonical/hreflang、面包屑、comparison noindex、域名重定向和 robots 指令均符合当前规则。
- `/api/healthz`、`/api/health`、`/ads.txt` 均返回 200，预期健康字段和广告发布商记录存在。
- 本轮没有发布工具、修改生产数据库、切换索引状态或改写产品事实。数据库字段为空只能证明相应存储字段缺失，不能直接推断整个页面没有证据。

## P0：执行偏差必须先收口

2026-09-04，OpenRouter 和 n8n 同日从未获索引批准的 fallback 迁移为 published / continue_index，增加四个语言 URL。它们保留原 canonical，避免了重复 URL，但仍属于两次新增索引放行。

这违反既定“公开收录每日 1–2 个、索引放行每日最多 1 个且每周最多 5 个”的内部策略。此前将“没有重复 canonical”误当作不受索引额度限制，并混淆了公开与索引的上限，是执行错误，不是已经批准的策略调整。

- 立即措施：暂停进一步新增索引批准；不追补 Consensus 或 Gamma 的历史时段，不把额度累积到次日。后续维护已应用统一数据库保护，保持 paused=true；详见本页追加验收记录。
- 不自动反复切换已上线页的 index/noindex，不把偏差记录伪装成事后批准。
- 已实施：生产工具表触发器统一记录批准日志并核对日/周额度，覆盖 migration、后台和批量脚本；隔离测试验证并发和事务回滚。历史预审测试不再被当作跨条目额度保护。
- 恢复条件：核对本周真实批准记录、明确已用额度并通过统一校验后再恢复；不能仅凭创建日期推断全部索引批准时间。
- 这些数量是本站观察策略，不是 Google 公布的每日页面配额。

## 按优先级维护

| ID | 优先级 | 任务 | 现场依据 | 当前状态 | 负责人/所需输入 |
| --- | --- | --- | --- | --- | --- |
| MAINT-01 | P0 | 公开收录与索引批准额度分离 | 本周可证实放行至少 12 次，当前额度 0 | 技术保护、本周可证实记录补账及额度判断完成；保持暂停，旧历史未知部分明确保留 | Codex；下周恢复前重新复核 |
| MAINT-02 | P0 | 生产健康、广告和 SEO 边界复查 | 本轮 SEO、health、ads.txt 检查通过 | 本轮审计完成；持续维护 | Codex |
| MAINT-03 | P1 | Consensus、Gamma 到期复核 | next_review_date 分别为 9 月 3 日、9 月 4 日；两者仍为 monitor | 进行中：Consensus 套餐局部核对、Gamma 导出限制卡更新完成；整页复核/排期待完成 | Codex |
| MAINT-04 | P1 | 历史工具维护字段补齐 | 23 个 published 工具没有 next_review_date；22 个没有数据库 editorial.reviewedAt；23 个没有数据库 marketValidation.verdict | 待分批核验，不批量伪造日期或验证结论 | Codex；官方与独立证据 |
| MAINT-05 | P1 | Emdash 复查排期 | 已有 9 月 1 日核验记录和 validated，但 next_review_date 为空 | 待核对现有复查计算逻辑并补齐显式排期 | Codex |
| MAINT-06 | P1 | Change Timeline 首批真实基线 | 主台账仍为 Fathom、Claude、Consensus，3/10 | Gamma 下一项；robots 受限来源不绕过 | Codex；必要时人工来源材料 |
| MAINT-07 | P1 | GSC / Coverage 周度复盘 | 现有主台账性能基线为 8 月 31 日导出；技术通过不代表 Google 已收录 | 等下一次同期数据后评估，不为等待数据扩页 | 用户提供 7 天、28 天及 Coverage |
| MAINT-08 | P2 | Stack/Trial 实际使用验收 | 技术阶段已完成，真实使用门槛仍需验证 | 保持维护，不新增功能 | 用户真实工具栈/试用反馈，Codex复盘 |
| MAINT-09 | P1 | SEO smoke 退出与超时保护 | 原脚本所有断言通过后未自行结束，重定向请求无超时且响应体未释放 | 已修复；重跑所有生产断言通过并以 0 退出 | Codex |

## 排期事实

### 后续执行：历史补账与局部内容维护

- `9fa46afc` 已获得 Vercel success / Deployment has completed。
- 补账脚本默认回滚预演及正式应用成功，9 月 1 日十条 + 9 月 4 日两条 = 至少 12 条。重复插入断言通过，所有工具行哈希不变，paused=true。
- 未知旧历史不猜测日期，历史退回 monitor 不退还额度；本周不再批准新增索引。详细依据见 [本周核对](./INDEX_HISTORY_RECONCILIATION_2026-09-04_CN.md)。
- Gamma 双语 priority evidence 卡更新具体导出限制；专项测试及完整 build 退出 0。未修改数据库整页核验日期或下次复核日，不将局部核查标为整页完成。

### 追加验收：统一索引保护

- 已应用 `db/neon/20260904_tool_index_release_guard.sql`；不是仅新增本地迁移文件。
- 生产事务预演回滚及正式应用均成功；前后全部工具行哈希一致。28 条未知日期基线、2 条已证实 9 月 4 日历史批准保留，不重写工具状态。
- `test:index-release-guard` 在随机隔离 schema 中通过暂停、日/周额度、批量回滚、草稿发布、冲突忽略与两种隔离级别并发测试，退出 0。
- `pnpm run build` 完整退出 0，AdSense 校验通过；专项 ESLint 通过。Browserslist 过期提示仍是非阻断维护项。
- 本次是前述只读审计后的独立维护实施，新增两张内部表、函数及触发器，并将新行默认质量状态固定为 monitor；没有新增工具页、修改现有工具或解除暂停。
- 操作及恢复边界见 [索引批准保护运行说明](./INDEX_RELEASE_GUARD_RUNBOOK_CN.md)。未完成历史核对，不能宣称 MAINT-01 整体完成。

以下是已有数据库复核日期，不是自动索引日期，日期按 Asia/Shanghai 解读：

| 日期 | 工具 | 说明 |
| --- | --- | --- |
| 9 月 3–4 日 | Consensus、Gamma | 到期，先复核；保持 monitor，受 MAINT-01 限制 |
| 9 月 5–6 日 | Runway、Luma AI | 按期核验，不保证索引放行 |
| 9 月 7–11 日 | Pipedream、Cursor、The Graph、Perplexity、Make | 按既有队列复核，不能绕过剩余额度 |
| 9 月 18 日 | OpenRouter、n8n | 官方事实及限制复核 |
| 10 月 1 日 | Claude、DeepL、Fathom | 已存在显式复核日期；出现价格/政策变化时提前处理 |

缺少 next_review_date 的 23 个工具：adobe、aigirl-best、anime-girl-studio、artiversehub-ai、character_ai、chatgpt-mac、emdash、fastimage-ai-sketch-to-image、gemini、gpt_4o、honeydo、notion、openai、poe、salesforce_einstein、shop_your_ai_powered_Shopping_assistant、shutterstock、sora、suno_aI、tattooai-design、undressing_ai、viggle、woy-ai。

## 数据与状态边界

- 未访问管理后台的登录态业务页面，不将匿名 SEO smoke 视为全部后台功能验收。
- 未在本轮读取真实评论、付款或试用业务记录，不对这些业务闭环的实际使用情况作完成声明。
- 工作流配置存在不等于定时任务运行成功；后续需检查 GitHub Actions 执行历史和必要密钥配置。
- 本轮仅修改维护脚本与文档：为 `scripts/production-seo-smoke.ts` 的重定向检查增加 20 秒超时和响应体取消释放。修复后真实生产 smoke 全部断言通过并正常退出 0；原挂起进程在断言通过后人工终止，不能算退出码成功。
- `pnpm run build` 已完整执行并退出 0；没有修改网站页面逻辑，也没有以“维护完成”代替未完成任务。
