import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

export const sunoReview = {
  id: 'fc8fce43-88ef-4817-ac3f-028231da4b4b',
  slug: 'suno_ai',
  reviewedAt: '2026-09-21',
  nextReviewDate: '2026-10-21',
  officialSources: [
    { label: 'Suno pricing and plan comparison', url: 'https://suno.com/pricing' },
    { label: 'Paid subscription rights and downloads', url: 'https://help.suno.com/en/articles/9601665' },
    { label: 'Song ownership by creation-time subscription', url: 'https://help.suno.com/en/articles/2416769' },
    { label: 'Suno Terms of Service', url: 'https://about.suno.com/terms' },
  ],
  independentSources: [
    {
      label: 'Google Play listing and public install/review signal',
      url: 'https://play.google.com/store/apps/details?id=com.suno.android',
    },
  ],
} as const;

const localized = <T>(en: T, zh: T) => ({ en, zh, cn: zh, tw: zh });

const content = localized(
  'Suno is an AI music-creation service for making songs from prompts and uploaded audio. Choose it for fast songwriting and arrangement exploration only after checking the plan, creation time, download time, commercial-use boundary, and rights in your source material.',
  'Suno 是通过提示词和上传音频创作歌曲的 AI 音乐服务。它适合快速写歌和编曲探索；选择前必须核对套餐、创建时点、下载时点、商业使用边界以及源素材权利。',
);

const detailEn = `## What Suno is

Suno is an AI music-creation service for turning prompts and audio inputs into songs. Current product material describes generation, audio upload, editing, stem separation, custom models, and a higher-tier Studio workflow.

## Best fit

- Songwriters and creators exploring fast draft, arrangement, and lyric-to-song workflows.
- Teams that can keep a release record for the account, plan, creation date, download date, and source material behind every output.
- Users prepared to test whether a specific model, queue, editing feature, and download allowance fits their project before committing.

## Check before choosing

- Free, Pro, and Premier differ in models, credits, downloads, queues, audio uploads, editing, stem tools, and commercial rights. Pro and Premier list commercial rights; verify the live plan table and checkout terms rather than relying on a cached or promotional price.
- Free-plan songs have no commercial rights and no monthly song downloads. The current pricing page is the source of truth for live allowances and feature availability.
- Suno says a user subscribed to Pro or Premier when a song is created is considered the owner of that song and retains commercial-use rights after cancelling. Separately, its paid-rights help page says songs downloaded while subscribed are granted commercial-use rights. Treat creation time and download time as separate checks, retain the account history, and ask Suno or qualified counsel about a specific release.
- Commercial-use permission does not guarantee copyright protection; Suno states that copyright qualification is determined by the relevant jurisdiction. Do not market a generated song as legally cleared, exclusive, or copyright-protected without the required rights review.
- Upload only material and voices you have rights, permissions, and consent to use. The terms restrict a Voice Model to your own voice and prohibit impersonation, infringement, and certain competing-model uses.

## Decision summary

Choose Suno when the job is rapid song ideation or creator experimentation and you can maintain provenance and subscription-timing records. Do not choose it when the project requires a guaranteed copyright outcome, exclusive output, cleared third-party samples or voices, or a validated production-quality benchmark. Start with the free experience for workflow fit; move to a paid tier only after the live plan and intended release rights are acceptable.

## Evidence and review boundary

Official product, plan, ownership, commercial-rights, download, and terms boundaries were reviewed on ${sunoReview.reviewedAt}. The independent mobile-store signal below supports market maturity only. This is a source-based editorial review, not a completed hands-on music-quality, originality, clearance, or distribution-acceptance test.`;

const detailZh = `## Suno 是什么

Suno 是将提示词和音频输入转为歌曲的 AI 音乐创作服务。当前产品资料描述了生成、音频上传、编辑、分轨、自定义模型和高阶 Studio 工作流。

## 更适合

- 希望快速完成歌曲草稿、编曲探索或歌词转歌曲流程的写作者和创作者。
- 能为每个输出保留账号、套餐、创建日期、下载日期和源素材记录的团队。
- 愿意先验证某一模型、队列、编辑功能和下载额度是否符合项目需求的用户。

## 选择前必须核对

- Free、Pro、Premier 在模型、credits、下载、队列、音频上传、编辑、分轨和商业权利上不同。Pro 与 Premier 列出商业权利；付款前应核对实时套餐表和结账条款，而不是沿用缓存或促销价格。
- 免费套餐歌曲没有商业权利，也没有每月歌曲下载额度。实时额度和功能可用性应以当前价格页为准。
- Suno 说明：在 Pro 或 Premier 订阅期间创建的歌曲，订阅用户被视为该歌曲所有者，并在取消订阅后保留商业使用权；其付费权利帮助页又说明，在订阅期间下载的歌曲会获得商业使用权。创建时点和下载时点应分开核对，保留账号历史；具体发行请向 Suno 或合格法律顾问确认。
- 商业使用许可不保证版权保护；Suno 说明版权资格由相关司法辖区决定。未经必要的权利审查，不应把生成歌曲宣传为已经合法清权、独占或必然受版权保护。
- 仅上传你拥有使用权、许可和同意的素材与声音。条款要求 Voice Model 只能是你自己的声音，并禁止冒充、侵权和部分竞争模型用途。

## 决策结论

当任务是快速歌曲构思或创作者实验，并且能维护来源与订阅时点记录时，可以选择 Suno。需要保证版权结果、独占输出、已清权的第三方采样或声音，或已验证的制作质量基准时，不应选择它。可先用免费体验验证工作流；只有在实时套餐和预期发行权利都合适时再考虑付费档位。

## 证据与核验边界

${sunoReview.reviewedAt} 已核验官方产品、套餐、所有权、商业权利、下载和条款边界。下方独立移动应用商店信号只用于判断市场成熟度。本页是来源核验式编辑分析，不声称已经完成真实音乐质量、原创性、权利清理或分发接受度测试。`;

export const sunoDecisionPayload = {
  content,
  detail: localized(detailEn, detailZh),
  tags: ['ai-music', 'song-generation', 'music-creation', 'commercial-rights'],
  useCases: localized(
    ['Songwriting drafts', 'Arrangement exploration', 'Lyric-to-song prototyping', 'Release-rights review preparation'],
    ['歌曲写作草稿', '编曲探索', '歌词转歌曲原型', '发行权利核对准备'],
  ),
  features: {
    audience: {
      bestFit: localized(
        [
          'Songwriters exploring drafts',
          'Creators prototyping songs from text or audio',
          'Teams tracking output provenance and subscription timing',
        ],
        ['探索歌曲草稿的写作者', '从文本或音频制作歌曲原型的创作者', '追踪输出来源和订阅时点的团队'],
      ),
      notIdealFor: localized(
        [
          'Projects requiring guaranteed copyright protection',
          'Releases using uncleared samples or another person’s voice',
          'Buyers needing a fixed unlimited download allowance',
        ],
        ['要求保证版权保护的项目', '使用未清权采样或他人声音的发行项目', '需要固定且不限量下载额度的购买者'],
      ),
    },
    editorial: {
      reviewedAt: sunoReview.reviewedAt,
      reviewedBy: 'AI Best Tool editorial',
      sourceUrl: sunoReview.officialSources[0].url,
      summary: localized(
        'Product scope, plan structure, creation-time ownership, download-time commercial rights, and terms limits reviewed against current official sources.',
        '已根据当前官方来源核验产品范围、套餐结构、创建时所有权、下载时商业权利和条款限制。',
      ),
      trustNote: localized(
        'Source-based review, not a music-quality or legal-clearance benchmark. Check both creation and download timing for each intended release.',
        '来源核验而非音乐质量或法律清权基准；每项预期发行都应核对创建与下载两个时点。',
      ),
    },
    decision: {
      compareAxes: localized(
        [
          'Song-generation workflow',
          'Plan-gated credits and downloads',
          'Creation-time ownership',
          'Download-time commercial rights',
          'Source-material and voice rights',
        ],
        ['歌曲生成工作流', '套餐限制的 credits 与下载', '创建时所有权', '下载时商业权利', '源素材与声音权利'],
      ),
      limitations: localized(
        [
          'Free-plan songs have no commercial rights',
          'Creation and download timing both matter',
          'Commercial use does not guarantee copyright protection',
          'Uploads and voices require rights and consent',
          'Features and allowances can change by plan',
        ],
        [
          '免费套餐歌曲没有商业权利',
          '创建与下载时点都重要',
          '商业使用不保证版权保护',
          '上传素材和声音需要权利与同意',
          '功能和额度会随套餐变化',
        ],
      ),
      pricingSummary: localized(
        'Free, Pro, and Premier have different access and rights boundaries; verify the live plan and checkout instead of a cached price.',
        'Free、Pro、Premier 的访问和权利边界不同；应核对实时套餐与结账信息，而不是依赖缓存价格。',
      ),
    },
    pricingSnapshot: {
      checkedAt: sunoReview.reviewedAt,
      model: 'freemium-subscription',
      summary: localized(
        'Free access plus Pro and Premier subscriptions. Credits, downloads, features, and commercial rights vary by active plan and can change.',
        '提供免费访问以及 Pro、Premier 订阅；credits、下载、功能和商业权利按当前套餐而异，并可能变化。',
      ),
      sourceUrls: [sunoReview.officialSources[0].url, sunoReview.officialSources[1].url],
    },
    evidence: { official: sunoReview.officialSources, independent: sunoReview.independentSources },
    marketValidation: {
      reviewedAt: sunoReview.reviewedAt,
      score: 90,
      verdict: 'validated',
      scores: { userValue: 22, independentValidation: 20, durability: 24, evidenceQuality: 16, strategicValue: 8 },
      strongSignals: ['major-mobile-store-presence', 'large-public-review-base'],
      supportingSignals: ['current-official-product-and-terms-documentation'],
      evidenceUrls: sunoReview.independentSources.map((source) => source.url),
      rationale: localized(
        'The mobile-store install and review signal supports durable public availability and market relevance only; it does not establish output quality, originality, clearance, or distribution acceptance.',
        '移动应用商店的安装量和公开评论信号只支持持续可用性与市场相关性；它不能证明输出质量、原创性、权利清理或分发接受度。',
      ),
    },
  },
};

export function validateSunoDecisionEvidence() {
  assert(sunoReview.officialSources.length >= 4);
  assert.equal(
    sunoReview.independentSources.length,
    1,
    'Independent evidence is intentionally limited to market maturity',
  );
  assert(detailEn.includes('Treat creation time and download time as separate checks'));
  assert(detailEn.includes('does not guarantee copyright protection'));
  assert(!detailEn.match(/\$\d/), 'Do not freeze volatile or promotional prices');
  assert.equal(
    Object.values(sunoDecisionPayload.features.marketValidation.scores).reduce((sum, score) => sum + score, 0),
    90,
  );
  for (const locale of ['en', 'zh', 'cn', 'tw'] as const) {
    assert(sunoDecisionPayload.features.audience.bestFit[locale].length >= 3);
    assert(sunoDecisionPayload.features.audience.notIdealFor[locale].length >= 3);
    assert(sunoDecisionPayload.features.decision.compareAxes[locale].length >= 5);
    assert(sunoDecisionPayload.features.decision.limitations[locale].length >= 5);
  }
}

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
  validateSunoDecisionEvidence();
  if (args.includes('--check')) return console.log('PASS Suno evidence and decision contract');

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:suno_ai'))");
    const select = `SELECT *, next_review_date::text AS next_review_date_text,
      to_jsonb(t)-'content'-'detail'-'features'-'use_cases'-'tags'-'next_review_date'-'updated_at'-'search_vector' AS stable
      FROM public.tools t WHERE id=$1 AND name=$2`;
    const params = [sunoReview.id, sunoReview.slug];
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
    assert(before, 'Suno fixed record not found');
    assert.equal(before.status, 'published');
    assert.equal(before.page_quality_status, 'continue_index');

    const alreadyApplied = before.features?.editorial?.reviewedAt === sunoReview.reviewedAt;
    if (!args.includes('--status') && !alreadyApplied) {
      assert(
        !before.features?.editorial?.reviewedAt,
        'Suno has a newer editorial record; audit instead of overwriting',
      );
      await client.query(
        `UPDATE public.tools SET content=$3::jsonb, detail=$4::jsonb, features=$5::jsonb,
         use_cases=$6::jsonb, tags=$7::text[], next_review_date=$8::date, updated_at=now()
         WHERE id=$1 AND name=$2`,
        [
          ...params,
          JSON.stringify(sunoDecisionPayload.content),
          JSON.stringify(sunoDecisionPayload.detail),
          JSON.stringify(sunoDecisionPayload.features),
          JSON.stringify(sunoDecisionPayload.useCases),
          sunoDecisionPayload.tags,
          sunoReview.nextReviewDate,
        ],
      );
    }

    const after = (await client.query(select, params)).rows[0];
    if (!args.includes('--status') && !alreadyApplied) {
      assert.deepEqual(
        after.stable,
        before.stable,
        'Protected ID, slug, canonical, media, category, pricing, and index fields changed',
      );
      assert.deepEqual(after.features, sunoDecisionPayload.features);
      assert.deepEqual(after.use_cases, sunoDecisionPayload.useCases);
      assert.deepEqual(after.tags, sunoDecisionPayload.tags);
      assert.equal(after.next_review_date_text, sunoReview.nextReviewDate);
    }
    assert.equal(getToolIndexDecision(indexInput(after)).indexable, true, 'Suno must remain indexable');
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          slug: sunoReview.slug,
          alreadyApplied,
          indexable: true,
          nextReviewDate: after.next_review_date_text,
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

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
