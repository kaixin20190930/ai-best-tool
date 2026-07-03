import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Mailchimp 替代方案对比' : 'Mailchimp alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Mailchimp 的 AI 工具，帮你更快判断邮件营销、自动化和受众管理该怎么选。'
      : 'Compare AI tools that are commonly used as Mailchimp alternatives so you can choose the right fit for email marketing, automation, and audience management.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '营销工具', en: 'Marketing tools' },
    comparisonLabel: { cn: 'Mailchimp 替代方案对比', en: 'Mailchimp alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Mailchimp 这类邮件营销和自动化入口，这一页会把常见替代项放在一起看，帮助你判断是要邮件触达、受众管理，还是更完整的营销系统。',
      en: 'If you are already comparing Mailchimp-style email marketing and automation entry points, this page puts the common alternatives side by side so you can decide whether you need email delivery, audience management, or a more complete marketing system.',
    },
    searchQuery: 'mailchimp',
    guideHref: '/guides/ai-tools-for-marketing',
    rankingHref: '/best-ai-tools/ai-marketing-tools',
    rankingLabel: { cn: '转去营销榜单页', en: 'Open the marketing ranking' },
    backGuideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' },
    altBrowseHref: '/explore?search=mailchimp&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Mailchimp 相关工具', en: 'Browse more Mailchimp-related tools' },
    breadcrumbLabel: { cn: 'Mailchimp 替代方案对比', en: 'Mailchimp alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Mailchimp 替代项的快速对照',
      en: 'A quick side-by-side look at common Mailchimp alternatives',
    },
    compareSubtitle: { cn: 'Mailchimp', en: 'Mailchimp' },
    preferredToolNames: ['mailchimp', 'hubspot', 'jasper', 'copy-ai'],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-marketing-tools',
        title: { cn: '先看营销榜单', en: 'Start with the marketing ranking' },
        description: {
          cn: '如果你已经明确在找邮件营销工具，先用榜单收口。',
          en: 'If email marketing tools are already the goal, use the ranking to narrow down first.',
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
      {
        href: '/guides/hubspot-alternatives-comparison',
        title: { cn: '转去 HubSpot 替代方案对比', en: 'Go to HubSpot alternatives comparison' },
        description: {
          cn: '如果你后面会走向 CRM 和更完整的营销系统，这条路径更高意图。',
          en: 'A higher-intent path when CRM and a fuller marketing system are the real need.',
        },
      },
      {
        href: '/guides/copy-ai-alternatives-comparison',
        title: { cn: '转去 Copy.ai 替代方案对比', en: 'Go to Copy.ai alternatives comparison' },
        description: {
          cn: '如果你同时也在看文案起稿和内容生成，这页也值得继续看。',
          en: 'Move here if you are also comparing drafting and content-generation tools.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '先看是不是做邮件营销', en: 'Email marketing first' },
        description: {
          cn: 'Mailchimp 的核心通常是邮件触达和自动化；如果你要的是纯内容生成，那不是这页最该看的方向。',
          en: 'Mailchimp is usually about email delivery and automation; if you only need content generation, this is not the main path to compare.',
        },
      },
      {
        title: { cn: '再看是不是要受众与流程', en: 'Audience and workflow' },
        description: {
          cn: '如果你要的是分群、触发和长期触达，受众管理和自动化深度会比单次邮件更重要。',
          en: 'If you need segmentation, triggers, and long-term outreach, audience management and automation depth matter more than one-off emails.',
        },
      },
      {
        title: { cn: '最后看是否适合长期营销系统', en: 'Long-term marketing system' },
        description: {
          cn: '真正能留下来的邮件工具，往往是能和 CRM、网站和其他营销动作连起来的。',
          en: 'The email tools that stick are usually the ones that connect cleanly with CRM, the website, and other marketing actions.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '邮件营销团队', en: 'Email marketing teams' },
        description: {
          cn: '适合经常做促销、培育和自动化邮件的人。',
          en: 'A strong fit for people running promos, nurture flows, and automation emails often.',
        },
      },
      {
        title: { cn: '需要受众管理的人', en: 'People who need audience management' },
        description: {
          cn: '如果你会频繁做分群、触发和复购提醒，这类页会很实用。',
          en: 'Useful when segmentation, triggers, and retention reminders are part of the job.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想写几句营销文案的人', en: 'People who only want a few marketing lines' },
        description: {
          cn: '如果你只是要写几句文案，营销或写作工具页更直接。',
          en: 'If you only need a few lines of copy, a marketing or writing tools page is more direct.',
        },
      },
      {
        title: { cn: '不做邮件触达的人', en: 'People who do not run email outreach' },
        description: {
          cn: '如果你的工作重点不在邮件和自动化，Mailchimp 替代页就不是第一层。',
          en: 'If your job is not centered on email or automation, this alternatives page is not the first layer to review.',
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
        href: '/guides/copy-ai-alternatives-comparison',
        title: { cn: '转去 Copy.ai 替代方案对比', en: 'Go to Copy.ai alternatives comparison' },
        description: {
          cn: '如果你更偏快速起稿和批量变体，这条路径更贴近。',
          en: 'Move here if fast drafting and bulk variations matter more.',
        },
      },
      {
        href: '/guides/jasper-alternatives-comparison',
        title: { cn: '转去 Jasper 替代方案对比', en: 'Go to Jasper alternatives comparison' },
        description: {
          cn: '如果你更在意品牌文案和营销内容生产，这页更合适。',
          en: 'A better fit if brand copy and marketing content production are the main need.',
        },
      },
    ],
    toolSelectionNotes: {
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
          en: 'If you are comparing broader marketing AI platforms, keep looking horizontally.',
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
          cn: '如果你只想做邮件发送，它可能比你需要的更重。',
          en: 'It can feel heavier than needed if you only want email sending.',
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
          cn: '如果你的重点是邮件自动化和受众管理，Mailchimp 路线更贴近。',
          en: 'If your focus is email automation and audience management, the Mailchimp route is closer.',
        },
      },
      'copy-ai': {
        bestFor: {
          cn: '需要快速起草多种营销文案变体的人。',
          en: 'People who need to draft many variations of marketing copy quickly.',
        },
        whyPickIt: {
          cn: '它适合加速文案起步。',
          en: 'It is useful for speeding up the first draft stage.',
        },
        watchOut: {
          cn: '如果你真正要管理邮件列表和触发流程，这不是最完整的一层。',
          en: 'If you need to manage mailing lists and triggers, this is not the full answer.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你要的是邮件发送、自动化，还是整个营销系统。',
        '看它能不能和 CRM、网站和受众分群接起来。',
        '如果你只是在找文案生成，别把邮件系统看太重。',
      ],
      en: [
        'First separate email sending, automation, and the full marketing system.',
        'Check whether it connects with CRM, your website, and audience segmentation.',
        'If you only need copy generation, do not over-weight the email system layer.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Mailchimp 替代方案页？', en: 'Why make a separate Mailchimp alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找邮件营销和自动化工具，这类意图很接近转化。',
          en: 'Because many users are explicitly looking for email marketing and automation tools, which is close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看邮件触达、自动化、受众管理、协作和真实反馈。',
          en: 'We compare email delivery, automation, audience management, collaboration, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='mailchimp_alternatives_comparison' />
    </>
  );
}
