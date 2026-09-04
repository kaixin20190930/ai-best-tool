import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

const checkedAt = '2026-09-04';
const nextReviewDate = '2026-09-18';
const localized = <T>(en: T, zh: T) => ({ en, zh, cn: zh });
const reviews = [
  {
    id: 'fffb8714-bf45-4e61-bbee-fde1c6f97fd8',
    slug: 'notion',
    baseline: '9852b19d0fbe17c51a627215c6828d95',
    sources: ['https://www.notion.com/help/notion-ai-faqs', 'https://www.notion.com/help/notion-ai-security-practices'],
    content: localized(
      'Notion combines documents, project tracking and a knowledge workspace. Evaluate its integrated AI by workspace context, plan allowances, permissions and the effort needed to verify answers.',
      'Notion 将文档、项目跟踪和知识工作区结合起来。选择其内置 AI 时，应核对工作区上下文、套餐额度、权限，以及核验回答所需的时间。',
    ),
    body: localized(
      `## What this page evaluates

Notion is a document and project workspace with integrated AI, not just a standalone chatbot. This review focuses on whether AI inside an existing workspace helps your work; it does not treat every Notion feature as an AI entitlement.

## Access and limits

The official FAQ places ongoing Notion AI access on Business and Enterprise, with limited trial responses for Free and Plus. Some AI features have usage allowances, so included access is not unlimited. Check your workspace settings and current terms before upgrading.

## Data boundaries

AI provider retention varies by plan and feature. Enterprise defaults are not a blanket zero-retention promise for every workspace or external agent. Review enabled data-retaining features, connected-app permissions and sharing settings before using sensitive documents.

## Who should try it

Our editorial suggestion: prioritize a trial if your project knowledge already lives in Notion and you repeatedly turn it into summaries or action lists. If you mainly need occasional open-ended chat, first compare that workflow against a standalone assistant without migrating your knowledge base.

## A concrete trial

Use a non-sensitive project with a known decision, owner and deadline. Ask for the decision and its supporting page, then draft an action list. Count unsupported statements, missed details and correction time. Repeat with a restricted test page using two authorized test accounts to check access boundaries before a wider rollout. Inspect proposed edits before applying them.

These are suggested acceptance steps, not results of a hands-on test. A useful result should save verification time, not merely produce more text. Migration effort and source organization remain part of your decision.`,
      `## 本页评估什么

Notion 是集成 AI 的文档与项目工作区，不只是独立聊天机器人。本页重点判断 AI 放进既有工作区是否有帮助，不把所有 Notion 功能都当作 AI 套餐权益。

## 访问与用量

官方 FAQ 将持续使用 Notion AI 的权益放在 Business 和 Enterprise，Free 与 Plus 提供有限试用回复。部分 AI 功能存在用量额度，包含 AI 不等于无限使用；升级前核对工作区设置和当前条款。

## 数据边界

AI 提供商的留存规则随套餐和功能变化。Enterprise 默认规则不等于所有工作区或外部 Agent 都零留存。处理敏感文档前，检查会保留数据的功能、连接应用权限和共享设置。

## 谁值得优先试用

编辑建议：如果项目知识已在 Notion 中，而且经常需要整理摘要和行动项，优先试用。如果只是偶尔开放式聊天，先与独立助手对照，不要仅为 AI 搬迁整个知识库。

## 可执行的试用检查

选一个不含敏感信息、已知决策、负责人和截止时间的项目。让 AI 找出决策及来源页面，再生成行动清单，记录无依据陈述、遗漏和修正耗时。使用两个获授权的测试账号与受限测试页面检查访问边界，再考虑扩大使用范围；应用修改前检查差异。

这些是建议的验收步骤，不是我们已做过的实测。有效结果应该降低核验成本，而不只是多生成文字。迁移成本与资料组织程度仍需要你实际评估。`,
    ),
    bestFit: localized(['Teams with existing Notion project knowledge'], ['已有 Notion 项目知识的团队']),
    notIdealFor: localized(['Migrating a workspace just for occasional AI chat'], ['仅为偶尔 AI 聊天搬迁工作区']),
    limitations: localized(
      ['Included AI still has allowances.', 'Retention and permissions require plan-specific review.'],
      ['包含 AI 仍有用量限制。', '留存与权限需要按套餐核对。'],
    ),
    forbidden: ['Craft powerful and visually appealing documents'],
  },
  {
    id: '0dfc49cb-f226-41fe-896a-8a881f5c2761',
    slug: 'poe',
    baseline: '8cdaf3730cc848594b816c9aa1009a45',
    sources: [
      'https://help.poe.com/hc/en-us/articles/19945140063636-Poe-Purchases-FAQs',
      'https://poe.com/pages/privacy-center',
    ],
    content: localized(
      "Poe provides access to multiple AI bots through web and mobile apps. Compare useful output per compute point, subscription management and each bot's privacy shield before choosing it for daily work.",
      'Poe 提供网页与移动应用中的多个 AI Bot 入口。日常使用前，应比较每点算力换来的有效输出、订阅管理方式，以及各 Bot 的隐私盾牌边界。',
    ),
    body: localized(
      `## What this page evaluates

Poe is a multi-bot AI platform with web, iOS and Android access. It is not a single model and it is not limited to a website awaiting a future mobile app. The bot you select matters to both results and data handling.

## Cost and subscription checks

Access uses compute points rather than a promise of unlimited answers. Check current bot costs and point history against your own workload. Subscription management depends on where you bought it: web, Apple or Google. Confirm the purchase channel before trying to change or cancel a plan. We have not verified your regional checkout price or account balance.

## Privacy is bot-specific

Poe's privacy shield indicates data handling. Half-shield bots or apps may share content with developers or external resources and may use it for training. Full shield does not mean no model provider receives content. New permissions can change the applicable shield; inspect the message details and memory settings before sharing sensitive information.

## Who should try it

Our editorial suggestion: consider Poe when you regularly compare different assistants on the same task. If you rely on one provider's particular workflow, test whether Poe actually supplies the needed experience before cancelling another subscription. Model access alone does not establish workflow equivalence.

## A concrete trial

Choose two bots and run the same non-sensitive task with an answer you can check. Record each bot's name, useful output, factual corrections and compute points spent. Repeat with a longer document and inspect the cost before committing a larger workload. Keep the better task result, not automatically the longer response.

Then review the shield on each bot, check where your subscription is managed and decide whether your expected weekly work fits the available budget. This is a proposed trial, not a completed benchmark or a savings guarantee.`,
      `## 本页评估什么

Poe 是支持网页、iOS 和 Android 的多 Bot AI 平台，不是单一模型，也不是等待未来推出手机应用的纯网站。所选 Bot 会影响输出和数据处理方式。

## 费用与订阅检查

访问使用算力点数，不应理解为无限回答。按实际任务核对当前 Bot 成本和点数历史。订阅管理取决于购买渠道：网页、Apple 或 Google；更改或取消之前先确认购买渠道。本轮未核验你的地区结账价格或账号余额。

## 隐私必须逐 Bot 判断

Poe 的隐私盾牌标识数据处理边界。半盾 Bot 或应用可能向开发者或外部资源共享内容，并可能用于训练；全盾也不代表模型提供商接收不到内容。新授权可能改变适用盾牌，提交敏感信息前检查消息详情和记忆设置。

## 谁值得优先试用

编辑建议：如果经常需要让不同助手处理同一个任务，可考虑 Poe。如果依赖某家提供商的特定工作流，先确认 Poe 是否提供你需要的体验，再考虑取消其他订阅。能访问模型不等于具有完全相同的工作流。

## 可执行的试用检查

选两个 Bot，输入同一项不含敏感信息、答案可以核验的任务，记录 Bot 名称、有效输出、事实纠错和消耗点数。再用较长文档重复测试，扩大任务量前查看成本。选择真正有效的结果，不要默认更长的回答更好。

随后逐一检查隐私盾牌，确认订阅管理入口，判断预计每周工作是否在预算内。这是建议的试用方法，不是已完成的性能测试或节省费用承诺。`,
    ),
    bestFit: localized(['Comparing assistants on repeatable tasks'], ['用可重复任务比较不同助手']),
    notIdealFor: localized(
      ['Assuming every bot has identical privacy or unlimited usage'],
      ['假定所有 Bot 隐私相同或用量无限'],
    ),
    limitations: localized(
      ['Budget by compute points.', 'Privacy varies by bot and permissions.'],
      ['按算力点数评估预算。', '隐私边界随 Bot 和权限变化。'],
    ),
    forbidden: [
      'potential mobile app development in the future',
      'ensures privacy and confidentiality for all user conversations',
    ],
  },
];

function payload(review: (typeof reviews)[number]) {
  const detail = localized(
    `${review.body.en}\n\n## Sources and scope\n\nOfficial documentation checked ${checkedAt}; next fact review ${nextReviewDate}. This is an official-source review, not independent market validation.\n\n${review.sources.map((url, i) => `- [Official source ${i + 1}](${url})`).join('\n')}`,
    `${review.body.zh}\n\n## 来源与范围\n\n官方资料核查于 ${checkedAt}，下次事实复查 ${nextReviewDate}。这是官方来源核查，不是独立市场验证。\n\n${review.sources.map((url, i) => `- [官方来源 ${i + 1}](${url})`).join('\n')}`,
  );
  const features = {
    editorial: {
      reviewedAt: checkedAt,
      reviewedBy: 'AI Best Tool editorial',
      sourceUrl: review.sources[0],
      summary: localized('Official access, usage and privacy review.', '已核对官方访问、用量与隐私说明。'),
      trustNote: localized(
        'Not a hands-on benchmark or independent market validation.',
        '不是亲自实测或独立市场验证。',
      ),
    },
    audience: { bestFit: review.bestFit, notIdealFor: review.notIdealFor },
    decision: { limitations: review.limitations },
    maintenanceReview: {
      checkedAt,
      nextReviewDate,
      sources: review.sources,
      scope: 'Official-source review; no market score assigned.',
    },
  };
  return { content: review.content, detail, features };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--pages', '--commit', '--status'].includes(arg)));
  for (const review of reviews) {
    const value = payload(review);
    assert(value.content.en.length >= 80 && value.detail.en.length >= 160);
    assert(value.detail.en !== value.detail.zh && /[\u4e00-\u9fff]/.test(value.detail.zh));
    assert(!('marketValidation' in value.features));
    assert(
      review.sources.every((url) => ['www.notion.com', 'help.poe.com', 'poe.com'].includes(new URL(url).hostname)),
    );
    for (const old of review.forbidden) assert(!value.detail.en.includes(old));
  }
  if (args.includes('--check')) {
    console.log('PASS two bilingual reviews, official sources, quality lengths and no fabricated market scores');
    return;
  }
  if (args.includes('--pages')) {
    const base = process.env.SEO_BASE_URL || 'http://localhost:3017';
    for (const review of reviews) {
      for (const locale of ['', '/cn']) {
        const path = `${locale}/ai/${review.slug}`;
        const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
        assert.equal(response.status, 200, path);
        const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        const needle = locale ? review.body.zh.split('\n\n')[1] : review.body.en.split('\n\n')[1];
        assert(html.includes(needle), `${path}: visible content missing`);
        assert(html.includes(nextReviewDate), `${path}: schedule missing`);
        for (const url of review.sources) assert(html.includes(url), `${path}: source missing`);
        for (const old of review.forbidden) assert(!html.includes(old), `${path}: stale claim remains`);
        assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`));
        assert(!/<meta[^>]*name="(?:robots|googlebot)"[^>]*content="[^"]*noindex/i.test(html));
        assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''));
        assert(/hreflang="en"/i.test(html));
        console.log(`PASS ${path}: visible copy, sources, schedule and SEO`);
      }
    }
    const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200);
    const xml = await response.text();
    for (const review of reviews) {
      for (const locale of ['', '/cn']) {
        assert(xml.includes(`<loc>https://aibesttool.com${locale}/ai/${review.slug}</loc>`));
      }
    }
    console.log(`PASS four existing sitemap entries; total ${(xml.match(/<loc>/g) || []).length}`);
    return;
  }
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    const results = [];
    for (const review of reviews) {
      const expected = payload(review);
      // Search vectors are database-derived from the edited summary.
      const select = `SELECT content,detail,features,next_review_date::text AS next_review_date,
        md5(content::text || detail::text) AS baseline,
        to_jsonb(t)-'content'-'detail'-'features'-'next_review_date'-'updated_at'-'search_vector' AS stable
        FROM tools t WHERE id=$1 AND name=$2`;
      const params = [review.id, review.slug];
      const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
      assert(before?.stable.status === 'published' && before.stable.page_quality_status === 'continue_index');
      const applied = before.features?.maintenanceReview?.checkedAt === checkedAt;
      if (!applied) {
        assert(
          before.features === null && before.next_review_date === null && before.baseline === review.baseline,
          `${review.slug}: baseline changed, review instead of overwriting`,
        );
      }
      if (!applied && !args.includes('--status')) {
        await client.query(
          'UPDATE tools SET content=$2::jsonb,detail=$3::jsonb,features=$4::jsonb,next_review_date=$5::date,updated_at=now() WHERE id=$1',
          [
            review.id,
            JSON.stringify(expected.content),
            JSON.stringify(expected.detail),
            JSON.stringify(expected.features),
            nextReviewDate,
          ],
        );
      }
      const after = (await client.query(select, params)).rows[0];
      assert.deepEqual(after.stable, before.stable, 'Identity, media and index fields must not change');
      assert.deepEqual(after.content, expected.content);
      assert.deepEqual(after.detail, expected.detail);
      assert.deepEqual(after.features, expected.features);
      assert.equal(after.next_review_date, nextReviewDate);
      results.push({ slug: review.slug, alreadyApplied: applied, nextReviewDate, identityAndIndexUnchanged: true });
    }
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: args[0] || 'dry-run-rollback', results }, null, 2));
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
