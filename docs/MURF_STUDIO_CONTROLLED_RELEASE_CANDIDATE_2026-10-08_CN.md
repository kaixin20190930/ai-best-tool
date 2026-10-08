# Murf Studio 受控发布候选

日期：2026-10-08（Asia/Shanghai）
状态：`RELEASED_MONITOR`；已于 2026-10-08 在独立 QA PASS 后完成受控生产提交，继续 `noindex` 且不进入 sitemap。

## 继承证据与实体门禁

沿用 [身份、素材与别名 QA_PASS 收口](./MURF_STUDIO_IDENTITY_MATERIAL_CLOSEOUT_2026-10-08_CN.md)：唯一产品为 Murf Studio，vendor 为 Murf，slug 为 `murf`；三语言旧 `murf-ai` 路径永久 308 到相应 canonical；自有中性封面及 Murf Academy 官方 Studio 教学视频已经部署。本轮未重做这些 PASS，也不创建 Murf API、Dub、Agents 实体。

七项实体门禁均通过：身份、唯一 canonical、重复意图、核心功能真实性、素材与法律安全、无明显误导、页面内容充分。公开内容只论 Studio 浏览器脚本旁白、时间轴与人工审听；纠错和 owner 更新入口由现有工具详情页 `ToolFeedbackBar` 提供，提交进入人工审核。未把官方视频表述为本站实测。

生产只读查重于 `2026-10-08T07:46:50.776Z` 返回：Neon Murf 产品匹配 0，Supabase Murf profile 0；`/ai/murf`、`/cn/ai/murf`、`/tw/ai/murf` 均为 200、自指 canonical、`noindex, follow`；三条旧路径均为 308；sitemap 126 URL、Murf 匹配 0。ElevenLabs 生产内容仍有旧 `murf-ai` 比较 slug，但其点击经已部署别名到达 `/murf`；本候选不为改写这个既有消费者增加生产写入。

## Claim 级 HOLD

[门禁 manifest](../data/collection/murf-controlled-release-preaudit-2026-10-08.json) 保留六条 Claim HOLD：Studio 结账价格 `unknown`（省略金额，10-15 复查）；账号套餐权益 `conditional`（限定账号和套餐，10-22 复查）；项目/VGT 额度 `conflict`（定价卡与 Workspace 帮助冲突，10-15 复查）；账户终止及删除 `conflict`、既有音频取回 `conflict`（隐私/安全/取消页面范围不同，10-22 复查）；普通 Studio 训练范围 `unknown`（不外推 Enterprise，10-22 复查）。所有冲突在[三语言发布稿](../data/collection/murf-release.json)标明限制、官方来源及下次复查日，不承诺精确价格或项目额度。公开稿中的 30/90 天是带来源的冲突说明，不是统一删除期限或取回承诺。实体层 `READY_MONITOR` 不解除任何 Claim HOLD。

## 受控执行与验证

- 固定实体 ID `8f2d4b5e-7481-4bb8-9f21-8d2de1c0f631`。发布路径仅允许 `published + monitor`，不批准 index/sitemap 或 Task/Capability/Fit。
- 生产 preflight 采用只读事务检查名称、标题、域名和固定 ID；重复实体或已占用 ID 整体拒绝。候选写入使用事务锁，Murf 冲突行不可更新，必须恰好插入一行；防止覆盖受保护字段。
- `--phase=preflight --online` 通过数据库唯一性、EN/CN canonical、noindex 与 sitemap 排除；跨库及三语言别名只读脚本通过。未运行 `--commit`。
- 默认 `--phase=release` 在真实库事务内插入、完整回读 EN/zh/cn 正文、features、媒体、复查日和 monitor 状态，然后 `ROLLBACK`；重复执行两次通过，随后 preflight 仍为零实体。独立 QA 对提交 `dd556d07` 返回 `QA_PASS` 后，总控执行一次显式 `--commit`，创建唯一 Murf Studio 实体 `8f2d4b5e-7481-4bb8-9f21-8d2de1c0f631`。
- `test-murf-controlled-release` 覆盖实体失败、冲突 Claim 缺限制/来源/复查日、精确暴露、重复 slug/域名、固定 ID 占用、零行/多行插入及受保护行拒绝。Claim policy、candidate-release 专项、TypeScript、Prettier、`git diff --check` 与一次完整 build 均通过。运行时发布路径有增量修改，因此执行了这次 build。

线上已存在唯一 `murf` 工具实体，状态为 `published + monitor/noindex`。六项 Claim HOLD 继续有效；未执行迁移、索引批准、sitemap 扩张或关系创建。
