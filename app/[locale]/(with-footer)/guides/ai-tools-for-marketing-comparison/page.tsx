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
  );
}
