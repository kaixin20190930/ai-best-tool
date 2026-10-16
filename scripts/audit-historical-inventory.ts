import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { buildHistoricalInventory, type CoverageInput, type InventoryTool } from './historical-inventory';

function option(name: string) {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main() {
  if (process.argv.slice(2).some((arg) => !/^--(date|out|report|coverage)=/.test(arg)))
    throw new Error('Unsupported option');
  const today = option('date') || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || Number.isNaN(Date.parse(today))) throw new Error('Invalid date');
  const coverage = option('coverage')
    ? (JSON.parse(fs.readFileSync(option('coverage')!, 'utf8')) as CoverageInput)
    : undefined;
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  let rows: InventoryTool[];
  try {
    await client.query('BEGIN READ ONLY');
    const result = await client.query<InventoryTool>(`SELECT id,name,status,page_quality_status,next_review_date::text,
      url,features,category_id,image_url,thumbnail_url,content,detail,pricing,tags FROM public.tools ORDER BY name,id`);
    rows = result.rows;
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
  const inventory = buildHistoricalInventory(rows, today, coverage);
  const json = `${JSON.stringify(inventory, null, 2)}\n`;
  if (option('out')) {
    const target = path.resolve(option('out')!);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, json);
  } else console.log(json);
  if (option('report')) {
    const lowRisk = inventory.items.filter((item) => item.action === 'existing_tool_freshness_batch');
    const owner = inventory.items.filter((item) => item.action === 'owner_authorization_required');
    const manual = inventory.items.filter((item) => item.action === 'manual_identity_review');
    const report =
      `# 已收录工具统一库存收敛报告\n\n日期：${today}。生产数据库只读，写入 0。正式 Tool ID：${inventory.totalToolIds}。\n\n` +
      `## 状态\n\n${Object.entries(inventory.counts)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n')}\n\n` +
      `Coverage：${inventory.coverage.status}；只有可靠且近期的逐 URL 结果才判断 Google 未收录，未提供不能当作零。\n\n` +
      `## 后续分流\n\n- 低风险定期更新候选 ${lowRisk.length} 条：${lowRisk.map((item) => item.slug).join('、') || '无'}。需逐项核变化事实与来源，不自动写入。\n` +
      `- 身份/实体证据人工核查 ${manual.length} 条：${manual.map((item) => item.slug).join('、') || '无'}；核查不等于自动归档。\n` +
      `- 需 Owner 授权的合并/归档/重定向候选 ${owner.length} 条：${owner.map((item) => item.slug).join('、') || '无'}。这里只是候选，未执行动作。\n` +
      '- 索引权限变更不在本单元；continue_index 的 Google 状态缺乏逐 URL 证据时保持 unavailable。\n\n' +
      '收敛完毕后只保留新工具收录与已收录工具定期更新；此库存是一次性审计快照，不建立第三条常态队列。\n';
    const target = path.resolve(option('report')!);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, report);
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
