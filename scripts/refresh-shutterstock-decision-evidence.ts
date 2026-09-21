import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const id = '603c7a89-e42f-4543-a7a6-2bcfdc00f00b';
const slug = 'shutterstock';
const reviewedAt = '2026-09-21';
const nextReviewDate = '2026-10-21';
const localized = <T>(en: T, zh: T) => ({ en, zh, cn: zh, tw: zh });

const official = [
  { label: 'AI-generated image licensing', url: 'https://www.shutterstock.com/help/en/articles/11962540-how-do-i-license-my-ai-generated-images' },
  { label: 'AI image indemnification', url: 'https://www.shutterstock.com/help/en/articles/11962590-are-my-images-indemnified' },
  { label: 'AI content review process', url: 'https://www.shutterstock.com/help/en/articles/10439924-what-is-the-content-review-process-for-ai-generated-assets' },
  { label: 'AI generator scope and ownership', url: 'https://www.shutterstock.com/help/en/articles/10594949-get-to-know-the-ai-generated-content-tool-on-shutterstock' },
];
const independent = [
  { label: '2025 SEC annual report', url: 'https://www.sec.gov/Archives/edgar/data/1549346/000154934626000008/sstk-20251231.htm' },
  { label: 'G2 customer reviews', url: 'https://www.g2.com/products/shutterstock-shutterstock/reviews' },
];

export const shutterstockDecisionPayload = {
  tags: ['generative-ai', 'stock-media', 'image-generation', 'commercial-licensing'],
  useCases: localized(
    ['Generate campaign image concepts', 'Combine generated and stock media', 'License approved creative assets', 'Review commercial-use risk'],
    ['生成营销图像概念', '组合生成内容与图库素材', '许可审核后的创意资产', '评估商业使用风险'],
  ),
  features: {
    audience: {
      bestFit: localized(
        ['Creative teams combining generation and stock', 'Marketers needing a licensing workflow', 'Enterprise buyers needing optional human review'],
        ['结合生成与图库素材的创意团队', '需要授权流程的营销人员', '需要可选人工审核的企业采购者'],
      ),
      notIdealFor: localized(
        ['Users expecting copyright ownership of generated output', 'Buyers assuming every generated image is indemnified', 'Teams needing a free unlimited generator'],
        ['要求拥有生成图版权的用户', '假定所有生成图都自动获得赔偿保护的采购者', '需要免费不限量生成的团队'],
      ),
    },
    editorial: {
      reviewedAt,
      reviewedBy: 'AI Best Tool editorial',
      sourceUrl: official[0].url,
      summary: localized(
        'Generation, licensing, ownership, human-review, and indemnification boundaries reviewed against current official documentation.',
        '已根据当前官方文档核验生成、许可、所有权、人工审核与赔偿保护边界。',
      ),
      trustNote: localized(
        'A license and indemnification are different protections. Verify the selected plan and approved asset before commercial use.',
        '许可与赔偿保护是不同层级；商业使用前应核对所选套餐及具体资产是否通过审核。',
      ),
    },
    decision: {
      compareAxes: localized(
        ['Generation plus stock workflow', 'License coverage', 'Human-review eligibility', 'Indemnification', 'Asset reuse and exclusivity'],
        ['生成与图库一体化工作流', '许可覆盖', '人工审核资格', '赔偿保护', '资产复用与独占性'],
      ),
      limitations: localized(
        ['Generated output is licensed rather than user-owned copyright', 'Indemnification depends on plan and approval', 'Protected brands or likenesses require review', 'Generated assets may enter the searchable library'],
        ['生成结果按许可使用而非归用户拥有版权', '赔偿保护取决于套餐和审核结果', '品牌或人物肖像需要额外复核', '生成资产可能进入可搜索图库'],
      ),
      pricingSummary: localized(
        'Access and protection depend on the active Shutterstock plan; verify live checkout and license terms rather than a cached price.',
        '访问与保护取决于当前 Shutterstock 套餐；应核对实时结账和许可条款，而不是依赖缓存价格。',
      ),
    },
    pricingSnapshot: {
      checkedAt: reviewedAt,
      model: 'paid-license-and-enterprise',
      summary: localized(
        'Plan- and package-based access. Human review and indemnification are available only under applicable terms.',
        '按套餐或资源包提供；人工审核和赔偿保护只在适用条款下提供。',
      ),
      sourceUrls: [official[0].url, official[1].url],
    },
    evidence: { official, independent },
    marketValidation: {
      reviewedAt,
      score: 96,
      verdict: 'validated',
      scores: { userValue: 23, independentValidation: 24, durability: 25, evidenceQuality: 16, strategicValue: 8 },
      strongSignals: ['public-company-disclosure', 'multi-million-customer-base'],
      supportingSignals: ['current-official-documentation', 'independent-review-presence'],
      evidenceUrls: independent.map((source) => source.url),
      rationale: localized(
        'Public filings and broad customer adoption establish durability; they do not prove that every generated asset is legally safe or high quality.',
        '公开披露与广泛客户采用证明其持续性，但不能证明每个生成资产都具备法律安全性或高质量。',
      ),
    },
  },
};

export function validateShutterstockDecisionEvidence() {
  assert(official.length >= 4 && independent.length >= 2);
  assert.equal(Object.values(shutterstockDecisionPayload.features.marketValidation.scores).reduce((a, b) => a + b, 0), 96);
  for (const locale of ['en', 'zh', 'cn', 'tw'] as const) {
    assert(shutterstockDecisionPayload.features.audience.bestFit[locale].length >= 3);
    assert(shutterstockDecisionPayload.features.decision.limitations[locale].length >= 4);
  }
}

function indexInput(row: Record<string, unknown>) {
  return { status: row.status as string, pageQualityStatus: row.page_quality_status as string, categoryId: row.category_id as string, imageUrl: row.image_url as string, thumbnailUrl: row.thumbnail_url as string, content: row.content, detail: row.detail, pricing: row.pricing as string, tags: row.tags as string[] };
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  validateShutterstockDecisionEvidence();
  if (args.includes('--check')) return console.log('PASS Shutterstock decision evidence contract');
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:shutterstock'))");
    const select = `SELECT *,next_review_date::text AS next_review_date_text,
      to_jsonb(t)-'features'-'use_cases'-'tags'-'next_review_date'-'updated_at'-'search_vector' AS stable
      FROM tools t WHERE id=$1 AND name=$2`;
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, [id, slug])).rows[0];
    assert(before && before.status === 'published' && before.page_quality_status === 'continue_index');
    if (!args.includes('--status')) {
      await client.query(`UPDATE tools SET features=$3::jsonb,use_cases=$4::jsonb,tags=$5::text[],next_review_date=$6::date,updated_at=now() WHERE id=$1 AND name=$2`, [id, slug, JSON.stringify(shutterstockDecisionPayload.features), JSON.stringify(shutterstockDecisionPayload.useCases), shutterstockDecisionPayload.tags, nextReviewDate]);
    }
    const after = (await client.query(select, [id, slug])).rows[0];
    if (!args.includes('--status')) assert.deepEqual(after.stable, before.stable, 'Protected fields changed');
    assert.equal(getToolIndexDecision(indexInput(after)).indexable, true);
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ success: true, mode: args[0] || 'dry-run-rollback', slug, indexable: true, nextReviewDate: after.next_review_date_text }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
