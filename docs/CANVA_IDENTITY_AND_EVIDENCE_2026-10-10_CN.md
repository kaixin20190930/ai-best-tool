# Canva 身份与证据候选包

单元：`CANVA-IDENTITY-AND-EVIDENCE-01`

核验日期：2026-10-10（UTC 页面检查；生产库只读）
结论：`READY_MONITOR_CANDIDATE`。候选已获独立 QA PASS，并接入现有受控发布器；本地集成与事务回滚验证完成。控制器已授权一次仅限实体的 monitor/noindex 写入；授权已记录，但尚未执行，Canva 仍不是生产实体。

## 结论

Canva 是成熟的视觉设计产品，具有真实且可用的 AI 功能；适合以唯一产品 `/ai/canva` 进入候选。Magic Studio、Canva AI、Magic Write、Magic Design 都是 Canva 产品内的功能或体验，不是独立工具实体。

市场证据支持“Canva 整体产品已有强采用，AI 功能有独立评测和使用反馈”这一有限结论，不支持“AI/Brand Voice 已被广泛采用”“品牌效果已改善”或本站做过输出质量实测。AI 2.0 的官方状态为 research preview；套餐、额度、角色、素材许可和隐私边界须按 Claim 分层，不能阻塞诚实的 `published + monitor/noindex` 候选，也不能被扩大成普遍承诺。

## 生产只读身份预检

检查时间：`2026-10-10T05:32:23.785Z`。

- Neon 使用 `BEGIN READ ONLY → SELECT → ROLLBACK`，工具表精确身份条件为 name、URL 主机/路径、标题中的 Canva/Magic Studio；匹配 0 行。固定生产 ID：无。
- 较宽上下文检索命中 3 处通用 `SVG canvas` 文本，是表达式误命中，不是 Canva 品牌/产品提及，也不构成实体重复。
- Supabase `product_intelligence_profiles`、关联 Canva 的 sources 和 claims 精确匹配均为 0 行。
- `toolRouteAliases.ts` 未发现 Canva 或 Magic Studio alias。
- 线上 `/ai/canva`、`/cn/ai/canva`、`/tw/ai/canva` 和对应 `/canva-magic-studio` 路径均为 `200 + self-canonical + noindex, follow`，内容是动态不可用壳，不是产品实体。
- 线上 sitemap 为 126 个 `<loc>`，Canva 匹配 0。
- 本次 production writes：`0`。

因此，历史上“没有 Canva entity”的结论在本次只读检查中仍成立；新结论不是 freshness 更新，而是一个待新建的单一 Canva 候选。只保留 `/ai/canva`；未来发布时要核对旧 Magic Studio 壳并收口，绝不创建第二个实体。

## AI 实质与市场证据

官方帮助中心说明 Canva AI 可以创建/编辑设计、图片、视频和文字；Canva AI 2.0 对话式体验及若干新流程仍以 research preview 发布。品牌语气在帮助文档列为特定计划/角色可用，Brand Kit 模板能为 Canva AI 生成提供上下文。由此可以收录“AI 辅助视觉内容制作，并能在同一编辑器继续修改”的工具价值，但不能把普通模板、Brand Kit 本身描述为 AI。

市场证据按对象分开记录：

- **强产品采用信号：** G2 Canva 页面截至 2026-10-10 报告 7,726 条产品评论。它证明 Canva 产品本身有大量独立用户评价；不把总评分/评论数转述为 AI 功能质量或使用率。
- **AI 专项补充：** G2 的 Magic Studio 页面列 12 条评论、4.0/5。样本有限，且 Magic Studio 只作为 Canva 内部功能集合，不作为第二产品。
- **独立上手：** TechRadar 2026 AI 工具盘点称测试 70 多个 AI 工具并介绍 Canva Magic Studio 图像编辑流程；这是独立编辑上手，不是代表性用户调查。
- **辅助实际演示：** BCcampus 教育工作坊材料演示 Canva Magic Studio；只证明教育场景有公开教学/演示，不证明机构采购或学习结果。
- **明确未知：** 没有独立数据量化 Canva AI 或 Brand Voice 的总体活跃采用；没有本站账号试用、受控 benchmark、品牌一致性收益或转化提升测量。

来源均在机器包中保存 URL、核查日期和各自证明范围：[Canva evidence candidate JSON](../data/collection/canva-evidence-candidate-2026-10-10.json)。

## 实体门禁与 Claim 边界

实体门禁：身份、核心 AI 功能、唯一拟定 canonical、市场成熟度和内容完整度通过候选审阅。素材权利由本站原创中性 SVG 解决，不使用 Canva logo、官方截图或未获许可资产。三语内容是审慎编辑稿，不声称本站实测。

下列 Claim 维持条件式，公开稿省略精确值并给出复核日：

| Claim | 当前处理 | 复核 |
| --- | --- | --- |
| Free / Pro / Business 具体金额、试用资格与账号购买状态 | `conditional`；不写具体金额，提示核对账号；Canva Teams 不描述为可新购 | 2026-10-17 |
| AI Standard/Premium/Ultra 额度与单次消耗 | `conditional`；只写共享额度随工具、复杂度、套餐而变，不保证固定次数 | 2026-10-17 |
| Brand Voice、Brand Kit 和管理角色 | `conditional`；说明计划/角色/管理员权限差异，不泛化到账户 | 2026-10-24 |
| Canva AI 2.0 | `conditional`；明确 research preview，不把公告功能写成普遍可用 | 2026-10-17 |
| 输出版权、非唯一性、Canva 库内容许可 | `conditional`；遵循输入权利、输出与 licensed content 的区别 | 2026-10-24 |
| 隐私与 AI 改进用途 | `conditional`；依账号隐私设置及账户类型；第三方 Apps 使用其自身条款 | 2026-10-24 |
| AI 输出准确性 | `verified_public`；Canva 明确不保证准确、完整或可靠，用户需复核 | 2026-11-09 |

公开内容已包含 Best for、Not ideal、真实限制、Jasper/专业图像工具比较方向和纠错预期。所有未决 Claim 仅限制精确金额、权益与精确推荐，不扩展为实体 HOLD。

## 三语候选内容

机器包内保存可供受控页面载荷使用的完整 EN / 简体中文 / 繁體中文正文。统一定位为：

- **EN:** Canva AI-assisted design and brand content.
- **简中：** Canva AI 辅助设计与品牌内容。
- **繁中：** Canva AI 輔助設計與品牌內容。

编辑核心：Canva 是综合视觉工作区；AI 帮助起草/编辑内容，用户仍需审查；品牌上下文能指导而非保证结果；依据工作重心比较 Jasper 或专业图像生成器。精确价格、额度、账户资格、preview 普遍可用性不作无条件断言。

候选素材为 `public/images/tool-media/canva-editorial-cover.svg`，是本站原创中性设计插画，不是 Canva 品牌资产或真实界面。未来部署前必须检查 SHA 与渲染边界。

## 状态、范围与下一步

当前 operational overlay 将 Canva 标为 `ready_monitor_local_only`，因此选择器将它列为下一个待独立 QA 的新工具候选。10-06 历史缓冲 JSON/MD 保持原样，不回写历史结论。

本单没有修改生产、push 或 deploy，也没有批准索引/sitemap/Task/Capability/Fit。QA PASS 后仅将 Canva manifest 和候选内容投影接入现有发布器，未另建通用框架。Canva 固定发布 ID 为 `7f37933d-7e61-4a47-bc6e-85bc1bc224c4`，canonical 唯一为 `/ai/canva`；Magic Studio alias 已接入通用 308 规则，部署后将按同语言跳转并保留 query。数据库 preflight 对产品身份及 fixed ID 执行只读查重；事务回滚先写入候选后显式 `ROLLBACK`，再用新只读连接确认仍为 0 匹配。

当前 release manifest 保持 `productionWriteApproved=false`，并新增 `controllerWriteAuthorization`，由 `AI Best Tool Controller` 授权候选 `canva` 一次 `entity_only_monitor_noindex` 写入（authorizedAt `2026-10-10`）；`indexApproved=false`、`sitemapEligible=false`、`taskCapabilityFitCreationApproved=false` 均保持关闭。pre-release 授权对象已在 preaudit 与 manifest 一致记录；只有候选、日期、精确 scope 和全部保留门禁均通过时，显式 `--commit` 才可继续。授权尚未执行，状态仍为 `ready_for_next_slot`，不能表述为已发布；此次变更不批准索引、sitemap 或关系写入。

## 验收记录

- `pnpm run collection:current-mature-queue`：PASS，Canva 位于唯一下一开发候选，已发布实体未回流。
- `pnpm exec tsx scripts/test-mature-candidate-current-state.ts`：PASS；历史 10-06 快照未改。
- `pnpm exec tsx scripts/test-canva-controlled-release.ts`：PASS，覆盖 fixed ID、素材 hash、en/cn/tw copy、Claim 边界、重复身份负例、通用 SVG canvas 负例、Magic Studio localized alias 和 sitemap/index/关系关闭。
- `pnpm exec tsx scripts/candidate-release-pipeline.ts --candidate=canva --phase=validate --as-of=2026-10-10`：PASS。
- 生产数据库只读 preflight：工具身份 alias/domain/title 匹配 0、fixed ID 匹配 0；交易回滚及新连接 postcheck 均为 0。线上 sitemap 保持 126 URL、Canva 0，reserved canonical 和旧 Magic Studio shell 仍为 200/self-canonical/noindex。未执行生产写入。
- 单一阻塞/未完成项：本次 `--online` 发布器在数据库只读 preflight 通过后，Node `fetch` 请求 `/sitemap.xml` 返回 `fetch failed`，因此发布器级 production route/SEO preflight 记为 N/A/未通过；独立 `curl` 对 sitemap 返回 200，但不替代该门禁。既有 2026-10-10 只读审计快照仍记录旧壳的 self-canonical/noindex；本地改动尚未部署，不能据此声称新 alias 已在生产生效。无需重跑已完成的本地测试/build；控制器在实际发布前需解决或明确豁免该 transport 检查并执行一次在线 preflight。
- `./node_modules/.bin/tsc --noEmit` 与单次完整 build：通过（见交付 commit 验证记录）。
- 生产只读身份/路由核验：PASS，`productionWrites=0`。
- 官方来源及独立采用范围：已逐条记录 URL、核查日及限制。
- 当前状态：固定 ID 已分配给唯一候选但生产尚不存在；控制器实体写入授权已记录，等待后续显式生产 commit。部署时 Magic Studio 旧壳将以同语言 308 收口，不能在部署前宣称重定向已生效。生产发布前的唯一待处理检查为上列 Node fetch 线上 transport blocker。
