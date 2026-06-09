# 媒体补全执行手册

这份手册用于把“工具已收录，但卡片观感不够好”的问题，变成每周可执行的固定动作。

## 什么时候需要跑

- 首页卡片观感参差不齐时
- `Explore` 或分类页出现大量占位 favicon 时
- `/admin/tools?status=published&needsMedia=1` 里积压过多时
- 每周固定运营检查时

## 先看哪里

优先看后台：

- `/admin/analytics`
  - `Priority Media Queue`
  - `Collection Compliance Audit`
- `/admin/tools?status=published&needsMedia=1`

其中：

- `Priority Media Queue` 用来判断“先补谁”
- `Collection Compliance Audit` 用来判断“还缺什么”

## 优先级规则

优先补这些条目：

1. 首页、Explore、重点分类里经常露出的工具
2. `Web3`、`Text & Writing`、`Chatbot`、`Productivity` 这些当前重点分类
3. 已经有一定浏览或点击的数据
4. 仍在使用 placeholder favicon 作为 logo 或 screenshot 的工具

## 每条工具至少补什么

发布后的正式目录条目，至少要补齐：

- 真实 logo
- 真实 screenshot / preview
- 分类
- 标签
- 简介
- detail
- 定价

其中媒体优先看两项：

- `image_url`：logo
- `thumbnail_url`：卡片首图 / 截图

## 本周执行节奏

### 第一步：拉出 Top 5

运行：

```bash
pnpm exec tsx scripts/print-priority-media-queue.ts
```

这会输出当前最值得先补图的 5 条工具。

### 第二步：逐条处理

对每条工具：

1. 打开编辑页
2. 替换 placeholder favicon
3. 补真实 logo
4. 补真实 screenshot
5. 保存后刷新后台列表

### 第三步：回看前台

至少检查：

- 首页
- Explore
- 对应分类页
- 工具详情页

确认卡片不再显得像占位条目。

## 完成标准

一轮媒体补全算完成，需要满足：

- 这 5 条工具不再出现在 `Priority Media Queue` 前列
- `needs media` 数量有下降
- 首页和 Explore 的视觉质量明显提升

## 不要做的事

- 不要一次性补太多，先做 Top 5
- 不要为了“有图”继续保留 favicon 占位图
- 不要只补前台最显眼的一条，忽略后台队列顺序

## 推荐的每周节奏

- 周一：拉一次 `Priority Media Queue`
- 周二到周四：补前 5 条
- 周五：检查首页 / Explore / 分类页结果

这样我们就能把“媒体质量”当成持续运营动作，而不是临时救火。
