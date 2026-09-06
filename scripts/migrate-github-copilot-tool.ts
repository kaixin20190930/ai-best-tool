import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const id = '8f09dc60-e77b-41e8-b2e0-9cefbc228d0d';
const reviewedAt = '2026-09-06';
const nextReviewDate = '2026-09-20';
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh, tw: zh });

const officialSources = [
  'https://github.com/features/copilot/plans',
  'https://docs.github.com/en/copilot/how-tos/chat-with-copilot/chat-in-ide',
  'https://docs.github.com/en/copilot/concepts/context/content-exclusion',
];
const independentSources = [
  'https://survey.stackoverflow.co/2025/ai',
  'https://www.g2.com/products/github-copilot/reviews',
];

const detailEn = `## What GitHub Copilot is

GitHub Copilot is GitHub's AI coding assistant for code completion, chat, code review, CLI and agent-driven development. It works across supported editors and GitHub surfaces. This record describes GitHub Copilot, not Microsoft Copilot, and not a single model or IDE.

## Best fit

- Developers who want completion, chat and agent workflows close to their editor and GitHub repositories.
- Teams that can review diffs, run repository tests and manage organization policies before accepting generated changes.
- Buyers comparing included AI credits, model access and GitHub-native workflow fit rather than only a headline subscription price.

## Check before choosing

- Pricing checked ${reviewedAt}: Free includes 2,000 completions per month and limited chat/agent usage. Pro is $10 per user/month and Pro+ is $39 per user/month. GitHub now meters chat, agents, code review, CLI, Spaces and Spark with AI Credits; code completion and next-edit suggestions remain unlimited on paid plans. Included credits and model multipliers can change, so confirm the live plan before purchase.
- Agent mode can read files, edit code and propose terminal commands, but availability depends on the editor, plan and organization policy. Generated code still requires review and the repository's own tests.
- Content exclusion is available for Business and Enterprise, but GitHub documents important exceptions: it is not supported by Copilot CLI, the cloud coding agent or IDE Agent mode, and semantic information may still arrive indirectly from an IDE. Do not treat an exclusion rule as a universal secret boundary.
- Individual Free, Pro and Pro+ interactions may be used to improve models unless the user opts out. Organization plans add policy and license controls; verify current data settings for the account that will access private code.
- The 2025 Stack Overflow Developer Survey reports GitHub Copilot as one of the most-used out-of-the-box AI assistants among respondents using agents. G2 has hundreds of reviews, but common complaints about inaccurate suggestions, context and price mean popularity does not prove fit for a specific repository.

## Decision summary

Run GitHub Copilot on the same three representative tasks used for another coding assistant. Record accepted work, review time, test failures, AI-credit use, policy gaps and whether the GitHub integration removes meaningful handoffs. Keep it when the integrated workflow saves more time than correction and governance cost. Compare it with Codex or Cursor when repository-wide execution, editor behavior or model economics matter more than GitHub-native convenience.

## Evidence and sources

- [Current plans and AI Credits](https://github.com/features/copilot/plans)
- [IDE chat and agent mode](https://docs.github.com/en/copilot/how-tos/chat-with-copilot/chat-in-ide)
- [Content exclusion boundaries](https://docs.github.com/en/copilot/concepts/context/content-exclusion)
- [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/ai)
- [Independent review profile](https://www.g2.com/products/github-copilot/reviews)

This is a source-based editorial review, not a completed hands-on benchmark.`;

const detailZh = `## GitHub Copilot 是什么

GitHub Copilot 是 GitHub 的 AI 编程助手，覆盖代码补全、聊天、代码审查、CLI 和智能体开发流程，可用于受支持的编辑器和 GitHub 工作界面。本条目描述 GitHub Copilot，不是 Microsoft Copilot，也不是某一个模型或 IDE。

## 更适合

- 希望补全、聊天和智能体流程靠近编辑器与 GitHub 仓库的开发者。
- 能在接受生成修改前审查 diff、运行仓库测试并管理组织策略的团队。
- 按 AI Credits、模型访问和 GitHub 原生工作流比较，而不是只看订阅价格的采购者。

## 选择前必须核对

- ${reviewedAt} 核验：Free 每月包含 2,000 次补全和有限聊天/智能体用量；Pro 为每用户每月 $10，Pro+ 为 $39。聊天、智能体、代码审查、CLI、Spaces 和 Spark 使用 AI Credits；付费版代码补全和 next-edit suggestions 仍为不限量。credits 与模型倍率可能变化，购买时应复核实时套餐。
- Agent mode 可以读取文件、修改代码并建议终端命令，但可用性受编辑器、套餐和组织策略影响。生成代码仍必须人工审查并运行仓库自身测试。
- Business 和 Enterprise 可设置内容排除，但官方明确存在边界：Copilot CLI、云端 coding agent 和 IDE Agent mode 不支持该排除，而且 IDE 可能间接提供语义信息。不能把排除规则当作覆盖所有入口的机密保护。
- 个人 Free、Pro 和 Pro+ 的交互可能用于改进模型，用户可以退出；组织套餐提供更多策略和席位管理。私有代码接入前应以实际账号复核当前数据设置。
- 2025 Stack Overflow Developer Survey 显示，GitHub Copilot 是使用智能体的受访者中最常用的现成 AI 助手之一；G2 有数百条评价，但不准确建议、上下文和价格方面的反馈说明，流行度不能证明它适合某个具体仓库。

## 决策结论

用 GitHub Copilot 和另一个编码助手完成相同的三项代表任务，记录被接受的成果、审查时间、测试失败、AI Credits 使用、策略缺口，以及 GitHub 集成是否真正减少交接。只有节省时间大于修正和治理成本时才保留；当仓库级执行、编辑器体验或模型成本更重要时，与 Codex 或 Cursor 比较。

## 证据与来源

- [当前套餐与 AI Credits](https://github.com/features/copilot/plans)
- [IDE 聊天与 Agent mode](https://docs.github.com/en/copilot/how-tos/chat-with-copilot/chat-in-ide)
- [内容排除边界](https://docs.github.com/en/copilot/concepts/context/content-exclusion)
- [2025 Stack Overflow 开发者调查](https://survey.stackoverflow.co/2025/ai)
- [独立评价页面](https://www.g2.com/products/github-copilot/reviews)

本页为来源核验式编辑分析，不声称已经完成真实使用基准测试。`;

const features = {
  audience: {
    bestFit: localized(
      ['GitHub-centered development', 'IDE completion and agent work', 'Teams with review controls'],
      ['以 GitHub 为中心的开发流程', '编辑器补全与智能体任务', '具备审查控制的团队'],
    ),
    notIdealFor: localized(
      ['Unreviewed production changes', 'Universal content exclusion', 'Buying without measuring AI-credit use'],
      ['未经审查的生产修改', '要求所有入口统一内容排除', '不测算 AI Credits 就采购'],
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: officialSources[0],
    summary: localized(
      'Product identity, plans, AI Credits, agent workflow and content-exclusion boundaries reviewed.',
      '已核验产品身份、套餐、AI Credits、智能体工作流和内容排除边界。',
    ),
    trustNote: localized(
      'Source-based review. A hands-on repository comparison has not yet been recorded.',
      '来源核验；尚未记录真实代码仓库对比结果。',
    ),
  },
  marketValidation: {
    reviewedAt,
    score: 97,
    verdict: 'Validated',
    scores: { userValue: 25, independentValidation: 24, durability: 24, evidenceQuality: 16, strategicValue: 8 },
    strongSignals: ['stackoverflow-2025-68-percent-agent-assistant-use', 'g2-277-reviews-4.5'],
    supportingSignals: ['multi-year-commercial-product', 'broad-editor-and-github-integration'],
    evidenceUrls: [...officialSources, ...independentSources],
    rationale: localized(
      'Independent survey use and hundreds of reviews support mature demand. Accuracy, context, governance and metered agent usage remain decision constraints.',
      '独立调查采用率和数百条评价支持成熟需求；准确性、上下文、治理及智能体计量用量仍是决策限制。',
    ),
  },
  trialTemplate: {
    targetOutcome: localized(
      'Complete three representative repository tasks and determine whether GitHub-native assistance reduces total implementation and review time after AI-credit and governance costs.',
      '完成三项代表性代码仓库任务，判断计入 AI Credits 和治理成本后，GitHub 原生辅助能否减少总实现与审查时间。',
    ),
    checks: localized(
      ['Complete three real tasks', 'Run repository tests', 'Record review and correction time', 'Record AI-credit use', 'Verify policy and exclusion behavior'],
      ['完成三项真实任务', '运行仓库测试', '记录审查与修正时间', '记录 AI Credits 使用', '核验策略和内容排除行为'],
    ),
  },
};

function indexInput(row: Record<string, unknown>) {
  return {
    status: row.status as string | null,
    pageQualityStatus: row.page_quality_status as string | null,
    categoryId: row.category_id as string | null,
    imageUrl: row.image_url as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    content: row.content,
    detail: row.detail,
    pricing: row.pricing as string | null,
    tags: row.tags as string[] | null,
  };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  assert.equal(Object.values(features.marketValidation.scores).reduce((sum, value) => sum + value, 0), 97);
  assert(detailEn.length > 2600 && detailZh.length > 1200);
  for (const source of [...officialSources, ...independentSources]) assert(detailEn.includes(source));
  for (const asset of ['public/icons/tool-logos/github-copilot.svg', 'public/images/tool-media/github-copilot-cover.svg']) {
    assert(fs.existsSync(asset), `${asset}: asset missing`);
  }
  if (args.includes('--check')) {
    console.log('PASS GitHub Copilot identity, evidence, market validation, trial template and assets');
    return;
  }

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:github-copilot'))");
    const conflicts = await client.query(
      `SELECT id, name, url FROM tools
       WHERE lower(name)='github-copilot'
          OR lower(url) ~ '^https?://(www\\.)?github\\.com/features/copilot([/?#]|$)'`,
    );
    assert(conflicts.rows.every((row) => row.id === id), 'Conflicting GitHub Copilot slug or URL');
    const microsoftCopilot = await client.query("SELECT id FROM tools WHERE lower(name)='copilot'");
    assert(microsoftCopilot.rowCount <= 1, 'Microsoft Copilot identity is ambiguous');
    const category = await client.query("SELECT id FROM categories WHERE slug='productivity'");
    assert.equal(category.rowCount, 1, 'Productivity storage category must exist exactly once');

    if (!args.includes('--status')) {
      await client.query(
        `INSERT INTO tools
        (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing,
         features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
        VALUES ($1, 'github-copilot', $2, $3, $4, 'https://github.com/features/copilot',
          '/icons/tool-logos/github-copilot.svg', '/images/tool-media/github-copilot-cover.svg', $5, $6,
          'freemium', $7, $8, ARRAY[]::text[], 'published', 'monitor', $9::date, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING`,
        [
          id,
          localized('GitHub Copilot', 'GitHub Copilot'),
          localized(
            'Compare GitHub Copilot completion, chat, review and agent workflows using current AI-credit, policy and content-exclusion boundaries.',
            '根据当前 AI Credits、组织策略和内容排除边界，比较 GitHub Copilot 的补全、聊天、审查与智能体工作流。',
          ),
          localized(detailEn, detailZh),
          category.rows[0].id,
          ['developer-tools', 'code-completion', 'coding-agent', 'code-review', 'github'],
          features,
          localized(
            ['IDE completion and chat', 'Agent-driven repository tasks', 'GitHub code review workflows'],
            ['编辑器补全与聊天', '智能体代码仓库任务', 'GitHub 代码审查工作流'],
          ),
          nextReviewDate,
        ],
      );
    }

    const result = await client.query(
      "SELECT *, next_review_date::text AS next_review_date_text FROM tools WHERE id=$1 AND name='github-copilot'",
      [id],
    );
    assert.equal(result.rowCount, 1, 'GitHub Copilot record missing');
    const row = result.rows[0];
    assert.equal(row.status, 'published');
    assert.equal(row.page_quality_status, 'monitor');
    assert.equal(row.next_review_date_text, nextReviewDate);
    assert.equal(row.features.editorial.reviewedAt, reviewedAt);
    assert.equal(row.features.marketValidation.score, 97);
    const indexDecision = getToolIndexDecision(indexInput(row));
    assert.equal(indexDecision.indexable, false);
    assert.equal(indexDecision.reason, 'indexing_paused');

    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({
      success: true,
      mode: args.includes('--commit') ? 'committed' : args.includes('--status') ? 'status' : 'dry-run-rollback',
      id,
      slug: 'github-copilot',
      distinctFrom: 'copilot',
      status: row.status,
      pageQualityStatus: row.page_quality_status,
      nextReviewDate,
      marketValidationScore: row.features.marketValidation.score,
      indexable: indexDecision.indexable,
      sitemapEligible: false,
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'GitHub Copilot migration failed');
  process.exitCode = 1;
});
