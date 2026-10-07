# Murf Studio 发布前深审：MURF-PRERELEASE-01

核查日：2026-10-07（Asia/Shanghai）；基线 `f1f0311a8be10e95a3c9f5873bab91038f590997`。结论：**HOLD_EVIDENCE，5 PASS / 3
HOLD；另有 canonical/历史别名意图 HOLD。** 不进入可执行发布 preflight。

完整 EN/CN/TW summary、detail、Best for、Not ideal for、limitations、pricing/privacy boundary、证据日期、Decision Card
和 Task/Capability/Constraint 研究假设见[候选 JSON](../data/collection/murf-prerelease-2026-10-07.json)。这是独立 QA 的
输入，不是发布器输入。三语言稿完成不等于独立内容验收通过；下一发布候选仍为 Elicit，本轮公开数 0。

## 范围及只读查重

读
取[当前成熟缓冲](../data/collection/mature-candidate-buffer-2026-10-06.json)、[运营台账](./OPS_RESET_CANDIDATE_BUFFER_2026-10-06_CN.md)、
[收录宪法](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)与[索引政策](./TOOL_INDEX_RELEASE_POLICY_CN.md)。不因品牌或研究
顺位批准发布。

先执行 Neon `BEGIN READ ONLY → SELECT → ROLLBACK`、Supabase profile GET、仓库 alias/意图扫描与线上 canonical：

- `tools.name/title/url` 搜索 Murf 为 0；Supabase `product_name/canonical_domain` 为 0。
- 扩展到 features/tags 后匹配 **ElevenLabs**，具体为 `features.decision.alternatives[1].slug = murf-ai`，不是 Murf 已发
  布实体。
- `/ai/murf`、`/cn/ai/murf`、`/tw/ai/murf` 为 200、自指 canonical、noindex。进一步读取历史 `murf-ai` 的 EN/CN/TW 路径也
  均为自指壳页。因此不能延用旧台账“仅一个 /ai/murf”的无条件结论；历史引用和路由未收口，**不重复且可维护 HOLD**。
- `lib/config/toolRouteAliases.ts` 无 Murf；app/lib/components 扫描无 Murf。历史 enrichment 脚本和占位素材不等于生产实
  体。范围限本次字段和仓库扫描，不声称穷尽站外别名。
- 69 total，54 published（17 continue_index / 35 monitor / 2 archive），9 draft、6 rejected；sitemap 126 URL、Murf 0。快
  照时间以 JSON 的 `productionReadback.checkedAt` 为准。

复现：`MURF_ENV_FILE=<已有生产环境文件> pnpm exec tsx scripts/check-murf-prerelease-readonly.ts`。工作树按 lockfile 安装
依赖并禁用生命周期脚本；只读加载主仓现有 `.env.local`，不打印凭据。不读取/修改主工作区两份未提交 SQL。

未来另案先统一 `murf-ai` 消费引用与 canonical/alias，再重新核验两 slug 的所有语言。这里不写 alias、实体、关系或 SEO 设
置。

## 当前权益与官方冲突

[首页](https://murf.ai/)明确区分 Studio、API、Agents 和 Dub；本候选只评价浏览器脚本旁白工作区，不借 API 低延迟、电话
Agent、Dub 免费下载、企业部署或厂商总用户量。实际入口 PASS 限公开注册/试用/购买路径，未登录生成、付款或验证地区覆盖。

[定价页](https://murf.ai/pricing)普通网页读取只有 JavaScript 壳；改用浏览器，先选 Studio，年付开关选中时读取，再切月付读
取。下表是 **2026-10-07 页面观测**，不写入对外稿的确定报价/额度。未走 checkout，币种确认、税费、促销、旧账户和合同例外未
验证。

| Studio 档位 | 月付页面               | 年付页面                        | 项目/席位页面观测                                               |
| ----------- | ---------------------- | ------------------------------- | --------------------------------------------------------------- |
| Free        | $0；一次性 10 分钟 VGT | 不将 10 分钟解释为年度/月度续送 | 10 项目、1 editor；无下载/商用                                  |
| Creator     | $29/月；2 小时/月 VGT  | $19 月均、$228 年付；24 小时/年 | 100 项目、1 editor                                              |
| Business    | $99/月；8 小时/月 VGT  | $66 月均、$792 年付；96 小时/年 | 500 项目、1 editor；转录表为月 4/年 48 小时                     |
| Enterprise  | Custom                 | Custom                          | 自定义项目/编辑者；表格 Custom (5+)；生成无限为厂商表述，需合同 |

重要冲突及处理：

- [Workspace 帮助](https://help.murf.ai/what-is-a-workspace)仍列 Free 2、Creator 5、Growth 50、Business 200 项
  目，Business 月 20/年 240 小时；当前卡片
  和[取消帮助](https://help.murf.ai/what-happens-to-my-account-and-projects-after-canceling)是另一套。 **未消歧，不承诺
  精确额度，不复活未在当前卡片出现的 Growth。**
- 首页说所有付费可协作；[邀请说明](https://help.murf.ai/invite-users-to-project)、Studio 比较表和
  [工作区流程](https://help.murf.ai/murf-studio-basics)限定 Enterprise。稿件采用更严格的套餐专属边界。
- [语言页](https://help.murf.ai/languages-and-accents)自身混合 200+/300+、33/40+；首页与定价又有 35+/30+。不发布声音/语
  言总数；可说明 Mandarin/Cantonese 列在文档中，不能保证台湾口音或每声音支持每风格。三语稿不是产品界面语言保证。
- 定价年付 FAQ 说明年度池没有逐月上限，但例子仍写 Basic；只能作为页面说明，账户额度仍需确认。比较表自助 subfolders 与帮
  助搜索摘要的 Enterprise 限制不同，不作自助嵌套/私密目录保证。

Creator 卡片包含商用、下载、Canva；Business 增加业务许可、强调、变化、Say It My Way、PowerPoint、转录；Enterprise 列出邀
请协作、私密权限、SSO、翻译、MSA、不训练承诺。预览分享不是多人编辑，下载无限不是生成无限。

[免费试用](https://help.murf.ai/is-murf-free-to-use)无卡、可试声音/部分付费功能、10 分钟 VGT/转录；
[免费时长说明](https://help.murf.ai/how-can-i-get-more-vgt-during-my-free-trial)明确 VGT 一次性。
[VGT](https://help.murf.ai/what-is-voice-generation-time-vgt)按新增/改文子块生成时长计量，帮助称仅改声音参数不扣新时长。
[项目](https://help.murf.ai/projects)是同时保有槽位，不是每月重送次数；[结转](https://help.murf.ai/vgt-validity)仅下一账
期，取消丢失未用时长。

## 商用、导出与第三方素材

[商用帮助](https://help.murf.ai/do-i-have-commercial-rights-over-the-voice-over-created)支持付费 Studio 商用；定价许可
FAQ 允许个人小规模商用，建议组织使用 Business License，并非把 Creator 写成只能非商业使用。TV/radio 广播只在 Enterprise
范围，当前比较表进一步标记 **Full Broadcasting Rights = Add-on**，所以 Enterprise 本身不保证含广播权。

[一般条款](https://murf.ai/legal/terms-of-service)§5 区分商用与转售 Murf 服务/声音库，禁止拿其声音训练 AI；用户需清权输
入，克隆须声音主体书面同意。目标平台仍自行决定接纳/变现。[YouTube code](https://help.murf.ai/what-are-youtube-codes)要求
为素材库音乐在视频描述放一次性代码；不保证所有 Content ID 争议或所有平台变现通过。库存素材的具体许可证、署名、地域及退订
后复用仍须逐项确认，不能从配音商用许可推出任意音乐/图像权利。

[纯语音导出](https://help.murf.ai/voice-only)列 MP3/WAV/FLAC 与电话 a-law/u-law；
[混音导出](https://help.murf.ai/voice-music)只导一个混合文件，不单独导音乐，另列 OGG；
[视频导出](https://help.murf.ai/video-export)为 MP4/MOV，可导 SRT/VTT 或烧录字幕。套餐表 Full HD 是文档事实，非实测。取
消帮助的账期末下载截止与安全页的协议结束后既有音频取回存在范围冲突，详见下节；两者均不作无条件承诺。

[导入限制](https://help.murf.ai/import-limits)将 Add Media 与 Audio to Text 的 45 分钟入口上限分开，脚本文档每次 15000
词，SRT 例外。不能将上传宣称无上限当作任意成品时长保证。 [时间轴](https://help.murf.ai/timeline-introduction)有旁白、图
像/视频、背景音乐三轨，媒体自动左对齐； [同步说明](https://help.murf.ai/syncing-images-and-videos-with-voice-blocks)不允
许把视频伸长到源时长之外。没有证明自动唇形同步、长项目 SLA 或某套餐最终片长上限。

## 隐私、训练与删除（QA 返工）

`afa68524` 的独立 QA_FAIL 指出本节漏读安全页生命周期条款及无条件下载截止表述；本轮重新直接读取原有安全页、隐私政策及取消
帮助，修正后待独立复核，不将返工自审记为 QA 通过。来源集合与采用证据不变。

| 场景     | 官方陈述与范围                                                                                                                                                                                                                                                          | 当前判定                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 取消订阅 | [取消帮助](https://help.murf.ai/what-happens-to-my-account-and-projects-after-canceling)称账期结束停止付费渲染/下载，项目保留到手动删除；不是终止账户                                                                                                                   | 与既有音频取回条款的适用范围待核                                     |
| 终止账户 | [隐私政策](https://murf.ai/legal/privacy-policy) Account Closure 称终止后 30 天内删除账户及上传项目/媒体/文本，但保留法律、监管、争议、安全、防欺诈、执行条款、退订请求等例外；[安全页](https://murf.ai/security)称无明确删除请求时终止后 90 天内自动删除 Customer Data | 数据范围、合同/套餐及 30/90 天关系冲突待核，不选一项作通用期限       |
| 删除请求 | 隐私政策称 30 天内回复，可有拒绝/限制；安全页 Deletion of Customer Data 称收到请求后删除，复杂情况最长 90 天，并在终止账户后的删除完成时确认                                                                                                                            | 回复期限不等于完成期限；请求、终止是不同触发条件                     |
| 备份删除 | 安全页明确永久删除范围包含备份，复杂情况最长 90 天；一般条款另列合理备份移除时间及共享副本例外                                                                                                                                                                          | 已有期限陈述，不能再称备份期限未说明；普通 Studio 适用范围与例外待核 |

非 Enterprise 项目垃圾箱 30 天与 Enterprise 表格恢复 60 天属于项目操作场景，不合并为账户终止/请求删除期限。安全页 Return
of Customer Data 又称**协议结束后最长 90 天可取回之前生成的音频**；这可能涉及与取消订阅不同的合同、数据或取回机制，但当
前没有依据消歧。不能保证退订后继续下载 90 天，也不能无条件断言账期结束即无法取回任何已有音频。三语
detail、limitations、Decision Card 均保留该冲突，要求取消/终止前确认目标账户范围和取回方式。

普通 Studio 训练/退出机制仍 unknown，Enterprise 不训练声明不外
推；[API 合同](https://murf.ai/legal/api-usage-agreement)也不能移植。官方证据门禁由 PASS 改为 **HOLD**，需厂商或适用合同
明确四种触发条件、数据类别、例外、备份完成和音频取回机制。本轮没有操作取消、终止、删除或取回。

## 两项独立实际采用

1. **强采
   用**：[Paula Marcelle 的 IJDL 设计案例](https://scholarworks.iu.edu/journals/index.php/ijdl/article/view/42061)，
   2025-12-17 发表，作者为独立教学设计师/学者；不是 Indiana University 采购案例。
   [PDF](https://scholarworks.iu.edu/journals/index.php/ijdl/article/download/42061/44044/125817) pp. 284–285、Fig.10 描
   述用 Murf Gen 2 制作 2–4 分钟课程开场音频，p.287 记录语速/发音修订。单一课程、仅导师评价，学生 pilot 在写作时尚待开
   展；精确制作日期未知，不能把发表日作为使用日或当前质量测试。正文已直接回读；PDF 截图请求 cache miss，因此未记视觉通
   过。
2. **辅助采
   用**：[独立匿名课程讨论](https://www.reddit.com/r/instructionaldesign/comments/1fonqvp/murf_is_not_being_truthful_about_their_pricing/)，
   2024-09-24：报告自学课程使用和续费/项目/席位摩擦。身份未证，不证明现价、质量、规模或不当行为。与论文为不同作者/项目。

原 NewTubers URL 再次读取失败，保留为未确认线索，不计数。厂商客户故事和总用户数不计独立信号。市场门禁 PASS 仅表示满足“一
强加另一强/辅助”的宪法门槛。

## 素材 HOLD 与八项门禁

浏览器 DOM 识别官方 logo 来源 `https://murf.ai/public-assets/v2-assets/logos/murf-icon.svg`，只读 URL，不取文件。真实预
览候选为 Studio 帮助的播放/暂停图与 Arcade 演示；来源能追溯，但像素/当前界面、本站托管/裁切/翻译/嵌入授权及署名要求未核
实。条款保留 IP；[Affiliate §9](https://murf.ai/legal/affiliate-program-terms-of-service)许可有项目资格和指定素材/链接前
提，当前没有适用证明。API 标记许可只在 API 范围。论文的 CC BY-NC-ND 与第三方组件也不能给本站商业截图复用放行。

`logo=null`、`preview=null`；没有下载、处理或复用素材。仓库 `murf.svg` 的 Mu 字母和 `murf-cover.svg` 是占位，未修改且排
除。公开前还需真实纠错/owner 更新入口接入与展示验收，候选 JSON `liveSignal` 明确为 blocker；本包不假定页面已实现。

| 门禁           | 结论 | 判据                                                 |
| -------------- | ---- | ---------------------------------------------------- |
| 对象明确       | PASS | Studio 单一产品边界                                  |
| AI 价值明确    | PASS | 脚本到可复核旁白及媒体对齐                           |
| 实际可用       | PASS | 公开试用/购买入口；未宣称实测/全地区可用             |
| 官方证据完整   | HOLD | 删除 30/90 天及既有音频取回范围冲突，待厂商/合同核实 |
| 独立市场依据   | PASS | 具名实际制作加独立匿名辅助使用                       |
| 决策价值       | PASS | 三语适合/不适合、限制和下一步比较                    |
| 内容真实完整   | HOLD | 素材权利/真实预览、独立 QA、纠错入口展示未通过       |
| 不重复且可维护 | HOLD | murf-ai 历史引用与双自指壳页待另案收口               |

下次复查 **2026-10-14** 或许可/冲突答复到齐时（较早者）；真实发布日重复核验。Task `ai-voiceover`、Capability
`text-to-speech-voice-generation` / `voice-consent-and-export` 仅复用种子定义作研究假设；Constraint 为编辑核查问题，未宣
称注册或创建关系。ElevenLabs 与 Descript 只是工作流比较方向，不作确定优劣排名。

只有门禁和独立 QA 全通过，才另行准备单项 monitor/noindex 输入、发布日 preflight 及行级 rollback；仍不自动执行。本轮无生
产变更，无需生产回滚，也未编写可执行 SQL。公开/索引/关系批准全部 false；不改 metadata/index/sitemap/Task Page。

## 初版验证记录

- JSON 解析、专项 `pnpm exec tsx scripts/test-murf-prerelease.ts`、`pnpm run test:candidate-release` 与
  `pnpm run test:mature-candidate-buffer` PASS。最后一项仅覆盖 09-20 历史 14 项；专项测试覆盖当前 15 项及批准边界。
- `pnpm exec tsc --noEmit --incremental false` PASS；另用继承仓库配置的临时 `/tmp/murf-tsconfig.json` 对两个新增脚本单独
  typecheck PASS，避免主 tsconfig 的选择性 include 漏检。无运行时产品代码变更，未执行完整 build。
- 25 个官方证据页面中 24 个 web 直接回读、定价页由浏览器 Studio 视图回读；两项独立使用来源及论文发表页直接回读。URL 语法
  检查与 18 个本地文档链接存在检查 PASS。NewTubers 失败链接不计有效证据；logo 文件和预览未下载/未验证为可复用素材。
- 生产只读脚本 PASS；`pnpm run seo:production-smoke` PASS，126 sitemap URL。测试只读，无生产 rollback 操作。
- 非 Murf 候选对象及唯一下一候选与基线 JSON 逐值相同；仅市场 PASS 总数由 3 更新为 4。修改文件 Prettier check 与
  `git diff --check` PASS（仓库旧格式配置给出 deprecated/unknown-option 提示，不影响结果）。
- 本地提交，不 push；文件范围仅候选 JSON、当前运营台账、专项审计及两个必要验证脚本。初版提交时独立 QA 尚未执行；后续
  QA_FAIL 与返工见下节。

### QA 最小返工验证

原提交 QA_FAIL；本轮只修正生命周期/取回冲突及相关门禁。JSON、专项、候选管线、格式、链接、全项目与新增脚本 TypeScript、只
读生产和 SEO smoke 重跑均 PASS。生产回读时间 `2026-10-07T00:44:37.182Z`：产品匹配 0、profile 0、sitemap 126 URL、生产写
入 0。采用证据、来源 URL、素材/canonical HOLD 与非 Murf 候选逐值不变；未 push 或生产写入。返工包等待独立 QA，不提前恢复
合并资格。
