# Elicit 发布前深审：ELICIT-PRERELEASE-01

核查日：2026-10-07（Asia/Shanghai）。基线 `3d660e6d951873d4a2168aca3a2be1dee3a4e060`。结论：**HOLD_EVIDENCE，七项 PASS、
一项 HOLD；未生成可执行发布候选或数据库事务。**

完整三语言字段、来源与日期、Decision Card、逐项事实及研究关系假设见
[候选 JSON](../data/collection/elicit-prerelease-2026-10-07.json)。这是供独立验收的编辑包，不是发布器输入，也不代表独立
QA 已通过。唯一下一候选仍为 Elicit；本次可发布数为 0。

基线读取 [10-06 缓冲](../data/collection/mature-candidate-buffer-2026-10-06.json)、
[运营台账](./OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md)、
[收录宪法](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)和[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)。历史
09-29/09-30 包保留其当时事实，不覆盖其核查日期。当前包单独处理新变化。

## 生产只读身份、意图与 canonical

`2026-10-06T23:43:26.350Z`，即上海 10-07 07:43，完成 Neon `BEGIN READ ONLY → SELECT → ROLLBACK`：
`tools.name/title/url/features/tags` 搜索 `elicit` 和历史厂商域 `ought.org` 为 0；Supabase
`product_intelligence_profiles.product_name/canonical_domain` 同范围 GET 为 0。没有写入。

全表 69：published 54（continue_index 17、monitor 35、archive 2）、draft/monitor 9、rejected/monitor 6。三语言
`/ai/elicit`、`/cn/ai/elicit`、`/tw/ai/elicit` 均 HTTP 200、自指 canonical、`noindex, follow`。这些现有壳路由不是产品实
体已发布的证据。sitemap HTTP 200、126 loc、Elicit 0。仓库 `toolRouteAliases.ts` 无 Elicit；app/lib/components 全文扫描只
发现既有研究 Guide 与分类页链接到相同产品路径，不构成第二个产品意图。Research Agent、Find Papers 等不拆实体；不新建
Task/同义 URL。

范围限已检查字段及仓库路由；不声称穷尽站外历史别名。发布当天仍须重复跨库身份、意图与 canonical preflight。只读复
现：`ELICIT_ENV_FILE=<现有生产环境文件> pnpm exec tsx scripts/check-elicit-prerelease-readonly.ts`。脚本只读已有环境文
件，不打印凭据。初次工作树缺依赖，已按 lockfile 安装并禁用生命周期脚本；随后发现工作树环境缺数据库连接、默认 Supabase 值
不能访问。显式只读加载主仓已有 `.env.local` 后成功，未修改主仓文件。

## 当前证据与旧稿必须更正的边界

- **入口迁
  移**：[官方迁移说明](https://support.elicit.com/en/articles/17220397-where-did-find-papers-extract-data-and-chat-with-papers-go)
  明确 2026-09-30 起三项独立工具合并到 Research Agent。旧会话只读/可导出；2027 年移除的具体日期未定，需逐一迁移或导出。
  不延用旧稿的独立入口描述。
- **工作流**：[专用综述](https://support.elicit.com/en/articles/14759154-systematic-reviews-in-elicit)限定
  Pro/Scale/Enterprise。每项综述输入上限与最终报告纳入上限不同，不能当月度额度。人工可改筛选决定并核对提取来源；全文筛选
  依赖摘要筛选。
- **价格和配额**：[定价](https://elicit.com/pricing)直接读取暴露多组年付价；Plus 11/月、132/年，Pro 39/468 与 49/588，
  Scale 89/1068 与 169/2028（美元、每用户）。这是页面观测值，不是已消歧的报价。受众/账号视图、月付结算与精确月额度未知，
  三语言对外稿不列付费金额。Basic 免
  费；[用量说明](https://support.elicit.com/en/articles/15646622-usage-limits-in-elicit) 明确共享月池、任务复杂度影响消
  耗，替代旧工作流次数及每日 Agent 限额。Pro/Scale 额外用量须主动开启并设置月花费上限。
- **导出与引用**：[导出说明](https://support.elicit.com/en/articles/14758189-export-your-data-from-elicit)：报告
  PDF/Word 跨套餐；Agent 表格 Plus 起，专用综述表格 Pro 起；CSV/Excel、部分参考表 RIS/BIB。格式支持不保证引用论断正确。
- **人工复核与语言**：[限制](https://support.elicit.com/en/articles/14757928-elicit-s-limitations)承认误读数字、遗漏语
  境，不能可靠评价研究质量。 [语言说明](https://support.elicit.com/en/articles/14758084-languages-other-than-english)强
  调英语优化，其他语言质量不同且耗用更快。EN/CN/TW 是本站本地化稿，不代表产品界面有对应语言保证。
- **隐私分层**：[上传 PDF](https://support.elicit.com/en/articles/14758043-privacy-for-uploaded-papers)的账户私有、加
  密、不进公共语料，不能推出不训练。[普通隐私政策](https://elicit.com/operations/privacy)描述按目的保留、法定例外及备份
  隔离，未给彻底删除 SLA。Basic/Plus/Pro/Scale 网页工作区训练范围仍未知。Enterprise 定价承诺、
  [授权用户条款](https://elicit.com/operations/authorized-user-terms)及[API 条款](https://elicit.com/operations/api-terms)按
  各自范围记录；API 禁止个人数据、输入训练须另行 opt in，不外推全产品。
- **平台**：[官方网页](https://elicit.com/)与账号入口可证；
  [扩展说明](https://support.elicit.com/en/articles/14759113-elicit-browser-extension)列 Chrome/Edge，限 Pro 起专用综
  述，机构全文访问依赖用户已有登录与权利。未证原生桌面/手机端、离线或全球地区覆盖，不作这些承诺。没有登录试用或购买。

这些是本次直接读取的官方文档事实，不是本站跑出的准确率、速度或可用性 SLA。全部来源 URL、核查日及 claim scope 已逐条入
JSON。用量页首次 web 读取失败，随后从官方综述页面链接进入成功；记录为最终直接读取，不把搜索摘要当正文。

## 独立采用的时间与外推边界

1. [Cambridge 可行性研究](https://www.cambridge.org/core/journals/research-synthesis-methods/article/using-elicit-ai-research-assistant-for-data-extraction-in-systematic-reviews-a-feasibility-study-across-environmental-and-life-sciences/C97DAEC70C3173A260F0B12E729E7250)：
   发表 2026-05-29；方法部分采用 2024-09-30 套餐快照，§2.4 明确高准确度复测在 2025-06-26。初始各次提取的精确日期未从正文
   确定。原始七项综述发表年份涵盖 2019、2020、2024，不是 2026 新采集的同一数据集。研究实际提取、导出并与人工数据比较，属
   强采用证据；不迁移历史价格/模型权益，不将个别样本准确率当当前产品保证。
2. [Sheffield Hallam 学生报告](https://shura.shu.ac.uk/34504/1/Wolstenholme_2024_Student_experiences_of_using_Elicit.pdf)：
   仓库文件标记 2024，确切发表日未证；项目 2023-10 至 2024-08，焦点小组 2024-03，单独访谈 2024-04。六位参与者按作业任务
   试用；参与研究有时间报酬。小样本、自选参与的体验研究支持历史实际使用，不等于自然增长、机构采购或当前规模。

两项来自不同项目，市场门槛 PASS 只表示满足宪法的实际采用证据，不构成付费规模、当前版本准确性或无需人工复核的承诺。

## 素材与真实内容 HOLD

[一般条款](https://elicit.com/operations/terms)保留图片/设计等权利；授权用户条款未赋予公开素材再分发权。API 条款另有品牌
资产书面同意要求，仅在 API 范围引用，不冒充所有场景的法律结论。官网/帮助/政策与定向 brand/logo/media-kit 搜索中，未发现
可核验的本站复制、托管、裁切、本地化或嵌入许可。同名 `elicittechnology.com`、`elicit-plant.com` 不是该研究产品，不能借其
brand kit。

这表示本轮未取得依据，不声称互联网上绝无许可。当前 `logo=null`、`preview=null`，没有下载、复制、生成或冒充官方素材；既有
`elicit.svg` 与 `elicit-cover.svg` 占位文件保持原状且被候选包排除。

缺口闭环：取得官方资产源 URL、权利主体、明确允许用途/处理范围、署名要求和可展示形式；再审真实当前界面及三语说明。尚未向
外发送申请。已形成完整三语 summary/detail/Best for/Not ideal for/limitations/pricing/privacy/platform/Decision Card；独
立内容 QA 与素材展示验收仍待下一单元，不能把本轮自审写成独立通过。

## 八项门禁与退出条件

| 门禁           | 本轮 | 可验收依据                                              |
| -------------- | ---- | ------------------------------------------------------- |
| 对象明确       | PASS | 单一 Elicit 应用与官网；不拆公司/模块                   |
| AI 价值明确    | PASS | Agent 研究与专用筛选、提取工作流                        |
| 实际可用       | PASS | 官方账号与 Basic/付费路径；明确未登录测试及地区未知范围 |
| 官方证据完整   | PASS | 互补官方事实；未消歧金额与普通套餐训练不作肯定承诺      |
| 独立市场依据   | PASS | 两项独立实际使用；发表与研究年份分离                    |
| 决策价值       | PASS | 方案、全文权利、语言、人工核验、导出和成本影响选择      |
| 内容真实完整   | HOLD | 三语草稿齐全；官方素材复用与独立 QA 未完成              |
| 不重复且可维护 | PASS | 指定范围跨库查重与三语 canonical；复查排期齐全          |

下次复查 **2026-10-14** 或素材依据到齐时（较早者），并于实际发布当天重新核对波动事实与生产身份。价格省略本身不独立阻塞，
只允许发表有证、明确限定的免费/付费边界。素材 HOLD 必须解除，全部八项与独立审核通过后，才可按原流水线准备受控发布
input、preflight、行级 rollback；当前不准备可执行 SQL 或空壳发布包。本轮无生产变更，故没有生产 rollback 需要执行；未来的
rollback 不是本轮已验证能力。

Task/Capability/Constraint/Evidence 均为研究假设。优先补研究综述筛选/提取缺口；与 Consensus 发现/问答及 Notebook 选定资
料综合作工作流比较，不作优劣排名，不写确定性关系。后续 Tool Intelligence、Task Page 和结构化比较各自需要发布门禁。公开、
索引与关系批准均 false，索引/sitemap/metadata/Task Page 无修改。主工作区两份 SQL 未读取或修改。

## 验收记录

- JSON 解
  析、`pnpm exec tsx scripts/test-elicit-prerelease.ts`、`test:candidate-release`、`test:mature-candidate-buffer`、Prettier
  check、`git diff --check` 均 PASS。历史缓冲测试覆盖 09-20 的 14 项；新增专项测试另核当前 10-06 的 15 项及批准边界。
- 生产只读查重、三语 canonical/noindex 与 sitemap 快照写入候选包；全站 `seo:production-smoke` PASS（126 URLs）。
- 链接：16 个官方来源与 2 个独立来源通过 web 直接读取，来源 URL 语法及 16 个本地文档链接检查 PASS。
- 本轮只改候选/审计/必要只读验证与测试文件；不改运行时，不需完整 build。无 push、部署、生产写入或公开批准。

独立 QA 收口：`QA_PASS_HOLD_WITH_EXACT_GAPS` 允许合并 HOLD 研究包，不代表公开批准。英文不适用场景已明确为需要有清楚依
据、覆盖所有套餐的不训练保证的团队。`liveSignal` 明确列为发布阻塞项：公开前必须连接真实纠错／owner 更新入口，并通过展示
验收；本候选未证明入口已实现。八项门禁结论、证据日期、来源与候选顺位保持不变。
