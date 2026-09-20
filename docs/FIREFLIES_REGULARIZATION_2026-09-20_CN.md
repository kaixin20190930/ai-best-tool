# Fireflies 既有实体正规化交付

日期：2026-09-20  
状态：已完成  
索引状态：`published + monitor/noindex`

## 为什么不是新增发布

执行发布前检查时确认，Fireflies 已在会议笔记 Pilot 中建立唯一生产实体 `57b270b9-78cf-41f8-8b74-dec46400cd65`，canonical slug 为 `fireflies`。旧路径 `/ai/fireflies-ai` 已永久重定向到 `/ai/fireflies`。因此本轮改为对同一实体进行内容正规化，未增加数据库记录、canonical URL 或 sitemap URL。

## 本次更新

1. 复核 Free、Pro、Business、Enterprise 的月付/年付席位价格与席位定义。
2. 将高级 AI credits 与核心订阅分开说明，记录动态扣费、团队共享、不结转、不退款和 Auto-Upgrade 边界。
3. 明确 7 天 AI-credit 试用会转为付费，并要求团队部署前核对默认自动升级设置。
4. 记录 Free/Pro/Business/Enterprise 存储差异、外部上传月度限额和超额费。
5. 区分 bot、Chrome 扩展、移动端和桌面采集，同时保留录制告知与司法辖区同意责任。
6. 复核 2026 隐私政策、第三方零留存、非训练承诺、Business/Enterprise DPA 范围和 service data 边界。
7. 根据官方条款明确输出可能存在重大不准确，不能直接用于承诺、人事、争议或受监管工作。
8. 保留 Otter.ai、Fathom 和原生会议笔记的比较路径，补齐七项比较维度和九项限制。
9. 本地 Fi 与封面图明确标注为 AI Best Tool 编辑素材，不冒充官方 Logo 或产品截图。

## 流程保护

- 统一候选流水线新增 `existingEntityExpected` 门禁，只允许唯一 ID、canonical slug、状态和质量状态完全匹配的实体刷新。
- 写入由 `ON CONFLICT (id) DO UPDATE` 完成，保留实体 ID 和所有外部关系。
- 旧 `migrate-fireflies-tool.ts` 只保留历史检查，写入口已退休，避免再次运行覆盖新内容。
- 更新前完成生产只读 preflight、事务 rollback 和会议 Pilot 关系复验；更新后再次执行同样的关系检查。

## 验收结果

- Fireflies 专项、alias、MEASURE-02、SEO 架构、计划一致性、索引契约、TypeScript 和完整 build：通过。
- 生产事务 `ROLLBACK`、`COMMIT`、在线 verify：通过。
- 独立生产审计：0 个失败，见 `reports/releases/2026-09-20/production-fireflies-regularized.json`。
- 会议 Pilot：3 个 published profiles、3 个 task fits、6 条证据关系保持完整。
- `/ai/fireflies` 为 200；`/ai/fireflies-ai` 为 308；页面继续 `noindex` 且不在 sitemap。
- 全站索引基线保持 63 条工具、50 条公开、13 条索引、37 条暂停索引、13 条未公开；页面检查 0 个问题。

## 后续

下次事实复核为 2026-10-20。最短观察期结束不代表自动索引，仍需独立检查搜索意图、内容信号、重复页面、GSC 反馈和当周索引预算。当前成熟候选缓冲已消耗完，下一项是建立新的 14-21 个候选池。
