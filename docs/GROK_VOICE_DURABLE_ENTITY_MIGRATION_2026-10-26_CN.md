# Grok Voice 耐久产品实体归并记录

日期：2026-10-26（北京时间）

## 结论

- 保留 Tool ID `a5691eb1-64d8-45d0-ba4d-b991c0018bfd`。
- 将版本绑定实体 `grok-voice-3-0` 原位归并为耐久产品实体 `grok-voice`，公开名称改为 `Grok Voice API`。
- `Grok Voice 3.0` 保留为当前 speech-to-speech 模型 Claim，不再作为独立工具身份。
- 不与消费端 `/ai/grok` 合并；二者产品表面和用户任务不同。
- 生命周期继续为 `published`，页面质量状态继续为 `continue_index`，未新增索引批准。

## 依据与边界

- 耐久产品入口：`https://x.ai/api/voice`。
- 当前模型页：`https://docs.x.ai/developers/models/grok-voice-3.0`。
- 现有价格、延迟、基准、安全和账户账单限制均保留；公开价格仍是有日期的公共证据，不泛化为账户结账保证。
- 生产编辑同时保留 EN/CN 内容、既有 `zh/tw` 键、市场验证快照、Decision evidence 和索引状态。
- 旧相对素材地址仅规范化为同源绝对 URL，素材文件和权利状态未改变。

## 交付与验证

- Admin 防损修复：`7c60f408`。无关编辑不再覆盖旧版 market validation；本地化编辑保留未修改语言键。
- canonical/redirect 修复：`1d76282c`。`grok-voice-3-0` 通过既有通用机制永久重定向至 `grok-voice`。
- 独立差分 QA：`01a1788e-c83c-7322-8ab1-1023ab895f1e`，最终 `QA_PASS`。
- 通过：`test:tool-route-aliases`、TypeScript、一次完整 build。
- 生产 smoke：
  - `/ai/grok-voice-3-0` -> `308 /ai/grok-voice`。
  - `/cn/ai/grok-voice-3-0` -> `308 /cn/ai/grok-voice`。
  - 新 EN/CN 页面均为 200、自 canonical、无 `noindex`。
  - 两页均回读同一 Tool ID，并可见 `Grok Voice 3.0` 模型 Claim。
  - sitemap 新路径 2 条、旧路径 0 条。

## 回滚边界

若生产出现实体或路由异常，使用同一 Admin 记录把 slug、标题、内容、官网和素材 URL 恢复到本记录前像，再撤销 `grok-voice-3-0` 路由别名。不得新建第二个 Tool ID，也不得合并到 `/ai/grok`。
