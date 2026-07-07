import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Jasper 替代方案对比' : 'Jasper alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Jasper 的 AI 工具，帮你更快判断品牌文案、活动素材和营销写作该怎么选。'
      : 'Compare AI tools that are commonly used as Jasper alternatives so you can choose the right fit for brand copy, campaign assets, and marketing writing.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '营销工具', en: 'Marketing tools' },
    comparisonLabel: { cn: 'Jasper 替代方案对比', en: 'Jasper alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Jasper 这类营销写作入口，这一页会把常见替代项放在一起看，帮助你判断是要品牌一致文案、快速起稿，还是更完整的营销工作流。',
      en: 'If you are already comparing Jasper-style marketing writing entry points, this page puts the common alternatives side by side so you can decide whether you need brand-consistent copy, fast drafting, or a more complete marketing workflow.',
    },
    searchQuery: 'jasper',
    guideHref: '/guides/ai-tools-for-marketing',
    rankingHref: '/best-ai-tools/ai-marketing-tools',
    rankingLabel: { cn: '转去营销榜单页', en: 'Open the marketing ranking' },
    backGuideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' },
    altBrowseHref: '/explore?search=jasper&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Jasper 相关工具', en: 'Browse more Jasper-related tools' },
    breadcrumbLabel: { cn: 'Jasper 替代方案对比', en: 'Jasper alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Jasper 替代项的快速对照',
      en: 'A quick side-by-side look at common Jasper alternatives',
    },
    compareSubtitle: { cn: 'Jasper', en: 'Jasper' },
    preferredToolNames: ['jasper', 'copy-ai', 'hubspot', 'mailchimp'],
    decisionCards: [
      {
        title: { cn: '先看是不是做品牌文案', en: 'Brand copy first' },
        description: {
          cn: 'Jasper 常被用来做品牌一致文案和活动素材；如果你只是轻量改写，别选太重的方案。',
          en: 'Jasper is often used for brand-consistent copy and campaign assets; if you only need light rewriting, do not overbuy.',
        },
      },
      {
        title: { cn: '再看是不是要营销工作流', en: 'Marketing workflow or not' },
        description: {
          cn: '如果你真正需要的是渠道、自动化和团队协作，单纯的生成器不一定够。',
          en: 'If you really need channels, automation, and teamwork, a simple generator may not be enough.',
        },
      },
      {
        title: { cn: '最后看是否适合持续产出', en: 'Sustainable output' },
        description: {
          cn: '稳定的模板、品牌控制和批量能力，会决定它能不能真正留在日常里。',
          en: 'Stable templates, brand control, and bulk output often decide whether the tool sticks in day-to-day use.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '增长团队 / 内容团队', en: 'Growth and content teams' },
        description: {
          cn: '适合持续产出营销文案、活动素材和转化内容的人。',
          en: 'A strong fit for people producing marketing copy, campaign assets, and conversion content.',
        },
      },
      {
        title: { cn: '独立创始人 / 小团队', en: 'Indie founders and small teams' },
        description: {
          cn: '如果你要用更少的人覆盖更多营销动作，这类页很实用。',
          en: 'Useful when a smaller team needs to cover more marketing moves with fewer people.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想写几句普通文案的人', en: 'People who only need a few quick lines' },
        description: {
          cn: '如果只是偶尔写一句话，泛用聊天工具通常就够了。',
          en: 'If you only need a quick line once in a while, a general chat tool is often enough.',
        },
      },
      {
        title: { cn: '还没想清楚营销渠道的人', en: 'People who have not decided on a channel' },
        description: {
          cn: '如果你还不确定是广告、邮件还是社媒，先把渠道定义清楚更重要。',
          en: 'If you have not decided between ads, email, or social, define the channel first.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-marketing-tools',
        title: { cn: '先看营销榜单', en: 'Start with the marketing ranking' },
        description: {
          cn: '如果你已经明确要做营销文案选型，先用榜单收口。',
          en: 'If marketing copy selection is already the goal, use the ranking to narrow down first.',
        },
      },
      {
        href: '/guides/copy-ai-alternatives-comparison',
        title: { cn: '转去 Copy.ai 替代方案对比', en: 'Go to Copy.ai alternatives comparison' },
        description: {
          cn: '如果你更偏快速起稿和多变体，这条路更高意图。',
          en: 'A higher-intent path when fast drafting and many variations are the real priority.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具总对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你想把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你后面会走向长文、SEO 或内容生产，这页也值得继续看。',
          en: 'Move here if your work shifts toward long-form, SEO, or content production.',
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
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你其实更需要长文和内容生产，这页更贴近。',
          en: 'Move here if long-form and content production are the real need.',
        },
      },
      {
        href: '/guides/ai-tools-for-lead-generation-comparison',
        title: { cn: '转去获客工具对比', en: 'Go to lead generation comparison' },
        description: {
          cn: '如果你的重点已经从写文案转向获客和转化，这条路径更高意图。',
          en: 'A better next stop when the goal shifts from copywriting to lead generation and conversion.',
        },
      },
    ],
    toolSelectionNotes: {
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
          cn: '如果你的重点是渠道自动化或 CRM 接入，它不是最完整的一层。',
          en: 'It is not the full answer if your main concern is channel automation or CRM integration.',
        },
      },
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
          cn: '如果你已经在做较重的团队协作或流程治理，还要继续比较。',
          en: 'If you need heavier team collaboration or workflow governance, keep comparing.',
        },
      },
      hubspot: {
        bestFor: {
          cn: '需要 CRM、营销和流程串起来的团队。',
          en: 'Teams that want CRM, marketing, and workflows connected together.',
        },
        whyPickIt: {
          cn: '它更接近营销系统而不是单点生成器，适合做长期决策。',
          en: 'It is closer to a marketing system than a single-purpose generator, which matters for long-term decisions.',
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
          cn: '如果你要比较的是更广义的营销 AI 平台，还需要再横向看。',
          en: 'If you are comparing broader marketing AI platforms, you should keep looking horizontally.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要做广告、邮件、社媒、落地页还是报告。',
        '看它能不能接入你现有的 CRM、邮件和投放工具。',
        '如果你会持续运营，优先看模板、批量、协作和品牌控制。',
      ],
      en: [
        'First decide whether you need ads, email, social, landing pages, or reporting.',
        'Check whether it integrates with your CRM, email, and ad stack.',
        'If you are running this long term, prioritize templates, bulk workflows, collaboration, and brand control.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Jasper 替代方案页？', en: 'Why make a separate Jasper alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找营销写作工具，这类意图比泛泛浏览更接近转化。',
          en: 'Because many users are explicitly looking for marketing writing tools, which is closer to conversion than casual browsing.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看品牌一致性、起稿效率、协作、流程接入和真实反馈。',
          en: 'We compare brand consistency, drafting efficiency, collaboration, workflow integration, and real feedback.',
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
              ? '先看榜单，再决定是继续看 Jasper 替代还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing Jasper alternatives or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做品牌文案或营销写作，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If brand copy or marketing writing is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-marketing-tools',
                title: locale === 'cn' || locale === 'tw' ? '营销榜单' : 'Marketing ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的营销候选。'
                    : 'Narrow to the most trial-worthy marketing candidates first.',
              },
              {
                href: '/guides/ai-tools-for-marketing-comparison',
                title: locale === 'cn' || locale === 'tw' ? '营销工具对比' : 'Marketing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你想把广告、邮件和增长一起看。'
                    : 'Useful when ads, email, and growth should be compared together.',
              },
              {
                href: '/guides/mailchimp-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Mailchimp 替代方案' : 'Mailchimp alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更偏邮件营销和自动化。'
                    : 'A better path when email marketing and automation are the real need.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要把营销写作单独拆开看。'
                    : 'Useful when marketing writing should be evaluated separately.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`jasper_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='jasper_alternatives_comparison' />
    </>
  );
}
