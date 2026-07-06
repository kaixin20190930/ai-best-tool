import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Copy.ai 替代方案对比' : 'Copy.ai alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Copy.ai 的 AI 工具，帮你更快判断快速起稿、营销文案和批量内容该怎么选。'
      : 'Compare AI tools that are commonly used as Copy.ai alternatives so you can choose the right fit for fast drafting, marketing copy, and bulk content.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '营销工具', en: 'Marketing tools' },
    comparisonLabel: { cn: 'Copy.ai 替代方案对比', en: 'Copy.ai alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Copy.ai 这类营销内容起稿入口，这一页会把常见替代项放在一起看，帮助你判断是要快速起稿、批量变体，还是更完整的营销工作流。',
      en: 'If you are already comparing Copy.ai-style marketing drafting entry points, this page puts the common alternatives side by side so you can decide whether you need fast drafting, bulk variations, or a more complete marketing workflow.',
    },
    searchQuery: 'copy-ai',
    guideHref: '/guides/ai-tools-for-marketing',
    rankingHref: '/best-ai-tools/ai-marketing-tools',
    rankingLabel: { cn: '转去营销榜单页', en: 'Open the marketing ranking' },
    backGuideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' },
    altBrowseHref: '/explore?search=copy-ai&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Copy.ai 相关工具', en: 'Browse more Copy.ai-related tools' },
    breadcrumbLabel: { cn: 'Copy.ai 替代方案对比', en: 'Copy.ai alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Copy.ai 替代项的快速对照',
      en: 'A quick side-by-side look at common Copy.ai alternatives',
    },
    compareSubtitle: { cn: 'Copy.ai', en: 'Copy.ai' },
    preferredToolNames: ['copy-ai', 'jasper', 'hubspot', 'mailchimp'],
    decisionCards: [
      {
        title: { cn: '先看是不是要快速起稿', en: 'Fast drafting first' },
        description: {
          cn: 'Copy.ai 的优势通常在快速起草和生成多个变体；如果你要更深入的品牌治理，别只看这一层。',
          en: 'Copy.ai is usually strongest for quick drafting and generating multiple variants; if you need deeper brand governance, compare further.',
        },
      },
      {
        title: { cn: '再看是不是要批量输出', en: 'Bulk output or not' },
        description: {
          cn: '如果你要的是大批量内容产出，模板、批量和协作会比单次质量更重要。',
          en: 'If you need content at scale, templates, bulk workflows, and collaboration matter more than one-off quality.',
        },
      },
      {
        title: { cn: '最后看是否能接进营销流程', en: 'Workflow fit' },
        description: {
          cn: '营销工具要能落地，光会生成还不够，最好能融进你已有的团队和渠道。',
          en: 'For a marketing tool to stick, generation alone is not enough; it should fit into your existing team and channels.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '增长团队 / 内容团队', en: 'Growth and content teams' },
        description: {
          cn: '适合频繁做文案测试、内容变体和活动素材的人。',
          en: 'A good fit for people running copy tests, content variations, and campaign asset production.',
        },
      },
      {
        title: { cn: '需要低门槛起稿的人', en: 'People who need low-friction drafting' },
        description: {
          cn: '如果你最缺的是“先出第一版”，这一类工具会很顺手。',
          en: 'These tools work well when the biggest problem is getting a first draft out quickly.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做长文规划的人', en: 'People who only do long-form planning' },
        description: {
          cn: '如果你主要写博客、白皮书或深度长文，写作页通常更贴近。',
          en: 'If you mainly write blogs, whitepapers, or deep long-form content, the writing page is usually a better fit.',
        },
      },
      {
        title: { cn: '还没确定营销渠道的人', en: 'People without a clear marketing channel' },
        description: {
          cn: '如果你还没确定是广告、邮件还是社媒，先把渠道想清楚更重要。',
          en: 'If you have not decided between ads, email, or social, define the channel first.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-marketing-tools',
        title: { cn: '先看营销榜单', en: 'Start with the marketing ranking' },
        description: {
          cn: '如果你已经明确是在找营销文案工具，先用榜单收窄。',
          en: 'If marketing copy tools are clearly the goal, use the ranking first to narrow the shortlist.',
        },
      },
      {
        href: '/guides/jasper-alternatives-comparison',
        title: { cn: '转去 Jasper 替代方案对比', en: 'Go to Jasper alternatives comparison' },
        description: {
          cn: '如果你在营销写作和品牌文案之间权衡，这页更合适。',
          en: 'Use this when you are weighing marketing writing and brand copy options.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你还要继续往长文和内容生产扩展，这条路径更稳。',
          en: 'Move here if you want to expand into long-form and content production.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具总对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具总对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/jasper-alternatives-comparison',
        title: { cn: '转去 Jasper 替代方案对比', en: 'Go to Jasper alternatives comparison' },
        description: {
          cn: '如果你更在意品牌文案和营销系统，这条路径更贴近。',
          en: 'Move here if brand copy and a fuller marketing system matter more.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你后面要做更长文本的内容生产，这页会更合适。',
          en: 'A better next stop if your work shifts toward longer-form content production.',
        },
      },
    ],
    toolSelectionNotes: {
      'copy-ai': {
        bestFor: {
          cn: '需要快速起草多种营销文案变体的人。',
          en: 'People who need to draft many variations of marketing copy quickly.',
        },
        whyPickIt: {
          cn: '它适合把“文案起步”这一步加速，尤其适合频繁测试。',
          en: 'It is useful for speeding up the first draft stage, especially for frequent testing.',
        },
        watchOut: {
          cn: '如果你需要更重的品牌控制或团队治理，还要继续比较。',
          en: 'If you need heavier brand control or team governance, keep comparing.',
        },
      },
      jasper: {
        bestFor: {
          cn: '需要品牌一致文案、活动素材和营销内容生产的团队。',
          en: 'Teams that need brand-consistent copy, campaign assets, and content production.',
        },
        whyPickIt: {
          cn: '它在营销写作和品牌语气控制上更容易看出价值。',
          en: 'Its value is easiest to see in marketing writing and brand voice control.',
        },
        watchOut: {
          cn: '如果你的重点只是快速起稿，Copy.ai 路线有时更轻。',
          en: 'If your main goal is quick drafting, Copy.ai may feel lighter.',
        },
      },
      hubspot: {
        bestFor: {
          cn: '需要 CRM、营销和流程串起来的团队。',
          en: 'Teams that want CRM, marketing, and workflows connected together.',
        },
        whyPickIt: {
          cn: '它更接近营销系统而不是单点生成器。',
          en: 'It is closer to a marketing system than a single-purpose generator.',
        },
        watchOut: {
          cn: '如果你只想做内容生成，它可能比你需要的更重。',
          en: 'It can feel heavier than needed if your main task is only content generation.',
        },
      },
      mailchimp: {
        bestFor: {
          cn: '邮件营销与自动化触发流程。',
          en: 'Email marketing and triggered automation workflows.',
        },
        whyPickIt: {
          cn: '它在邮件触达和受众管理上很容易看出效率价值。',
          en: 'Its efficiency gains are easy to see in email delivery and audience management.',
        },
        watchOut: {
          cn: '如果你比较的是更广义的营销 AI 平台，还需要再横向看。',
          en: 'If you are comparing broader marketing AI platforms, keep looking horizontally.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是起稿、变体，还是整个营销工作流。',
        '如果你会批量出内容，模板、协作和品牌控制会更重要。',
        '不要只看单次生成效果，持续使用感会更决定能不能留下。',
      ],
      en: [
        'First separate drafting, variations, and the full marketing workflow.',
        'If you create content in batches, templates, collaboration, and brand control matter more.',
        'Do not judge only by one generated result; long-term usability is what decides retention.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Copy.ai 替代方案页？', en: 'Why make a separate Copy.ai alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找快速起稿和营销文案工具，这类意图很接近转化。',
          en: 'Because many users are explicitly looking for fast drafting and marketing copy tools, which is close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看起稿速度、变体生成、模板、协作和真实反馈。',
          en: 'We compare drafting speed, variation generation, templates, collaboration, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先收紧营销起稿入口，再决定要不要继续看更广的营销工具'
              : 'Tighten the marketing-drafting entry first, then decide whether to keep browsing broader marketing tools'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确是在找起稿、变体或营销文案工具，先看更高意图入口通常更省时间。'
              : 'If the task is clearly drafting, variations, or marketing copy tools, starting with higher-intent entry points usually saves time.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-marketing-tools',
                title: locale === 'cn' || locale === 'tw' ? '营销榜单' : 'Marketing ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先把候选范围收紧。'
                    : 'Use this to narrow the candidate set first.',
              },
              {
                href: '/guides/jasper-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Jasper 替代方案' : 'Jasper alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心品牌文案和营销生产。'
                    : 'Best when brand copy and marketing production are the real focus.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你需要更长文本和内容生产。'
                    : 'Use this when longer-form content production matters more.',
              },
              {
                href: '/guides/ai-tools-for-marketing-comparison',
                title: locale === 'cn' || locale === 'tw' ? '营销工具对比' : 'Marketing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要继续扩大营销候选。'
                    : 'Choose this when you want a broader marketing shortlist.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`copy_ai_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='copy_ai_alternatives_comparison' />
    </>
  );
}
