# Comparison / Alias 巡检（2026-07-28）

## 执行范围

- 路径：`app/[locale]/(with-footer)/guides/*/page.tsx`
- 对象：页面名包含 `-comparison` 或 `alternatives-comparison` 的所有文件
- 目标：确认 comparison 与 alias 路由在索引策略上不会回归

## 检查项

1. 是否启用 noindex（`getNoindexMetadata` 或 `buildComparisonMetadata`）
2. 是否有可复核的 canonical 回流策略（部分页面通过基页 `buildComparisonPageData`/`guideHref` 实现）
3. 是否有模板化元数据覆盖与结构化信号

## 结果

- 命中的 comparison 页面总数：145
- 检查结论：未发现未启用 noindex 的 comparison 页面
- 说明：全部 `comparison` 页面要么直接使用 `buildComparisonMetadata`，要么显式叠加 `getNoindexMetadata`。
- 风险项：无

## 后续动作

- 继续把本次巡检结果纳入 P0 周报
- 后续有新 comparison/alias 页面增加时，必须同步包含 noindex 收口元数据
