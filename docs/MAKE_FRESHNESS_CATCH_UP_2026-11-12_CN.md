# Make 逾期事实复核、发布与线上验收

日期：2026-11-12（上海时间）。状态：**独立 QA_PASS、正式生产提交、线上验收 PASS，已补做完成。** 本轮维护既有 Make，不新增工具、页面或发布器。

原到期日 2026-10-22；实际复核日为 11-12，不回填历史完成日期。Tool `c0bb3aba-33be-4e14-903e-5f1d036eec4a` 保持 `published + monitor/noindex`，下次复核 11-26。

## 实际修改

- EN/CN/ZH 正文的计费与数据边界段落发生实际差分，不只顺延日期。大多数非 AI operation 一 credit 是默认规则；补明空轮询、下游 bundle、Code 按时间及指定免费模块的例外，并建议用运行级记录估算。
- 区分 Make AI Provider、自有及自动 provider。内置 Toolkit/Agents 的自有连接要求付费套餐；Make operation credits 与模型商 token 费用分开，Create Agent Context 仍可能有 embedding-token credits；自动连接遵循各模块的 token/文件/页数规则。
- 当前公开定价文本不足以完整核对旧固定报价与 Free 权益，撤下其“本次已验证现行条款”断言，要求核对当前档位、付款周期及账号结账。没有据此声称官方已经调价。
- 复核并明确各 webhook 的容量边界：credits 耗尽后须补充，队列满后超限请求会被拒绝；不承诺无限排队或自动恢复成功。
- US/EU 组织存储和处理区域创建后不可改，新增连接服务及模型商数据流须另查的边界；不把组织区域等同于所有下游数据驻留。
- `maintenanceReview` 保存六个实读来源、逐项结论、范围及未实测事项。原市场采用、G2、安全证据和历史日期保持原状，本次不宣称重做这些验证。

## 现有流程执行

唯一独立 QA 复用原 `operations_qa`，对六个官方来源、新正文、精确前像和保护字段逐项核验。清单指纹 `953338ac18b53c77d3a00e2017ae5f53f6b1de13d4f5ef21c02102ccf3d501ed`，独立报告指纹 `f150e943e143eba6022d25726c000685da43678e5cf9cab3ecf452b522e151f6`。

通用 `run-existing-tools-freshness-change-set.ts` 执行：fresh preflight 0 写、真实事务 rollback 0 持久写、14:04:13 正式 commit 更新 1 行、postcheck `alreadyApplied=true` 且 0 写。只写 `detail.en/cn/zh`、`features.maintenanceReview`、`next_review_date`。生产整行与预期后像精确相等，其余字段包括状态、质量、市场证据、素材、身份及原 `updated_at` 均未改变；因此不把旧通用更新日期当作本次全部事实复核日，正文明确显示实际复核日期。

## 线上验收

14:04:36 的一次真实 HTTP 采样覆盖 [英文](https://aibesttool.com/ai/make)、[简中](https://aibesttool.com/cn/ai/make)、[繁中入口](https://aibesttool.com/tw/ai/make)：均 200，新五段事实全部可见，实际标题、复核日、官网及关键官方来源正确，无流式 not-found；self-canonical/noindex 和 sitemap 排除通过。

繁中入口沿用既有中文标题、英文正文回退，不冒称本轮完成繁体翻译。最初验收脚本错误地用正文语言回退规则匹配 H1；核对实际 presenter 后，使用**同一份已保存的线上 HTML**纠正标题期望，最终 PASS。初始失败证据保留，没有重复抓取、提交生产或修改运行时代码。此前带旧日期的静态事实卡仍为历史快照；本轮实际新证据位于已更新正文和维护账本，不把整页旧市场/安全事实改标为本次新核验。

本轮未改索引、sitemap、canonical 配置、Task/Fit 或推荐关系；未建立索引 release，不启动 D+。没有运行本地 build、TypeScript、全量测试或 Make 账号/真实 scenario/模型商账单测试，只做来源、结构、独立差分 QA、既有事务校验和一次定向线上验收。

## 落账与接续

`make-freshness-catch-up` 已从待补做改为 `production_verified`，同一日常任务 11-26 复核或有真实变化时提前处理，不重复入队或提交本次差分。11-13 的 Coverage、11-15 的 n8n、11-19 的已发布观察按现有安排接续；Make 索引分发仍另行 HOLD。

私有证据位于 `.local/gsc/operations/`：`make-freshness-before-2026-11-12.json`、`make-freshness-manifest-2026-11-12.json`、`make-freshness-qa-2026-11-12.json`、`make-freshness-execution-2026-11-12.json`、`make-freshness-production-acceptance-2026-11-12.json`、保留的 initial 报告及三份实际 HTML。密钥、完整生产对象和授权不入 Git。

官方来源：[定价](https://www.make.com/pricing)、[Credits](https://help.make.com/credits)、[功能计费规则](https://help.make.com/how-features-use-credits)、[组织与数据区域](https://help.make.com/organizations)、[运行级用量记录](https://help.make.com/introducing-credit-usage-history)、[Webhook 队列](https://help.make.com/webhooks)。
