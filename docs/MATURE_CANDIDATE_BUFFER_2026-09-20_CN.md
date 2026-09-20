# 成熟高需求工具候选缓冲池

日期：2026-09-20  
状态：候选池已建立，待逐条深审  
数据文件：`data/collection/mature-candidate-buffer-2026-09-20.json`

## 一、这一步做了什么

先对生产 63 条工具记录做只读查重，再建立 14 条候选缓冲。候选入池只表示“值得进行完整核验”，不会创建公开页面，也不会批准索引。

当前组合：

- 成熟高需求工具 10 条；
- 快速增长且已有证据基础的工具 3 条；
- 有明确决策差异的专业工具 1 条。

候选覆盖写作、设计、自动化、开发、研究、会议和企业 Agent。排序优先考虑用户是否存在真实选择困难、官方边界是否可验证、是否能与现有工具形成有意义的比较，而不是只按新品或品牌流量排序。

## 二、候选顺序

| 顺序 | 工具 | 类型 | 主要决策价值 | 当前状态 |
| ---: | --- | --- | --- | --- |
| 1 | Grammarly | 成熟高需求 | 免费/付费、通用 AI 替代、Superhuman Go 迁移 | 发布包完成，等待 2026-09-21 受控发布 |
| 2 | Jasper | 成熟高需求 | 席位费、credits、品牌治理 | 深审完成，待发布包 |
| 3 | Descript | 成熟高需求 | 文本式剪辑、媒体时长、AI credits | 待深审 |
| 4 | Canva Magic Studio | 成熟高需求 | AI 套件范围、套餐限制、商业使用 | 待深审 |
| 5 | Zapier Agents | 成熟高需求 | Agent 与 Zap、activity 计费、可靠性 | 待深审 |
| 6 | Microsoft Copilot Studio | 成熟高需求 | 消息包、按量计费、Power Platform 依赖 | 待深审 |
| 7 | Tabnine | 成熟高需求 | 私有部署、编码助手与 Agent、收购后连续性 | 待深审 |
| 8 | Elicit | 成熟高需求 | 检索与系统综述、语料和导出限制 | 待深审 |
| 9 | Avoma | 成熟高需求 | 录制席位、免费协作者、CRM 工作流 | 待深审 |
| 10 | Copy.ai | 成熟高需求 | Copywriter 到 GTM 平台的身份变化 | 待深审 |
| 11 | Read AI | 快速增长 | 会议额度、回放、工作区和保留策略 | 待深审 |
| 12 | Granola | 快速增长 | Botless 会议记录、用户笔记与 AI 增强 | 待深审 |
| 13 | Ideogram | 快速增长 | 订阅/API、credits、隐私和授权 | 待深审 |
| 14 | Scite | 专业差异化 | Smart Citation、检索与证据判断 | 待深审 |

## 三、明确排除的对象

- `Sourcegraph Cody`：Free/Pro 已停止，不能沿用历史热度制作面向普通用户的页面；如未来处理，只能先重新定义 Enterprise 范围。
- `Amazon Q Developer IDE plugins`：官方已有 2027-04-30 停止支持通知并引导至 Kiro；必须先解决产品生命周期和 canonical 范围，不能直接排期。

这两项说明候选池不是热门词清单。产品生命周期不稳定时，即使知名也应先退出发布队列。

## 四、下一步执行方式

每次只处理一条候选：

1. 再次查询生产实体、域名、alias 和搜索意图，确保无重复。
2. 核验至少两条互补官方来源，不把同一价格页的不同段落当作多来源。
3. 核验至少一条强独立信号和另一条强信号或支持信号。
4. 写清价格、免费额度、限制、隐私、适合与不适合人群、比较维度和素材使用依据。
5. 自动测试通过后，才允许生成 `published + monitor/noindex` 页面。
6. 页面经过相应观察期并再次通过独立索引评审后，才可能改为 `continue_index`；观察期结束不自动索引。

首个对象 Grammarly 已完成身份、价格、提示额度、训练控制、隐私、独立市场信号和三语言 Decision Card 核验。结论是保留 Grammarly 作为写作产品 canonical；Superhuman 是母品牌与套件，Go 是相关但不同范围的助手，不能合并成同一工具页。发布包、本地编辑素材、候选流水线和日期门禁已完成，静态兜底页也已替换 2026-08-03 旧快照。最早生产日期仍为 `2026-09-21`；届时只允许写入 `published + monitor/noindex`，不进入 sitemap，也不消耗索引额度。详见 `data/collection/grammarly-preaudit-2026-09-20.json` 与 `data/collection/grammarly-release.json`。

第二个对象 Jasper 已完成深审。现有 `/ai/jasper` 与 `/cn/ai/jasper` 是 `200 + self-canonical + noindex` 的静态兜底页，生产数据库没有实体且 sitemap 匹配为 0。当前 Jasper 应定义为营销 AI 平台，而不是通用长文写手；采购判断必须同时覆盖 Pro 单席位费、Business 定制合同、共享 credits、Brand Voice/Knowledge/Style Guide 边界、第三方处理与人工编辑。最早发布日为 `2026-09-22`，不会与 Grammarly 的 9 月 21 日槽位重叠。下一项为 Jasper 发布包。

## 五、验收结论

自动验收固定检查：候选总数 14-21、slug 与官网域名唯一、分类配比一致、每项至少 2 条官方来源和 1 条独立来源、至少 4 个决策维度和 2 个风险，并确保所有 `publicReleaseApproved` 与 `indexReleaseApproved` 均为 `false`。

本轮没有写生产数据库、没有新增页面、没有修改 sitemap，也没有消耗索引额度。
