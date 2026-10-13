# BUILD-APP-DECISION-UNIT-01：四工具比较证据 HOLD

日期：2026-10-13（Asia/Shanghai）  
范围：Bolt、Lovable、Replit、v0 by Vercel 的 `build-app-with-ai` Structured Comparison  
开发结论：`HOLD_PUBLIC_COMPARISON`；本次仅做只读核对，未修改公开页面、关系、索引或生产数据。本结论不是四个工具的收录
HOLD：四项工具页面均已公开为 monitor/noindex。

## 已核对基线

| 工具    | 当前可追溯材料                                                                                                                                                     | 可用于比较的已知边界                                                                                                                    | 本轮缺口                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bolt    | [`bolt-release.json`](../data/collection/bolt-release.json)，2026-10-12；[当日发布审计](./DAILY_OPERATIONS_2026-10-12_CN.md)                                       | 官方文档支持 JS Web 应用、Bolt Cloud 数据库/托管、项目下载和 GitHub；源码交接不代表数据、密钥、域名和托管资源自动迁移。本站未实测账户。 | 对外部集成及离开 Bolt Cloud 后的数据/部署迁移，只能标记需实测，不能填“已支持”或成本/工时。                                                                                       |
| Lovable | [`lovable-release.json`](../data/collection/lovable-release.json)，2026-09-14；[发布审计](./DELAYED_LOVABLE_MIDJOURNEY_RELEASE_2026-09-14_CN.md)                   | 记录 Git、Cloud、Supabase、共享 credits、安全/RLS 与维护责任；代码归属不等于托管数据等资源完成迁移。                                    | 2026-10-14 到期前需仅复核会进入比较表的可变 Claim；不得沿用旧精确套餐数字作为当下报价。                                                                                          |
| Replit  | [`replit-release.json`](../data/collection/replit-release.json)，2026-09-09；[2026-10-09 freshness](./REPLIT_FRESHNESS_2026-10-09_CN.md)                           | 一体化 Agent、源码、托管数据库和部署；最新复核已撤回旧精确价格/credits，强调 Agent 与云资源独立用量。                                   | 具体源码、数据、密钥、域名和部署配置的导出/迁移范围尚无同一份当前、逐项来源快照；不能推成“一键完整迁移”。                                                                        |
| v0      | [历史候选记录](./OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md)仍为当时 `HOLD_EVIDENCE`；最新逐项编辑评估只在 git 忽略的 `.local/ops2-v0-evaluation-2026-10-12.json` | 该本地评估列出 v0.app、官方文档/价格/政策及 GitHub、Vercel 部署的候选 Claim，但不能代替版本化的来源核验记录。                           | 缺已入库、注明核验日、逐项限定 Git/source handoff、托管、后端/数据、集成、费用与维护边界的当前证据快照。不得把旧候选 HOLD 当作当前生产状态，也不得把忽略的本地评估当作发布审计。 |

本次仅通过现有公开只读 HTTP 入口确认 `/ai/bolt`、`/ai/lovable`、`/ai/replit`、`/ai/v0` 和
`/guides/ai-coding-tools-comparison` 均返回 200。工具的 `published + monitor/noindex` 状态采
用[当日日报](./DAILY_OPERATIONS_2026-10-13_CN.md)与发布记录；HTTP 200 本身不证明 Claim、关系或索引资格。

## 为什么不直接替换现有比较页

1. [`ai-coding-tools-comparison/page.tsx`](<../app/[locale]/(with-footer)/guides/ai-coding-tools-comparison/page.tsx>)当
   前是 noindex unavailable 占位，标题和 metadata 均承诺“AI 编程工具”比
   较；[`ai-coding-tools/page.tsx`](<../app/[locale]/(with-footer)/guides/ai-coding-tools/page.tsx>)从代码补全、调试、重
   构的任务入口链接该 URL。直接把内容改成四个 prompt-to-app 构建器，会产生入口与比较意图不一致。不得为赶本周计数创建同义
   新 URL。
2. 四工具之间的“源码交接”“托管”“数据库/后端”“第三方集成”“维护成本”不是同一维度的布尔能力。现有材料可以提出试用清单，却不
   能支持每个格子的当前、可复核断言，尤其是 v0 的版本化来源和 Replit 的迁移范围。
3. `build-app-with-ai` 的旧 n8n/OpenRouter Fit 已撤回；四个当前工具的公开页面不等于 Task/Capability/Fit 已发布。本比较不
   能借静态文案暗示存在已审核关系或经本站实测的排名。
4. 既有 [`VerifiedComparison`](../lib/content/verifiedComparison.ts) 结构要求每个候选的适合/不适合、限制和每行证据引用完
   整。用“未知”明确限制可以成立，但不能把一整行关键采购问题都填成推断，再称为 verified comparison。

## 最小解除路径

1. 先做一份版本化、逐 Claim 的四工具比较证据表，仅覆盖源码/Git 交接、托管、数据/后端、集成、费用/维护六类。每格记录官方
   URL、核验日、适用套餐/账户边界、`verified_public`/`conditional`/`unknown` 和下一复查日；优先补 v0 的当前来源与 Replit
   的可迁移范围。不能查证的格子保持 unknown，不以缺证据推断“不支持”。
2. 对 Lovable 仅复核即将到期且会被比较页引用的变化字段；Bolt 的已核事实在有效期内不重复审查。比较不展示未核实的精确价
   格、额度、迁移时长或 hands-on 结果。
3. 先解决单一现有 URL 的用户意图：若沿用 `/guides/ai-coding-tools-comparison`，同步把其入口、title/description 和内容明
   确区分“编码助手”与“应用构建器”，不得让现有补全/重构入口误导用户。若产品决定二者应分成独立意图，须由总控按 SEO 信息架
   构门禁另案决定 URL；本开发单元不新增页面。
4. 完成上述来源及意图门禁后，才在现有比较页做一个最小四候选表：Best for、Not ideal、限制和上述六类决策维度逐项引用；保持
   noindex、self-canonical 与 sitemap 排除。Task/Capability/Fit、索引和 sitemap 仍各走独立门禁。

## 本轮验证与交接

- R 级：核对了任务锁、运营基线、现有路由/入口、四工具版本化材料、本地忽略评估的存在性，以及五个生产公开 URL 的只读 200
  响应。
- 没有运行 TypeScript、完整 build 或生产 smoke，因为没有运行时代码变更；没有生产写入。
- 独立 QA 重点：复核两个 HOLD 条件是否真实存在（v0 最新证据未版本化、现有路由意图冲突），确认文档没有把旧候选状态当作当
  前生产状态，也没有把公开 200 当作关系或 Claim 验证。
