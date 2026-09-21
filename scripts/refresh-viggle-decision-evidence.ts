import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

export const viggleReview = {
  id: 'a838bc9e-6653-4608-86d5-144cb703075b',
  slug: 'viggle',
  canonicalPath: '/ai/viggle',
  reviewedAt: '2026-09-21',
  nextReviewDate: '2026-10-21',
  officialSources: [
    { label: 'Viggle product and platform overview', url: 'https://viggle.ai/' },
    { label: 'Viggle creator-plan pricing and limits', url: 'https://viggle.ai/pricing' },
    { label: 'Viggle Terms of Use', url: 'https://viggle.ai/terms-of-use' },
    { label: 'Viggle Privacy Policy', url: 'https://viggle.ai/privacy-policy' },
    { label: 'Viggle API pricing and retention', url: 'https://docs.viggle.ai/v1/pricing' },
    {
      label: 'Viggle API reference-to-video quick start',
      url: 'https://docs.viggle.ai/v1/guides/quickstart-reference-to-video',
    },
  ],
} as const;

const localized = <T>(en: T, zh: T) => ({ en, zh, cn: zh, tw: zh });

const content = localized(
  'Viggle is a character, motion, and video-creation platform with web, iOS/Android app, and developer API paths. Compare plan gates, separate API billing, upload rights, training-use conditions, and retention before using it for a production workflow.',
  'Viggle 是提供角色、动作和视频创作的平台，包含网页、iOS/Android 应用和开发者 API 路径。用于正式工作流前，应比较套餐门槛、独立 API 计费、上传权利、训练使用条件和留存边界。',
);

const detailEn = `## What Viggle is

Viggle provides character swapping, motion capture and character animation, real-time swap, meme/video creation, 3D motion-capture and character-asset workflows, plus a developer API. The official site presents web creation, an iPhone/Android app, and API access as separate product paths; API use requires its own key and billing balance.

## Best fit

- Creators making character-led short videos, remixes, or motion-driven social content who can test the exact model and plan before a deadline.
- Animation or game teams evaluating PINOC motion capture or 3D character/motion exports in their own pipeline.
- Developers who need an API for character, motion, video, or remix workflows and can account for asynchronous jobs, per-operation credits, and temporary result links.

## Check before choosing

- The current web-plan snapshot is Free at $0, Pro at $7.99/month, Live at $15.99/month, and Max at $63.99/month. The displayed paid amounts are promotional monthly prices at this review date, so check the live plan table and checkout; the Terms say fees can change without notice.
- Free currently includes 5 videos/day, one concurrent generation, limited multi-track and real-time swap, and 7-day asset and generation storage. Pro, Live, and Max raise monthly credits (80/200/800), concurrency (4/6/10), storage, model access, watermark removal, and real-time-swap capacity. Monthly subscription credits expire on the billing date; purchased credits do not expire but require an active Viggle plan to use.
- Consumer-plan limits do not describe API cost. API credits are priced separately at $0.01 each; official API documentation lists per-operation charges and says new accounts start with 100 free API credits. A reference-to-video request needs an API key and asynchronous polling, and its signed result URL is valid for one hour.
- You are responsible for the rights, permissions, and consent for uploaded images, video, music, likenesses, and livestream content. Viggle may remove celebrity likenesses, infringing music, or other content that violates its rules. Do not treat character swapping or motion generation as clearance for a person, brand, soundtrack, or other third-party material.
- The Terms describe user content as non-confidential and grant Viggle a broad licence to use it, including to improve and train or fine-tune its tools. The stated training exception covers content submitted/generated through the API and content provided/generated while you are a paid user, unless prior written consent is given; it is not a blanket privacy or confidentiality guarantee. Opting in to share content can allow other users to view, download, copy, modify, and use it.
- The service and some features may be beta, change without notice, have limited functionality, or be unavailable. Keep your own backup; the Terms disclaim responsibility for failure to store, loss, or corruption of user content. Do not remove watermarks or other legal notices from outputs where present.

## Decision summary

Choose Viggle when the task specifically needs character motion, swaps, or motion-capture-derived assets and the team can validate the selected product path, plan limit, source-material rights, and retention model. Do not choose it as a substitute for cleared talent or music rights, confidential media handling, a guaranteed output-quality benchmark, or a fixed all-inclusive API budget. Compare a character-animation workflow with broader video-generation or post-production tools when control, licensing, editing, and delivery requirements extend beyond movement and character effects.

## Evidence and review boundary

Official product, creator-plan, API, terms, and privacy material were reviewed on ${viggleReview.reviewedAt}. This is a source-based editorial review, not a hands-on quality, latency, output-safety, legal-clearance, or production-reliability benchmark. This maintenance pass used official sources only, so it does not re-score independent market validation or assert a user-adoption conclusion.`;

const detailZh = `## Viggle 是什么

Viggle 提供角色替换、动作捕捉与角色动画、实时换人、表情包/视频创作、3D 动作捕捉和角色资产工作流，以及开发者 API。官方将网页创作、iPhone/Android 应用和 API 作为不同产品路径；API 需要独立密钥和余额。

## 更适合

- 能在上线前验证具体模型和套餐的角色短视频、混剪或动作驱动社媒内容创作者。
- 希望在自身流程中评估 PINOC 动作捕捉或 3D 角色/动作导出的动画与游戏团队。
- 需要通过 API 使用角色、动作、视频或混剪流程，并能处理异步任务、按操作 credits 和临时结果链接的开发团队。

## 选择前必须核对

- 本次复核时网页套餐为 Free $0、Pro $7.99/月、Live $15.99/月、Max $63.99/月。付费显示金额是本复核日期的月付促销价；应核对实时套餐表和结账页，条款说明费用可在不另行通知时变更。
- Free 当前包含每天 5 条视频、一次并发生成、有限的多轨与实时换人，以及 7 天资产和生成结果存储。Pro、Live、Max 分别提高月 credits（80/200/800）、并发数（4/6/10）、存储、模型权限、去水印和实时换人能力。月订阅 credits 在账单日失效；另购 credits 不失效，但使用时仍需有效 Viggle 套餐。
- 网页套餐限制不等于 API 成本。API credits 单价为 $0.01，官方 API 文档列出按操作计费，并说明新账户有 100 个免费 API credits。参考视频生成需要 API key 和异步轮询，签名结果链接有效期为 1 小时。
- 你须对上传的图片、视频、音乐、肖像和直播内容拥有必要的权利、许可与同意。Viggle 可删除名人肖像、侵权音乐或其他违反规则的内容。角色替换或动作生成不等于已获得人物、品牌、配乐或其他第三方素材的使用许可。
- 条款把用户内容视为非保密内容，并授予 Viggle 广泛使用许可，包括改进、训练或微调工具。所列训练例外仅覆盖通过 API 提交/生成的内容，以及付费用户期间提供/生成的内容（除非取得事先书面同意）；这不是普遍的隐私或保密保证。选择分享内容可能允许其他用户查看、下载、复制、修改和使用。
- 服务及部分功能可能仍属 beta、可随时变化、功能有限或暂不可用。应自行备份；条款不对用户内容未存储、丢失或损坏负责。存在水印或其他法律标记时，不应自行移除。

## 决策结论

当任务确实需要角色动作、换人或由动作捕捉产生的资产，而且团队能验证所选产品路径、套餐限制、源素材权利和留存模式时，可以考虑 Viggle。它不应被视为已清权的人才或音乐替代品、保密媒体处理方案、质量保证基准或固定全包 API 预算。若控制、许可、编辑和交付要求超出动作与角色效果，应继续比较角色动画流程与更全面的视频生成或后期工具。

## 证据与核验边界

${viggleReview.reviewedAt} 已核验官方产品、创作者套餐、API、条款和隐私资料。本页是来源核验式编辑分析，不声称已经完成真实使用的质量、延迟、输出安全、法律清权或生产可靠性测试。本次维护只使用官方来源，因此不重新评分独立市场验证，也不对真实采用情况作出结论。`;

export const viggleDecisionPayload = {
  content,
  detail: localized(detailEn, detailZh),
  tags: ['ai-video', 'character-animation', 'motion-capture', 'character-swap', 'video-api'],
  useCases: localized(
    [
      'Character-led short-video drafts',
      'Motion-transfer experiments',
      '3D motion and character-asset evaluation',
      'API video workflow prototyping',
    ],
    ['角色短视频草稿', '动作迁移实验', '3D 动作与角色资产评估', 'API 视频工作流原型'],
  ),
  features: {
    audience: {
      bestFit: localized(
        [
          'Character-led video creators',
          'Motion-capture and game-pipeline evaluators',
          'Developers integrating asynchronous video APIs',
        ],
        ['角色视频创作者', '评估动作捕捉和游戏流程的团队', '集成异步视频 API 的开发团队'],
      ),
      notIdealFor: localized(
        [
          'Projects needing cleared third-party likeness or music rights',
          'Confidential media workflows without an acceptable training and sharing review',
          'Buyers expecting one all-inclusive price across web plans and API use',
        ],
        [
          '需要已清权第三方肖像或音乐权利的项目',
          '未完成可接受训练与分享审查的保密媒体工作流',
          '预期网页套餐与 API 共用单一全包价格的采购者',
        ],
      ),
    },
    editorial: {
      reviewedAt: viggleReview.reviewedAt,
      reviewedBy: 'AI Best Tool editorial',
      sourceUrl: viggleReview.officialSources[0].url,
      summary: localized(
        'Product paths, current creator-plan limits, API billing/retention, upload-rights, training-use, and sharing boundaries reviewed against official sources.',
        '已根据官方来源核验产品路径、当前创作者套餐限制、API 计费/留存、上传权利、训练使用和分享边界。',
      ),
      trustNote: localized(
        'Source-based review only. Verify live checkout, API usage, rights, consent, and data handling for the exact workflow before production use.',
        '仅为来源核验；正式使用前应针对具体工作流核对实时结账、API 用量、权利、同意和数据处理。',
      ),
    },
    decision: {
      compareAxes: localized(
        [
          'Character-motion control',
          'Creator-plan credits and concurrency',
          'Web plan versus API billing',
          'Asset retention and result-link lifetime',
          'Upload rights and consent',
          'Training and sharing conditions',
        ],
        [
          '角色动作控制',
          '创作者套餐 credits 与并发',
          '网页套餐与 API 计费',
          '资产留存与结果链接期限',
          '上传权利与同意',
          '训练和分享条件',
        ],
      ),
      limitations: localized(
        [
          'Free plan limits daily videos, concurrency, features, and seven-day storage',
          'Paid plan prices and fees can change',
          'API is separately billed and asynchronous',
          'Uploaded or generated content can be used for training outside stated exceptions',
          'Sharing opt-in can expose content to other users',
          'Rights, consent, backups, and watermark compliance remain the user’s responsibility',
          'Features can be beta, limited, changed, or unavailable',
        ],
        [
          '免费套餐限制每日视频、并发、功能和 7 天存储',
          '付费套餐价格和费用可能变化',
          'API 独立计费且为异步流程',
          '除所列例外外，上传或生成内容可被用于训练',
          '选择分享可能让其他用户使用内容',
          '权利、同意、备份和水印合规仍由用户负责',
          '功能可能处于 beta、受限、变化或不可用',
        ],
      ),
      pricingSummary: localized(
        'At the review snapshot: Free $0; displayed monthly promotional prices were Pro $7.99, Live $15.99, and Max $63.99. API credits are separate at $0.01 each; verify live pricing before purchase.',
        '本次复核快照：Free $0；显示的月付促销价为 Pro $7.99、Live $15.99、Max $63.99。API credits 独立计费，每个 $0.01；购买前请核对实时价格。',
      ),
    },
    pricingSnapshot: {
      checkedAt: viggleReview.reviewedAt,
      model: 'freemium-subscription-plus-metered-api',
      summary: localized(
        'Free web access plus Pro, Live, and Max subscriptions. API credits are separately metered; live plan prices, feature availability, and fees can change.',
        '网页端提供 Free、Pro、Live、Max；API credits 独立按量计费。实时套餐价格、功能可用性和费用可能变化。',
      ),
      sourceUrls: [viggleReview.officialSources[1].url, viggleReview.officialSources[4].url],
    },
    evidence: { official: viggleReview.officialSources, independent: [] },
    marketValidation: {
      reviewedAt: viggleReview.reviewedAt,
      verdict: 'unverified',
      score: 0,
      scores: { userValue: 0, independentValidation: 0, durability: 0, evidenceQuality: 0, strategicValue: 0 },
      strongSignals: [],
      supportingSignals: [],
      evidenceUrls: [],
      rationale: localized(
        'This maintenance pass intentionally used official sources only. Those sources can establish product facts but do not substitute for independent market-validation evidence.',
        '本次维护刻意只使用官方来源。它们可证明产品事实，但不能替代独立市场验证证据。',
      ),
    },
  },
};

export function validateViggleDecisionEvidence() {
  assert.equal(getCanonicalToolSlug(viggleReview.slug), viggleReview.slug);
  assert.equal(viggleReview.canonicalPath, `/ai/${viggleReview.slug}`);
  assert(viggleReview.officialSources.length >= 5);
  assert.equal(viggleDecisionPayload.features.evidence.independent.length, 0);
  assert.equal(viggleDecisionPayload.features.marketValidation.verdict, 'unverified');
  assert(detailEn.includes('Free at $0, Pro at $7.99/month, Live at $15.99/month, and Max at $63.99/month'));
  assert(detailEn.includes('Consumer-plan limits do not describe API cost'));
  assert(detailEn.includes('not a blanket privacy or confidentiality guarantee'));
  assert(detailEn.includes('not a hands-on quality'));
  assert(detailZh.includes('API credits 单价为 $0.01') && detailZh.includes('不重新评分独立市场验证'));
  for (const locale of ['en', 'zh', 'cn', 'tw'] as const) {
    assert(viggleDecisionPayload.features.audience.bestFit[locale].length >= 3);
    assert(viggleDecisionPayload.features.audience.notIdealFor[locale].length >= 3);
    assert(viggleDecisionPayload.features.decision.compareAxes[locale].length >= 6);
    assert(viggleDecisionPayload.features.decision.limitations[locale].length >= 7);
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
  validateViggleDecisionEvidence();
  if (args.includes('--check'))
    return console.log('PASS Viggle evidence, decision, price, rights, privacy, identity, and index contracts');

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:viggle'))");
    const select = `SELECT *, next_review_date::text AS next_review_date_text,
      to_jsonb(t)-'content'-'detail'-'features'-'use_cases'-'tags'-'next_review_date'-'updated_at'-'search_vector' AS stable
      FROM public.tools t WHERE id=$1 AND name=$2`;
    const params = [viggleReview.id, viggleReview.slug];
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
    assert(before, 'Viggle fixed record not found');
    assert.equal(before.id, viggleReview.id);
    assert.equal(before.name, viggleReview.slug);
    assert.equal(before.status, 'published');
    assert.equal(before.page_quality_status, 'continue_index');

    const alreadyApplied = before.features?.editorial?.reviewedAt === viggleReview.reviewedAt;
    if (!args.includes('--status') && !alreadyApplied) {
      assert(
        !before.features?.editorial?.reviewedAt,
        'Viggle has an existing editorial record; audit instead of overwriting',
      );
      await client.query(
        `UPDATE public.tools SET content=$3::jsonb, detail=$4::jsonb, features=$5::jsonb,
         use_cases=$6::jsonb, tags=$7::text[], next_review_date=$8::date, updated_at=now()
         WHERE id=$1 AND name=$2`,
        [
          ...params,
          JSON.stringify(viggleDecisionPayload.content),
          JSON.stringify(viggleDecisionPayload.detail),
          JSON.stringify(viggleDecisionPayload.features),
          JSON.stringify(viggleDecisionPayload.useCases),
          viggleDecisionPayload.tags,
          viggleReview.nextReviewDate,
        ],
      );
    }

    const after = (await client.query(select, params)).rows[0];
    assert(after, 'Viggle disappeared during maintenance');
    assert.equal(after.id, viggleReview.id);
    assert.equal(after.name, viggleReview.slug);
    assert.equal(after.status, 'published');
    assert.equal(after.page_quality_status, 'continue_index');
    if (!args.includes('--status') && !alreadyApplied) {
      assert.deepEqual(
        after.stable,
        before.stable,
        'Protected ID, slug, URL, media, category, pricing, and index fields changed',
      );
      assert.deepEqual(after.features, viggleDecisionPayload.features);
      assert.deepEqual(after.use_cases, viggleDecisionPayload.useCases);
      assert.deepEqual(after.tags, viggleDecisionPayload.tags);
      assert.equal(after.next_review_date_text, viggleReview.nextReviewDate);
    }
    assert.equal(getToolIndexDecision(indexInput(after)).indexable, true, 'Viggle must remain indexable');
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          id: viggleReview.id,
          slug: viggleReview.slug,
          canonicalPath: viggleReview.canonicalPath,
          pageQualityStatus: after.page_quality_status,
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
