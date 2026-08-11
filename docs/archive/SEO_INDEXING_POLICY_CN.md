# 站点收录策略（中文）

更新日期：2026-06-15

这份文档的目标很简单：把站点里所有页面分成三类，并且以后都按同一套规则处理。

- 进 sitemap 的页面：搜索引擎应该优先发现、优先理解、优先收录
- 只做内部流量的页面：对用户很有用，但不应该抢索引预算
- 永远不进索引面的页面：管理、登录、会话、分页、参数页、API 页

核心原则只有一句话：

> sitemap 只放“能代表站点主题、且对用户有独立价值”的规范页。

## 0. 当前推荐规模

按目前站点结构，sitemap 的推荐规模大致是：

- 首页 + 总入口页 + 策略页：6 个基础路由
- 核心指南页：约 18 个
- 核心分类页：约 12 个
- 公开工具详情页：按已发布工具数量计算

如果已发布工具大约在 118 个左右，且只保留 `en` 和 `cn` 两个可索引语言，那么 sitemap 的总量大约会落在：

- 36 个规范路由 x 2 语言 = 72
- 118 个工具 x 2 语言 = 236
- 合计约 308 个 URL

这意味着当前阶段，sitemap 维持在 300 左右是合理的；如果明显超过 350，通常要检查是不是把比较页、参数页、内部过渡页也放进去了。

## 1. 进 sitemap 的页面

这类页面应该满足三个条件：

1. 是公开可访问的 canonical 页面
2. 页面内容足够独立，不是别的页面重复版
3. 页面能清楚表达站点主题或某个明确意图

### 1.1 首页

保留：

- `/`

原因：

- 这是全站主题锚点
- 需要最先告诉 Google：这是一个 AI 工具目录站

### 1.2 总入口页

保留：

- `/explore`
- `/guides`

说明：

- `explore` 是目录主入口
- `guides` 是内容主入口
- 这两个页面应该始终在 sitemap 中

### 1.3 核心分类页

优先保留：

- `/categories/productivity`
- `/categories/web3`
- `/categories/research`
- `/categories/voice`
- `/categories/automation`
- `/categories/developer-tools`
- `/categories/chatbot`
- `/categories/text-writing`
- `/categories/seo`
- `/categories/design-art`
- `/categories/image-generator`
- `/categories/video-generator`

保留标准：

- 分类下有足够工具
- 页面不是空壳
- 能通过介绍、筛选和代表工具展示真实价值

如果一个分类工具太少、内容太薄，就先不放进 sitemap，继续当内部入口养内容。

### 1.4 主力指南页

保留：

- `/guides/how-to-choose-ai-tools`
- `/guides/free-ai-tools`
- `/guides/best-free-ai-tools`
- `/guides/ai-writing-tools`
- `/guides/ai-seo-tools`
- `/guides/ai-video-tools`
- `/guides/ai-image-tools`
- `/guides/ai-coding-tools`
- `/guides/ai-chatbot-tools`
- `/guides/ai-productivity-tools`
- `/guides/ai-tools-for-research`
- `/guides/ai-tools-for-developers`
- `/guides/ai-tools-for-automation`
- `/guides/ai-tools-for-web3`
- `/guides/ai-tools-for-marketing`
- `/guides/ai-tools-for-sales`
- `/guides/ai-tools-for-voice`
- `/guides/ai-note-taking-tools`

保留标准：

- 标题和描述清晰
- 有自己的判断逻辑，不只是工具合集
- 页面里有明确的内部链接，能把用户导向分类页或工具页

### 1.5 代表性工具详情页

优先保留：

- ChatGPT
- Claude
- Cursor
- Runway
- Dune
- DefiLlama
- Fathom
- Gamma
- Notta
- Perplexity

保留标准：

- 有 logo
- 有截图
- 有明确描述
- 有标签
- 有价格信息
- 有最近更新时间
- 有评论、收藏、分享等真实互动信号

### 1.6 价格页

可以保留，但不需要做成重索引目标。

建议：

- 保留可访问
- 作为转化页存在
- 但不要抢首页、分类页、指南页的收录优先级

## 2. 只做内部流量的页面

这类页面很重要，但它们的作用主要是：

- 帮用户从宽泛需求走向具体决策
- 帮爬虫从强入口页继续往下走

它们不应该靠 sitemap 抢优先级，而应该靠内部链接自然导流。

### 2.1 Comparison 页

例如：

- `/guides/*-comparison`

建议策略：

- 对用户开放
- 作为内部导流页存在
- 先不要进入 sitemap
- 默认保持 `noindex`

原因：

- 这类页面结构相似度高
- 很容易互相重复
- 对新站来说，不应该优先于首页、分类页和主指南页

### 2.2 Secondary guide 页

例如：

- 行业长尾 guide
- 某个细分工作流 guide
- 尚未补厚的场景 guide

建议策略：

- 可以保留
- 通过首页、指南页、分类页互相导流
- 在内容变厚之前，先不要把它们推成 sitemap 主力

### 2.3 转化页

例如：

- `/submit`
- `/developer/listing`
- `/pricing`
- `/new`

建议策略：

- 对用户开放
- 重点服务转化和操作
- 作为内部流量页即可
- 不要和主题内容页争夺 sitemap 权重

### 2.4 分类分页与筛选页

例如：

- `/explore?page=2`
- `/categories/productivity?page=2`
- 带很多查询参数的筛选结果页

建议策略：

- 保留给用户翻页和筛选
- 默认 `noindex`
- 不进入 sitemap

## 3. 永远不进索引面的页面

这些页面不适合进入 sitemap，也不适合被当成 SEO 目标页：

- `/admin/*`
- `/login`
- `/register`
- `/forgot-password`
- `/verify-email`
- `/profile/*`
- `/settings`
- `/api/*`
- `/auth/*`
- `/health`
- `/healthz`
- checkout / webhook / callback 这类支付与系统接口页

原因很简单：

- 它们依赖会话
- 它们不是公开内容页
- 它们没有稳定的搜索价值

## 4. 多语言策略

当前站点虽然有多语言能力，但索引面不要一次铺太大。

### 4.1 当前只让这两个语言参与索引

- `en`
- `cn`

### 4.2 其他语言的处理方式

其他语言版本建议：

- 继续保留可访问能力
- 但不进入 sitemap
- 也不要参与 hreflang 索引面
- 如果内容没有达到稳定质量，直接 `noindex`

### 4.3 什么时候可以放开更多语言

只有当下面这些条件同时满足时，才考虑新增语言索引：

1. 该语言至少覆盖首页、guides、核心分类页和一批代表性工具页
2. 页面内容不是简单机器翻译
3. 站内有足够内部链接支撑该语言的页面结构
4. 该语言版本能形成稳定的用户停留和点击信号

### 4.4 语言内容的一致性要求

同一页面尽量只使用一种主语言。

不要出现这种情况：

- 页面标题是中文
- H1 是英文
- 正文混着中英
- 导航又切到第三种语言

这种混写会降低页面主题清晰度，也会让 Google 更难判断该页该归到哪个语言版本。

## 5. sitemap、内部链接、noindex 的配合方式

三者要分工明确：

- sitemap：告诉 Google 哪些是你最想被发现的页面
- 内部链接：告诉 Google 这些页面之间的层级和主题关系
- noindex：告诉 Google 哪些页面不该参与索引竞争

不要让它们互相打架。

### 5.1 sitemap

只放：

- 首页
- 主入口页
- 核心分类页
- 主力指南页
- 代表性工具详情页
- 少量真正有独立价值的转化页

### 5.2 内部链接

优先从这些地方把流量往核心页导：

- 首页
- 指南页
- 分类页
- 代表性工具页

### 5.3 noindex

优先给这些页面：

- 分页
- 参数筛选页
- 比较页
- 登录/注册/个人中心
- 支付/回调/API/健康检查页

## 6. 当前站点的建议分层

### 第一层：绝对主力

- 首页
- Explore
- Guides
- productivity
- web3
- research
- voice
- automation
- developer-tools
- writing / seo / chatbot / design-art / image-generator / video-generator

### 第二层：高价值内容页

- 主力 guide 页
- 代表性工具页
- 少量价格页和转化页

### 第三层：内部流量页

- comparison 页
- 细分长尾 guide
- submit / pricing / developer listing / new

### 第四层：不进索引面

- admin
- auth
- profile
- settings
- API
- pagination
- query 参数页

## 7. 页面晋级规则

一个页面从“内部流量页”升级到“sitemap 页”，至少要满足这些条件：

1. 页面有独立搜索意图
2. 页面不是另一个页面的重复版
3. 页面有足够正文和结构信息
4. 页面在站内有足够内链
5. 页面能持续获得点击、停留或评论信号

如果不满足，就先留在内部流量层，不要急着升格。

## 8. 维护节奏

### 每周

- 看新增页面是否应该进 sitemap
- 看首页、guides、分类页的内链是否还足够强
- 看是否出现新的薄页或重复页

### 每月

- 清理不再主推的页面
- 调整 sitemap 里的优先级
- 回看多语言覆盖是否仍然合理

### 每季度

- 复盘哪些页面真正带来了收录、点击和转化
- 决定是否放开更多分类、comparison 页或更多语言

## 9. 当前结论

现在最适合这套站点的做法不是“尽可能多收录”，而是：

1. 先让 Google 理解你最重要的页面
2. 再让用户和爬虫通过内部链接往下走
3. 最后才放开次级页、comparison 页和更多语言

这会比一次性把所有页面塞进 sitemap 更稳，也更像一个可持续运营的目录站。
