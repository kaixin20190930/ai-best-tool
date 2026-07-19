# Editorial 真实复核队列

更新时间：2026-07-18

这份队列只记录需要人工补充的真实复核，不把模板文案、脚本生成内容或统一日期当作编辑证据。

## 当前基线

- 生产 `tools` 表共 25 条记录。
- 完整 editorial 复核：0 条。
- 部分 editorial 记录：0 条。
- 当前后台可通过 `Editorial pending` 筛选查看待处理记录。
- 复核完成标准：复核日期、复核人、至少一份英文或中文摘要齐全。

## 数据库工具队列

| 工具 | 官方 URL | 状态 | 需要补充 |
| --- | --- | --- | --- |
| adobe | https://www.adobe.com/home | 待复核 | 官方价格/功能核查、编辑判断、核查日期 |
| aigirl-best | https://aigirl.best | 待复核 | 官方功能核查、适用边界、核查日期 |
| anime-girl-studio | https://animegirl.studio/ | 待复核 | 官方功能核查、内容边界、核查日期 |
| anthropic | https://claude.ai/login?returnTo=%2F%3F | 待复核 | 官方入口核查、产品定位、核查日期 |
| artiversehub-ai | https://artiversehub.ai/ | 待复核 | 官方功能核查、编辑判断、核查日期 |
| character_ai | https://character.ai/ | 待复核 | 官方功能核查、适用边界、核查日期 |
| chatgpt-mac | https://apps.apple.com/us/app/chatgpt/id6448311069 | 待复核 | App 版本/价格核查、适用边界、核查日期 |
| deepl | https://www.deepl.com/translator | 待复核 | 官方价格/语言支持核查、编辑判断、核查日期 |
| gemini | https://gemini.google.com/ | 待复核 | 官方功能/额度核查、编辑判断、核查日期 |
| gpt_4o | https://chatgpt.com/?oai-dm=1 | 待复核 | 官方模型入口核查、适用场景、核查日期 |
| honeydo | https://apps.apple.com/us/app/honeydo-speak-snap-and-shop/id6473463998?platform=iphone | 待复核 | App 功能/价格核查、编辑判断、核查日期 |
| notion | https://www.notion.so/ | 待复核 | 官方计划/协作能力核查、编辑判断、核查日期 |
| openai | https://openai.com/ | 待复核 | 官方产品范围核查、编辑判断、核查日期 |
| poe | https://poe.com/ | 待复核 | 官方模型/额度核查、编辑判断、核查日期 |
| runtime | https://www.producthunt.com/products/runtime | 待复核 | 官方产品入口核查、编辑判断、核查日期 |
| salesforce_einstein | https://www.salesforce.com/jp/?ir=1 | 待复核 | 官方产品/企业边界核查、编辑判断、核查日期 |
| shop_your_ai_powered_Shopping_assistant | https://shop.app/ | 待复核 | 官方功能核查、适用场景、核查日期 |
| shutterstock | https://www.shutterstock.com/ | 待复核 | 官方计划/素材能力核查、编辑判断、核查日期 |
| sora | https://openai.com/index/sora/ | 待复核 | 官方可用性/限制核查、编辑判断、核查日期 |
| suno_aI | https://suno.com/ | 待复核 | 官方计划/生成限制核查、编辑判断、核查日期 |
| tattooai-design | https://tattooai.design | 待复核 | 官方功能/内容边界核查、编辑判断、核查日期 |
| undressing_ai | https://undressing.ai/ | 待复核 | 官方内容边界/安全风险核查、编辑判断、核查日期 |
| viggle | https://www.viggle.ai/ | 待复核 | 官方功能/额度核查、编辑判断、核查日期 |
| voker | https://www.producthunt.com/r/p/1146493?app_id=339 | 待复核 | 产品官方入口核查、编辑判断、核查日期 |
| woy-ai | https://woy.ai | 待复核 | 官方目录定位核查、编辑判断、核查日期 |

## GSC 高曝光页的数据源缺口

GSC 基线中的 `/ai/fathom` 和 `/ai/pipedream` 当前不在生产 `tools` 表的 25 条记录中。它们的页面信号来自代码中的静态增强逻辑和历史脚本，不能通过后台 editorial 表单完成复核。

处理顺序：

1. 先确认生产环境这两个 slug 的实际数据来源和发布状态。
2. 把复核字段接入该数据源，或明确将它们迁移为可管理的工具记录。
3. 只有完成真实官方核查后，才填写日期、复核人和摘要。

可重复执行数据源检查。检查会分别报告“生产页面是否存在”和“当前连接数据库是否有可管理来源”：

```bash
pnpm run seo:priority-source-audit
pnpm run seo:priority-source-audit -- --strict
```

默认模式只输出警告，不阻断部署；`--strict` 用于发布前强制检查。

2026-07-19 复核结果：Fathom / Pipedream 生产页面均可访问，但本地项目的 `.env.production` 没有数据库连接变量，因此本次未执行生产数据库记录判断。不能把线上页面当作已进入 editorial 复核队列；后续需要通过安全环境变量提供生产数据库连接，或将这两个页面迁移到统一 `tools` 数据源。若要检查本地库，显式设置 `SEO_AUDIT_ENV=local`。

## 复核记录格式

- 复核日期：实际完成核查的日期。
- 复核人：个人姓名或明确团队名。
- 摘要：至少说明适合谁、关键限制或实际判断之一。
- 信任备注：可选，记录官方页面、实际试用、用户反馈或 owner 更新来源。
