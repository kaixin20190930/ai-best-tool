# 所有者产品去重与收录验收

日期：2026-11-19，上海日期。触发：用户提供 16 个域名，要求产品去重、收录和普通官网链接。本记录是明确手动批次，不冒充日常首次调度或搜索增长。

## 范围与真实阶段

先按规范域名（HTTPS、www、尾斜杠）、名称及候选查重，再核对当前产品，而不是按照用户表里的 DR、流量或过往定位直接建立页面。用户提供的 DR、访问量未在本轮重新测量，不写为本站实测结论。未执行仓库中已有的所有者产品批量插入 SQL，也未修改其他站点的互链。

| 对象 | 去重/资格结论 | 本次阶段 |
| --- | --- | --- |
| Moxion | 无既有 Tool/候选；AI GIF 与动图处理，和 MossImage 是不同产品 | 已 published + monitor/noindex；独立 QA 与三语言线上验收 PASS |
| RapCraft | 无既有 Tool/候选；说唱歌曲及歌词对齐视频 | 已 published + monitor/noindex；独立 QA 与三语言线上验收 PASS |
| DictoText | 无既有 Tool/候选；云端音频转写，须与本地降噪区分 | 已 published + monitor/noindex；独立 QA 与三语言线上验收 PASS |
| Sigoo | 无既有 Tool/候选；MCP Agent 控制平面，真实连接处于私有 Beta | 首轮 QA 阻止错误 Free 徽标；授权续作已改为未知定价并 published + monitor/noindex，三语言验收 PASS |
| MossImage、Pixform | 既有 published + monitor 工具 | 不重复入队/发布；仅本次中文页面身份及官网链接检查 PASS |
| Pairvu、TripTrace、BriefVu、Writivia | 既有 published + monitor 工具 | 不重复建页；仅本次中文页面身份及官网链接检查 PASS |
| HN Tube | 当前为 Hacker News 推荐技术视频索引，不是用户表中的新站聚合 AI 工具 | 不为外链目的伪造 AI 核心能力，不入队 |
| SpriteChecklist | 当前为 Fortnite 收藏追踪清单，不是 AI 素材工具 | 不入队 |
| Rulevio | 当前为游戏攻略、兑换码内容站，缺少可验证 AI 工具核心能力 | 不入队 |
| AI Best Tool | 本目录自身 | 不自收录 |
| STLPeak、CalcTiles | 用户表中已明确独立赛道，不参与 AI 互链 | 按原边界不入队 |

Pairvu 现有条目是商品图片检查器，BriefVu 是图片工具，TripTrace 是旅行记忆地图，Writivia 是大学申请文书评分工具；本轮没有依过往表格的“AI 对比/摘要/行程/写作”定位重复建实体。没有检测到这 6 个既有产品的当前域名/名称重复 Tool；同名 OpenMOSS 模型与 MossImage 托管工作室继续分开，未执行合并、删除或重定向。

## 内容和发布边界

准备批次按视觉（Moxion）、音频（RapCraft、DictoText）、Agent（Sigoo）三个主题分组；共用一次新增素材部署，未为了分批重复部署或凑页面配额。首轮仅前两组公开，Agent 组因真实 QA 缺口未公开；之后用户授权的 Sigoo 定价最小修复、公开与验收已完成，详见 [续作记录](SIGOO_PRICING_AND_PUBLICATION_2026-11-19_CN.md)，原失败保留。每个新对象由一条 Tool 记录驱动 en/cn/tw，而非新建三套代码。每个对象至少两个互补官方来源，包含适合/不适合、限制、费用、未实测说明和本站所有者提交关系披露；不是声称独立使用过的评测。

- Moxion：免费处理与 AI 额度分开；水印、购买额度与 Pro 模型控制、云端处理边界分别说明。
- RapCraft：自有音频/歌词权利、片段额度、预览容量、人物连贯和口型限制分别说明。
- DictoText：本地降噪不等于本地转写；说话人标签、容量池、额度周期和 24 小时到期/清理延迟分别说明。
- Sigoo：合成演示不证明真实集成、安全审计或生产 SLA，私有 Beta 报价未知。首轮正文无法修正产品级 Free 标签，因此实际停止公开。用户授权续作后，复用既有 nullable 字段和 Check website 展示，最小补齐共享 Admin/普通 monitor/结构化数据处理，通过真实受控定价修正和同一 QA 新前像复核后，沿原 Tool 完成公开；未虚称 paid/freemium、未绕过编辑契约、未重复收录。

四张素材为平台原创中性 SVG，明确是编辑示意图而非产品截图，无供应商标志或外部资产。素材提交 `b7b96365577db90ac4103a23cacce2d1f30688f1` 已在生产部署 `dpl_5qnHKiFJJwrMfhbwmVZwPgQz2zyA` READY，精确 team/project/commit/production 和正式域名均通过现有部署连接核对。部署技能只用于确认目标和真实部署状态，未增加流水线。

## 官网普通链接

现有详情模板官网按钮是原生 `<a href>`，只有 `rel="noreferrer"`；没有 `nofollow`、`sponsored` 或 `ugc`，不需要增加无意义的 `rel="dofollow"`。本批不改共享链接组件、不植入页脚/全站友链、不要求其他站回链、不增加编辑推荐关系。若未来实际属于广告、付费或交换权益安排，仍应按关系正确标注，不能沿用普通链接掩盖商业安排。

6 个已存在中文工具页本次实际均返回 200、正确标题、无流式 not-found，官网去向正确，`noindex, follow` 且官网链接没有不跟随限定。这只是当前身份和官网链接验收，不是过期事实维护、全三语重新验收或独立质量背书。

普通链接不等于 Google 承诺抓取或传递排名信号；monitor/noindex 页面没有因此取得索引批准。继续保留原 robots/canonical/sitemap 边界，不批量放开索引，不启动虚假的 release D+ 时钟。

## 证据与最小校验

首轮私有证据统一在 `.local/gsc/operations/owner-catalog-*-2026-11-19.*`：规范身份查重、真实官方页面及时间/指纹、完整三语选择包、通用入队/导入实际回滚与提交、草稿后像、同一位真实独立 QA 的逐对象报告、生产发布审计及线上原始 HTML。Moxion、RapCraft、DictoText 各为 enqueue 1 + draft import 3 + publication 1，共 5 次通用持久写操作；Sigoo 首轮仅 enqueue 1 + draft import 3，合计 19。随后 Sigoo 定价修正 1 + publication 1，Sigoo 累计 6、四产品累计 21；续作证据单列 `sigoo-pricing-*-2026-11-19.*`，不覆盖原失败。回滚、前后查验和每个已公开对象的一次幂等回查均为 0 次持久写。6 个既有对象生产修改 0，不执行重复收录或发布。

首轮只改内容/数据和编辑配图，无运行时代码改动，未运行本地 build、TypeScript 或全量测试。Sigoo 后续最小运行时代码修复仅做直接相关校验、增量 TypeScript 和一次最终 build，详见续作记录；两轮 GSC/Inspection 新采集均为 0。首轮三个公开对象逐一通过 fresh preflight、实际事务 rollback、tool commit、postcheck 和一次零写幂等回查，再完成一次实际三语言页面验收。素材取真实上线字节并与 QA 绑定 SHA256 一致，sitemap 复用今日 03:30:33.877Z 的 154 URL 成功快照与原哈希，不把复用说成新采样；三对象均未在该索引清单内。

线上验收时间 2026-11-19 04:06:20–04:06:30 UTC（上海 12:06）：9/9 页面 PASS。实际标题、摘要、完整三语正文、适合/不适合、每项限制、价格边界、所有权披露、主官方证据、官网普通链接、示意图标识/alt、无流式 not-found、self-canonical 和 noindex/follow 均通过。数据库 published + monitor、复核日期、独立 QA 审计绑定和保护内容一致；候选前像未改，market validation 仍为空，无索引/TaskFit/关系写入。TW 共用模板的“查看证据来源”仍为原简体标签，本轮三语产品正文完整，不声称改造共享界面翻译。

| 新公开对象 | 中文地址 | 同步英文 / 繁体路径 | 后续日期 |
| --- | --- | --- | --- |
| Moxion | https://aibesttool.com/cn/ai/moxion | `/ai/moxion` / `/tw/ai/moxion` | 2026-12-03 |
| RapCraft | https://aibesttool.com/cn/ai/rapcraft | `/ai/rapcraft` / `/tw/ai/rapcraft` | 2026-12-03 |
| DictoText | https://aibesttool.com/cn/ai/dictotext | `/ai/dictotext` / `/tw/ai/dictotext` | 2026-12-03 |
| Sigoo（授权续作） | https://aibesttool.com/cn/ai/sigoo | `/ai/sigoo` / `/tw/ai/sigoo` | 2026-12-03 |

目前以上四个公开对象均记 production_verified，Sigoo 单列的 05:45 UTC 三语言验收 3/3 PASS，定价为未知而不是免费，原三个 PASS 未重做。后续由现有 ai-best-tool-cluster 维护，12-03 实际复核来源与价格/使用边界，不只顺延日期；Sigoo 未有新价格证据时继续如实未知。未创建新定时任务，未扩大当前日常 Automation 路线，未将页面数量记为增长。
