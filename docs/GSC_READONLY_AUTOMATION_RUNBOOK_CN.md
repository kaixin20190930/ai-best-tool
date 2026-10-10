# GSC Search Analytics 只读采集手册

## 范围

`pnpm run gsc:fetch-readonly` 只执行 OAuth token refresh、`sites.get` 和 `searchAnalytics.query`。它不提交 URL、不改 sitemap、不写数据库，也不改变索引决策。采集 Google Search 的最近完整日期，以及截至该日期的 7 天、28 天总量和 date/page/query 明细。

Google Search Console API 的日期采用美国太平洋时间。脚本同时查询 `dataState=all` 的 `first_incomplete_date` 和 `dataState=final` 的可用日期；只选不晚于昨天、严格早于未完成边界的最终日期。没有完整日期时直接失败，不把未完成数据当作完整周报。

## 一次性 OAuth 授权

1. 在 Google Cloud Console 创建项目，启用 **Search Console API**，配置 OAuth consent screen。授权用的 Google 账号必须对目标 GSC property 有读取权限。
2. 创建 **Web application** OAuth client。若使用 [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) 获取 refresh token，把 `https://developers.google.com/oauthplayground` 加入该 client 的 Authorized redirect URIs。
3. 在 Playground 设置中选择 **Use your own OAuth credentials**，填入该 client ID/secret，选择 offline access。只授权 `https://www.googleapis.com/auth/webmasters.readonly`，不要授权可写的 `webmasters` scope。
4. 用有 property 权限的账号完成 consent，交换 authorization code，取得 refresh token。OAuth app 若仍处于 Testing，授权可能在七天后过期；稳定定时运行前须按 Google 的 OAuth 发布规则处理。
5. 将四项值配置在运行机器的私有环境或密钥管理器中，不要写入代码、文档、命令行参数、Git 或对话消息：`GSC_CLIENT_ID`、`GSC_CLIENT_SECRET`、`GSC_REFRESH_TOKEN`、`GSC_PROPERTY_URL`。

`GSC_PROPERTY_URL` 必须与 Search Console 中的 property **精确一致**。Domain property 例子：`sc-domain:aibesttool.com`；URL-prefix property 例子：`https://aibesttool.com/`。两者不能互换。脚本先用 `sites.get` 检查该账号是否有读取权限。

## 运行和输出

```bash
pnpm run gsc:fetch-readonly
```

默认输出在被 Git 忽略的 `.local/gsc/<property-hash>/`，包含完整 JSON 快照和本地 Markdown 报告。文件名由最近完整日期确定，重复运行覆盖同一天的本地文件。快照包含查询词与 URL，视作私有数据，不要提交到 Git。

只有明确需要把**汇总指标**写到仓库文档时，才运行：

```bash
pnpm run gsc:fetch-readonly -- --summary-out docs/GSC_SEARCH_ANALYTICS_SUMMARY_CN.md
```

`--summary-out` 只允许 `docs/` 内的 Markdown 路径，写入内容不包含 page/query 明细。写入后仍须人工 review 再决定是否提交。任何失败应保留上次成功快照，不得把失败解释为零流量。

## 数据解释边界

- 总量由不分维度的 property 查询取得；不要把 page/query 行加总当作总量。页面维度的聚合规则可能与 property 总量不同。
- page/query 请求每页最多 25,000 行，本脚本最多取各维度 50,000 行并标记是否触及本地上限。但 Google 只保证返回部分头部行，**即使没有触及上限也不保证 query 完整**；匿名化查询可能缺失。
- date 维度不含零数据日期。连续日期如有空缺，应标记为未返回，而不是自行填零。
- Search Analytics API **不提供汇总 Coverage / 已索引 / 未索引数量**。Coverage 周报继续使用 GSC 界面导出的 XLSX；URL Inspection 只能检查单个 URL，不能代替汇总 Coverage。
- 该脚本仅采集，不自动修改 `continue_index`、sitemap 或任何 SEO 决策。

## 故障与回退

- `401`：检查 refresh token 是否过期或被撤销、OAuth client 是否匹配。
- `403`：检查 API 是否启用、scope 是否为 `webmasters.readonly`、账号是否有目标 property 权限，以及 API 配额。
- 无完整日期：等待 GSC 数据完成，不生成新的“完整”报告。
- API 不可用、权限失效或配额受限：使用既有 `gsc:weekly-report` 和人工导出的 Performance/Coverage XLSX 流程。不要修改索引状态。

官方参考：[Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)、[Sites get](https://developers.google.com/webmaster-tools/v1/sites/get)、[获取表现数据](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data)、[Search Console API 概览](https://developers.google.com/webmaster-tools/v1/api_reference_index)。
