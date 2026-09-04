import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';

const id = 'ccddfbaa-b7eb-4192-b9d6-aafc40488719';
const checkedAt = '2026-09-04';
const nextReviewDate = '2026-09-18';
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh });
const sources = [
  'https://support.google.com/gemini/answer/13278668?hl=en',
  'https://support.google.com/gemini/answer/16275805?hl=en',
  'https://support.google.com/gemini/answer/13594961?hl=en',
];
const content = localized(
  'Google Gemini Apps provides web and mobile AI assistance for writing, learning and planning. Choose by account eligibility, real task quality, usage limits and data controls rather than assuming a paid plan is unlimited.',
  'Google Gemini Apps 提供网页与移动端 AI 助手，用于写作、学习和规划。选择前应核对账号资格、真实任务表现、用量限制和数据设置，而不是把付费等同于无限使用。',
);
const detailEn = `## What Gemini is

This page evaluates Google Gemini Apps, the web and mobile assistant, rather than the Gemini developer API or every product using the Gemini brand. You can use the web app in a supported browser; downloading a phone app is not the only way to start.

## Best fit

Use it as a candidate for drafting, learning, planning and reviewing material when you are willing to check the answer. Compare it with Claude or ChatGPT using the same non-sensitive task rather than choosing solely by a model name.

## Check before choosing

- Some web features work without signing in. Additional features and saved activity require a Google Account. Country, age, account type and administrator access can affect availability; personal-account terms should not be assumed to apply to work or school accounts.
- Personal-account usage is compute-based: prompt complexity, model, feature and chat length affect consumption. Google describes five-hour refreshes subject to a weekly limit. Paid plans expand access, not guarantee unlimited use; confirm current limits in your account.
- Turning Keep Activity off is not zero retention. Google describes retaining personal-account chats for up to 72 hours; submitting feedback can change how associated content is used. Check the current Privacy Hub before uploading confidential material.

## Trial checklist

Try one task with a known answer and one representative document. Record factual corrections, useful output, limits reached and time spent checking. Verify citations and permissions before sharing output or connecting account data. These are suggested checks, not a hands-on benchmark or a promise of accuracy.

## Evidence and review scope

Official access, usage and privacy documentation checked ${checkedAt}; next fact review ${nextReviewDate}. Prices, independent adoption scores and personal-account eligibility were not tested for your account.

- [Account and web access](${sources[0]})
- [Usage limits and upgrades](${sources[1]})
- [Privacy and retention](${sources[2]})`;
const detailZh = `## Gemini 是什么

本页评估 Google Gemini Apps 网页与移动端助手，不代表 Gemini 开发者 API 或所有使用 Gemini 品牌的产品。可以通过受支持的浏览器访问，不必先下载手机应用。

## 更适合

适合愿意核对回答的用户，将其用于初稿、学习、规划和材料整理。建议用同一项不含敏感信息的真实任务，与 Claude 或 ChatGPT 对照，而不是只按模型名称选择。

## 选择前必须核对

- 网页部分功能无需登录；更多功能和活动保存需要 Google 账号。地区、年龄、账号类型和管理员权限会影响可用性，个人账号条款不能直接套用于工作或学校账号。
- 个人账号采用计算量相关限额，提示复杂度、模型、功能和对话长度都会影响消耗。官方说明每五小时刷新，但仍受周上限约束。付费提升访问额度，不代表无限使用；以账号当前限制为准。
- 关闭 Keep Activity 不等于零留存。官方说明个人账号聊天仍可能保留最多 72 小时；提交反馈还会影响相关内容的使用方式。上传机密资料前，先核对最新 Privacy Hub 和设置。

## 试用检查

先用一个已知答案的问题和一份代表性文档测试。记录事实纠错次数、有效输出、触发限额及核验耗时；分享结果或连接账号数据前检查引用与权限。这些是建议的检查步骤，不是我们已完成的性能实测，也不是准确性保证。

## 证据与核验范围

官方访问、额度和隐私文档核查于 ${checkedAt}，下次事实复查为 ${nextReviewDate}。本轮未核验你的账号资格、实际账单金额或独立采用评分。

- [账号与网页访问](${sources[0]})
- [使用限制与升级](${sources[1]})
- [隐私与留存](${sources[2]})`;
const detail = localized(detailEn, detailZh);
const additions = {
  editorial: {
    reviewedAt: checkedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: sources[0],
    summary: localized(
      'Official-source review of Gemini Apps access, usage and privacy boundaries.',
      '已依据官方资料核验 Gemini Apps 的访问、用量和隐私边界。',
    ),
    trustNote: localized('Not a hands-on benchmark or independent market validation.', '不是亲自实测或独立市场验证。'),
  },
  audience: {
    bestFit: localized(
      ['Drafting and planning', 'Learning with answer verification'],
      ['写作初稿与规划', '会核对答案的学习流程'],
    ),
    notIdealFor: localized(
      ['Unchecked factual decisions', 'Assuming personal chat is a zero-retention workspace'],
      ['不核实事实直接做决策', '把个人聊天当作零留存工作区'],
    ),
  },
  decision: {
    limitations: localized(
      [
        'Paid access is not unlimited.',
        'Keep Activity off is not zero retention.',
        'Work and school account terms differ.',
      ],
      ['付费不等于无限额度。', '关闭 Keep Activity 不等于零留存。', '工作与学校账号条款不同。'],
    ),
  },
  maintenanceReview: {
    checkedAt,
    nextReviewDate,
    sources,
    scope: 'Official access, usage and privacy only; no independent market score assigned.',
  },
};

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--pages', '--commit', '--status'].includes(arg)));
  assert(detailEn.includes('weekly limit') && detailZh.includes('72 小时'));
  assert(detailEn !== detailZh && sources.every((url) => new URL(url).hostname === 'support.google.com'));
  assert(!('marketValidation' in additions));
  if (args.includes('--check')) {
    console.log('PASS bilingual content, official sources and no fabricated market validation');
    return;
  }
  if (args.includes('--pages')) {
    const base = process.env.SEO_BASE_URL || 'http://localhost:3000';
    for (const [path, needle] of [
      ['/ai/gemini', 'This page evaluates Google Gemini Apps'],
      ['/cn/ai/gemini', '本页评估 Google Gemini Apps'],
    ]) {
      const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
      assert.equal(response.status, 200);
      const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      assert(html.includes(needle) && html.includes(nextReviewDate), `${path}: reviewed visible content missing`);
      assert(!html.includes('everyday mobile use'), `${path}: legacy content remains`);
      assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`));
      assert(!/<meta[^>]*name="(?:robots|googlebot)"[^>]*content="[^"]*noindex/i.test(html));
      assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''));
      assert(html.includes('hrefLang="en"') || html.includes('hreflang="en"'));
      for (const url of sources) assert(html.includes(url), `${path}: source missing`);
      console.log(`PASS ${path}: visible reviewed content, sources, canonical and existing index status`);
    }
    const sitemapResponse = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
    assert.equal(sitemapResponse.status, 200);
    const sitemap = await sitemapResponse.text();
    for (const path of ['/ai/gemini', '/cn/ai/gemini']) {
      assert(sitemap.includes(`<loc>https://aibesttool.com${path}</loc>`));
    }
    console.log(`PASS existing bilingual sitemap entries; total ${(sitemap.match(/<loc>/g) || []).length} URLs`);
    return;
  }
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    // Updating content also rebuilds the database-managed search vector.
    const select = `SELECT content,detail,features,next_review_date::text AS next_review_date,
      to_jsonb(t)-'content'-'detail'-'features'-'next_review_date'-'updated_at'-'search_vector' AS stable FROM tools t WHERE id=$1 AND name='gemini'`;
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id])).rows[0];
    assert(before && before.stable.status === 'published' && before.stable.page_quality_status === 'continue_index');
    const alreadyApplied = before.features?.maintenanceReview?.checkedAt === checkedAt;
    assert(before.features === null || alreadyApplied, 'Existing editorial data changed; review before replacing it');
    if (!alreadyApplied) {
      assert(
        before.detail.en.includes('everyday mobile use') && before.next_review_date === null,
        'Legacy baseline changed',
      );
    }
    if (!args.includes('--status') && !alreadyApplied) {
      await client.query(
        'UPDATE tools SET content=$2::jsonb,detail=$3::jsonb,features=$4::jsonb,next_review_date=$5::date,updated_at=now() WHERE id=$1',
        [id, JSON.stringify(content), JSON.stringify(detail), JSON.stringify(additions), nextReviewDate],
      );
    }
    const after = (await client.query(select, [id])).rows[0];
    assert.deepEqual(after.stable, before.stable, 'Identity, media, publication and index fields must not change');
    assert.deepEqual(after.detail, detail);
    assert.deepEqual(after.content, content);
    assert.deepEqual(after.features, additions);
    assert.equal(after.next_review_date, nextReviewDate);
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          alreadyApplied,
          nextReviewDate,
          identityAndIndexUnchanged: true,
          marketValidationAssigned: false,
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
