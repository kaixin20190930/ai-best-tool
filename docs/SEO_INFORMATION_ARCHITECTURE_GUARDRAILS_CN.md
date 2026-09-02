# SEO 信息架构与不可回退规则

创建日期：2026-09-02  
状态：现状审计完成；SEO-IA-01 至 SEO-IA-06 已实施并通过本地发布门禁  
上位计划：[收录与搜索质量主计划](./MASTER_OPTIMIZATION_TRACKER_CN.md)

## 一、审计结论

当前总体架构方向正确：Google 已开始把站点理解为 AI 工具目录；首页、Explore、Guide、Best topic、分类和工具详情形成基本层
级；工具页 robots 与 sitemap 已统一使用索引门禁；可索引语言已经限制为 `en/cn`。

但仍有四个架构债务需要在新决策功能前收口：

1. 历史 Guide 和 alias 中存在多处手写 `/${locale}` 或 `${BASE_URL}/${locale}` canonical，英文会形成 `/en/...`，与默认英
   文无前缀规则冲突。
2. 部分 canonical 使用相对值（例如 `./new`），没有统一经过 localized canonical helper。
3. 多数核心页面有 JSON-LD Breadcrumb，但没有一致的可见面包屑；部分 JSON-LD 自身也手写 locale URL。
4. Guide、Best topic 等页面 metadata 实现不一致，部分只有 title/description，缺少统一 canonical/hreflang；alias 的
   redirect/noindex/canonical 策略也不完全统一。

结论不是重构全部路由，而是先建立统一页面类型、metadata builder、breadcrumb builder 和测试门禁，再小批量迁移历史页面。

## 二、最终站点层级

```text
Home /
├── Explore /explore
│   ├── Category /categories/[slug]
│   │   └── Tool /ai/[slug]
│   └── Tool /ai/[slug]
├── Guides /guides
│   └── Guide /guides/[approved-slug]
│       └── Tool /ai/[slug]
├── Best AI Tools /best-ai-tools
│   └── Topic /best-ai-tools/[topic]
│       └── Tool /ai/[slug]
└── User/Owner actions
    ├── /submit /pricing /developer/listing
    └── /profile/* /admin/* /find-tools
```

- Home 是目录主题与主要入口。
- Explore 是全目录筛选中枢。
- Category 是稳定分类 hub，只在至少 3 个合格工具且内容完整时索引。
- Guide 回答任务型问题；只维护白名单，不批量生成。
- Best topic 是有明确方法和可维护 shortlist 的榜单，不等同于自动排序列表。
- Tool 是事实、Decision Card、Evidence Ledger、Timeline 和真实信号的汇合点。
- 用户/owner 操作页不承担自然搜索入口。

## 三、URL 与索引矩阵

| 页面类型                      | URL                       | Index          | Sitemap | Canonical                                |
| ----------------------------- | ------------------------- | -------------- | ------- | ---------------------------------------- |
| Home                          | `/`, `/cn`                | 是             | 是      | self                                     |
| Explore                       | `/explore`, `/cn/explore` | 是             | 是      | 忽略筛选 query，canonical 到 Explore 根  |
| Category                      | `/categories/[slug]`      | 条件           | 条件    | self                                     |
| Guide root                    | `/guides`                 | 是             | 是      | self                                     |
| 白名单 Guide                  | `/guides/[slug]`          | 是             | 是      | self                                     |
| 非白名单/弱 Guide             | 同上                      | 否             | 否      | self 或明确合并目标                      |
| Alias Guide                   | 历史 slug                 | 否/redirect    | 否      | canonical 目标或永久重定向               |
| Comparison template           | `/guides/*-comparison`    | 默认否         | 否      | 对应主 Guide；若未来独立索引必须单独准入 |
| Best root/topic               | `/best-ai-tools/*`        | 是             | 是      | self                                     |
| Tool                          | `/ai/[slug]`              | 由统一门禁决定 | 同门禁  | canonical slug self                      |
| Submit/Pricing/New/Developer  | 固定路由                  | 否             | 否      | self                                     |
| Finder/Profile/Admin/Auth/API | 固定/动态                 | 否             | 否      | self，不公开 saved session URL           |
| 非 en/cn locale               | 历史路由                  | 否             | 否      | 不加入 hreflang                          |

## 四、Metadata 标准

### 统一 builder

新增单一接口，所有可索引页面逐步迁移：

```ts
buildLocalizedPageMetadata({
  locale,
  path,
  title,
  description,
  indexable,
  image,
  type,
});
```

该 builder 必须：

- 英文 canonical 无 `/en`，中文 canonical 有 `/cn`。
- 只输出 `en`、`zh-CN`（实现可继续用内部键 `cn`）和 `x-default` hreflang。
- canonical 为绝对 HTTPS URL，无相对路径、query 和尾随斜杠漂移。
- noindex 页面明确输出 `index:false, follow:true`。
- Open Graph URL 与 canonical 一致；图片使用绝对 URL。
- 页面不存在或数据加载失败时不返回可索引的空壳 metadata。

### 页面模板

| 页面       | Title 重点                               | Description 重点           | Schema                                       |
| ---------- | ---------------------------------------- | -------------------------- | -------------------------------------------- |
| Home       | AI Tools Directory + 差异副主张          | 目录、证据、限制、变化     | WebSite + Organization                       |
| Explore    | Explore AI Tools + task/category/pricing | 筛选与决策路径             | BreadcrumbList                               |
| Category   | 具体类别 + AI Tools                      | 任务、关键限制、更新时间   | CollectionPage/ItemList + BreadcrumbList     |
| Guide      | 明确任务问题                             | 方法、适用边界、候选路径   | Article + BreadcrumbList；FAQ 仅真实可见 FAQ |
| Best topic | 具体任务 + Best AI Tools                 | 选择方法、核查日期、限制   | ItemList + BreadcrumbList                    |
| Tool       | Product + use case/pricing/limits        | 具体事实和判断，不堆品牌词 | SoftwareApplication + BreadcrumbList         |

禁止为了长度机械追加站名或关键词；title 和 description 必须与页面可见内容一致。

## 五、Canonical 与 hreflang 规则

- 默认语言 `en` 使用无前缀 URL，例如 `https://aibesttool.com/ai/fathom`。
- 中文使用 `/cn`，例如 `https://aibesttool.com/cn/ai/fathom`。
- `x-default` 指向英文无前缀 URL。
- 不存在完整中文内容的页面不应输出中文 hreflang；当前核心模板已有中英文内容时才维持双语。
- query 参数仅用于筛选/排序，不形成独立 canonical。
- alias 优先 308 到唯一实体；只有必须保留用户访问时才采用 noindex + canonical。
- canonical 目标必须返回 200，不得形成 canonical chain、循环或指向 noindex 页面。

### 已发现的 P0 债务

- 多个 Guide/alias 使用 ``canonical: `/${locale}/...` ``。
- `ai-writing-tools`、`ai-coding-tools`、`ai-note-taking-tools`、`ai-seo-tools`、`ai-tools-for-web3`、`free-ai-tools` 等
  使用 `${BASE_URL}/${locale}`。
- `new` 使用相对 canonical `./new`。
- Best topic metadata 未统一输出 canonical/hreflang。
- 多处 Breadcrumb URL 仍直接拼接 `${BASE_URL}/${locale}`。

这些页面需要按“先测试、后批量替换、再生产 smoke”的方式修复，不能用一次全局文本替换。

## 六、内链架构

### 链接方向

```text
Home -> Explore / 重点 Category / 白名单 Guide / 少量核心 Tool
Explore -> Category / Guide / Tool
Category -> Tool / 同任务 Guide / 相邻 Category
Guide -> 3-8 个明确 Tool / 1 个 Category / 1 个方法 Guide
Best topic -> Tool / 对应 Guide / Category
Tool -> Category / 2-4 个关系明确的 Tool / 对应 Guide
```

### 规则

- 每个 indexable Tool 至少从一个 indexable Category、Guide 或 Best topic 获得可抓取文本链接。
- 每个白名单 Guide 至少从 Guides root 或一个核心 hub 获得链接。
- 工具页的 `Compare next` 必须来自 reviewed `tool_relationships` 或现有人工配置，不随机链接。
- noindex comparison 可以作为用户次级操作链接，但不能占首页/导航/Guide 首要链接的大多数。
- 不把 query、按钮 JS、卡片 onclick 作为唯一内链；核心链接必须是真实 `<a href>`。
- anchor 描述任务或关系，避免所有链接都叫“Learn more”。
- 每页控制高价值上下文链接，禁止为了“SEO”堆几十个无解释工具链接。

### 当前问题

部分 Guide 把多个 noindex comparison 放在高意图入口中。保留真正帮助比较的 1 个次级入口即可，其余应直接链接工具详情、分类
或主 Guide，减少用户绕行和内部权重浪费。

## 七、Breadcrumb 标准

### 可见与结构化数据必须同源

新增共享 `SeoBreadcrumbs`，输入同一组 `BreadcrumbItem[]`，同时渲染：

- 可见 `<nav aria-label="Breadcrumb">`。
- JSON-LD `BreadcrumbList`。

层级：

- Explore：Home > Explore
- Category：Home > Explore > Category
- Guide：Home > Guides > Guide
- Best topic：Home > Best AI Tools > Topic
- Tool：Home > Explore > Category（如有）> Tool

最后一项为当前页，不添加误导性链接。移动端允许横向滚动或折叠中间项，但完整 JSON-LD 保留。所有 URL 使用
`generateLocalizedCanonicalUrl`，不手写 locale。

当前多数核心页仅生成 JSON-LD，用户不可见；这是 UX 和架构一致性问题，应按模板逐类迁移。

## 八、结构化数据规则

- 结构化数据必须对应页面可见内容，不得只为 rich result 添加隐藏问答。
- Tool 的 SoftwareApplication 价格只有 verified/current 证据时输出；未知时省略，不写 0。
- ItemList 的顺序必须与页面可见列表一致，不能使用商业 Featured 顺序伪装编辑排名。
- `dateModified` 只在真实编辑或事实变化后更新，不因 build/deploy 自动刷新。
- Breadcrumb JSON-LD 与可见面包屑同源。
- schema 失败不能让页面 500，但专项测试必须报警。

## 九、抓取与发布边界

- sitemap 与 robots 对 Tool 必须共同调用 `getToolIndexDecision`。
- 新工具公开 1-2 个/日，但默认 `monitor/noindex`；最多 1 个/日、5 个/周批准索引。
- Category 少于 3 个合格工具不进 sitemap；即使 URL 可访问也 noindex。
- 新 Finder/Stack/Trial/Watch 不改变索引总量。
- GSC 出现批量 Crawled/Discovered not indexed、重复 canonical 或非首页展示恶化时，暂停新增索引，而不是删除整个目录。

## 十、架构实施任务

| ID        | 优先级 | 任务                                 | 验收标准                                                 | 状态            |
| --------- | ------ | ------------------------------------ | -------------------------------------------------------- | --------------- |
| SEO-IA-01 | P0     | 建立统一 metadata builder            | canonical/hreflang/OG/robots 单一实现                    | 已完成          |
| SEO-IA-02 | P0     | 修复手写 locale 与相对 canonical     | 英文无 `/en`；无 `./new`；测试覆盖                       | 已完成          |
| SEO-IA-03 | P0     | Best topic 和核心模板补统一 hreflang | self、alternate、x-default 一致                          | 已完成          |
| SEO-IA-04 | P0     | 新增 SEO 架构静态门禁                | CI 阻断手写 canonical 和 sitemap 越界                    | 已完成          |
| SEO-IA-05 | P1     | 共享可见 Breadcrumb + JSON-LD        | 五类核心模板同源渲染                                     | 已完成          |
| SEO-IA-06 | P1     | Guide 高意图内链收口                 | 首要路径指向 indexable 实体；noindex comparison 降为次级 | 已完成          |
| SEO-IA-07 | P1     | Tool 关系内链接入 reviewed 数据      | 2-4 个明确关系，无随机/商业干预                          | 已完成          |
| SEO-IA-08 | P0     | 本地/生产架构 smoke                  | sitemap、robots、canonical、hreflang、breadcrumb 全通过  | 本地通过/待生产 |

## 十一、SEO 架构变更流程

任何新增页面类型、路由、locale、schema 或全局导航变更必须先回答：

1. 它承接独立搜索意图，还是用户工作区？后者默认 noindex。
2. canonical 是什么，是否已有页面承接同一意图？
3. 从哪里获得内链，又链接到哪里？
4. 是否进入 sitemap；若进入，准入证据是什么？
5. metadata、Breadcrumb 和 schema 是否来自统一 builder？
6. 是否通过 `test:seo-architecture`、build 和生产 smoke？

没有上述记录不得进入 main。该规则用于保护 Google 已形成的“AI 工具目录”认知，同时允许产品能力在 noindex 工作区和现有工具
页内继续升级。

## 十二、SEO-IA-01 至 SEO-IA-04 实施记录（2026-09-02）

- 新增 `buildLocalizedPageMetadata`，统一 canonical、`en/cn/x-default` hreflang、robots、Open Graph、Twitter 和绝对图片
  URL；query/hash 会在 canonical 生成前移除。
- Home、Explore、Guides root、Best root/topic、Category 和 Tool 核心模板已经切换到统一 builder。
- 无效 Best topic、缺失分类、少于 3 个工具的分类和不满足工具索引门禁的详情页明确输出 `noindex,follow`。
- 清除 app 源码中手写 ``canonical: `/${locale}/...` ``、`${BASE_URL}/${locale}` 和 `./new`；alias 复用主页面
  canonical，comparison 使用 localized helper 指向主 Guide。
- Explore 历史 layout H1 与页面 H1 重复问题已收口，当前只保留页面的唯一主 H1。
- Best topic 明确使用动态服务端渲染：共享 locale layout 会读取登录 cookies，若继续静态生成会在请求阶段触发
  `app-static-to-dynamic` 并返回 500；架构门禁会阻止该约束被误删。
- 新增 `pnpm run test:localized-metadata` 与 `pnpm run test:seo-architecture`；后者扫描 284 个 app 源文件，并保护核心模
  板、sitemap locale、Guide comparison 排除、分类门槛和统一工具索引决策。
- 生产 SEO smoke 已加入 `/cn/best-ai-tools/ai-writing-tools`，避免以后只检查榜单根页而遗漏专题页 500。
- `pnpm run test:tool-indexing`、TypeScript 和完整 `pnpm run build` 已通过；AdSense 校验通过，43/43 静态页生成完成。
- 本地 production server 页面级验收通过：Home、Explore、Guides、Best topic、Tool 的中英文代表页均返回 200，canonical 正
  确，每页输出 3 组 hreflang 且仅有 1 个 H1。部署后仍需执行 `pnpm run seo:production-smoke` 完成生产确认。

## 十三、SEO-IA-05 实施记录（2026-09-02）

- 新增共享 `SeoBreadcrumbs`，调用方只提供名称和无 locale 的站内 path；组件统一生成 canonical URL、可见链接和
  `BreadcrumbList`，不再维护两套数据。
- Explore、Guides root、Best root/topic、Category 和 Tool 六个核心模板已接入；Tool 有有效分类时会形成
  `Home > Explore > Category > Tool`，无分类时安全降级。
- 可见导航支持移动端横向滚动、键盘焦点、`aria-label` 和当前页 `aria-current`；当前页不再生成误导性链接。
- 新增 `pnpm run test:seo-breadcrumbs`，阻止六个模板重新引入独立 `generateBreadcrumbSchema`。
- 完整 build、TypeScript、metadata、索引和 Breadcrumb 测试通过。本地 production server 验收中，六个代表页均返回 200，并
  且各自只有一个可见 Breadcrumb nav 和一个 Breadcrumb JSON-LD。

## 十四、SEO-IA-06 实施记录（2026-09-02）

- Guides hub 从约 1900 行收口到约 365 行，移除首屏、主要卡片和重复专题区中几十个 noindex comparison 主入口。
- 主路径现在依次承接可索引任务 Guide、Best topic、Category 和 Tool；只保留一个明确标注的次级 comparison，供已经明确需要
  并排比较的用户使用。
- 可索引 Guide 白名单已从 sitemap 和 middleware 内部迁移到 `lib/seo/guideIndexing.ts`；Guides hub、sitemap 与
  `X-Robots-Tag` 共同使用同一来源，避免展示、sitemap 和 robots 状态再次漂移。
- 新增 `generateLocalizedPath`，Guide hub 和共享 Breadcrumb 的英文链接保持无 `/en`，中文链接使用 `/cn`；canonical 与可见
  内链使用同一套 locale 规则。
- 新增 `pnpm run test:guide-link-boundaries`：校验 18 个可索引 Guide、主路径无 comparison、全页最多一个次级 comparison，
  以及 sitemap/Guide hub 白名单同源。
- 完整 build、TypeScript、SEO 架构、Breadcrumb、metadata、工具索引和 Guide 链接门禁全部通过；本地 production server 的
  `/guides` 与 `/cn/guides` 均返回 200、只有一个 H1 和一个 Breadcrumb。
- 全站 Header/Footer 仍有默认英文 `/en` 历史链接，这不由 Guide hub 生成，已记录为后续全站导航 canonical 收口项。

## 十五、SEO-IA-07 实施记录（2026-09-02）

- 公开 Tool 页原先调用 `getRecommendedTools`，按分类、标签、评分和浏览量自动选择 6 个“相似工具”；该算法不再参与关系内
  链或 Decision Card 的 `Compare next`。
- 新增 `reviewedToolRelationships` 人工白名单。每条关系必须包含方向、`alternative/complements/overlaps/replaces` 类型、中
  英文理由、复核日期和下次复查日期；单个来源工具限制为 2-4 条。
- 首批覆盖 Claude、Gemini、GPT-4o、ChatGPT Mac、Poe、Adobe、Shutterstock 和 FastImage。真实目录回读确认 8 个来源工具
  均能解析 2-3 个目标，不存在缺失 slug。
- 公开读取层会再次验证目标工具为 `published`，并通过统一 `getToolIndexDecision`；`monitor/noindex`、质量不足、被拒绝或归档的
  目标不会出现在关系模块和 Decision Card。
- Tool 页 Decision Card 与“接下来比较哪些工具”模块消费同一份 reviewed 数据；没有审核关系时不伪造推荐，用户仍可通过
  Category 和 Guide 继续探索。
- 关系卡明确展示“可替代/可配合/部分重合/可替换”、理由和复核日期，并直接进入目标 Tool 的 Decision Card；链接不受
  Featured、流量、评分或随机标签控制。
- 这份人工白名单是 DCF-01/06 数据库与后台审核上线前的受控桥接，不代表 DCF 已完成。未来迁移到 `tool_relationships` 时必须
  保留相同公开读取门槛和自动测试。
- 新增 `pnpm run test:reviewed-tool-relationships`，阻止自链、重复、超过 4 条、缺少双语理由、无复查日期、重新调用算法推荐或
  绕过索引门禁。
