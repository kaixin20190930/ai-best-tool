# Adobe / Salesforce 范围澄清实施

归属：质量收尾RC-05。日期：2026-09-04。状态：RC-05B展示层与共享读层已实现；数据库原文未写入、未部署，不等于RC-05全部完成。

## 官方依据与判断

- [Adobe Firefly官方页](https://www.adobe.com/products/firefly.html)明确了具体生成式AI产品。结论：Adobe泛品牌不能直接作为Firefly已核验记录，不继承其套餐、授权或市场验证。
- [Salesforce服务范围](https://compliance.salesforce.com/en/services/agentforce-einstein-platform)分列多项Agentforce/Einstein服务；[助手命名说明](https://www.salesforce.com/agentforce/einstein-copilot/)针对原Einstein Copilot相应助手。结论：不能将整个Einstein更名为Agentforce，也不能假设一个统一套餐覆盖全部功能。
- 官方资料只证明上述范围；本轮未进行账户实操、独立采用验证或完整价格核验。不引用营销页的收益、安全性宣传作为独立事实。

## 已实施

1. 单一配置`lib/config/legacyToolScopeReviews.ts`，范围核对日期、英中结论、核验建议及来源同源。
2. 共享服务端组件`LegacyToolScopePage`仅承接两个范围未明确的记录。使用范围结论、未知信息、建议核验步骤和来源正文，绕过原通用工具模板。`LegacyToolScopeNotice`同步用于该页与指南；其他slug不受影响。
3. 同一提示用于Salesforce comparison，去掉“常见替代项”暗示市场验证的摘要/metadata/对比标题；明确候选并非经验证的等价替代。
4. RC-05A历史阶段仅加提示，旧正文仍在；RC-05B已替代两页旧正文并停止输出通用价格、评分、适用建议、比较卡及SoftwareApplication schema，避免“待核验提示”与确定性推荐冲突。保留原title/slug/canonical/索引判断、面包屑、认领入口、登录回跳和访问埋点。历史用户数据未删除；这两页暂不展示旧通用互动区，其他正常工具页保持原模板。
5. `toolPresenter`的列表/详情输出、`lib/data.ts`的导出数据及网络层本地化fallback均复用同一内容配置。静态原始数组保留历史文本供审计，不再作为公开导出；数据库原始content/detail尚未改写。此处为明确限定两个slug的临时读层纠偏，不是全数据库清洗，也不能据此提升市场核验状态。

## 验收

- `pnpm run test:legacy-tool-scope`：英中/繁体、来源链接、未知工具/原型键、安全空态、无额外H1、数据库与fallback共同入口、comparison边界。
- `pnpm run test:legacy-tool-scope -- --smoke`：默认localhost:3018；检查4个工具页和2个comparison，加2个Claude对照页。验证单H1、面包屑、无单软件schema、无通用比较卡、认领入口及原索引边界。
- 工具页原self-canonical及允许索引保持；comparison本地/生产均为noindex且无canonical，本次维持现状，不新增canonical。初版测试错误假设comparison也self-canonical，已与生产及模板对照修正，未借此修改SEO策略。
- RC-05A验收历史：旧工具页1464条及comparison8条indent错误与当时HEAD一致，属于既有ESLint/Prettier格式冲突。RC-05B新增配置、两个组件及扩展测试ESLint通过，不宣称旧大文件或全仓库lint全部通过，不为局部修正重排数千行代码。
- RC-05B完整build退出0（包括类型检查、44个静态页面及构建跟踪）；AdSense前置校验通过。关系内链8项、状态一致性、SEO架构295文件、Guide边界18项、面包屑6模板、本地化导航77文件及git diff --check通过。八页本地production服务HTML smoke通过，原索引边界保持、两个Claude对照页不进入范围页；未做生产部署后的新页面验收。

## 剩余任务与撤除条件

| 子项 | 状态 | 完成条件 |
| --- | --- | --- |
| RC-05A 范围提示及对比入口澄清 | 本地实现完成，待发布验收 | 六页本地HTML通过，发布后同样验收 |
| RC-05B 原始正文、列表/兜底、通用决策和结构化数据一致纠偏 | 展示层/共享读层本地实现；数据库原文与发布验收待完成 | 固定ID，明确保留范围；双语、数据、fallback、指南一致；不保留互相矛盾的旧结论 |
| RC-05C URL/索引最终处置 | 待URL级GSC数据与决策 | 不把未知点击当0；不直接继承Firefly/Agentforce身份；通过独立索引门禁 |

下次范围复核建议09-11；不是已写入数据库的排期或自动任务。只有RC-05B完成且明确资料身份后，才更新/撤除临时范围提示并同步测试；不能只删提示恢复无依据推荐。历史缺排期19、变化基线3/10和四周9/13均不因本次提示而增加。

## RC-05B剩余写入与发布顺序

1. 已只读确认Adobe `eca3ba76-9e1c-449d-bfa8-43e1a390d681`、Salesforce `44dd71ec-57fb-4d1b-b702-002693fb7c36`的当前原文和更新时间；Adobe当前基线包含09-04已有更新，迁移以本次回读哈希保护，不回退该更新。
2. `refresh:legacy-tool-scope`已完成仅允许content/detail的事务预演并回滚，保护ID、slug、title、官方URL、features、排期和索引审批字段；迁移前后两页索引判断均为`published_and_approved`、质量分100。基线不匹配将停止，正式写入必须显式使用`--commit`。
3. 完整build通过后提交发布；生产HTML验收通过再按受控流程写入原文并独立回读。目前没有执行生产写入，也没有生成要求用户执行的SQL。
4. 最终URL迁移或索引变更仍属RC-05C，不随正文修正自动放行；完成具体对象核验前不撤销范围提示。
