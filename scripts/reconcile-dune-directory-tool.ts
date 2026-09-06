import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { createAdminClient } from '../lib/supabase/admin';

const id = 'dd8cb6a3-ef78-4747-9075-ebf663290410';
const reviewedAt = '2026-09-06';
const nextReviewDate = '2026-09-20';
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh });

const detailEn = `## What Dune is

Dune is an onchain data platform whose Data Hub lets users query blockchain data with SQL, build visualizations and dashboards, schedule refreshes and alerts, and share or embed results. It also offers APIs, connectors, transformations, and Datashare for teams whose needs extend beyond interactive analysis.

## Best fit

- Onchain analysts who need to answer questions that a fixed market dashboard does not expose.
- Crypto researchers who want reusable queries and evidence behind a thesis rather than a packaged summary alone.
- Product and data teams prepared to own SQL logic, data definitions, refresh expectations, and credit usage.

## Check before choosing

- Basic SQL knowledge is a real adoption requirement for the Data Hub. A large public query library can accelerate a start, but copied queries still need their schema, filters, assumptions, and freshness reviewed.
- Dune products are not interchangeable. Data Hub is aimed at analytic workflows and uses compute-based credits, while Datashare targets warehouse integration with flat subscription fees. Confirm which product the team actually needs.
- Coverage does not imply identical freshness. Dune documents different refresh ranges for EVM, Solana, curated data, and Datashare, so a dashboard should expose its latest successful execution before it supports a time-sensitive decision.
- Query cost depends on compute and workload. Scheduled runs, API use, transformations, writes, and storage can create different credit patterns; estimate cost from a representative workflow instead of treating freemium access as a production budget.
- Public dashboards and embeds are useful for collaboration, but a polished visualization is not proof that its query logic or data interpretation is correct. Review the underlying query before reusing a result.
- Dune can support research and application data workflows, but it does not replace domain judgment, data-quality checks, or a complete warehouse and governance process for every team.

## Decision summary

Choose Dune when custom, reusable onchain analysis is worth learning and maintaining the query layer. Compare it with DefiLlama when broad market scanning is the main task, with Nansen when packaged entity and wallet intelligence is more valuable than query control, and with a direct warehouse or data provider when governed application pipelines are the priority. Before committing, reproduce one important analysis, record data freshness and credit use, and have another person review the query assumptions.

## Sources

- [Dune documentation](https://docs.dune.com/)
- [Products overview](https://docs.dune.com/docs/product-comparison)
- [Data Hub overview](https://docs.dune.com/web-app/overview)
- [Share and embed](https://docs.dune.com/web-app/share)

This is an official-source editorial review, not a claimed hands-on benchmark.`;

const detailZh = `## Dune 是什么

Dune 是链上数据平台。它的 Data Hub 支持用 SQL 查询区块链数据、构建可视化和看板、设置定时刷新与提醒，并分享或嵌入结果；同时还提供 API、connector、数据转换和 Datashare，承接超出交互式分析的团队需求。

## 更适合

- 需要回答固定市场看板无法覆盖问题的链上分析师。
- 希望通过可复用查询为判断提供证据，而不是只消费打包结论的加密研究者。
- 愿意负责 SQL 逻辑、数据定义、新鲜度预期和 credit 用量的产品与数据团队。

## 选择前必须核对

- Data Hub 确实要求基础 SQL 能力。公开查询库可以加快起步，但复用查询时仍要检查 schema、过滤条件、假设和数据新鲜度。
- Dune 的产品不能混为一谈。Data Hub 面向分析工作流并按计算 credit 计费；Datashare 面向数据仓库集成并采用固定订阅费。团队应先确认实际需要哪一种产品。
- 覆盖不代表数据具有相同的新鲜度。Dune 对 EVM、Solana、curated data 和 Datashare 给出了不同刷新范围；时效敏感的判断应显示最近一次成功执行时间。
- 查询成本取决于计算和工作负载。定时运行、API、数据转换、写入和存储可能形成不同 credit 消耗，应通过代表性工作流估算，而不能把 freemium 当作生产预算。
- 公开看板和嵌入便于协作，但漂亮图表不能证明查询逻辑和数据解释正确。复用结论前仍需检查底层查询。
- Dune 能支持研究和应用数据工作流，但不会替代领域判断、数据质量检查，也并非所有团队的完整仓库与治理方案。

## 决策结论

当自定义、可复用的链上分析值得团队学习并维护查询层时，选择 Dune。主要任务是宏观市场扫描时比较 DefiLlama；更看重打包好的实体和钱包情报时比较 Nansen；更看重受治理的应用数据管道时比较直接数据仓库或数据供应商。正式采用前，应复现一项关键分析，记录数据新鲜度和 credit 消耗，并让另一位人员复核查询假设。

## 来源

- [Dune 官方文档](https://docs.dune.com/)
- [产品对比](https://docs.dune.com/docs/product-comparison)
- [Data Hub 概览](https://docs.dune.com/web-app/overview)
- [分享与嵌入](https://docs.dune.com/web-app/share)

本页为官方来源核验式编辑分析，不声称已完成产品实测。`;

const features = {
  localized: localized(
    [
      { label: 'Core focus', value: 'Custom SQL analysis, reusable dashboards, and programmatic onchain data access.' },
      {
        label: 'Cost boundary',
        value: 'Data Hub compute credits and Datashare subscriptions cover different products and workloads.',
      },
      {
        label: 'Trust boundary',
        value: 'Dashboard polish does not validate query assumptions, freshness, or interpretation.',
      },
    ],
    [
      { label: '核心定位', value: '自定义 SQL 分析、可复用看板和程序化链上数据访问。' },
      { label: '成本边界', value: 'Data Hub 计算 credit 与 Datashare 订阅对应不同产品和工作负载。' },
      { label: '可信边界', value: '看板呈现不能验证查询假设、数据新鲜度或解释是否正确。' },
    ],
  ),
  audience: {
    bestFit: localized(
      ['On-chain analysts', 'Crypto researchers', 'Teams validating protocol or wallet theses'],
      ['链上分析师', '加密研究者', '验证协议或钱包判断的团队'],
    ),
    notIdealFor: localized(
      ['People only wanting lightweight charts', 'Users who do not want to work close to raw data'],
      ['只想看轻量图表的人', '不想接近原始数据的用户'],
    ),
  },
  decision: {
    compareAxes: localized(
      ['Query flexibility', 'Data freshness', 'Credit predictability', 'Reusable evidence'],
      ['查询灵活性', '数据新鲜度', 'credit 可预测性', '证据复用'],
    ),
    officialSummary: localized(
      'Dune spans Data Hub, APIs, connectors, transformations, and Datashare; compare the product that matches the workflow.',
      'Dune 覆盖 Data Hub、API、connector、数据转换和 Datashare，应按实际工作流比较对应产品。',
    ),
    freshnessSummary: localized(
      'Coverage and refresh cadence differ by chain, schema, query execution, and product.',
      '覆盖与刷新节奏会随链、schema、查询执行和产品而变化。',
    ),
    pricingSummary: localized(
      'Estimate Data Hub credits from a representative workload; Datashare follows a separate subscription model.',
      'Data Hub 应通过代表性负载估算 credit；Datashare 使用独立的订阅模式。',
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: 'https://docs.dune.com/docs/product-comparison',
    summary: localized(
      'Product boundaries, SQL workflow, freshness, sharing, and cost model reviewed against official documentation.',
      '已根据官方文档核验产品边界、SQL 工作流、数据新鲜度、分享方式和成本模型。',
    ),
    trustNote: localized(
      'Source-based review, not a hands-on benchmark. Index release remains gated after directory reconciliation.',
      '来源核验而非实测跑分；完成目录对账后仍需通过独立索引放行门槛。',
    ),
  },
};

async function main() {
  const args = process.argv.slice(2).filter((argument) => argument !== '--');
  assert(
    args.every((argument) => ['--check', '--commit'].includes(argument)),
    'Unknown argument',
  );
  assert(!(args.includes('--check') && args.includes('--commit')), 'Choose one mode');
  assert(fs.existsSync('public/icons/tool-logos/dune.svg'));
  assert(fs.existsSync('public/images/tool-media/dune-cover.svg'));
  assert(detailEn.length > 2000 && detailZh.length > 900);
  assert.equal(features.audience.bestFit.en.length, 3);
  if (args.includes('--check')) {
    console.log('PASS Dune reconciliation content, identity and noindex release boundary');
    return;
  }

  loadEnvConfig(process.cwd());
  const supabase = createAdminClient();
  const { data: source, error: sourceError } = await supabase
    .from('tools')
    .select('id, name, url, status, created_at')
    .eq('id', id)
    .maybeSingle();
  if (sourceError) throw new Error(sourceError.message);
  assert(source, 'Historical Supabase Dune record is missing');
  assert.equal(source.name, 'dune');
  assert.equal(new URL(source.url).hostname, 'dune.com');
  assert.equal(source.status, 'published');

  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:dune'))");
    const conflicts = await client.query(
      "SELECT id, name, url FROM tools WHERE (lower(name) = 'dune' OR url ~* '^https?://(www\\.)?dune\\.com([/:?#]|$)') AND id <> $1",
      [id],
    );
    assert.equal(conflicts.rowCount, 0, 'Conflicting Dune slug or domain requires manual review');
    const category = await client.query("SELECT id FROM categories WHERE slug = 'productivity'");
    assert.equal(category.rowCount, 1, 'Productivity storage category must exist exactly once');

    await client.query(
      `INSERT INTO tools
      (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing,
       features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
      VALUES ($1, 'dune', $2, $3, $4, 'https://dune.com/', '/icons/tool-logos/dune.svg',
       '/images/tool-media/dune-cover.svg', $5, $6, 'freemium', $7, $8, ARRAY[]::text[],
       'published', 'monitor', $9::date, $10::timestamptz, NOW())
      ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name, title=EXCLUDED.title, content=EXCLUDED.content, detail=EXCLUDED.detail,
       url=EXCLUDED.url, image_url=EXCLUDED.image_url, thumbnail_url=EXCLUDED.thumbnail_url,
       category_id=EXCLUDED.category_id, tags=EXCLUDED.tags, pricing=EXCLUDED.pricing,
       features=EXCLUDED.features, use_cases=EXCLUDED.use_cases, screenshots=EXCLUDED.screenshots,
       status='published', page_quality_status='monitor', next_review_date=EXCLUDED.next_review_date,
       updated_at=NOW()`,
      [
        id,
        localized('Dune Onchain Data & SQL Analytics', 'Dune 链上数据与 SQL 分析'),
        localized(
          'Query blockchain data with SQL, build reusable dashboards, and support onchain research or application workflows. Compare product boundaries, freshness, query ownership, and credit usage before adopting it.',
          '用 SQL 查询区块链数据、构建可复用看板，并支持链上研究或应用工作流。采用前应比较产品边界、数据新鲜度、查询维护责任和 credit 用量。',
        ),
        localized(detailEn, detailZh),
        category.rows[0].id,
        ['web3', 'on-chain-analysis', 'blockchain-data', 'sql-analytics', 'research'],
        features,
        localized(
          [
            'Custom onchain queries',
            'Reusable research dashboards',
            'Protocol thesis validation',
            'Programmatic data access',
          ],
          ['自定义链上查询', '可复用研究看板', '协议判断验证', '程序化数据访问'],
        ),
        nextReviewDate,
        source.created_at,
      ],
    );
    const result = await client.query(
      'SELECT id, name, status, page_quality_status, next_review_date::text, features, detail FROM tools WHERE id=$1',
      [id],
    );
    assert.equal(result.rowCount, 1);
    const row = result.rows[0];
    assert.equal(row.name, 'dune');
    assert.equal(row.status, 'published');
    assert.equal(row.page_quality_status, 'monitor');
    assert.equal(row.next_review_date, nextReviewDate);
    assert.equal(row.features.editorial.reviewedAt, reviewedAt);
    assert.equal(row.detail.en, detailEn);
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify({
        success: true,
        mode: args.includes('--commit') ? 'committed' : 'rolled_back',
        id,
        canonical: '/ai/dune',
        pageQualityStatus: 'monitor',
        indexed: false,
        nextReviewDate,
      }),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
