# Murf Studio 身份、素材与别名收口

交付单元：`MURF-STUDIO-IDENTITY-MATERIAL-01`

日期：2026-10-08（Asia/Shanghai）

状态：**受控候选包已准备；整体 HOLD；productionWrites=0**

## 唯一实体与 URL

- 唯一产品实体：**Murf Studio**；vendor：**Murf**。
- canonical：`/ai/murf`、`/cn/ai/murf`、`/tw/ai/murf`。
- 历史 `/ai/murf-ai`、`/cn/ai/murf-ai`、`/tw/ai/murf-ai` 在本地应用路由表中永久映射到对应语言的 Murf canonical。详情页使
  用 Next.js `permanentRedirect`，预期 HTTP 308；须由总控集成后做生产只读验收。
- ElevenLabs 三语发布材料的自然语言比较链接和结构化 alternative slug 均已指向 `murf`。旧生产读回仍作为 2026-10-07 的历史
  快照，生产消费者是否已同步须在发布日复核。
- Murf、Murf API、Murf Dub、Murf Agents 不作为独立产品实体；Studio 权益、套餐、隐私、能力不外推至这些产品。

## 素材与内容包

- 封面由 AI Best Tool 新绘制，为中性身份图，不是 Murf 官方 logo 或产品截
  图：`public/images/tool-media/murf-studio-editorial-cover.svg`。
- 官方预览使用 Murf Academy 页面直接列出的 **Getting Started with Murf Studio** 视频
  embed：`https://www.youtube-nocookie.com/embed/M2-5OhbVwaE`。播放使用 YouTube 托管，不下载、自托管、处理或热链其缩略
  图；页面须标注官方来源，并明确它是教学视频，不是本站实测结果。
- EN/CN/TW Tool Intelligence 与 Decision 文案及图片/视频字段已在候选包中整理。正文保留 VGT 修订消耗、付费导出、广播权需
  额外确认、编辑席位限制、项目/额度冲突、配音审听和音视频同步人工检查等选择相关事实。
- 当前官方定价页只能读取到 JavaScript 应用外壳，账户结账/当前账号权益未验证，因此没有将价格或观察到的额度写成发布承诺。
  账户终止和删除的 30/90 天范围、取消与协议终止后的音频取回范围仍有官方冲突；普通 Studio 的训练/退出范围仍未知。

## 本轮 delta 与剩余 HOLD

本轮只复核素材源、Studio 操作入口、免费试用、价格页可读性及删除/取回冲突；沿用此前独立市场研究和不受影响的已复核事实，没
有重跑八项门禁。

- 已关闭本地变更：唯一 slug 别名映射、三语 comparison 路径、官方 embed 溯源、中性自有封面和受控内容包结构。
- **HOLD 官方权益**：目标 Studio 账号当前套餐/地区权益、项目配额、终止/删除与导出边界需账户或适用合同核验。
- **HOLD 内容验收**：独立三语内容与视觉 QA 尚未完成；公开页上的纠错/owner 更新入口需在最终呈现中验收。
- **HOLD 生产别名**：总控集成后须逐一读回六个新旧本地化路径，确认旧路径 308 到匹配语言 canonical、页面仅保留一个
  self-canonical，并确认生产比较内容不再输出旧 slug。
- 索引、sitemap、Task/Capability/Fit 关系均未批准或写入；候选包不是生产发布批准。

## 10 月 8 日一方复核来源

- [Murf Academy](https://murf.ai/academy/home)：列出 Murf Studio 教学视频及 YouTube embed。
- [Getting familiar with the Studio](https://help.murf.ai/murf-studio-basics)：确认 Studio 脚本、语音、媒体、时间轴、预
  览和导出流程。
- [Free Trial Features](https://help.murf.ai/is-murf-free-to-use)：当前帮助页仍说明 10 分钟 VGT、无下载、无需银行卡。
- [Pricing](https://murf.ai/pricing)：JavaScript-only，未取得账号级现行价格及权益。
- [Privacy Policy](https://murf.ai/legal/privacy-policy)：仍标注 2023-11-03；账号关闭删除期限与安全页范围冲突。
- [Security & Trust](https://murf.ai/security)：当前仍写明协议结束后的最长 90 天音频取回，以及复杂删除请求的最长 90 天；
  与取消、账户终止和隐私政策条款的适用关系未消歧。

## 验收边界

- 局部验证只覆盖 Murf 材料结构、共享路由别名和 ElevenLabs 的直接内容消费者。
- 全仓 TypeScript 与 Next bundle 编译通过；一次 build 在静态预渲染 `/api/monitor/trial-reminders` 时因本地未配置
  `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 失败。未提供生产凭据，也未触发生产数据库访问。
- Murf prerelease、路由别名、ElevenLabs 专项、Prettier 与 `git diff --check` 通过；没有执行数据库、生产写入、索引或
  sitemap 操作。
- 预期最终状
  态：`publicReleaseApproved=false`、`indexReleaseApproved=false`、`relationshipCreationApproved=false`、`productionWrites=0`。
