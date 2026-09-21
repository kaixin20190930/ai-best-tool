import assert from 'node:assert/strict';
import { config } from 'dotenv';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

export const characterAiReview = {
  id: '48256626-68c0-4cbc-a120-126f5ca03179',
  slug: 'character_ai',
  reviewedAt: '2026-09-21',
  nextReviewDate: '2026-10-21',
  officialSources: [
    {
      label: 'Reading Mode for users verified under 18',
      url: 'https://support.character.ai/hc/en-us/articles/51795669396763-What-is-Reading-Mode',
    },
    {
      label: 'c.ai+ benefits and free messaging boundary',
      url: 'https://support.character.ai/hc/en-us/articles/55845963766555-C-ai-FAQ',
    },
    {
      label: 'Training data documentation',
      url: 'https://support.character.ai/hc/en-us/articles/47703013822875-Training-Data-Documentation',
    },
    {
      label: 'Model training settings',
      url: 'https://support.character.ai/hc/en-us/articles/42788047758747-How-do-I-manage-update-my-model-training-settings',
    },
    { label: 'Character.AI Safety Center', url: 'https://character.ai/safety' },
  ],
  independentSources: [
    {
      label: 'Google Play listing',
      url: 'https://play.google.com/store/apps/details?id=ai.character.app',
    },
    {
      label: 'Apple App Store reviews',
      url: 'https://apps.apple.com/us/app/character-ai-chat-talk-text/id1671705818?platform=ipad&see-all=reviews',
    },
    {
      label: 'Longitudinal user-perception study',
      url: 'https://arxiv.org/abs/2608.24654',
    },
  ],
} as const;

const localized = <T>(en: T, zh: T) => ({ en, zh, cn: zh, tw: zh });

const content = localized(
  'Character.AI is an interactive entertainment platform for character creation, role-play, and fictional conversation. Compare its age-based access, memory consistency, moderation, data-use controls, and c.ai+ convenience benefits before choosing it.',
  'Character.AI 是面向角色创建、角色扮演和虚构对话的互动娱乐平台。选择前应比较年龄访问规则、记忆一致性、内容治理、数据使用控制和 c.ai+ 的便利性权益。',
);

const detailEn = `## What Character.AI is

Character.AI is an interactive entertainment platform for creating characters, role-playing, and fictional conversation. It is not a factual research assistant, and generated characters can invent information.

## Best fit

- Adults using fictional conversation or role-play for entertainment and creative exploration.
- Character creators who want to test personas, scenes, and story directions.
- Users willing to evaluate memory consistency, moderation behavior, and privacy settings over several sessions.

## Check before choosing

- Users verified as under 18 are placed in Reading Mode: they can browse and view public content, but chat is unavailable. Past chats remain saved, and creation or feed features may still be available.
- Free users retain unlimited messaging. c.ai+ adds convenience benefits such as skipping waiting rooms, faster messages, a badge, support/community access, and early access to selected features. The official FAQ says response quality is the same for free and paid users.
- Character memory, persona consistency, repetition, and moderation can change across characters and product releases. Test one repeated scenario before relying on a long-running role-play.
- Character.AI documents the use of public, user-interaction, synthetic, internal safety, open-source, and third-party data for training. Its documented model-training opt-out applies to EEA and UK users; do not assume the same control exists in every region.
- Do not use a character as authority for medical, legal, financial, safety-critical, or other consequential decisions. Avoid sharing confidential or identifying information in fictional conversations.

## Decision summary

Choose Character.AI when the main job is character-led entertainment and creative role-play. Do not choose it for source-grounded research, professional advice, or workflows that require stable memory and reproducible answers. Start with the free experience; c.ai+ is primarily a convenience upgrade, not an official promise of higher response quality.

## Evidence and review boundary

Official product, safety, age-access, subscription, and training-data documentation were reviewed on ${characterAiReview.reviewedAt}. App-store presence and an independent longitudinal study support durable market relevance. This is a source-based editorial review, not a completed hands-on quality benchmark.`;

const detailZh = `## Character.AI 是什么

Character.AI 是用于创建角色、角色扮演和虚构对话的互动娱乐平台。它不是事实研究助手，生成角色可能编造信息。

## 更适合

- 把虚构对话或角色扮演用于娱乐和创意探索的成年人。
- 希望测试人物设定、场景和故事方向的角色创作者。
- 愿意通过多轮使用观察记忆一致性、内容治理和隐私设置的用户。

## 选择前必须核对

- 经验证未满 18 岁的用户会进入 Reading Mode：可以浏览和查看公开内容，但不能聊天；历史聊天会保留，部分创建和信息流功能仍可能开放。
- 免费用户仍可不限量发送消息。c.ai+ 提供跳过等候、加快回复、徽章、社区与支持、部分功能抢先体验等便利权益；官方 FAQ 明确免费与付费用户的回复质量相同。
- 角色记忆、人物一致性、重复表达和内容治理表现会随角色与产品版本变化。长期角色扮演前，应使用同一场景做重复测试。
- Character.AI 说明训练数据可能包括公开数据、用户互动数据、合成数据、内部安全数据、开源和第三方数据；其文档中的模型训练退出选项适用于 EEA 和英国用户，不应推断为所有地区都具备相同控制。
- 不要把角色用于医疗、法律、金融、安全或其他高影响决策，也不要在虚构对话中分享机密或可识别个人的信息。

## 决策结论

主要任务是角色娱乐和创意角色扮演时，可以选择 Character.AI；需要有来源的研究、专业建议、稳定记忆或可复现答案时，不应选择它。先使用免费体验；c.ai+ 主要是便利性升级，不是官方承诺的更高回复质量。

## 证据与核验边界

${characterAiReview.reviewedAt} 已核验官方产品、安全、年龄访问、订阅和训练数据文档。应用商店存在性与独立纵向研究支持其持续市场相关性。本页是来源核验式编辑分析，不声称已经完成真实使用质量基准测试。`;

const features = {
  audience: {
    bestFit: localized(
      ['Fictional conversation and role-play', 'Character and story creators', 'Users testing entertainment companions'],
      ['虚构对话与角色扮演', '角色和故事创作者', '测试娱乐型陪伴体验的用户'],
    ),
    notIdealFor: localized(
      ['Source-grounded research', 'Professional or consequential advice', 'Workflows requiring stable reproducible memory'],
      ['有来源要求的研究', '专业或高影响建议', '要求稳定且可复现记忆的工作流'],
    ),
  },
  editorial: {
    reviewedAt: characterAiReview.reviewedAt,
    reviewedBy: 'AI Best Tool editorial',
    sourceUrl: characterAiReview.officialSources[0].url,
    summary: localized(
      'Age access, c.ai+ boundaries, training-data controls, safety, and decision limits reviewed against current sources.',
      '已根据当前来源核验年龄访问、c.ai+ 边界、训练数据控制、安全与决策限制。',
    ),
    trustNote: localized(
      'Source-based review, not a hands-on benchmark. Memory and moderation should be tested in the intended scenario.',
      '来源核验而非真实使用基准；应在目标场景中测试记忆和内容治理表现。',
    ),
  },
  decision: {
    compareAxes: localized(
      ['Age-based access', 'Memory and persona consistency', 'Moderation behavior', 'Data-use controls', 'Free versus c.ai+ convenience'],
      ['年龄访问规则', '记忆与人物一致性', '内容治理表现', '数据使用控制', '免费版与 c.ai+ 便利性'],
    ),
    limitations: localized(
      ['Can invent facts', 'Under-18 chat is unavailable', 'Long-session consistency varies', 'Regional privacy controls differ'],
      ['可能编造事实', '未成年人不能聊天', '长对话一致性会变化', '隐私控制存在地区差异'],
    ),
    pricingSummary: localized(
      'Free messaging is available; c.ai+ sells speed, access, and convenience rather than officially higher response quality.',
      '免费版可发送消息；c.ai+ 主要销售速度、访问与便利性，而不是官方承诺的更高回复质量。',
    ),
  },
  pricingSnapshot: {
    checkedAt: characterAiReview.reviewedAt,
    model: 'freemium',
    summary: localized(
      'Free unlimited messaging plus an optional c.ai+ subscription; verify current regional checkout terms before purchase.',
      '免费不限量消息，可选 c.ai+ 订阅；购买前核对所在地区的实时结账条款。',
    ),
    sourceUrls: [characterAiReview.officialSources[1].url],
  },
  evidence: {
    official: characterAiReview.officialSources,
    independent: characterAiReview.independentSources,
  },
  marketValidation: {
    reviewedAt: characterAiReview.reviewedAt,
    score: 93,
    verdict: 'validated',
    scores: { userValue: 23, independentValidation: 22, durability: 24, evidenceQuality: 16, strategicValue: 8 },
    strongSignals: ['major-app-store-presence', 'independent-longitudinal-research'],
    supportingSignals: ['current-official-documentation', 'active-safety-and-product-updates'],
    evidenceUrls: characterAiReview.independentSources.map((source) => source.url),
    rationale: localized(
      'Large-platform availability and independent research support durable relevance; they do not prove memory quality, safety, or suitability for every user.',
      '主流应用平台存在性和独立研究支持其持续相关性，但不能证明记忆质量、安全性或适合每一位用户。',
    ),
  },
};

const useCases = localized(
  ['Fictional character chat', 'Interactive role-play', 'Character and story ideation', 'Entertainment companion evaluation'],
  ['虚构角色对话', '互动角色扮演', '角色与故事构思', '娱乐型陪伴体验评估'],
);

export const characterAiPayload = {
  content,
  detail: localized(detailEn, detailZh),
  features,
  useCases,
  tags: ['ai-character', 'roleplay', 'interactive-storytelling', 'ai-entertainment'],
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

export function validateCharacterAiReview() {
  assert(detailEn.length > 1200 && detailZh.length > 600);
  assert(detailEn.includes('Reading Mode') && detailZh.includes('Reading Mode'));
  assert(detailEn.includes('response quality is the same'));
  assert(detailEn.includes('EEA and UK users'));
  assert(!detailEn.includes('$9.99'), 'Do not freeze volatile promotional pricing');
  assert(characterAiReview.officialSources.length >= 4);
  assert(characterAiReview.independentSources.length >= 2);
  assert.equal(Object.values(features.marketValidation.scores).reduce((sum, score) => sum + score, 0), 93);
  for (const locale of ['en', 'zh', 'cn', 'tw'] as const) {
    assert(features.audience.bestFit[locale].length >= 3);
    assert(features.audience.notIdealFor[locale].length >= 3);
    assert(features.decision.compareAxes[locale].length >= 4);
    assert(features.decision.limitations[locale].length >= 4);
  }
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  assert(args.length <= 1 && args.every((arg) => ['--check', '--status', '--commit'].includes(arg)));
  validateCharacterAiReview();
  if (args.includes('--check')) {
    console.log('PASS Character.AI review contract');
    return;
  }

  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('directory:character_ai'))");
    const select = `SELECT *, next_review_date::text AS next_review_date_text,
      to_jsonb(t)-'content'-'detail'-'features'-'use_cases'-'tags'-'next_review_date'-'updated_at'-'search_vector' AS stable
      FROM public.tools t WHERE id=$1 AND name=$2`;
    const params = [characterAiReview.id, characterAiReview.slug];
    const before = (await client.query(`${select}${args.includes('--status') ? '' : ' FOR UPDATE'}`, params)).rows[0];
    assert(before, 'Character.AI fixed record not found');
    assert.equal(before.status, 'published');
    assert.equal(before.page_quality_status, 'continue_index');

    if (!args.includes('--status')) {
      await client.query(
        `UPDATE public.tools SET content=$3::jsonb,detail=$4::jsonb,features=$5::jsonb,
         use_cases=$6::jsonb,tags=$7::text[],next_review_date=$8::date,updated_at=now()
         WHERE id=$1 AND name=$2`,
        [
          ...params,
          JSON.stringify(characterAiPayload.content),
          JSON.stringify(characterAiPayload.detail),
          JSON.stringify(characterAiPayload.features),
          JSON.stringify(characterAiPayload.useCases),
          characterAiPayload.tags,
          characterAiReview.nextReviewDate,
        ],
      );
    }

    const after = (await client.query(select, params)).rows[0];
    if (!args.includes('--status')) {
      assert.deepEqual(after.stable, before.stable, 'Protected identity, media, pricing, and index fields changed');
      assert.deepEqual(after.features, characterAiPayload.features);
      assert.deepEqual(after.use_cases, characterAiPayload.useCases);
      assert.deepEqual(after.tags, characterAiPayload.tags);
      assert.equal(after.next_review_date_text, characterAiReview.nextReviewDate);
    }
    assert.equal(getToolIndexDecision(indexInput(after)).indexable, true, 'Character.AI must remain indexable');
    await client.query(args.includes('--commit') ? 'COMMIT' : 'ROLLBACK');
    console.log(
      JSON.stringify(
        {
          success: true,
          mode: args[0] || 'dry-run-rollback',
          slug: characterAiReview.slug,
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
