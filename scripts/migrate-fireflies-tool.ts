import assert from 'node:assert/strict';
import fs from 'node:fs';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const id = '57b270b9-78cf-41f8-8b74-dec46400cd65';
const reviewedAt = '2026-09-20';
const nextReviewDate = '2026-10-20';
const localized = (en: unknown, zh: unknown) => ({ en, zh, cn: zh, tw: zh });

const officialSources = [
  'https://guide.fireflies.ai/articles/4027724828-learn-about-the-fireflies-free-plan',
  'https://guide.fireflies.ai/articles/1055386295-learn-about-transcription-credits',
  'https://guide.fireflies.ai/articles/2631950139-learn-about-transcription-credits-storage-and-rate-limits-for-meetings',
];

const detailEn = `## What Fireflies is

Fireflies is an AI meeting assistant for recording or uploading conversations, producing transcripts and summaries, extracting action items, searching meeting history, and moving meeting knowledge into team workflows.

## Best fit

- Teams with recurring meetings that will reuse transcripts, summaries, decisions, and follow-up items.
- Groups prepared to configure auto-join, participant notice, sharing, retention, and downstream integrations.
- Buyers willing to compare transcription, storage, AI-credit, upload, and plan limits instead of treating every “unlimited” label as equivalent.

## Check before choosing

- The current Free plan has signup-dependent transcription credits. Auto-join can unlock unlimited eligible meeting transcription, while summaries and uploaded files still follow credit rules.
- Free storage is 400 meeting minutes per seat. Paid upload sources have monthly rate limits, and plan or account age can change applicable boundaries.
- Advanced features use a separate AI-credit model. Credit use varies by feature and query complexity, so transcription access does not imply unlimited advanced analysis.
- Automatic meeting attendance, recording, sharing, CRM sync, and searchable history increase consent, confidentiality, retention, access, and offboarding obligations.
- Transcripts, speaker labels, summaries, action items, and generated answers require review before they are used for commitments, personnel decisions, disputes, or regulated work.

## Decision summary

Choose Fireflies when repeated meetings create enough retrieval and follow-up work to justify a governed meeting-memory system. Compare Otter.ai, Fathom, or platform-native notes when you need a simpler capture workflow, different bot behavior, clearer plan limits, or fewer downstream data copies.

## Evidence and sources

- [Free-plan boundary](${officialSources[0]})
- [Transcription-credit rules](${officialSources[1]})
- [Storage and upload limits](${officialSources[2]})

This is a source-based editorial review, not a completed hands-on benchmark.`;

const detailZh = `## Fireflies 是什么

Fireflies 是 AI 会议助手，可记录或上传对话，生成转录与摘要、提取行动项、搜索会议历史，并把会议知识带入团队工作流。

## 更适合

- 需要反复复用转录、摘要、决策和跟进行动的高会议频率团队。
- 能治理自动入会、参会者告知、共享、留存和下游集成的组织。
- 会同时比较转录、存储、AI credits、上传和套餐限制，而不是只看“无限”标签的采购者。

## 选择前必须核对

- 当前 Free 套餐的初始转录 credits 会因注册入口不同而变化；开启符合条件的 Auto-join 可获得不限次数会议转录，但摘要和上传文件仍受 credits 规则约束。
- Free 每席位提供 400 分钟会议存储。付费上传来源仍有月度 rate limit，而且账号创建时间和套餐可能改变适用边界。
- 高级功能使用独立 AI credits，消耗会随功能和查询复杂度变化；能转录不等于高级分析不限量。
- 自动入会、录制、共享、CRM 同步和可搜索历史会扩大同意、保密、留存、权限和离职交接责任。
- 转录、说话人标签、摘要、行动项和生成回答都需要复核，不能直接用于承诺、人事判断、争议或受监管工作。

## 决策结论

当重复会议带来的检索和跟进工作足以证明一个受治理的会议记忆系统有价值时，可以选择 Fireflies；如果需要更简单的采集流程、不同的机器人行为、更清晰的套餐边界或更少的数据副本，应继续比较 Otter.ai、Fathom 或会议平台自带笔记。

本页是来源核验式编辑分析，不声称已经完成真实使用基准测试。`;

const features = {
  audience: {
    bestFit: localized(
      ['Meeting-heavy teams', 'Teams reusing conversation knowledge', 'Organizations with governance controls'],
      ['高会议频率团队', '需要复用对话知识的团队', '具备治理控制的组织'],
    ),
    notIdealFor: localized(
      [
        'Unnoticed confidential recording',
        'Authoritative transcripts without review',
        'Teams unable to govern auto-join and sharing',
      ],
      ['未经告知的敏感录制', '要求转录无需复核即可作为权威记录', '无法治理自动入会和共享的团队'],
    ),
  },
  editorial: {
    reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: officialSources[0],
    summary: localized(
      'Free-plan transcription, storage and AI-credit boundaries reviewed against current official documentation.',
      '已根据当前官方文档核验免费套餐转录、存储和 AI credits 边界。',
    ),
    trustNote: localized(
      'Source-based review. Account-age and auto-join conditions can change the applicable free boundary.',
      '来源核验；账号创建时间与 Auto-join 条件可能改变适用的免费边界。',
    ),
  },
  marketValidation: {
    reviewedAt,
    score: 95,
    verdict: 'validated',
    evidenceUrls: officialSources,
    rationale: localized(
      'Mature meeting workflows and current official documentation support inclusion; consent, accuracy, plan complexity and downstream data governance remain material constraints.',
      '成熟会议工作流和当前官方文档支持收录；同意、准确性、套餐复杂度和下游数据治理仍是重要限制。',
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
  assert(detailEn.length > 1000, 'English decision detail is incomplete');
  assert(detailZh.length > 500, 'Chinese decision detail is incomplete');
  assert(officialSources.every((source) => detailEn.includes(source)));
  for (const asset of ['public/icons/tool-logos/fireflies.svg', 'public/images/tool-media/fireflies-cover.svg']) {
    assert(fs.existsSync(asset), `${asset}: asset missing`);
  }
  if (args.includes('--check')) {
    console.log('PASS Fireflies identity, current official evidence, decision boundaries and local assets');
    return;
  }

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:fireflies'))");
    const conflicts = await client.query(
      `SELECT id, name, url FROM tools
       WHERE lower(name) IN ('fireflies', 'fireflies-ai', 'fireflies.ai')
          OR lower(url) ~ '^https?://(www\\.)?fireflies\\.ai([/?#]|$)'`,
    );
    assert(
      conflicts.rows.every((row) => row.id === id),
      'Conflicting Fireflies slug or URL',
    );
    const category = await client.query("SELECT id FROM categories WHERE slug='productivity'");
    assert.equal(category.rowCount, 1, 'Productivity category missing or duplicated');

    await client.query(
      `INSERT INTO tools (
         id, name, title, content, detail, url, image_url, thumbnail_url, category_id, tags, pricing,
         features, use_cases, screenshots, video_url, status, page_quality_status, next_review_date
       ) VALUES ($1,'fireflies',$2::jsonb,$3::jsonb,$4::jsonb,'https://fireflies.ai/',
         '/icons/tool-logos/fireflies.svg','/images/tool-media/fireflies-cover.svg',$5,
         ARRAY['ai-meeting-assistant','meeting-notes','transcription','conversation-intelligence'],'freemium',
         $6::jsonb,$7::jsonb,ARRAY[]::text[],NULL,'published','monitor',$8::date)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,title=EXCLUDED.title,content=EXCLUDED.content,detail=EXCLUDED.detail,
         url=EXCLUDED.url,image_url=EXCLUDED.image_url,thumbnail_url=EXCLUDED.thumbnail_url,
         category_id=EXCLUDED.category_id,tags=EXCLUDED.tags,pricing=EXCLUDED.pricing,
         features=EXCLUDED.features,use_cases=EXCLUDED.use_cases,status='published',
         page_quality_status='monitor',next_review_date=EXCLUDED.next_review_date,updated_at=NOW()`,
      [
        id,
        JSON.stringify(
          localized('Fireflies AI Meeting Notes and Conversation Intelligence', 'Fireflies AI 会议笔记与对话智能'),
        ),
        JSON.stringify(
          localized(
            'Fireflies records or imports meetings, creates transcripts and summaries, and helps teams search and act on conversation knowledge.',
            'Fireflies 可记录或上传会议，生成转录与摘要，并帮助团队检索和使用对话知识。',
          ),
        ),
        JSON.stringify(localized(detailEn, detailZh)),
        category.rows[0].id,
        JSON.stringify(features),
        JSON.stringify(
          localized(
            [
              'Record and review meetings',
              'Search conversation history',
              'Prepare follow-up actions',
              'Test meeting-data governance',
            ],
            ['记录并复核会议', '检索对话历史', '准备后续行动', '测试会议数据治理'],
          ),
        ),
        nextReviewDate,
      ],
    );
    const row = await client.query('SELECT * FROM tools WHERE id=$1', [id]);
    assert.equal(row.rowCount, 1);
    const decision = getToolIndexDecision(indexInput(row.rows[0]));
    assert.equal(decision.indexable, false, 'Fireflies must remain monitor/noindex');
    assert.equal(row.rows[0].name, 'fireflies');
    assert.equal(row.rows[0].status, 'published');

    if (args.includes('--commit')) await client.query('COMMIT');
    else await client.query('ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args.includes('--commit') ? 'commit' : 'dry-run',
          id,
          slug: 'fireflies',
          indexable: decision.indexable,
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
