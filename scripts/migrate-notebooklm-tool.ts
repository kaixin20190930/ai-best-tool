import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const id = 'cec78907-e2a1-4eb7-853a-a58334026280';
const reviewedAt = '2026-09-06';
const nextReviewDate = '2026-09-20';
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh, tw: zh });

const officialSources = [
  'https://support.google.com/notebooklm/answer/16164461?hl=en',
  'https://support.google.com/googleone/answer/16105039?hl=en',
  'https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/',
];
const independentSources = [
  'https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/',
  'https://www.androidauthority.com/notebooklm-poll-result-3532575/',
];

const detailEn = `## What NotebookLM is

NotebookLM is Google's source-grounded research and learning workspace. Users add a bounded set of documents, web pages, YouTube videos, audio or other supported material, then ask questions and create outputs such as notes, reports, quizzes, flashcards, mind maps, Audio Overviews and Video Overviews. It is not an open-web search engine and it does not make weak source material authoritative.

## Best fit

- Students, researchers and operators who already have a defined source set and need to compare, summarize or navigate it.
- Teams that want answers linked back to supplied material and can still open the cited passage before making a consequential claim.
- People comparing a source workspace with open-web research tools such as Perplexity or literature-specific tools such as Consensus.

## Check before choosing

- NotebookLM is freemium rather than simply free. Limits depend on Standard, Google AI Plus, Pro or Ultra access and can vary by country and account. At the ${reviewedAt} review, Google documents up to 100 sources per notebook for AI Plus, 300 for AI Pro and 600 for AI Ultra; generation and Q&A limits also differ. Verify the live account instead of relying on an old fixed quota.
- Source grounding narrows the evidence set but does not prove that every summary, inference or citation is correct. Inspect the cited passage, check whether a source is current and independent, and do not use generated study material as the only authority for exams, medical, legal or financial decisions.
- Output quality depends on source quality, extraction and scope. Scanned PDFs, charts, audio transcripts, conflicting documents and missing context can produce incomplete or misleading synthesis even when the answer appears cited.
- Data handling differs by account. Google states that Workspace and Workspace for Education uploads, queries and responses are not reviewed by human reviewers and are not used to train AI models. Personal-account users should read the current notice and privacy policy rather than assuming the same contractual boundary.
- NotebookLM helps analyze material already selected. If the hard part is discovering a complete body of evidence, running a reproducible systematic search or checking citation support across the literature, use a dedicated discovery or citation tool before importing the final source set.

## Decision summary

Create one notebook from a representative source set containing at least one long document, one web source and one conflicting claim. Test five factual questions, one cross-source synthesis and one generated learning output. Record citation accuracy, missing context, correction time and whether the notebook reduces manual rereading. Keep NotebookLM when a bounded source workspace improves navigation and synthesis; compare Perplexity for open-web discovery and Consensus or Scite for literature-specific evidence checks.

## Evidence and sources

- [NotebookLM product and data notice](https://support.google.com/notebooklm/answer/16164461?hl=en)
- [Google AI plan and source limits](https://support.google.com/googleone/answer/16105039?hl=en)
- [Supported audio and YouTube source workflows](https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/)
- [Independent consumer AI adoption analysis](https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/)
- [Independent user poll](https://www.androidauthority.com/notebooklm-poll-result-3532575/)

This is a source-based editorial review. Independent adoption signals are directional and do not replace a hands-on accuracy test.`;

const detailZh = `## NotebookLM 是什么

NotebookLM 是 Google 的资料锚定型研究与学习工作空间。用户先加入限定范围的文档、网页、YouTube 视频、音频或其他支持材料，再进行问答并生成笔记、报告、测验、闪卡、思维导图、Audio Overviews 和 Video Overviews。它不是开放网页搜索引擎，也不会自动把质量较差的来源变成权威证据。

## 更适合

- 已经有明确资料集，需要比较、总结或快速定位内容的学生、研究者和运营人员。
- 希望回答能够回到已提供材料，并愿意在重要决策前打开引文原文的团队。
- 正在比较资料工作空间、Perplexity 一类开放网页研究工具，以及 Consensus 一类学术检索工具的用户。

## 选择前必须核对

- NotebookLM 是 freemium，而不是简单的“完全免费”。额度取决于 Standard、Google AI Plus、Pro 或 Ultra，并可能随国家和账号变化。${reviewedAt} 核验时，Google 说明 AI Plus 每个 notebook 最多 100 个来源，AI Pro 为 300 个，AI Ultra 为 600 个；生成和问答额度也不同。应以实际账号为准，不沿用旧的固定额度。
- 资料锚定可以缩小证据范围，但不能证明每条总结、推断或引用都正确。重要结论必须打开引文段落，核对来源是否最新和独立；考试、医疗、法律或金融判断不能只依赖生成的学习材料。
- 输出质量取决于来源质量、解析结果和材料范围。扫描 PDF、图表、音频转录、相互冲突的文档和缺失上下文，即使显示引用，也可能形成不完整或误导性综合。
- 数据处理因账号而异。Google 表示 Workspace 与 Workspace for Education 用户的上传、查询和模型回答不会由人工审阅，也不会用于训练 AI 模型。个人账号用户应查看当前产品提示和隐私政策，不能假定具有相同合同边界。
- NotebookLM 擅长分析已经选定的材料。如果真正困难的是发现完整证据集、执行可复现的系统检索或核对论文引用支持，应先使用专门的发现或引文工具，再导入最终来源集。

## 决策结论

用一组代表性材料建立 notebook，其中至少包含一份长文档、一个网页来源和一组相互冲突的说法。测试五个事实问题、一次跨来源综合和一种学习输出，记录引用准确性、缺失上下文、修正时间，以及是否减少重复阅读。需要在限定资料内提高导航和综合效率时保留 NotebookLM；开放网页发现比较 Perplexity，学术证据检索和引文核对比较 Consensus 或 Scite。

## 证据与来源

- [NotebookLM 产品与数据说明](https://support.google.com/notebooklm/answer/16164461?hl=en)
- [Google AI 套餐与来源额度](https://support.google.com/googleone/answer/16105039?hl=en)
- [音频与 YouTube 来源工作流](https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/)
- [独立消费者 AI 采用分析](https://a16z.com/state-of-consumer-ai-2025-product-hits-misses-and-whats-next/)
- [独立用户调查](https://www.androidauthority.com/notebooklm-poll-result-3532575/)

本页为来源核验式编辑分析。独立采用信号只说明需求方向，不能替代真实准确性测试。`;

const features = {
  audience: {
    bestFit: localized(
      ['Bounded-source research', 'Study and knowledge synthesis', 'Document-grounded question answering'],
      ['限定资料研究', '学习与知识综合', '基于文档的问答'],
    ),
    notIdealFor: localized(
      ['Complete open-web discovery', 'Unverified high-stakes conclusions', 'Poor-quality or incomplete source sets'],
      ['完整开放网页发现', '未经核验的高风险结论', '低质量或不完整的资料集'],
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: officialSources[0],
    summary: localized(
      'Product scope, plan-dependent limits, source formats, account-level data handling and citation boundaries reviewed.',
      '已核验产品范围、套餐额度、来源格式、账号数据处理和引用边界。',
    ),
    trustNote: localized(
      'Source-based review. Citation accuracy has not yet been tested by the directory on a controlled source set.',
      '来源核验；目录尚未使用受控资料集完成引用准确性实测。',
    ),
  },
  marketValidation: {
    reviewedAt,
    score: 90,
    verdict: 'Validated',
    scores: { userValue: 24, independentValidation: 20, durability: 23, evidenceQuality: 15, strategicValue: 8 },
    strongSignals: ['google-product-since-2023', 'a16z-2025-consumer-ai-adoption-signal'],
    supportingSignals: ['independent-user-poll', 'continued-first-party-feature-expansion'],
    evidenceUrls: [...officialSources, ...independentSources],
    rationale: localized(
      'Multi-year operation, continued product expansion and independent consumer adoption analysis support mature demand. Independent accuracy evidence remains thinner than usage visibility.',
      '多年持续运营、功能扩展和独立消费者采用分析支持成熟需求；独立准确性证据仍弱于使用可见度。',
    ),
  },
  trialTemplate: {
    targetOutcome: localized(
      'Verify whether NotebookLM reduces rereading while preserving citation accuracy across a representative mixed-format source set.',
      '使用代表性的混合格式资料集，验证 NotebookLM 能否在保持引用准确性的同时减少重复阅读。',
    ),
    checks: localized(
      ['Add a mixed-format source set', 'Test five factual questions', 'Test one conflicting claim', 'Inspect every cited passage', 'Record correction time and missing context'],
      ['加入混合格式资料集', '测试五个事实问题', '测试一组冲突说法', '检查每个引用段落', '记录修正时间和缺失上下文'],
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
  assert.equal(Object.values(features.marketValidation.scores).reduce((sum, value) => sum + value, 0), 90);
  assert(detailEn.length > 2800 && detailZh.length > 1400);
  for (const source of [...officialSources, ...independentSources]) assert(detailEn.includes(source));
  for (const asset of ['public/icons/tool-logos/notebooklm.svg', 'public/images/tool-media/notebooklm-cover.svg']) {
    assert(fs.existsSync(asset), `${asset}: asset missing`);
  }
  if (args.includes('--check')) {
    console.log('PASS NotebookLM identity, evidence, limits, market validation and trial template');
    return;
  }

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:notebooklm'))");
    const conflicts = await client.query(
      `SELECT id, name, url FROM tools
       WHERE lower(name)='notebooklm'
          OR lower(url) ~ '^https?://notebooklm\\.google\\.com([/?#]|$)'`,
    );
    assert(conflicts.rows.every((row) => row.id === id), 'Conflicting NotebookLM slug or URL');
    // Research is a virtual hub; existing research tools use Productivity as their storage category.
    const category = await client.query("SELECT id FROM categories WHERE slug='productivity'");
    assert.equal(category.rowCount, 1, 'Productivity storage category must exist exactly once');

    if (!args.includes('--status')) {
      await client.query(
        `INSERT INTO tools
        (id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing,
         features, use_cases, screenshots, status, page_quality_status, next_review_date, created_at, updated_at)
        VALUES ($1, 'notebooklm', $2, $3, $4, 'https://notebooklm.google.com/',
          '/icons/tool-logos/notebooklm.svg', '/images/tool-media/notebooklm-cover.svg', $5, $6,
          'freemium', $7, $8, ARRAY[]::text[], 'published', 'monitor', $9::date, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING`,
        [
          id,
          localized('NotebookLM Source-Grounded Research', 'NotebookLM 资料锚定研究'),
          localized(
            'Analyze a bounded source set with linked answers and generated study outputs. Compare plan limits, source quality, citation accuracy and account-level data handling.',
            '围绕限定资料集进行带引用的问答并生成学习输出，重点比较套餐额度、来源质量、引用准确性和账号数据处理边界。',
          ),
          localized(detailEn, detailZh),
          category.rows[0].id,
          ['research', 'source-grounded', 'document-qa', 'study', 'audio-overviews'],
          features,
          localized(
            ['Source-set synthesis', 'Document question answering', 'Study guides and audio overviews'],
            ['资料集综合', '文档问答', '学习指南与音频概览'],
          ),
          nextReviewDate,
        ],
      );
    }

    const result = await client.query(
      "SELECT *, next_review_date::text AS next_review_date_text FROM tools WHERE id=$1 AND name='notebooklm'",
      [id],
    );
    assert.equal(result.rowCount, 1, 'NotebookLM record missing');
    const row = result.rows[0];
    assert.equal(row.status, 'published');
    assert.equal(row.page_quality_status, 'monitor');
    assert.equal(row.pricing, 'freemium');
    assert.equal(row.next_review_date_text, nextReviewDate);
    assert.equal(row.features.editorial.reviewedAt, reviewedAt);
    assert.equal(row.features.marketValidation.score, 90);
    const indexDecision = getToolIndexDecision(indexInput(row));
    assert.equal(indexDecision.indexable, false);
    assert.equal(indexDecision.reason, 'indexing_paused');

    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({
      success: true,
      mode: args.includes('--commit') ? 'committed' : args.includes('--status') ? 'status' : 'dry-run-rollback',
      id,
      slug: 'notebooklm',
      pricing: row.pricing,
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
  console.error(error instanceof Error ? error.message : 'NotebookLM migration failed');
  process.exitCode = 1;
});
