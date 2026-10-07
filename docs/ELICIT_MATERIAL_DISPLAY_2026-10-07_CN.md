# ELICIT-MATERIAL-DISPLAY-01 交付记录

核查日：2026-10-07；生产发布日：2026-10-08。基于已持久化的 Elicit 七项 PASS；本单元只处理剩余素材/内容展示差分。

## 生产交付结果

2026-10-08 已完成素材部署、生产只读 preflight、事务 rollback、显式 commit 与本地化读回。生产唯一实体 ID 为
`c2e3a5f4-cf8e-4564-8563-093053962ed1`，状态固定为 `published + monitor/noindex`，下次复核日为
`2026-10-14`。Elicit 不进入 sitemap，不批准 Task/Capability/Fit 关系，也不改变站点索引额度。`cn` 字段已按现行
locale 契约统一为简体中文；繁体页面继续使用既有回退机制，不虚构单独的数据库 `tw` 字段。

## Change set（开工锁定）

1. 素材权利策略：公开 monitor/noindex 可用本站中性身份素材加可核验的第一方官方 embed；不把中性素材称为官方 logo、截图或
   质量证据。无授权素材且无官方 embed 时维持 HOLD。
2. 真实产品预览：直接核对 Elicit 官方频道、视频当前内容和嵌入许可；仅嵌入官方播放器，不复制、下载、自托管、裁切或重新包
   装视频与缩略图。
3. 已上线的 `profile_correction` / `ownership_update` 入口：引用生产可见路径作为 content gate 差分，不重测入口实现。
4. 统一受控发布器最小支持 `video_url` 写入、更新及回读；不新增数据库列或迁移。
5. Elicit 发布包及对应最小专项测试；只准备 exact-commit 独立 QA，不作生产写入、push、索引或关系放行。

## 素材与真实展示结论

- Elicit
  [帮助中心频道页](https://support.elicit.com/en/articles/14757553-elicit-s-youtube-channel-tutorials-tips-news)把
  `@elicit-research` 指向其官方 YouTube 频道。[Elicit Research Agent](https://www.youtube.com/watch?v=gHtxaBhA1IA) 页
  面、YouTube oEmbed 与播放器元数据于 2026-10-07 直接核对：发布者 Elicit、发布时间 2026-08-05、时长 45
  秒、`playabilityStatus=OK` 且 `playableInEmbed=true`；隐私增强 `/embed/gHtxaBhA1IA` 返回 HTTP 200。视频说明展示
  Research Agent 查找多种来源、生成有引用的报告/表格等输出。它是官方视频演示，不是本站实测，也不能替代对当前套餐、准确率
  和隐私条款的单独核验。发布当天必须重查嵌入状态。
- `imageUrl` 使用本站新制中性 research identity tile；`thumbnailUrl` 使用本站新制中性 editorial cover。两者无 Elicit 官
  方 logo、截图、界面仿制或紫色 `El` 占位符。候选 `features.media` 逐项标注 AI Best Tool 所有、非官方、非产品截图；三语
  正文也明确告知。旧 `elicit.svg` 与 `elicit-cover.svg` 仍被排除，没有引用或修改。
- `videoUrl` 指向 `https://www.youtube-nocookie.com/embed/gHtxaBhA1IA`，作为 **first-party official embed**。只调用官方
  播放器；不下载、自托管、裁切、hotlink 缩略图或重新包装视频。一般条款没有给本站复制官方 logo/截图的明确许可，因此没有使
  用这些资产。

按更新后的[收录规范](./BEST_DIRECTORY_POSITIONING_AND_INTAKE_CN.md)，中性平台自有身份素材加已核验第一方 embed 足以解除公
开 `monitor/noindex` 的**素材门禁**。索引门禁没有随之通过；中性素材不是官方资产或质量证明。
原[预审包](../data/collection/elicit-prerelease-2026-10-07.json)保留其历史 HOLD 快照，新
的[发布包](../data/collection/elicit-release.json)和[受控预审](../data/collection/elicit-material-display-preaudit-2026-10-07.json)承
载本次差分。

## 已上线纠错和 owner 更新入口

生产 `/ai/claude` 可见带完整上下文的 `profile_correction` 和 `ownership_update` 链接，分别进入
`/developer/listing?intent=profile_correction…#claim-form` 与 `/developer/listing?intent=ownership_update…#claim-form`。
统一工具页代码会为发布后的 Elicit 自动提供相同入口，并附带 `toolId`、`slug`、`website`、`sourcePath`；提交仍进人工审核。
这里引用的是已发布的共享入口，不声称 Elicit 已有 owner 认证、用户评价或已收到纠错，也不重新测试表单全链路。

## 受控发布边界与验证

统一发布器仅扩展现有 `tools.video_url` 字段，覆盖 insert、已有行更新、视频 URL 限制和事务内回读；未新增列或迁移。未提供
新视频的旧条目在更新时保留原值。Elicit 预审在发布前保持 `productionWriteApproved=false`；controller 已完成
release-day preflight、两个素材 hash 核对、事务 rollback、exact-commit 独立 QA 与显式 `--commit`。发布结果为
`published + monitor/noindex`；index、sitemap、relationship 均为 false。

验证等级
C：`pnpm exec tsx scripts/test-elicit-material-display.ts`、`pnpm run test:candidate-release`、`pnpm exec tsc --noEmit`、`git diff --check`。
未修改页面渲染、路由或构建配置，因此按任务规定不运行完整 build。测试数据库指向故意不可达的本机地
址；开发与独立 QA 阶段 `productionWrites=0`。素材门禁已解除，controller 的 preflight、rollback、commit 均已完成。
