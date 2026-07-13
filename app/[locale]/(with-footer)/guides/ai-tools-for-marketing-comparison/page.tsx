import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 营销工具对比' : 'AI marketing tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的营销 AI 工具，帮你更快选出适合广告、邮件、社媒和增长流程的一个。'
      : 'Compare common marketing AI tools to choose the one that fits ads, email, social, and growth workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '营销工具', en: 'Marketing tools' },
    comparisonLabel: { cn: 'AI 营销工具对比', en: 'AI marketing tools comparison' },
    description: {
      cn: '如果你已经知道自己要做广告、邮件、社媒、落地页或增长实验，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need ads, email, social, landing pages, or growth experiments, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'marketing',
    guideHref: '/guides/ai-tools-for-marketing',
    rankingHref: '/best-ai-tools/ai-marketing-tools',
    rankingLabel: { cn: '转去营销榜单页', en: 'Open the marketing ranking' },
    backGuideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' },
    altBrowseHref: '/explore?search=marketing&sort=popular',
    altBrowseLabel: { cn: '浏览更多营销工具', en: 'Browse more marketing tools' },
    breadcrumbLabel: { cn: '营销工具对比', en: 'Marketing tools comparison' },
    compareTitle: { cn: '几款常见营销工具的快速对照', en: 'A quick side-by-side look at common marketing tools' },
    compareSubtitle: { cn: '营销工具', en: 'Marketing tools' },
    preferredToolNames: ['jasper', 'copy-ai', 'hubspot', 'mailchimp'],
    comparisonDimensions: [
      {
        title: { cn: '渠道覆盖', en: 'Channel coverage' },
        description: {
          cn: '先看它是否覆盖你真正会用的渠道：广告、邮件、社媒、落地页或 CRM。',
          en: 'Check whether it covers the channels you actually use: ads, email, social, landing pages, or CRM.',
        },
      },
      {
        title: { cn: '产出效率', en: 'Output efficiency' },
        description: {
          cn: '如果你要持续批量产出，模板、批处理和品牌控制会比单条生成更关键。',
          en: 'If you need repeated output at scale, templates, batch workflows, and brand control matter more than one-off generation.',
        },
      },
      {
        title: { cn: '协作与权限', en: 'Collaboration and permissions' },
        description: {
          cn: '营销工具常常给多个成员一起用，团队协作、审批和权限管理很容易决定能不能真正落地。',
          en: 'Marketing tools are often shared across a team, so collaboration, approvals, and permissions decide whether they can actually be adopted.',
        },
      },
      {
        title: { cn: '品牌一致性', en: 'Brand consistency' },
        description: {
          cn: '如果输出会直接面向客户或受众，品牌语气、术语和视觉一致性不能忽略。',
          en: 'If outputs face customers or prospects directly, brand voice, terminology, and visual consistency cannot be ignored.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做广告 / 投放', en: 'Ads / paid acquisition' },
        description: {
          cn: '先看文案、测试节奏和批量生成能力。',
          en: 'Prioritize copy generation, testing speed, and bulk output.',
        },
      },
      {
        title: { cn: '做邮件 / CRM', en: 'Email / CRM' },
        description: {
          cn: '更该看模板、自动化和与现有系统的接入。',
          en: 'Focus more on templates, automation, and integration with the systems you already use.',
        },
      },
      {
        title: { cn: '做社媒 / 内容营销', en: 'Social / content marketing' },
        description: {
          cn: '品牌语气、批量改写和跨渠道复用通常更重要。',
          en: 'Brand voice, rewrite speed, and multi-channel reuse are usually more important.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '增长团队 / 内容团队', en: 'Growth and content teams' },
        description: {
          cn: '适合持续迭代投放、内容和转化实验的人。',
          en: 'A strong fit for people iterating on campaigns, content, and conversion experiments.',
        },
      },
      {
        title: { cn: '独立创始人 / 小团队', en: 'Indie founders and small teams' },
        description: {
          cn: '适合需要少人覆盖更多营销渠道的场景。',
          en: 'A strong fit when a small team needs to cover many marketing channels.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想随便生成几句文案的人', en: 'People who only want a few random lines of copy' },
        description: {
          cn: '如果只是偶尔写一句话，泛用聊天工具可能已经够了。',
          en: 'If you only need a quick one-off line, a general chat tool may already be enough.',
        },
      },
      {
        title: { cn: '没有明确渠道的人', en: 'People without a clear channel need' },
        description: {
          cn: '如果你还不确定要做广告、邮件还是社媒，先回到更上层的选型会更稳。',
          en: 'If you have not decided between ads, email, or social yet, go back up a level and define the channel first.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-marketing-tools',
        title: { cn: '先看营销榜单', en: 'Start with the marketing ranking' },
        description: {
          cn: '如果你已经明确是营销场景，先用榜单把 shortlist 缩小。',
          en: 'If marketing is the lane, use the ranking to narrow the shortlist first.',
        },
      },
      {
        href: '/guides/ai-tools-for-marketing',
        title: { cn: '回到营销指南', en: 'Return to the marketing guide' },
        description: {
          cn: '先回到更高层的判断，再重新对比渠道和流程。',
          en: 'Step back to the broader guide, then re-compare channels and workflows.',
        },
      },
      {
        href: '/categories/marketing?sort=popular',
        title: { cn: '看 Marketing 分类', en: 'Open the Marketing category' },
        description: {
          cn: '先看真实条目，再决定要不要继续对比。',
          en: 'Browse real listings first, then decide whether to keep comparing.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果真正的需求更偏外联、跟进和 CRM，这条更高意图。',
          en: 'A better next step if outreach, follow-up, and CRM are the real need.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你主要在比较文案和长文本生成，这页更直接。',
          en: 'A better fit if your main task is copywriting and long-form text.',
        },
      },
      {
        href: '/guides/ai-tools-for-lead-generation-comparison',
        title: { cn: '转去获客工具对比', en: 'Go to lead generation comparison' },
        description: {
          cn: '如果你更关心增长和线索流，这页更贴近目标。',
          en: 'A tighter path when the real goal is growth and lead flow.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果你需要的是外呼、跟进和销售流程，这页更高意图。',
          en: 'A better next stop for outreach, follow-up, and sales workflow needs.',
        },
      },
      {
        href: '/categories/marketing?sort=popular',
        title: { cn: '转去 Marketing 分类', en: 'Go to the Marketing category' },
        description: {
          cn: '先看真实条目，再回到对比页做决定。',
          en: 'Browse real listings first, then come back to compare when ready.',
        },
      },
      {
        href: '/guides/mailchimp-alternatives-comparison',
        title: { cn: '转去 Mailchimp 替代方案对比', en: 'Go to Mailchimp alternatives comparison' },
        description: {
          cn: '如果你的重点已经变成邮件营销和自动化，这条路径更高意图。',
          en: 'A higher-intent path if your focus has shifted to email marketing and automation.',
        },
      },
      {
        href: '/guides/hubspot-alternatives-comparison',
        title: { cn: '转去 HubSpot 替代方案对比', en: 'Go to HubSpot alternatives comparison' },
        description: {
          cn: '如果你的重点已经变成 CRM、营销自动化和流程编排，这条路径更贴近。',
          en: 'A better path when the real need is CRM, marketing automation, and workflow orchestration.',
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
          en: 'If you are comparing broad marketing AI platforms, you should keep looking horizontally.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要做广告、邮件、社媒、落地页还是报告。',
        '看它能不能接入你现有的 CRM、邮件和投放工具。',
        '如果你会持续运营，优先看模板、批量、协作和品牌控制。',
        '更看重长期使用时，真实评论和最近更新尤其重要。',
      ],
      en: [
        'First decide whether you need ads, email, social, landing pages, or reporting.',
        'Check whether it integrates with your CRM, email, and ad stack.',
        'If you will operate it continuously, prioritize templates, batch workflows, collaboration, and brand control.',
        'For long-term use, real comments and fresh updates matter a lot.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '营销工具最适合哪些人？',
          en: 'Who are marketing tools best for?',
        },
        answer: {
          cn: '增长、内容、广告投放、邮件和社媒团队通常收益最大。',
          en: 'Growth, content, paid ads, email, and social teams usually benefit the most.',
        },
      },
      {
        question: {
          cn: '我应该先比什么？',
          en: 'What should I compare first?',
        },
        answer: {
          cn: '先看渠道适配，再看批量效率、协作和品牌控制。',
          en: 'Start with channel fit, then compare batch speed, collaboration, and brand control.',
        },
      },
      {
        question: {
          cn: '付费版值得吗？',
          en: 'Is paid worth it?',
        },
        answer: {
          cn: '如果你要持续产出和多人协作，通常比免费版更稳定；如果只是试用，免费版够先验证。',
          en: 'If you need ongoing production and team use, paid plans are usually more stable; free tiers are enough to validate first.',
        },
      },
      {
        question: {
          cn: '我可以从这里继续找工具吗？',
          en: 'Can I keep browsing tools from here?',
        },
        answer: {
          cn: '可以，先看分类，再看对比，再进单个工具页，会更快收敛。',
          en: 'Yes. Category first, then comparison, then individual tool pages is usually the fastest way to narrow down.',
        },
      },
    ],
  });

  return (
    <>
      <ComparisonPage
        isChinese={data.isChinese}
        breadcrumbSchema={data.breadcrumbSchema}
        faqSchema={data.faqSchema}
        itemListSchema={data.itemListSchema}
        tools={data.tools}
        tips={data.tips}
        decisionCards={data.decisionCards}
        comparisonDimensions={data.comparisonDimensions}
        fitFor={data.fitFor}
        notFor={data.notFor}
        nextPaths={data.nextPaths}
        categories={data.categories}
        config={data.config}
        siteUrl={data.siteUrl}
        locale={locale}
      />
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '营销对比页要围绕渠道覆盖、产出效率、协作权限和品牌一致性来判断，不要只看工具有多少模板。这个页继续可索引，但会把写作、销售和自动化路径分层。'
            : 'This marketing comparison page should judge channel coverage, output efficiency, collaboration, and brand consistency instead of counting templates. Keep it indexable, but separate writing, sales, and automation paths.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '验证重点' : 'Validation focus',
            value: locale === 'cn' || locale === 'tw' ? '渠道、产出、品牌' : 'Channels, output, brand',
            note:
              locale === 'cn' || locale === 'tw'
                ? '确认它是不是在服务广告、邮件或社媒工作流。'
                : 'Confirm it serves ads, email, or social workflows.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '合并策略' : 'Merge strategy',
            value: locale === 'cn' || locale === 'tw' ? '分流到写作/销售' : 'Route to writing/sales',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只是文案生成，就转到写作页。'
                : 'If the need is only copy generation, move to writing pages.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '后续增量' : 'Next increments',
            value: locale === 'cn' || locale === 'tw' ? '真实渠道案例、样本' : 'Real channel cases, samples',
            note:
              locale === 'cn' || locale === 'tw'
                ? '补真实投放、邮件和增长实验样本。'
                : 'Add real ads, email, and growth experiment examples.',
          },
        ]}
      />
      <section className='mx-auto mt-6 grid max-w-6xl gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '营销对比页已按真实渠道和协作场景重新核对。'
              : 'The marketing comparison page has been rechecked against real channel and collaboration scenarios.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-700'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，继续强调渠道、协作和品牌一致性。'
              : 'Keep it indexable and keep emphasizing channels, collaboration, and brand consistency.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-700'>
            {locale === 'cn' || locale === 'tw'
              ? '补一个真实投放或内容生产案例。'
              : 'Add one real campaign or content production case.'}
          </p>
        </div>
      </section>
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是直接上营销平台还是继续看替代方案'
              : 'Start with the ranking, then decide whether to use a marketing platform or keep comparing alternatives'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确是营销场景，先把 shortlist 收紧会比继续横向浏览更有效。'
              : 'If marketing is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-marketing-tools',
                title: locale === 'cn' || locale === 'tw' ? '营销工具榜单' : 'Marketing tools ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-tools-for-marketing',
                title: locale === 'cn' || locale === 'tw' ? '营销指南' : 'Marketing guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认广告、邮件还是社媒。'
                    : 'Re-check whether the need is ads, email, or social.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当核心是文案和长文本。'
                    : 'Useful when copy and long-form content are the core need.',
              },
              {
                href: '/guides/ai-tools-for-sales-comparison',
                title: locale === 'cn' || locale === 'tw' ? '销售工具对比' : 'Sales tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果需求已经偏向外联和跟进。'
                    : 'Better when the real need is outreach and follow-up.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`marketing_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_marketing_comparison' />
    </>
  );
}
