import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const id = '35b7a4ae-1200-41f2-94c5-d5ba4dc98704';
const reviewedAt = '2026-09-06';
const nextReviewDate = '2026-09-20';
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh, tw: zh });

const detailEn = `## What Codex is

Codex is OpenAI's coding agent. It can work with a repository, edit files, run commands and tests, review changes, and support longer engineering tasks. The product is available through several surfaces, including the desktop app, CLI, IDE extension, web, and cloud workflows. This record describes the Codex product, not OpenAI as a company and not one specific API model.

## Best fit

- Developers using real repositories where an agent can inspect context, make focused changes, and run the project's own checks.
- Teams that keep human review, source control, tests, and deployment safeguards in the workflow.
- Repetitive or multi-step engineering work with a clear goal and observable acceptance criteria.

## Check before choosing

- Results depend on repository context, task clarity, permissions, selected model, and the quality of project tests. Generated code is not evidence that a task is correct.
- Local and cloud execution have different environment boundaries. Review sandbox, network, filesystem, secret, connector, and approval settings before using sensitive repositories or production systems.
- Broader permissions can increase autonomy and risk. Start with the narrowest workable access and review commands, diffs, tests, and deployment effects.
- Availability, usage limits, models, and billing can vary by account, plan, client, and date. Confirm the current terms in the account used for the trial instead of relying on a static directory price.
- A successful demo is not enough for adoption. Measure completed tasks, review time, regressions, blocked work, and the amount of human correction on a representative repository.

## Seven-day decision test

Use Codex on at least three real development tasks. Require a real test or build result for each material change and keep a link to the resulting commit or outcome. At the end, choose Keep, Compare, or Cancel based on completed work and review burden rather than generated lines of code.

## Official sources

- [Codex overview](https://learn.chatgpt.com/docs)
- [Quickstart](https://learn.chatgpt.com/docs/quickstart)
- [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Code review](https://learn.chatgpt.com/docs/code-review)

This is an official-source editorial review. The seven-day hands-on result has not been recorded yet.`;

const detailZh = `## Codex 是什么

Codex 是 OpenAI 的编程智能体，可在代码仓库中读取上下文、修改文件、运行命令和测试、审查改动并协助较长的工程任务。产品可通过桌面应用、CLI、IDE 扩展、网页和云端工作流使用。本条目描述的是 Codex 产品，不是 OpenAI 公司，也不是某个特定 API 模型。

## 更适合

- 在真实代码仓库中，让智能体理解上下文、完成聚焦修改并运行项目自身检查的开发者。
- 保留人工审查、版本控制、测试和部署保护的团队。
- 目标和验收标准明确的重复或多步骤工程任务。

## 选择前必须核对

- 结果取决于仓库上下文、任务描述、权限、所选模型和项目测试质量。生成代码不等于任务正确。
- 本地与云端执行边界不同。敏感仓库或生产系统使用前，应核对沙盒、网络、文件、密钥、连接器和审批设置。
- 权限越宽，自主性与风险都可能增加。应从能够工作的最小权限开始，并检查命令、diff、测试和部署影响。
- 可用性、使用限额、模型和计费可能随账号、套餐、客户端和时间变化。试用时以实际账号的当前信息为准，不使用目录中的静态价格代替。
- 一次演示成功不足以决定采购。应在代表性仓库记录完成任务数、审查时间、回归、阻塞和人工修正量。

## 7 天决策试用

至少用 Codex 完成 3 个真实开发任务。每项重要修改都必须有真实测试或 build 结果，并保留对应 commit 或结果。第 7 天根据完成工作和审查负担选择 Keep、Compare 或 Cancel，不使用生成代码行数作为主要指标。

## 官方来源

- [Codex 概览](https://learn.chatgpt.com/docs)
- [快速开始](https://learn.chatgpt.com/docs/quickstart)
- [智能体审批与安全](https://learn.chatgpt.com/docs/agent-approvals-security)
- [代码审查](https://learn.chatgpt.com/docs/code-review)

本页为官方来源核验式编辑分析，尚未记录 7 天真实试用结果。`;

const features = {
  audience: {
    bestFit: localized(
      ['Repository-based engineering', 'Testable multi-step coding work', 'Teams with human review'],
      ['基于代码仓库的工程任务', '可测试的多步骤开发工作', '保留人工审查的团队'],
    ),
    notIdealFor: localized(
      [
        'Unreviewed production changes',
        'Repositories without acceptance checks',
        'Sensitive work with unrestricted access',
      ],
      ['未经审查的生产修改', '没有验收检查的代码仓库', '使用不受限权限处理敏感工作'],
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: 'https://learn.chatgpt.com/docs',
    summary: localized(
      'Product surfaces, repository workflow, permissions, and review boundaries checked against official documentation.',
      '已根据官方资料核验产品入口、代码仓库工作流、权限与审查边界。',
    ),
    trustNote: localized(
      'Source-based review. The directory has not yet recorded a completed seven-day hands-on trial.',
      '来源核验；目录尚未记录完成的 7 天真实试用。',
    ),
  },
  trialTemplate: {
    targetOutcome: localized(
      'Complete at least three real repository tasks in seven days, verify each material change with tests or a production build, and determine whether Codex reduces manual implementation and debugging time without introducing serious regressions.',
      '在 7 天内用 Codex 完成至少 3 个真实代码仓库任务，每项重要修改都通过测试或生产 build 验证，并判断它能否减少手工实现和排查时间且不引入严重回归。',
    ),
    checks: localized(
      [
        'Complete at least three real tasks with a commit or observable result for each.',
        'Run the relevant tests, and run the full production build before every deployment-related push.',
        'Complete at least one full loop from diagnosis through implementation to production verification.',
        'Record one task Codex handled well and one task that required meaningful human correction.',
        'Record any serious regression or confirm none was found during the seven-day window.',
      ],
      [
        '至少完成 3 个真实任务，每项都有 commit 或可观察结果。',
        '运行相关测试；涉及部署的推送前必须完成完整生产 build。',
        '至少完成一次从问题定位、实现到生产验收的完整闭环。',
        '记录一个 Codex 完成较好的任务和一个需要明显人工修正的任务。',
        '记录严重回归；若未发现，也要明确记录 7 天观察结果。',
      ],
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
  assert(detailEn.length > 1900 && detailZh.length > 700);
  assert.equal(features.trialTemplate.checks.en.length, 5);
  assert.equal(features.trialTemplate.checks.zh.length, 5);
  for (const path of ['public/icons/tool-logos/codex.svg', 'public/images/tool-media/codex-cover.svg']) {
    assert(fs.existsSync(path), `${path}: asset missing`);
  }
  if (args.includes('--check')) {
    console.log('PASS Codex identity, bilingual evidence, trial template and local assets');
    return;
  }

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:codex'))");

    const conflicts = await client.query(
      `SELECT id, name, url FROM tools
       WHERE lower(name)='codex' OR lower(url) IN ('https://chatgpt.com/codex','https://chatgpt.com/codex/')`,
    );
    assert(
      conflicts.rows.every((row) => row.id === id && row.name === 'codex'),
      'Conflicting Codex slug or exact product URL; manual review required',
    );
    // Developer Tools is a virtual hub; its current persisted category is Productivity.
    const category = await client.query("SELECT id FROM categories WHERE slug='productivity'");
    assert.equal(category.rowCount, 1, 'Productivity storage category must exist exactly once');

    if (!args.includes('--status')) {
      await client.query(
        `INSERT INTO tools
        (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing,
         features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
        VALUES ($1, 'codex', $2, $3, $4, 'https://chatgpt.com/codex', '/icons/tool-logos/codex.svg',
          '/images/tool-media/codex-cover.svg', $5, $6, 'paid', $7, $8, ARRAY[]::text[], 'published', 'monitor',
          $9::date, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING`,
        [
          id,
          localized('Codex Coding Agent', 'Codex 编程智能体'),
          localized(
            'Work with real code repositories using an agent that can inspect context, edit files, run commands and tests, and review changes. Evaluate completed tasks, review effort, permissions, and regressions in a seven-day trial.',
            '使用能够理解代码仓库、修改文件、运行命令和测试并审查改动的智能体完成真实开发工作。通过 7 天试用评估完成任务、审查成本、权限和回归。',
          ),
          localized(detailEn, detailZh),
          category.rows[0].id,
          ['developer-tools', 'coding-agent', 'code-review', 'terminal', 'automation'],
          features,
          localized(
            ['Repository changes with verification', 'Code review and debugging', 'Multi-step engineering tasks'],
            ['带验证的代码仓库修改', '代码审查与问题排查', '多步骤工程任务'],
          ),
          nextReviewDate,
        ],
      );
    }

    const result = await client.query(
      "SELECT *, next_review_date::text AS next_review_date_text FROM tools WHERE id=$1 AND name='codex'",
      [id],
    );
    assert.equal(result.rowCount, 1, 'Codex record missing');
    const row = result.rows[0];
    assert.equal(row.status, 'published');
    assert.equal(row.page_quality_status, 'monitor');
    assert.equal(row.next_review_date_text, nextReviewDate);
    assert.equal(row.features.editorial.reviewedAt, reviewedAt);
    assert.deepEqual(row.features.trialTemplate, features.trialTemplate);
    const indexDecision = getToolIndexDecision(indexInput(row));
    assert.equal(indexDecision.indexable, false);
    assert.equal(indexDecision.reason, 'indexing_paused');

    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args.includes('--commit') ? 'committed' : args.includes('--status') ? 'status' : 'dry-run-rollback',
          id,
          slug: 'codex',
          status: row.status,
          pageQualityStatus: row.page_quality_status,
          nextReviewDate,
          indexable: indexDecision.indexable,
          sitemapEligible: false,
          trialTemplateChecks: row.features.trialTemplate.checks.en.length,
        },
        null,
        2,
      ),
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
