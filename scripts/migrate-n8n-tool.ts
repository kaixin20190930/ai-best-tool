import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

const id = '23bb3601-a5ac-42c3-bff3-64b06a063959';
const reviewedAt = '2026-09-04';
const audit = JSON.parse(fs.readFileSync('data/collection/n8n-preaudit-2026-09-01.json', 'utf8'));
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh });
const detailEn = `## What n8n is

n8n combines visual workflow building, code, API integrations, and AI steps. Its distinctive choice is between managed Cloud and operating the same workflow platform yourself. The benefit is control over branching and integrations; the tradeoff is that complex workflows still need technical ownership.

## Best fit

- Technical operations teams connecting APIs and internal systems.
- Developers combining visual flows with code, error handling, and AI model calls.
- Organizations that can decide who owns credentials, workflow changes, and production incidents.

## Check before choosing

- Pricing checked ${reviewedAt}: annual-billing Starter is €20/month for 2,500 executions and Pro is €50/month for 10,000. Business is self-hosted at €667/month for 40,000; Enterprise is quoted for Cloud or self-hosting. Confirm the selected tier at purchase.
- An execution is a whole workflow run rather than each node. Estimate schedules, incoming events, retries, and chat-message triggers from a representative workload. AI Assistant credits are separate from model-provider API charges within workflows.
- Community is free to self-host and includes queue mode, but sharing, projects, SSO, environments, external secrets, and Git governance are not all free-edition capabilities. Free registration unlocks folders, editor debugging, and custom execution data; compare the current edition matrix before inviting a team.
- Self-hosting means owning upgrades, backups, databases, secrets, capacity, and monitoring. Queue mode adds Redis and workers with a shared database and encryption key. Verify version-specific binary-data storage constraints before processing large files.
- n8n is source-available under the Sustainable Use License, not OSI open source. Paid hosting, white-label resale, or embedding customer-credential workflows can require a commercial agreement. Review the official examples for your use case rather than assuming all commercial use is either allowed or forbidden.
- AI-generated workflow steps and outputs still need review. Keep human approval for consequential actions and test failure paths without using production customer data.

## Decision summary

Pilot one real workflow in n8n and a simpler managed alternative such as Make. Measure successful business outcomes, execution volume, setup and maintenance time, error recovery, and the number of people able to edit safely. Choose n8n when code flexibility or deployment control pays for that ownership. Choose managed Cloud when you want n8n workflows without operating the service; do not choose self-hosting merely because the software has a free edition.

## Evidence and sources

- [Current plans and execution billing](https://n8n.io/pricing/)
- [Community and paid editions](https://docs.n8n.io/deploy/host-n8n/community-edition-features/)
- [Sustainable Use License](https://docs.n8n.io/privacy-and-security/sustainable-use-license)
- [Queue-mode operations](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode/)

This is an official-source editorial review, not a hands-on performance benchmark. Market adoption evidence was collected separately on ${audit.reviewedAt}; repository popularity is not proof of reliability for your workload.`;
const detailZh = `## n8n 是什么

n8n 将可视化工作流、代码、API 集成和 AI 步骤结合起来。核心选择是使用托管 Cloud，还是自行运营工作流平台。它提供分支和集成控制，但复杂流程依然需要技术人员负责。

## 更适合

- 连接 API 和内部系统的技术运营团队。
- 希望在可视化流程中结合代码、异常处理和模型调用的开发者。
- 能明确凭证、流程变更和生产故障责任人的组织。

## 选择前必须核对

- ${reviewedAt} 核验：按年付时 Starter 为 €20/月、2,500 executions，Pro 为 €50/月、10,000。Business 为自托管 €667/月、40,000；Enterprise 可选 Cloud 或自托管并询价。购买时应复核实际档位。
- execution 按整个流程运行而非节点数计费。应按真实任务测算调度、事件、重试和聊天消息触发次数；AI Assistant credits 不等于工作流内部模型商 API 费用。
- Community 免费自托管且包含 queue mode，但共享、项目、SSO、环境、external secrets 和 Git 治理并非全部属于免费版。免费注册可解锁文件夹、编辑器调试和自定义执行数据；邀请团队前先核对版本矩阵。
- 自托管意味着自己负责升级、备份、数据库、密钥、容量和监控。queue mode 还涉及 Redis、worker、共享数据库和加密密钥；大文件处理需核对对应版本的二进制存储限制。
- n8n 使用 Sustainable Use License，源码可见但不属于 OSI 开源。收费托管、白标销售及使用客户凭证的产品嵌入可能需要商业协议。应核对官方案例，而不是笼统认为一切商用都允许或都禁止。
- AI 生成的流程步骤与输出仍需审核。高影响操作保留人工批准，并避免使用真实客户数据测试失败路径。

## 决策结论

用一项真实工作流比较 n8n 与 Make 等较简单的托管方案。记录成功业务结果、执行量、搭建维护时间、失败恢复及能安全编辑的人数。只有代码灵活性或部署控制值得承担维护责任时，才选择 n8n。需要 n8n 而不想运营服务时优先考虑 Cloud，不要仅因有免费版就选择自托管。

## 证据与来源

- [当前套餐与计费](https://n8n.io/pricing/)
- [Community 与付费版本](https://docs.n8n.io/deploy/host-n8n/community-edition-features/)
- [Sustainable Use License](https://docs.n8n.io/privacy-and-security/sustainable-use-license)
- [Queue mode 运维](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode/)

本页为官方来源核验式分析，不声称已完成性能实测。市场采用证据另采集于 ${audit.reviewedAt}，仓库热度不能证明具体业务负载的可靠性。`;
const features = {
  audience: {
    bestFit: localized(
      ['Technical operations', 'Code-assisted workflows', 'Teams with deployment ownership'],
      ['技术运营', '代码辅助工作流', '明确部署责任的团队'],
    ),
    notIdealFor: localized(
      [
        'Zero-maintenance self-hosting',
        'Unrestricted workflow-platform resale',
        'Simple tasks without an operations owner',
      ],
      ['零维护自托管', '不受限制地转售工作流平台', '没有运维责任人的简单任务'],
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: 'https://n8n.io/pricing/',
    summary: localized(
      'Official pricing, editions, licensing, and queue operations reviewed.',
      '已核验官方定价、版本、许可证和队列运维。',
    ),
    trustNote: localized(
      'Source-based review, not a hands-on benchmark. Market evidence collected on 2026-09-01.',
      '来源核验而非性能实测；市场证据采集于 2026-09-01。',
    ),
  },
  marketValidation: {
    reviewedAt: audit.reviewedAt,
    score: audit.marketValidation.score,
    verdict: audit.marketValidation.verdict,
    scores: { userValue: 25, independentValidation: 24, durability: 24, evidenceQuality: 17, strategicValue: 8 },
    strongSignals: audit.marketValidation.strongSignals,
    supportingSignals: ['active-release-history', 'independent-review-presence'],
    evidenceUrls: [...audit.sources.official, ...audit.sources.independent],
    rationale: localized(
      audit.marketValidation.rationale,
      '持续发布、广泛社区与独立评价支持产品成熟度；技术学习、自托管运维和执行量预算仍是实际限制。此结论不保证每项流程可靠，也不将仓库热度等同于使用人数。',
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
  assert.equal(audit.existingRoute, '/ai/n8n');
  assert.equal(audit.category.storageSlug, 'productivity');
  assert.equal(audit.pricingSnapshot.checkedAt, reviewedAt);
  assert(new Date().toISOString().slice(0, 10) >= audit.publishNotBefore, 'Release slot is not open');
  assert.equal(
    Object.values(features.marketValidation.scores).reduce((a, b) => a + b, 0),
    audit.marketValidation.score,
  );
  for (const asset of ['public/icons/tool-logos/n8n.svg', 'public/images/tool-media/n8n-cover.svg'])
    assert(fs.existsSync(asset));
  for (const detail of [detailEn, detailZh]) {
    for (const term of ['Sustainable Use License', 'Community', 'queue mode', 'AI Assistant', '€667'])
      assert(detail.includes(term));
  }
  assert(detailEn.length > 2000 && detailZh.length > 900);
  if (args.includes('--check')) {
    console.log('n8n release content checks passed; no database access.');
    return;
  }
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:n8n'))");
    const existing = await client.query(
      "SELECT id, name FROM tools WHERE name = 'n8n' OR url ~* '^https?://(www\\.)?n8n\\.io([/:?#]|$)'",
    );
    assert(
      existing.rows.every((row) => row.id === id && row.name === 'n8n'),
      'Conflicting slug/domain: manual review required',
    );
    const category = await client.query("SELECT id FROM categories WHERE slug = 'productivity'");
    assert.equal(category.rowCount, 1, 'Storage category must exist exactly once');
    await client.query(
      `INSERT INTO tools
      (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing, features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
      VALUES ($1, 'n8n', $2, $3, $4, 'https://n8n.io/', '/icons/tool-logos/n8n.svg', '/images/tool-media/n8n-cover.svg', $5, $6, 'freemium', $7, $8, ARRAY[]::text[], 'published', 'continue_index', '2026-09-18', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        localized('n8n Workflow Automation', 'n8n 工作流自动化'),
        localized(
          'Build visual workflows with code, APIs, and AI steps using Cloud or self-hosting. Compare execution costs, governance, license boundaries, and maintenance responsibility before choosing a deployment.',
          '使用 Cloud 或自托管，通过可视化流程连接代码、API 和 AI 步骤。选择前比较执行成本、治理能力、许可证边界和维护责任。',
        ),
        localized(detailEn, detailZh),
        category.rows[0].id,
        ['workflow-automation', 'api-integration', 'self-hosted', 'ai-agents'],
        features,
        localized(
          ['Internal API automation', 'Code-assisted business workflows', 'AI workflows with human review'],
          ['内部 API 自动化', '代码辅助业务流程', '带人工审核的 AI 工作流'],
        ),
      ],
    );
    const result = await client.query('SELECT status, page_quality_status, features, detail FROM tools WHERE id = $1', [
      id,
    ]);
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
        canonical: '/ai/n8n',
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
