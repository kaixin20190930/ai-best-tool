import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

// Defaults to a real transaction that is rolled back. Publication requires --commit.
const id = 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e';
const reviewedAt = '2026-09-04';
const audit = JSON.parse(fs.readFileSync('data/collection/openrouter-preaudit-2026-09-01.json', 'utf8'));
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh });
const detailEn = `## What OpenRouter is

OpenRouter is a unified API and model gateway for developers comparing and operating models from multiple providers. Its useful distinction is centralized integration, billing, provider selection, and fallbacks rather than a guarantee that every model behaves identically.

## Best fit

- Teams testing several model families behind one integration.
- Applications that need explicit provider ordering, fallback rules, budgets, and usage monitoring.
- Developers willing to benchmark quality, latency, and total cost on representative workloads.

## Check before choosing

- Pricing checked ${reviewedAt}: Free lists 25+ free models, four free providers, and 50 requests per day. Pay-as-you-go lists 500+ models and 80+ providers; counts and limits are snapshots, not permanent guarantees.
- Inference is model-priced. Pay-as-you-go has a 5.5% platform fee and no minimum spend. BYOK has no platform fee on the first $25,000 of list-price inference per month, then 5%; Enterprise has a separate $200,000 threshold. Check the selected endpoint and current billing terms before budgeting.
- Default routing may change providers, latency, caching, supported parameters, and output behavior. Constrain providers and fallbacks when reproducibility matters.
- An OpenAI-compatible interface does not make context limits, structured output, tools, or safety behavior identical across models.
- OpenRouter and downstream providers have separate data policies. Review the selected endpoint, account settings, retention, and plugin policies before sending sensitive data; non-logging is not a blanket zero-retention guarantee.
- Centralized access adds a gateway, credit balance, and support dependency. Free-model limits are not a production capacity plan.

## Decision summary

Compare one direct-provider integration with the same workload through OpenRouter. Record successful task cost, first-token and total latency, failed requests, fallback behavior, and privacy-policy fit. Keep it when integration savings and provider choice outweigh the extra dependency; use a direct provider when one stable endpoint already meets the requirement.

## Sources

- [Pricing](https://openrouter.ai/pricing)
- [Provider selection](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Provider logging](https://openrouter.ai/docs/guides/privacy/provider-logging)
- [ZDR scope](https://openrouter.ai/docs/guides/features/zdr)

This is a source-based editorial review, not a claimed hands-on benchmark.`;
const detailZh = `## OpenRouter 是什么

OpenRouter 是面向开发者的统一 API 与模型网关，帮助团队比较和运行多个供应商的模型。差异点在于统一集成、账单、供应商选择和 fallback，而不是保证所有模型行为一致。

## 更适合

- 希望通过一个接口测试多个模型家族的团队。
- 需要明确供应商顺序、fallback、预算和用量监控的应用。
- 愿意用代表性任务测量质量、延迟和总成本的开发者。

## 选择前必须核对

- ${reviewedAt} 核验的 Free 列出 25+ 免费模型、4 个免费供应商和每天 50 次请求；按量付费列出 500+ 模型和 80+ 供应商。数量与限额是快照，并非永久承诺。
- 推理按模型计价，按量付费平台费为 5.5%，无最低消费。BYOK 每月前 $25,000 标价推理免平台费，之后为 5%；Enterprise 阈值为 $200,000。预算应以所选 endpoint 与当前账单条款为准。
- 默认路由可能改变供应商、延迟、缓存、参数支持和输出行为。要求可重复性时，应明确限制供应商和 fallback。
- OpenAI 兼容接口不代表不同模型的上下文、结构化输出、工具调用和安全行为完全一致。
- OpenRouter 和下游供应商有各自的数据政策。发送敏感信息前，应检查 endpoint、账号设置、留存和插件政策；不记录正文不等于全面零保留。
- 统一访问会增加网关、余额和支持依赖，免费限额不能代替生产容量规划。

## 决策结论

对同一代表性任务比较直连供应商与 OpenRouter，记录每次成功任务成本、首 token 和总延迟、失败请求、fallback 行为及隐私政策匹配程度。只有集成节省和供应商选择的价值超过额外依赖时才保留；若一个稳定 endpoint 已满足需求，可优先直连。

## 来源

- [官方定价](https://openrouter.ai/pricing)
- [供应商选择](https://openrouter.ai/docs/guides/routing/provider-selection)
- [供应商日志政策](https://openrouter.ai/docs/guides/privacy/provider-logging)
- [ZDR 范围](https://openrouter.ai/docs/guides/features/zdr)

本页为来源核验式编辑分析，不声称已完成产品实测。`;
const features = {
  audience: {
    bestFit: localized(
      ['Multi-model application teams', 'Provider routing and fallback control'],
      ['多模型应用团队', '供应商路由与 fallback 控制'],
    ),
    notIdealFor: localized(
      ['One stable provider is sufficient', 'Sensitive workloads without endpoint review'],
      ['一个稳定供应商已足够', '未核对 endpoint 政策的敏感工作负载'],
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: 'https://openrouter.ai/pricing',
    summary: localized(
      'Pricing, routing, and provider privacy reviewed against official documentation.',
      '已根据官方文档核验定价、路由和供应商隐私边界。',
    ),
    trustNote: localized(
      'Source-based review, not a hands-on benchmark. Market evidence was collected on 2026-09-01.',
      '来源核验而非实测跑分；市场证据采集于 2026-09-01。',
    ),
  },
  marketValidation: {
    reviewedAt: audit.reviewedAt,
    score: audit.marketValidation.score,
    verdict: audit.marketValidation.verdict,
    scores: { userValue: 24, independentValidation: 23, durability: 24, evidenceQuality: 18, strategicValue: 8 },
    strongSignals: audit.marketValidation.strongSignals,
    supportingSignals: audit.marketValidation.recurringUserFriction,
    evidenceUrls: [...audit.sources.official, ...audit.sources.independent],
    rationale: localized(
      audit.marketValidation.rationale,
      '已有多模型 API、持续运营、独立评价与采用证据；官方规模数字为自报，不代表本平台实测。市场验证不保证具体模型的质量、可靠性或隐私适配。',
    ),
  },
};

async function main() {
  const args = process.argv.slice(2);
  assert(
    args.every((arg) => ['--commit', '--check'].includes(arg)),
    'Unknown argument',
  );
  assert(!(args.includes('--commit') && args.includes('--check')), 'Choose one mode');
  assert.equal(audit.existingRoute, '/ai/openrouter');
  assert(new Date().toISOString().slice(0, 10) >= audit.publishNotBefore, 'Release slot is not open');
  assert.equal(audit.category.storageSlug, 'productivity');
  assert.equal(
    Object.values(features.marketValidation.scores).reduce((a, b) => a + b, 0),
    audit.marketValidation.score,
  );
  for (const asset of ['public/icons/tool-logos/openrouter.svg', 'public/images/tool-media/openrouter-cover.svg'])
    assert(fs.existsSync(asset));
  assert(detailEn.length > 1800 && detailZh.length > 700);
  if (args.includes('--check')) {
    console.log('OpenRouter release content checks passed; no database access.');
    return;
  }
  config({ path: '.env.local' });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:openrouter'))");
    const existing = await client.query(
      "SELECT id, name FROM tools WHERE name = 'openrouter' OR url ~* '^https?://(www\\.)?openrouter\\.ai([/:?#]|$)'",
    );
    assert(
      existing.rows.every((row) => row.id === id && row.name === 'openrouter'),
      'Conflicting slug/domain: manual review required',
    );
    const category = await client.query("SELECT id FROM categories WHERE slug = 'productivity'");
    assert.equal(category.rowCount, 1, 'Storage category must exist exactly once');
    await client.query(
      `INSERT INTO tools
      (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing, features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
      VALUES ($1, 'openrouter', $2, $3, $4, 'https://openrouter.ai/', '/icons/tool-logos/openrouter.svg', '/images/tool-media/openrouter-cover.svg', $5, $6, 'freemium', $7, $8, ARRAY[]::text[], 'published', 'continue_index', '2026-09-18', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        localized('OpenRouter Unified AI Model API', 'OpenRouter 统一 AI 模型 API'),
        localized(
          'Compare model providers through one API with centralized billing, routing, and fallbacks. Review endpoint capabilities, total cost, privacy, and the extra gateway dependency before production use.',
          '通过统一 API 比较模型供应商，集中管理账单、路由和 fallback。生产使用前应核对 endpoint 能力、总成本、隐私及额外网关依赖。',
        ),
        localized(detailEn, detailZh),
        category.rows[0].id,
        ['developer-platform', 'model-routing', 'llm-api', 'ai-infrastructure'],
        features,
        localized(
          ['Multi-model evaluation', 'Provider fallback routing', 'Centralized API billing'],
          ['多模型评估', '供应商 fallback 路由', '集中管理 API 账单'],
        ),
      ],
    );
    const result = await client.query(
      'SELECT name, status, page_quality_status, features, detail FROM tools WHERE id = $1',
      [id],
    );
    assert.equal(result.rowCount, 1);
    const row = result.rows[0];
    assert.equal(row.status, 'published');
    assert.equal(row.page_quality_status, 'continue_index');
    assert.equal(row.features.editorial.reviewedAt, reviewedAt);
    assert.equal(row.detail.en, detailEn);
    assert.equal(row.detail.cn, detailZh);
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify({
        success: true,
        mode: args.includes('--commit') ? 'committed' : 'rolled_back',
        id,
        canonical: '/ai/openrouter',
        reviewedAt,
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
  console.error(error instanceof Error ? error.message : 'Migration failed');
  process.exitCode = 1;
});
