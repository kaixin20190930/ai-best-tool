# Gemini Notebook Stage 2 Supabase 数据层交付

状态：**生产 Supabase 已提交 Stage 2 candidate/draft；本次 source URL amendment 尚未在生产执行。** 原提交的完整 `stateMd5` / 回滚凭据为 `769d65d12796a59bc33dd66117ebbc74`。2026-10-01T06:46:37Z 的零状态只读基线是历史记录，不是当前生产状态。`research-with-citations` Task 与两条 Capability 保持原 ID 和 active；Task Page/index 仍有独立门禁。Neon Stage 1 身份迁移不在此 amendment 范围内。

## 当前唯一 Owner 步骤：source URL amendment

原 source 102 的 `16164461?hl=en` 候选链接进入 Google 验证页；[无参数官方页](https://support.google.com/gemininotebook/answer/16164461)为同一文章编号和标题，可读且支持 claim 402、410。使用专用 [amendment SQL](../db/supabase/manual/20261001_gemini_notebook_stage2_source_url_amendment.sql)，先在 Supabase SQL Editor 原样运行默认 `ROLLBACK`，要求仅一行 `mode=preflight`、`changed_sources=1`、`changed_claims=2` 和新 `post_md5`。此调用不会留下写入。Owner 核对该行后，在新会话只把最后一行的模式改成 `COMMIT` 并运行一次；要求 `mode=committed`、`1/2` 和新 `post_md5`。立即运行只读 `--candidate`，要求其 `stateMd5` 等于**提交返回的**新 `post_md5`。将新回执保存在私有审计位置；后续 review SQL 的 prior hash 与 Stage 2 rollback 的精确回滚凭据都应使用这个新提交哈希。旧 `769d65d12796a59bc33dd66117ebbc74` 只作为 amendment 的前像门禁。重复执行 amendment 会因旧前像不再匹配而安全拒绝。

下面的原始 candidate 操作顺序保留为历史/新环境说明。**当前生产已存在 candidate，不得重跑原 candidate SQL，不得回滚整批来修 URL。** 此 URL 修正不填写 reviewer、不提升状态、不创建 link，也不开放 Task Page。

## 审计与状态契约

- [证据 schema](../db/supabase/migrations/20260727_product_intelligence_evidence.sql) 对 tool owner 证据启用 RLS；浏览器仅能访问本人 distribution project 的证据。Decision profile、Tool Capability、Fit 和 link 表亦启用 RLS；原始 link 没有浏览器 SELECT policy。Owner 使用 Supabase SQL Editor 的受控数据库角色；[只读 verifier](../scripts/verify-gemini-notebook-stage2-readonly.ts) 用 service role 的 GET，并由 `pub-03-readonly-run.mjs` 限制数据库 read only 与 HTTP GET/HEAD。
- [Decision link trigger](../db/supabase/migrations/20260922_decision_capability_foundation.sql) 与 Capability link trigger 要求 claim 已 `verified`、有效、无冲突且属于目标 tool。候选 claim 不能合法挂 link。因此候选事务先保留 `profile_status=pending`、`fetch_status=pending`、claim `candidate`、Decision/Tool Capability/Fit `draft`，所有 link 为 0；没有人工审核时此即最低安全状态。
- `decision_official_evidence_intake` 的域名限制要求 URL 属于 `notebook.google.com`，而必要官方来源还包括 `blog.google` 与 `support.google.com`。本包用固定 URL 的 Owner SQL 事务，人工审核门禁仍逐条校验 reviewer、来源、引文、期限、owner 和 link trigger。没有扩大 intake 函数的全局信任范围。
- Task `527fe8b7-c171-4c50-ab1f-9404d7536e7c`、Capability `50288b6e-a968-4bcf-9e55-911df203e0c7` 与 `04930ae8-4c78-487f-a6c9-25680b8da681` 仅复用，不更新 Task Capability，不触及其他工具。

## 交付内容

| 文件 | 作用 | 默认行为 |
| --- | --- | --- |
| [candidate.sql](../db/supabase/manual/20261001_gemini_notebook_stage2_candidate.sql) | 固定 owner 下 1 profile、7 Google 官方 URL、10 candidate claim、1 draft Decision、2 draft Tool Capability、1 draft Fit；旧状态、行数、RLS、重复 ID、字段 postimage 闸门 | 最后一行调用模式为 `ROLLBACK`；返回一行结果，候选写入在内部撤销 |
| [source URL amendment](../db/supabase/manual/20261001_gemini_notebook_stage2_source_url_amendment.sql) | 对已经提交的旧哈希 candidate，只将 source 102 的 `url/canonical_url` 和 claim 402/410 的 `source_url` 改为同一官方文章无参数 URL | `ROLLBACK` 预检 1+2 行且不留写入；`COMMIT` 返回新 `post_md5` |
| [review_links.sql](../db/supabase/manual/20261001_gemini_notebook_stage2_review_links.sql) | **后续独立人工审核后**，10 claim 逐条核原文并填写真实摘录；验证 reviewer UUID、精确邮箱、应用管理员依据、Owner 明确批准与 QA 引用；再次验证九表 RLS 后转 verified/ready/reviewed，新增同 owner 5+9+6 link（包括导出限制的 claim 406） | reviewer 与摘录为无效占位，且 `ROLLBACK` |
| [rollback.sql](../db/supabase/manual/20261001_gemini_notebook_stage2_rollback.sql) | 用原始提交回执 `POST_MD5` 对完整行 postimage 精确核验后删除本批；检查外部关系与跨 owner link，恢复 Stage 2 前零状态 | 缺 post hash，且 `ROLLBACK` |
| [verifier.ts](../scripts/verify-gemini-notebook-stage2-readonly.ts) | `--baseline`、`--candidate`、`--reviewed` 三状态只读回验；核对唯一 owner/source/claim/relation、来源和 claim 一致、期限、审核状态、跨工具 link、Task Page/index/sitemap，并输出与三份 SQL 同构的 `stateMd5` | 只读 |

固定 ID 与 `stage2Batch=gemini-notebook-20261001` 只属于此工具。前向重复执行只接受**完全一致**的候选 postimage；已有不同 ID、状态、字段或未知行会 HOLD。原始 `POST_MD5` 包含九组行的完整 JSON（包括时间戳和 link），须与私有审计回执一起保存。**不要把回执或官方摘录中的私有审核信息提交仓库。** 不创建无 RLS 的备份表。

## Owner 操作顺序

1. **第一步只预检：**先运行只读 `--baseline`；在 Supabase SQL Editor **原样执行同一份** `20261001_gemini_notebook_stage2_candidate.sql`。最后一行是 `SELECT * FROM pg_temp.gemini_notebook_stage2_candidate('ROLLBACK');`，会返回一行 `mode=preflight`、`preflight=true`、`profiles/sources/claims/decision/capabilities/fit/links=1/7/10/1/2/1/0` 和 `post_md5`；候选表写入在该调用的内部子事务撤销。**只看返回行，不依赖 NOTICE。** 保存结果、执行时刻、票据至私有审计位置。任何不同即 HOLD。此步生产数据写入为 0。预检的哈希对应本次临时 postimage，**不可作为将来回滚凭据**。
2. Owner 确认唯一实体及官方事实后，在新会话将**同一文件最后一行中的模式字符串**从 `'ROLLBACK'` 改成 `'COMMIT'`，其他内容不改；执行一次，返回 `mode=committed`、`preflight=false` 与相同的行数。保存**这次提交返回行**的原始 `post_md5`，并回传总控；它才是 rollback SQL 的 `POST_MD5` 凭据。立即运行 `--candidate`，要求 `stateMd5` 与提交的 `post_md5` 完全相等。候选事务不构成独立人工审核；不要以此批准关系或页面。
3. 只有真实独立编辑逐条打开七个官方 URL、核对十条 claim 与各自 scope/摘录、记录账号/地区/套餐/Workspace 条件后，才填写 review SQL 的 reviewer UUID、**auth.users 中同一人的精确小写邮箱**、QA reference、十条原文摘录及**步骤 2 原始 candidate `POST_MD5`**。管理员依据须与[应用契约](../lib/auth/admin.ts)一致：`USER_METADATA_ROLE` 对应 `auth.users.raw_user_meta_data.role=admin/moderator`；`ADMIN_EMAILS` 对应 Owner 已在**生产运行时** `ADMIN_EMAILS` 名单中核实的同一邮箱（数据库无法读取该环境变量）。Owner 还须把 `owner_approval` 填为 SQL 注释规定的、绑定 UUID/邮箱/依据的精确字符串。审核事务会再次检查九表 RLS；先保留 `ROLLBACK` 预检，审阅 **5/9/6** 同 owner link 后另开新会话改为 `COMMIT`；保存该次 reviewed `POST_MD5`，运行 `--reviewed`。若需要无操作重跑，以原始 reviewed `POST_MD5` 作 prior 门禁；绝不可用漂移后新算的哈希替代原回执。无法核实名单、身份或独立审核时保持 candidate/draft。
4. 后续关系出版、Task Page 审批与 sitemap/index 属独立门禁。本包最多到 `reviewed`；`research-with-citations` Task Page 继续 404，工具保持 noindex/sitemap 排除。站内引文准确性没有受控实测；即使官方 claim 核验通过也不能把引文路径当作结论准确性的证明。
5. 如需回滚 Stage 2，在回滚 SQL 填入**要撤销的那次原始提交** `POST_MD5`，保留 `ROLLBACK` 预检并检查零状态恢复通知，另开会话仅改末尾 `COMMIT`。发生任何数据漂移、跨工具依赖或其他关系时 HOLD，先制定独立处理方案。Neon Stage 1 不在此回滚事务内，两库没有原子提交。

只读命令（在隔离 worktree 中复用主工作区的 `.env.local` 路径；wrapper 只装载必要连接变量并强制 Neon read only、Supabase GET/HEAD；不在命令行粘贴或输出密钥）：

```sh
PUB03_ENV_FILE=/Users/liukai/web/ai-best-tool/.env.local node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-stage2-readonly.ts --baseline
PUB03_ENV_FILE=/Users/liukai/web/ai-best-tool/.env.local node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-stage2-readonly.ts --candidate
PUB03_ENV_FILE=/Users/liukai/web/ai-best-tool/.env.local node scripts/pub-03-readonly-run.mjs pnpm exec tsx scripts/verify-gemini-notebook-stage2-readonly.ts --reviewed
```

## 待人工确认的事实与门禁

Google 的[产品帮助](https://support.google.com/gemininotebook/answer/16164461)支持已选来源聊天和行内引文，但本站未测准确率；[来源说明](https://support.google.com/gemininotebook/answer/16215270?hl=en)需逐项核对 Web/Drive 发现、用户选择导入及网页、视频、Google 文件、音频的导入损失。**YouTube 导入依赖可用字幕并导入字幕/转录文本；嵌入媒体不导入，不能表述为字幕本身被丢弃。** [创建 notebook](https://support.google.com/gemininotebook/answer/16206563?hl=en)需核对 notebook 隔离、分享/导出权限；[套餐](https://support.google.com/gemininotebook/answer/16213268?hl=en)和[计算量限制](https://support.google.com/gemininotebook/answer/17670842?hl=en)会变，需在审核当日按目标账号、地区和 Workspace 管理员设置再查；[隐私条款](https://support.google.com/gemininotebook/answer/17004255?hl=en)与产品帮助需分别核对一般账号、主动反馈、跨服务及合格 Workspace/Education 边界。发现/导入不能声称是系统性、穷尽、可复现的检索。更名身份以[Google 公告](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)为准。若来源内容或状态改变，更新候选包并重新预检，不直接提升审核状态。

本地验证：临时 PostgreSQL 测试覆盖默认预检返回行且不留候选数据、提交返回行、三份 SQL 的哈希字段/排序一致、verifier 的 PostgreSQL JSONB 文本与 candidate/reviewed 哈希一致、幂等、漂移拒绝、两阶段 RLS 漂移、reviewer UUID/邮箱/Owner gate 拒绝、两种应用管理员依据、导出 claim 同 owner link 与精确回滚；`tsc --noEmit`、完整 build（设置仅供构建的 `MONITOR_API_TOKEN`）与 `git diff --check`。这不代替生产 SQL Editor 预检或独立事实审核。
