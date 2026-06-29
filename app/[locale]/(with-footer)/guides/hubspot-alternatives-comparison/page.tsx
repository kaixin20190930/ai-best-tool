import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'HubSpot 替代方案对比' : 'HubSpot alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 HubSpot 的 AI 工具，帮你更快判断 CRM、营销自动化和流程编排该怎么选。'
      : 'Compare AI tools that are commonly used as HubSpot alternatives so you can choose the right fit for CRM, marketing automation, and workflow orchestration.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '营销工具', en: 'Marketing tools' },
    comparisonLabel: { cn: 'HubSpot 替代方案对比', en: 'HubSpot alternatives comparison' },
    description: {
      cn: '如果你已经在比较 HubSpot 这类 CRM 加营销系统入口，这一页会把常见替代项放在一起看，帮助你判断是要营销自动化、受众管理，还是更轻量的增长工作流。',
      en: 'If you are already comparing HubSpot-style CRM plus marketing system entry points, this page puts the common alternatives side by side so you can decide whether you need marketing automation, audience management, or a lighter growth workflow.',
    },
    searchQuery: 'hubspot',
    guideHref: '/guides/ai-tools-for-marketing',
    rankingHref: '/best-ai-tools/ai-marketing-tools',
    rankingLabel: { cn: '转去营销榜单页', en: 'Open the marketing ranking' },
    backGuideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' },
    altBrowseHref: '/explore?search=hubspot&sort=popular',
    altBrowseLabel: { cn: '浏览更多 HubSpot 相关工具', en: 'Browse more HubSpot-related tools' },
    breadcrumbLabel: { cn: 'HubSpot 替代方案对比', en: 'HubSpot alternatives comparison' },
    compareTitle: {
      cn: '几款常见 HubSpot 替代项的快速对照',
      en: 'A quick side-by-side look at common HubSpot alternatives',
    },
    compareSubtitle: { cn: 'HubSpot', en: 'HubSpot' },
    preferredToolNames: ['hubspot', 'mailchimp', 'jasper', 'copy-ai'],
    decisionCards: [
      {
        title: { cn: '先看是不是要系统级营销', en: 'System-level marketing' },
        description: {
          cn: 'HubSpot 的重点通常不是单点生成，而是把 CRM、营销和自动化连起来。',
          en: 'HubSpot is usually about connecting CRM, marketing, and automation rather than single-point generation.',
        },
      },
      {
        title: { cn: '再看是不是要流程编排', en: 'Workflow orchestration' },
        description: {
          cn: '如果你要的是受众分层、触发、跟进和团队协作，工作流会比单次内容产出重要得多。',
          en: 'If you need segmentation, triggers, follow-up, and team coordination, workflow matters much more than one-off content.',
        },
      },
      {
        title: { cn: '最后看是否适合长期用在团队里', en: 'Team adoption' },
        description: {
          cn: '真正能落地的系统，往往是能和现有 CRM、邮件和销售流程协同工作的。',
          en: 'The systems that stick are usually the ones that work cleanly with your CRM, email, and sales motion.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要 CRM + 营销统一的人', en: 'People who need CRM plus marketing in one place' },
        description: {
          cn: '适合想把线索、邮件、触达和记录放在同一个系统里的人。',
          en: 'A good fit when you want leads, email, outreach, and records in one system.',
        },
      },
      {
        title: { cn: '团队协作驱动的公司', en: 'Team-coordination-heavy companies' },
        description: {
          cn: '如果多人一起做营销和跟进，流程和权限会非常关键。',
          en: 'If multiple people run marketing and follow-up together, workflow and permissions matter a lot.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想写文案的人', en: 'People who only want copywriting' },
        description: {
          cn: '如果你的任务主要是内容生成，营销写作或 Copy.ai 类工具更轻。',
          en: 'If your task is mainly content generation, marketing writing or Copy.ai-style tools are lighter.',
        },
      },
      {
        title: { cn: '没有 CRM 需求的人', en: 'People without CRM needs' },
        description: {
          cn: '如果你不需要客户关系和流程管理，这类系统会显得偏重。',
          en: 'If you do not need CRM or workflow management, these systems can feel heavy.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-marketing-comparison',
        title: { cn: '转去营销工具总对比', en: 'Go to marketing tools comparison' },
        description: {
          cn: '如果你还在扩大候选范围，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/mailchimp-alternatives-comparison',
        title: { cn: '转去 Mailchimp 替代方案对比', en: 'Go to Mailchimp alternatives comparison' },
        description: {
          cn: '如果你更偏邮件营销和自动化，这条路径更贴近。',
          en: 'Move here if email marketing and automation are the real focus.',
        },
      },
      {
        href: '/guides/jasper-alternatives-comparison',
        title: { cn: '转去 Jasper 替代方案对比', en: 'Go to Jasper alternatives comparison' },
        description: {
          cn: '如果你更需要品牌文案和内容生产，这页更合适。',
          en: 'A better fit if brand copy and content production matter more.',
        },
      },
    ],
    toolSelectionNotes: {
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
          cn: '如果你需要更完整的 CRM 协同，这不是最重的一层。',
          en: 'If you need fuller CRM coordination, this is not the heaviest layer.',
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
          cn: '如果你的重点已经是 CRM 和自动化，Jasper 不是那一层。',
          en: 'If your focus is already CRM and automation, Jasper is not that layer.',
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
          cn: '如果你需要的是 CRM 和流程系统，它不是最终答案。',
          en: 'If you need CRM and a workflow system, it is not the final answer.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在买 CRM 还是买营销自动化。',
        '如果团队多人协作，权限、流程和记录会很关键。',
        '如果只是要生成内容，别把系统层工具看得太重。',
      ],
      en: [
        'First separate CRM needs from marketing automation needs.',
        'If a team is collaborating, permissions, workflows, and records matter a lot.',
        'If you only need content generation, do not over-weight system-level tools.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 HubSpot 替代方案页？', en: 'Why make a separate HubSpot alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找 CRM 和营销自动化系统，这比泛泛对比更接近真实决策。',
          en: 'Because many users are explicitly looking for CRM and marketing automation systems, which is closer to a real decision than a broad comparison.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看 CRM、自动化、协作、流程编排和真实反馈。',
          en: 'We compare CRM, automation, collaboration, workflow orchestration, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='hubspot_alternatives_comparison' />
    </>
  );
}
