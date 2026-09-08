# Adobe / Salesforce 范围澄清实施

归属：质量收尾RC-05。日期：2026-09-04，执行更新：2026-09-08。状态：RC-05A/B/C 已完成；两条泛品牌/产品族记录均保留历史
URL 和范围说明，转为 `monitor/noindex` 并退出 sitemap，复查日为 2026-10-08。

## 官方依据与判断

- [Adobe Firefly官方页](https://www.adobe.com/products/firefly.html)明确了具体生成式AI产品。结论：Adobe泛品牌不能直接作
  为Firefly已核验记录，不继承其套餐、授权或市场验证。
- [Salesforce服务范围](https://compliance.salesforce.com/en/services/agentforce-einstein-platform)分列多项
  Agentforce/Einstein服务；[助手命名说明](https://www.salesforce.com/agentforce/einstein-copilot/)针对原Einstein Copilot
  相应助手。结论：不能将整个Einstein更名为Agentforce，也不能假设一个统一套餐覆盖全部功能。
- 官方资料只证明上述范围；本轮未进行账户实操、独立采用验证或完整价格核验。不引用营销页的收益、安全性宣传作为独立事实。
- 2026-09-08 独立复核确认 Firefly 自身已有独立评论与实测资料，但这些证据不能归给 Adobe 泛品牌页；Agentforce 也有独立实施
  反馈，但 Einstein 是多项服务的产品族，不能把一项更名扩展到全部 Einstein 能力。
- 最近 GSC Top Pages 导出中没有两个 canonical URL。该事实只表示“没有可见机会行”，不写成 0 曝光或 0 点击，也不据此删除
  URL；处置依据是对象身份不合格、官网指向泛化及索引意图不清，而非假设流量为零。

## 已实施

1. 单一配置`lib/config/legacyToolScopeReviews.ts`，范围核对日期、英中结论、核验建议及来源同源。
2. 共享服务端组件`LegacyToolScopePage`仅承接两个范围未明确的记录。使用范围结论、未知信息、建议核验步骤和来源正文，绕过原
   通用工具模板。`LegacyToolScopeNotice`同步用于该页与指南；其他slug不受影响。
3. 同一提示用于Salesforce comparison，去掉“常见替代项”暗示市场验证的摘要/metadata/对比标题；明确候选并非经验证的等价替
   代。
4. RC-05A历史阶段仅加提示，旧正文仍在；RC-05B已替代两页旧正文并停止输出通用价格、评分、适用建议、比较卡及
   SoftwareApplication schema，避免“待核验提示”与确定性推荐冲突。保留原title/slug/canonical/索引判断、面包屑、认领入口、
   登录回跳和访问埋点。历史用户数据未删除；这两页暂不展示旧通用互动区，其他正常工具页保持原模板。
5. `toolPresenter`的列表/详情输出、`lib/data.ts`的导出数据及网络层本地化fallback均复用同一内容配置。静态原始数组保留历史
   文本供审计，不再作为公开导出；数据库原始content/detail尚未改写。此处为明确限定两个slug的临时读层纠偏，不是全数据库清
   洗，也不能据此提升市场核验状态。

## 验收

- `pnpm run test:legacy-tool-scope`：英中/繁体、来源链接、未知工具/原型键、安全空态、无额外H1、数据库与fallback共同入
  口、comparison边界。
- `pnpm run test:legacy-tool-scope -- --smoke`：默认localhost:3018；检查4个工具页和2个comparison，加2个Claude对照页。验
  证单H1、面包屑、无单软件schema、无通用比较卡、认领入口及原索引边界。
- 工具页原self-canonical及允许索引保持；comparison本地/生产均为noindex且无canonical，本次维持现状，不新增canonical。初版
  测试错误假设comparison也self-canonical，已与生产及模板对照修正，未借此修改SEO策略。
- RC-05A验收历史：旧工具页1464条及comparison8条indent错误与当时HEAD一致，属于既有ESLint/Prettier格式冲突。RC-05B新增配
  置、两个组件及扩展测试ESLint通过，不宣称旧大文件或全仓库lint全部通过，不为局部修正重排数千行代码。
- RC-05B完整build退出0（包括类型检查、44个静态页面及构建跟踪）；AdSense前置校验通过。关系内链8项、状态一致性、SEO架构295
  文件、Guide边界18项、面包屑6模板、本地化导航77文件及git diff --check通过。八页本地production服务HTML smoke通过，原索引
  边界保持、两个Claude对照页不进入范围页；未做生产部署后的新页面验收。

## 最终任务状态

| 子项                                                     | 状态                                                | 完成条件                                                                     |
| -------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| RC-05A 范围提示及对比入口澄清                            | 已完成 | 六页本地及生产验收通过 |
| RC-05B 原始正文、列表/兜底、通用决策和结构化数据一致纠偏 | 已完成 | 固定 ID、双语、数据、fallback 与指南一致；旧确定性结论已撤下 |
| RC-05C URL/索引最终处置                                  | 已完成 | 两条转为 monitor/noindex；保留历史 URL，不错误继承 Firefly/Agentforce 身份，不进入 sitemap |

下次范围复核日为 2026-10-08。它是人工复核日期，不会自动恢复索引。Firefly 或 Agentforce 如需收录，必须建立独立产品实体、来源
和 canonical，再通过资料、市场与索引门禁；不能只删范围提示或把本页重定向到不同身份。四周一级比例不因 RC-05 子方案完成而增加。

## RC-05B剩余写入与发布顺序

1. 已只读确认Adobe `eca3ba76-9e1c-449d-bfa8-43e1a390d681`、Salesforce `44dd71ec-57fb-4d1b-b702-002693fb7c36`的当前原文和
   更新时间；Adobe当前基线包含09-04已有更新，迁移以本次回读哈希保护，不回退该更新。
2. `refresh:legacy-tool-scope`已完成仅允许content/detail的事务预演并回滚，保护ID、slug、title、官方URL、features、排期和
   索引审批字段；迁移前后两页索引判断均为`published_and_approved`、质量分100。基线不匹配将停止，正式写入必须显式使
   用`--commit`。
3. 完整build通过后以`73bcebb4`发布；8个生产HTML页面验收通过后执行`--commit`，两条固定记录写入成功并经独立连接回读。迁移
   只改content/detail，索引判断和质量分保持不变；无需用户执行SQL。
4. 最终URL迁移或索引变更仍属RC-05C，不随正文修正自动放行；完成具体对象核验前不撤销范围提示。
5. `schedule:legacy-scope-reviews`已通过固定ID、事务预演和正式落库，将两条`next_review_date`设为2026-09-11。脚本只允许该
   字段变化，不刷新`updated_at`，并断言正文、状态和索引判断前后相同；独立inventory确认缺排期为0。

## RC-05C 实施结果（2026-09-08）

1. 结构化决策记录：`data/collection/legacy-brand-scope-index-review-2026-09-08.json`，明确 GSC 缺行不是 0 数据。
2. 固定 ID 事务脚本：`pnpm run isolate:legacy-brand-scope` 默认 rollback，只有 `--commit` 写生产，`--status` 独立回读。
3. rollback 与 commit 均确认 Adobe、Salesforce Einstein 从 `published_and_approved` 变为 `indexing_paused`，标题、正文、URL、分类
   和历史业务字段保持不变；复查日更新为 2026-10-08。
4. 页面继续保留 self-canonical 历史访问和范围说明；comparison 保持 noindex。没有创建 Firefly/Agentforce 实体或错误重定向。
5. 专项范围测试、迁移契约、TypeScript、diff check 与完整生产 build 均通过；部署后继续运行生产 smoke 和全站索引一致性审计。
