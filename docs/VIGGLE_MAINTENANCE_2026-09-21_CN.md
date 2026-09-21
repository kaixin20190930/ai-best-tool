# Viggle AI 索引页到期维护交付

日期：2026-09-21
状态：代码与无数据库契约检查完成；未执行 `--commit`，没有生产数据库写入、推送或部署。
范围：仅既有 `/ai/viggle` canonical 对应实体 `a838bc9e-6653-4608-86d5-144cb703075b`（slug `viggle`）。

## 保留的边界

- 目标实体必须始终为 `published + continue_index`；本维护不改变 URL、slug、canonical、分类、媒体、价格类
  型、robots、sitemap 或索引批准。
- 脚本仅允许写入 `content`、`detail`、`features`、`use_cases`、`tags`、`next_review_date` 与自动时间戳。写后会比较其他字
  段，并重新断言索引仍为允许状态。
- 默认数据库模式在事务中演练并 `ROLLBACK`；只有显式 `--commit` 才会写入。若已有不同的 `features.editorial.reviewedAt`，
  停止并要求审计，绝不覆盖较新的编辑记录。

## 2026-09-21 官方来源结论

- 当前网页套餐为 Free、Pro、Live、Max。价格页当日显示 Free `$0`，以及 Pro `$7.99`、Live `$15.99`、Max `$63.99` 的月付促
  销金额；免费档为每天 5 条视频、1 次并发和 7 天存储，付费档提高 credits、并发、存储、模型和去水印能力。费用与产品能力会
  变动，购买前必须回到实时价格与结账页。
- API 是独立计费路径。官方文档说明 1 credit 为 `$0.01`，新账户有 100 个免费 API credits；参考视频/图像生成要求 API key、
  异步轮询，签名结果链接有效期为 1 小时。
- 官方条款覆盖网页、iPhone/Android 应用、动画工具、Viggle Live、PINOC 和 API。上传的肖像、视频、音乐和直播内容需要用户自
  己取得必要权利、许可与同意；平台可以移除名人肖像、侵权音乐或违规内容。生成或换人能力不构成第三方素材清权。
- 用户内容被视为非保密，条款授予 Viggle 广泛的使用许可；API 内容与付费用户期间内容存在明确的训练/微调例外，但这不等于全
  面保密保证。选择共享可使其他用户使用内容；用户应自行备份，且不得移除水印或法律标记。
- 本轮只核验官方一手资料，因此结构化 `marketValidation` 明确标记为 `unverified`，分数为 0；不把厂商的采用宣传、logo 或案
  例当作独立市场证据，也不声称亲自测试。

官方来源：

- [产品与平台入口](https://viggle.ai/)
- [网页套餐与限制](https://viggle.ai/pricing)
- [Terms of Use（2026-08-26 更新）](https://viggle.ai/terms-of-use)
- [Privacy Policy（2026-08-26 更新）](https://viggle.ai/privacy-policy)
- [API 计费与留存](https://docs.viggle.ai/v1/pricing)
- [API Reference-to-Video 快速开始](https://docs.viggle.ai/v1/guides/quickstart-reference-to-video)

## 执行与回滚

```sh
pnpm run test:viggle-decision-evidence
pnpm exec tsx scripts/refresh-viggle-decision-evidence.ts --check
pnpm exec tsx scripts/refresh-viggle-decision-evidence.ts
pnpm exec tsx scripts/refresh-viggle-decision-evidence.ts --status

# 仅在明确取得生产写入授权后：
pnpm exec tsx scripts/refresh-viggle-decision-evidence.ts --commit
```

默认运行会回滚；数据库事务失败也会回滚。生产提交后的回退应由维护者从已验证的前一版编辑 payload 以同一受保护字段集恢复，
且先做 read-only 备份/核对；不得通过修改 slug、canonical 或索引状态回退。

## 下次复核与未决风险

- 下次事实复核：`2026-10-21`；若套餐、条款、隐私或 API 计费先变化，应提前复核。
- 未决：特定人物、音乐、品牌或其他第三方素材是否可用于特定商业项目，仍取决于权利链、同意、适用法律和实际发布渠道；本目录
  不提供法律清权结论。
- 未决：当前维护没有独立质量、延迟、可靠性或市场采用测试；这些不能由官方资料代替。
