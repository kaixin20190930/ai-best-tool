# Scite 受控预发布深审：SCITE-PRERELEASE-01

核查日：2026-10-07（Asia/Shanghai）。基线 `0d7868a7e099b88e27e8e5aaab19d4499cbf55f6`。结论：**HOLD_EVIDENCE，6 PASS / 2
HOLD（official、content）**。独立 QA 待执行。本包是本地候选材料，不是发布器输入或发布授权。

[完整候选 JSON](../data/collection/scite-prerelease-2026-10-07.json)记录了三语 Tool Intelligence / Decision Card、来源与
适用范围、价格/隐私/权利事实、冲突、媒体、维护和发布边界。依
据[收录准入规范](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)、[统一索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)，并参
照 Elicit、Murf、Pika 的 10-07 prerelease 包。缓冲中唯一下一发布候选仍是 Elicit；Scite 不改变候选顺位。

## 八项门禁

| 门禁           | 状态 | 依据和边界                                                                                                                         |
| -------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 对象明确       | PASS | `scite.ai` / Scite, LLC（Research Solutions 公司）为研究应用；模块和 MCP/API/Zotero/扩展不拆实体。生产身份只读验收须在发布日完成。 |
| AI 价值明确    | PASS | 引文陈述语境分类、全文引文检索、来源链接答案及 Reference Check 有明确研究用途；分类不是科学真伪裁决。                              |
| 实际可用       | PASS | 官网、应用和试用/购买入口可核。没有账户登录、结账或地区访问实测。                                                                  |
| 官方证据完整   | HOLD | 功能、套餐、API、隐私、条款均有互补官方来源；语料覆盖分母、当前模型表现、目标账户权益、导出/API限额及合同边界仍有未知项。          |
| 独立市场依据   | PASS | PolyU 与 CUNI MFF 图书馆分别记录机构访问/订阅；2023 同行评审研究提供历史独立评估。只证明相应时点的采用或评估，不外推当前性能。     |
| 决策价值       | PASS | 三语稿给出适用与排除条件、目标学科对照步骤和 Elicit/Consensus 的不同工作流比较。                                                   |
| 内容真实完整   | HOLD | EN/CN/TW 草稿完成；本站公开纠错/owner 更新路线尚未连接并验收，授权媒体和当前界面素材的复用权利未取得，独立内容/视觉 QA 未做。      |
| 不重复且可维护 | PASS | 本轮只读生产核验的指定字段与九个壳路由无 Scite 实体/profile 匹配、sitemap 无匹配；发布日仍需复查。                                 |

## 能力、覆盖和分类边界

[官方功能页](https://scite.ai/features)列 Smart Citations、Assistant、Search、Reports、Collections、Reference Check；官
网另列 Zotero、浏览器扩展、MCP 与 API。Search 查找全文中的引文陈述并可按章节等过滤；Assistant 返回基于文献的回答和来源链
接；Reference Check 检视稿件参考文献与撤稿、编辑告示或对照引文线索。公开产品页的能力描述没有被本站实际账户测试。

Scite 的 Smart Citation 标签作用于具体引文陈述/语境，不是论文整体质量或论点真伪。独立同行评审研究
[Bakker、Theis-Mahon 与 Brown (2023)](https://journals.indianapolis.iu.edu/index.php/hypothesis/article/download/26528/25101/54274)
在一组药学系统综述的撤稿论文引用中发现，31% 的引用未在 Scite 中表示、37.7% 因全文不可用而未分类；在作者人工编码的已分类
集合里，支持类召回率为 0.05、对照类为 0。该样本和年份有明确边界，不能当作当前所有领域的准确率；它足以要求将分类作为人工
核验线索，而非审稿判定。

官方页面同时展示 1.6B+ Smart Citations、300M+/317M+ articles/scholarly sources、49M+ full-text sources、44+ publisher
partners 等口径。分母、发布时间、语言/学科完整率及全文授权覆盖率未由独立审计确认。遗漏、无全文或未分类不等于不存在支持/
反对证据。系统综述仍需多数据库、可复现检索和人工筛查。

## 计划、隐私、导出与使用权

[10-07 定价页](https://scite.ai/pricing)当前显示 Basic、Pro、Team、Enterprise：页面的 Basic 为 `$20/month` 并显示年付节
省；Pro `$50/month`，有 `$60 API credit included, limited time only`；Team `$250/month` 含 8 seats，额外 seat 页面列
`$50/mo`；Enterprise 定制。Basic 展示每月 250 MCP credits，Pro 展示 2,500，Team 展示每用户 2,500。7 天试用在试用结束后自
动转入所选订阅，除非提前取消。这些是页面快照，不是 checkout 实测；月付、税费、机构合同、当前促销截止、API 超额和账户权益
仍须确认。09-28 旧审计记录的不同促销和套餐金额原样保留为历史观察，不能据此声称普遍价格冲突，也不能覆盖 10-07 页面当前显
示。

同一定价 FAQ 说明学生/学者若向所在机构推荐 Scite，可向 `customersupport@researchsolutions.com` 与 `sales@scite.ai` 发送
并抄送双方的邮件，或把邮件转寄给双方，以申请折扣码。页面没有给资格条件、折扣金额和其他细则；本稿仅记录申请路径，不承诺符
合资格或节省金额。

[隐私政策](https://scite.ai/policy)生效日显示 2026-03-26；[服务条款](https://scite.ai/terms)定义 Customer Data 包含用户
提交/上传/输入内容、输出、查询和互动产生的使用数据，并明确不会用这些 Customer Data 训练、微调或改进 AI 系统。政策又说明
会分析服务使用以改进服务，二者是不同范围，必须同时展示。隐私政策称账户数据在账户关闭后可能保留十年，其他个人信息按目的和
法律义务保留；备份清除时限与账户级合同控制未核。Enterprise enhanced confidentiality 不自动适用于个人套餐。

该政策还称 Scite 多数运营在美国，个人信息可能在美国处理，并按适用法律为跨境传输提供保护；欧洲经济区来源传输举例采用欧盟
委员会标准合同条款。面向中国大陆居民的专节另述个人信息可能在美国处理，并写明使用服务即同意个人信息传至中国大陆以外。这里
按政策的地域章节记录，不扩展为对所有地区适用的法律结论。

条款将引用文章、Classifier Results 和 AI Content 的使用置于第三方许可范围；禁止超出自身研究合理需求的大量/系统获取、向第
三方存储/再分发/销售/许可，及用这些内容或衍生数据训练/评估模型。API/MCP 是访问方式，不是批量再发布或商业转授权许可。导出
格式、各套餐限额、API 计量/过量成本仍 unknown。

[官方 API 页](https://scite.ai/api)列出六类 endpoint families：Assistant `POST /assistant`、Search `GET /search`、Smart Citations/tallies
`GET /tallies/{doi}`、Reference Check `POST /reference-check`、Journal/Organization/Funder
Metrics `GET /journals/{issn}`、Evidence Datasets `GET /evidence`。这些是页面公开支持的家族，不表示当前账户已开通或已实
测。账户额度、费率/超额、导出格式与限额、机构合约和再分发权继续 `unknown/HOLD`。

## 独立采用和使用限制

- [PolyU Pao Yue-kong Library](https://www.lib.polyu.edu.hk/databases/scite)：独立图书馆页面列 Scite 数据库与机构访问说
  明及版权警告。当前许可周期/访问人数未从所读页面确认；只作机构客户采用，不代表所有功能。
- [Charles University MFF Library](https://www.mff.cuni.cz/en/library/news/permanent-access-to-scite)：2026-04-01 公告称
  校内网络及 `@matfyz.cuni.cz` 远程访问，并说明当时订阅可用至 2027-03-30。此为明确的历史订阅窗口，不证明个人用户、现时使
  用率或工具效果。
- [独立分类评估](https://journals.indianapolis.iu.edu/index.php/hypothesis/article/download/26528/25101/54274)：同行评审
  2023 研究，样本有限；只用来界定需人工核验的风险，不外推当前模型或所有学科。

## 素材、canonical 与纠错维护

唯一拟定实体为 `scite.ai`，路径 `/ai/scite`，及其中文/繁中本地化路径。Assistant、Smart Citations、Search、Reference
Check、Collections、API、MCP、扩展和 Zotero 均归同一产品。既有研究 Guide 对 Scite 的提及不是独立产品页或已批准关系。缓冲
记录 10-06 Neon 指定字段匹配 0，但本轮正式生产核验尚未执行；`/ai/scite-ai`、`/ai/sciteai` 壳路由不能推导为获准 alias。发
布日须完成当前跨库实体、profile、alias、页面、Guide/comparison 意图与 sitemap 复查。

没有下载、复用或处理官方图片。本地 `scite.svg` / `scite-cover.svg` 不是获许可官方素材；取得权利人、目录展示/托管/裁切/翻
译许可、署名要求和当前界面预览后再验收。Scite 官方客户支持邮箱为 `customersupport@researchsolutions.com`；没有发送消息。
该厂商联系渠道不是本站纠错机制。未来详情页必须连接真实、可见且经过展示测试的纠错/owner 更新入口，才能解除 content HOLD。

## 生产边界与复核

新增 `scripts/check-scite-prerelease-readonly.ts`，仅以默认只读 PostgreSQL、`BEGIN READ ONLY` 查询后
`ROLLBACK`，Supabase 只执行 GET，并检查既有线上三语壳路由及 sitemap。复现时同时设置 `PUB03_ENV_FILE=<受控环境文件>` 与
`SCITE_ENV_FILE=<同一受控环境文件>` 后执行 `pnpm run check:scite-prerelease:production`；本脚本不打印密钥、不做写操
作。2026-10-07T04:26:52.435Z 只读回读：tools 共 69，产品/上下文字段匹配 0，profiles 0；9 条
`/ai/scite`、`/ai/scite-ai`、`/ai/sciteai` 三语路径均为 200/self-canonical/noindex 壳，sitemap 126 loc 且 Scite 匹配 0。
范围只限这些查询字段和路由；发布日仍需查实体、alias、Guide/Comparison 意图。没有实体、关系、Task
Page、SQL、metadata、index、robots 或 sitemap 写入；发布、关系、索引批准均为 false，productionWrites=0，未 push/deploy。

专项测试：`pnpm run test:scite-prerelease`；类型检查：`pnpm run typecheck:scite-prerelease`。通用 Decision Card model 测
试通过；既有 `test:tool-decision-card-structure` 因断言 `'Decision Card'` 必须单独带引号而未识别现存的
`Tool Intelligence / Decision Card` label，未改动通用运行时代码/测试。独立 QA 通过、纠错路线和素材验收、official HOLD 逐
项解决后，才可讨论另案发布预审。复查日期 2026-10-14；如果提前处理，需重新读取当日波动的套餐、条款与实体范围。
