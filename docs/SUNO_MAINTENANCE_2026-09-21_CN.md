# Suno 索引页维护交付

日期：2026-09-21
状态：代码与无数据库契约检查完成；默认回滚演练因环境未配置 Postgres 连接串而未能连接。本子任务未执行 `--commit`，没有写生产数据库、部署或推送。
范围：仅既有 `suno_ai`（固定 ID `fc8fce43-88ef-4817-ac3f-028231da4b4b`）的已发布、继续索引实体。

## 本轮结论

- 现行官方产品主线为 Free、Pro、Premier。套餐会改变模型、credits、下载、队列、上传、编辑、分轨与商业权利；不在正文冻结短
  期促销或缓存价格。
- 免费套餐歌曲没有商业权利，也没有每月歌曲下载额度。实时额度和功能以 [价格页](https://suno.com/pricing) 为准。
- 官方 [所有权说明](https://help.suno.com/en/articles/2416769) 将“在 Pro 或 Premier 订阅期间创建”作为所有权判断；官方
  [付费权利说明](https://help.suno.com/en/articles/9601665) 则将“订阅期间下载”作为商业使用权授予条件。页面和数据结构将创
  建与下载明确拆为两个时点核对项，不把其中一项推断为另一项。
- 商业使用许可不保证版权保护；该资格由相关司法辖区决定。上传素材、声音和 Voice Model 还必须满足
  [服务条款](https://about.suno.com/terms) 的权利、同意与本人声音限制。
- Google Play 的公开安装/评价信号仅写入 `marketValidation` 以判断市场成熟度；不作为音乐质量、原创性、权利清理或分发接受
  度的真实使用测试。下次事实复核日设为 `2026-10-21`。

## 受保护范围与写入方式

脚本 [refresh-suno-decision-evidence.ts](../scripts/refresh-suno-decision-evidence.ts) 只可修改
`content`、`detail`、`features`、`use_cases`、`tags`、`next_review_date` 与自动时间戳。它锁定固定 ID 和 slug，断言
`published + continue_index`，并在更新后比较受保护字段；因此 canonical、媒体、分类、价格类型和索引决定均不能改变。

默认执行设计为在事务中预演后 `ROLLBACK`；仅 `--commit` 会持久化写入。若发现已有不同的 editorial 复核记录，脚本停止而不是覆盖。
此子任务未运行 `--commit`；本环境缺少有效 Postgres 连接串，因此尚未完成实际连接后的回滚演练。

```sh
pnpm run test:suno-decision-evidence
pnpm exec tsx scripts/refresh-suno-decision-evidence.ts
pnpm exec tsx scripts/refresh-suno-decision-evidence.ts --commit
```

## 未决项

- 特定歌曲的版权资格、第三方素材/声音清权与发行平台接受度取决于事实和司法辖区，不能由本目录页保证。
- 当前官方所有权页与付费权利页分别描述创建和下载时点；实际商业发行前应保留账号记录，并向 Suno 或合格法律顾问确认具体情
  形。
