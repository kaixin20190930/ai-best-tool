# OpenAI 家族历史对象收口

日期：2026-09-06。归属：[质量收尾 RC-07](./QUALITY_CLOSEOUT_IMPLEMENTATION_2026-09-04_CN.md)，不是新的并行计划。

## 结论

| slug | 原问题 | 明确对象 | 处置 | 下次复查 |
| --- | --- | --- | --- | --- |
| `chatgpt-mac` | 非官方 DMG、陈旧套餐/隐私声明，把客户端当独立工具 | ChatGPT 的 macOS 桌面入口 | 官方下载页；`monitor`；后续评估并入 ChatGPT 主记录 | 2026-10-06 |
| `gpt_4o` | 把模型当 ChatGPT 产品，旧价格及无依据支持/合规声明 | OpenAI API 模型；已退出 ChatGPT、API 仍可用 | 官方模型页；`monitor`；不作为活跃 ChatGPT 产品推荐 | 2026-10-06 |
| `openai` | 把公司/品牌包装成单一工具 | 公司及产品家族记录 | 保留历史说明；`monitor`；引导用户选择具体产品 | 2026-10-06 |
| `sora` | 2024 发布文案仍按活跃工具展示 | 已停止网站/应用服务的历史产品；API 有停止排期 | 停服说明；`monitor`；不参与活跃推荐 | 2026-09-25 |

本次保留四个原 slug 和历史账户关系，不创建新 canonical、不做 301、不删除记录。`monitor` 通过既有索引门禁产生 noindex、退出 sitemap 和 reviewed 推荐；不是把事实纠错等同于市场验证。

## 官方依据

- ChatGPT 官方下载：`https://chatgpt.com/download/`；macOS 帮助：`https://help.openai.com/en/articles/9275200-downloading-the-chatgpt-macos-app`。
- GPT-4o API 模型：`https://developers.openai.com/api/docs/models/gpt-4o`；退出 ChatGPT：`https://help.openai.com/en/articles/20001051`。
- OpenAI 公司入口：`https://openai.com/`。
- Sora 当前状态：`https://openai.com/sora/`；安全说明：`https://openai.com/index/creating-with-sora-safely/`。

来源只支持对应范围。未执行真实付费账户操作，不填写效果、市场分数、HIPAA/ISO 或人工支持承诺。

## 数据保护

脚本：`scripts/isolate-openai-family-scope.ts`。四条使用固定 UUID 与变更前 `content + detail` MD5；默认事务回滚，只有 `--commit` 写入。允许字段仅为 title、url、content、detail、page_quality_status、next_review_date、updated_at；其余字段通过 JSON 深比较保持不变。

正式写入后 `--status` 四条均为 `alreadyApplied: true`，`pageQualityStatus: monitor`；inventory 从19降为15。重复运行不会依赖新 MD5 覆盖，也不会刷新时间。

## 验收

- `pnpm run test:legacy-tool-scope`：通过；覆盖双语、静态 fallback、数据库 presenter、官方 URL、危险旧声明排除。
- `pnpm run isolate:openai-family-scope -- --check`：通过。
- `pnpm run isolate:openai-family-scope`：回滚演练通过，四条索引决策均由 true 变 false。
- `./node_modules/.bin/tsc --noEmit`：通过。
- `pnpm run build`：通过；AdSense、编译、类型检查、44 个静态页生成完成。
- `SEO_BASE_URL=https://aibesttool.com pnpm run test:legacy-tool-scope -- --smoke`：通过；中英文四个本组页面、Adobe/Salesforce、comparison 与 Claude 对照页均通过 200、唯一 H1、scope notice、索引边界、canonical、无单软件 schema 和官方链接检查。部署提交 `b0dac6aa`。

## 下一步

RC-07 剩余13条：先做普通对象10条，再处理安全/合规边界3条。Adobe/Salesforce 仍属于 RC-05C 数据依赖，不混入本组完成数。任何对象必须先完成身份、官网、运行状态和证据核对，再决定保留、补充、隔离或待数据。
