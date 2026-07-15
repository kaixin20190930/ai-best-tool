import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 客服工具对比' : 'AI customer support tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 客服工作流工具，帮你更快判断回复、分流和知识库能力。'
      : 'Compare common AI customer support workflow tools to judge replies, triage, and knowledge-base fit faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '客服工具', en: 'Customer support tools' },
    comparisonLabel: { cn: 'AI 客服工具对比', en: 'AI customer support tools comparison' },
    description: {
      cn: '如果你已经知道自己要比的是客服回复、知识库接入、工单分流和人工接手，这一页会帮你把常见候选放在一起看，减少反复试错。',
      en: 'If you already know the workflow is about replies, knowledge-base access, ticket triage, and human handoff, this page helps you compare common options side by side and reduce trial-and-error.',
    },
    searchQuery: 'support',
    guideHref: '/guides/ai-tools-for-customer-support',
    rankingHref: '/best-ai-tools/ai-small-business-tools',
    rankingLabel: { cn: '转去小企业榜单页', en: 'Open the small-business ranking' },
    backGuideLabel: { cn: '回到客服指南', en: 'Back to customer support guide' },
    altBrowseHref: '/explore?search=support&sort=popular',
    altBrowseLabel: { cn: '浏览更多客服工具', en: 'Browse more support tools' },
    breadcrumbLabel: { cn: '客服工具对比', en: 'Customer support tools comparison' },
    compareTitle: { cn: '几款常见客服工具的快速对照', en: 'A quick side-by-side look at common support tools' },
    compareSubtitle: { cn: '客服工作流', en: 'Support workflow' },
    preferredToolNames: ['chatgpt-mac', 'anthropic', 'gemini', 'notion'],
    toolSelectionNotes: {
      'chatgpt-mac': {
        bestFor: {
          cn: '快速写回复草稿和通用支持场景',
          en: 'Fast reply drafts and general support use cases',
        },
        whyPickIt: {
          cn: '适合把一线客服的上下文快速整理成可发出的回答。',
          en: 'Good for turning frontline context into a sendable response quickly.',
        },
        watchOut: {
          cn: '如果你需要严格的工单流程和知识库治理，还要继续看集成能力。',
          en: 'If you need strict ticketing workflows and knowledge-base governance, keep checking integrations.',
        },
      },
      anthropic: {
        bestFor: {
          cn: '较长上下文、政策解释和更稳的文本推理',
          en: 'Long context, policy explanation, and steadier text reasoning',
        },
        whyPickIt: {
          cn: '适合处理较复杂的客服规则、退款政策和多段对话。',
          en: 'Well suited for complex support policies, refunds, and multi-turn conversations.',
        },
        watchOut: {
          cn: '如果要直接接入工单或知识库，还是要看你现有系统怎么连。',
          en: 'If you need direct ticketing or knowledge-base integration, check how your current stack connects.',
        },
      },
      gemini: {
        bestFor: {
          cn: 'Google 生态里的支持协作和文档场景',
          en: 'Support collaboration and document-heavy workflows in the Google ecosystem',
        },
        whyPickIt: {
          cn: '适合和 Gmail、Docs、Drive 这类环境一起用。',
          en: 'A practical fit if your team already works in Gmail, Docs, and Drive.',
        },
        watchOut: {
          cn: '如果你的客服流程更依赖专门工单系统，先确认联动是否顺手。',
          en: 'If your support process depends on dedicated ticketing, make sure the handoff feels natural.',
        },
      },
      notion: {
        bestFor: {
          cn: '内部知识库、FAQ 管理和处理规范沉淀',
          en: 'Internal knowledge bases, FAQ management, and process documentation',
        },
        whyPickIt: {
          cn: '适合把客服话术、政策和常见问题整理成团队可复用的知识页。',
          en: 'Great for turning support scripts, policies, and FAQs into reusable team docs.',
        },
        watchOut: {
          cn: '如果你要的是实时工单响应，Notion 更像知识底座而不是前台客服系统。',
          en: 'If you need live ticket response, Notion is more of a knowledge layer than a frontline support system.',
        },
      },
    },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-small-business-tools',
        title: { cn: '先看小企业榜单', en: 'Start with the small-business ranking' },
        description: {
          cn: '如果客服已经是确定需求，先用榜单缩小 shortlist。',
          en: 'If support is already the clear need, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-customer-support',
        title: { cn: '回到客服指南', en: 'Back to the support guide' },
        description: {
          cn: '如果你还要先理清回复、知识库和分流规则，可以回到指南页。',
          en: 'Go back if you still need to clarify replies, knowledge base, and routing rules first.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具对比', en: 'Go to automation comparison' },
        description: {
          cn: '如果你要解决的是分流、通知和自动回复，这页更高意图。',
          en: 'A higher-intent path when triage, notifications, and auto-replies are the real need.',
        },
      },
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你更关心通用问答和对话体验，这页更适合。',
          en: 'Move there if general Q&A and conversational quality matter more.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-customer-support',
        title: { cn: '先看客服指南', en: 'Start with the support guide' },
        description: {
          cn: '如果你还在定义比较维度，先回到指南页更容易建立判断。',
          en: 'If you still need to define comparison criteria, start from the guide first.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具对比', en: 'Switch to automation comparison' },
        description: {
          cn: '如果你真正想比的是分流、通知和自动化流，这一页更贴近。',
          en: 'Go there if the real need is triage, notifications, and automation flows.',
        },
      },
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人对比', en: 'Switch to chatbot comparison' },
        description: {
          cn: '如果你更关心通用问答和对话体验，这页更适合。',
          en: 'Move there if general Q&A and conversational quality matter more.',
        },
      },
    ],
    tips: {
      cn: [
        '先看回复、分流、知识库和人工接手，别只盯着模型输出。',
        '如果你已经有工单系统，优先看集成和权限，而不是单点功能。',
        '长期使用时，政策更新、可追踪性和团队协作通常比“好看回答”更重要。',
      ],
      en: [
        'Start with replies, triage, knowledge-base access, and human handoff rather than only raw model output.',
        'If you already have ticketing software, prioritize integrations and permissions over isolated features.',
        'For long-term use, policy updates, traceability, and team collaboration usually matter more than “nice-looking” answers.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的重点是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看回复质量、知识库接入、工单分流、人工接手和团队协作。',
          en: 'We compare reply quality, knowledge-base access, ticket triage, human handoff, and team collaboration.',
        },
      },
      {
        question: { cn: '为什么客服要单独看？', en: 'Why compare support tools separately?' },
        answer: {
          cn: '因为客服场景更看重上下文、语气、规则和流程，和通用聊天工具并不完全一样。',
          en: 'Because support work depends more on context, tone, rules, and workflow than a generic chat experience.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '客服对比页应该看回复质量、分流、知识库接入和人工接手是否顺畅，而不只是模型输出是否漂亮。'
            : 'The support comparison page should judge reply quality, triage, knowledge-base access, and human handoff instead of just pretty outputs.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '回复质量' : 'Reply quality',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能稳妥回答'
                : 'Check whether it can answer safely and clearly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '客服最怕答非所问。'
                : 'Support teams cannot afford off-target replies.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '工单分流' : 'Ticket triage',
            value:
              locale === 'cn' || locale === 'tw' ? '看能否分到正确队列' : 'See whether it routes to the right queue',
            note:
              locale === 'cn' || locale === 'tw'
                ? '分流正确，后面的人工处理才会省力。'
                : 'Good triage makes the rest of the human workflow much easier.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '知识库接入' : 'Knowledge-base fit',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看是否能复用已有知识'
                : 'Check whether existing knowledge can be reused',
            note:
              locale === 'cn' || locale === 'tw'
                ? '接得上知识库，客服效率才会稳定。'
                : 'Support efficiency only scales when the knowledge base is usable.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '回复信号' : 'Reply signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能稳妥回答'
                : 'Check whether it can answer safely and clearly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '客服最怕答非所问。'
                : 'Support teams cannot afford off-target replies.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '分流信号' : 'Triage signal',
            value:
              locale === 'cn' || locale === 'tw' ? '看能否分到正确队列' : 'See whether it routes to the right queue',
            note:
              locale === 'cn' || locale === 'tw'
                ? '分流正确，后面的人工处理才会省力。'
                : 'Good triage makes the rest of the human workflow much easier.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '知识库信号' : 'Knowledge-base signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看是否能复用已有知识'
                : 'Check whether existing knowledge can be reused',
            note:
              locale === 'cn' || locale === 'tw'
                ? '接得上知识库，客服效率才会稳定。'
                : 'Support efficiency only scales when the knowledge base is usable.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实客服路径重新核对，保留回复、分流和知识库入口。'
              : 'This page has been rechecked against a real support workflow and keeps reply, triage, and knowledge-base entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实客服证据'
              : 'Keep it indexable and add real support evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用工单、知识库和真人评论把它和泛客服页区分开。'
              : 'Use tickets, knowledge-base signals, and real comments to differentiate it from generic support pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实客服场景和反馈' : 'Add real support scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补工单案例、知识库样例和真人评论。'
              : 'Next, prioritize ticket cases, knowledge-base examples, and real comments.'}
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
              ? '先看榜单，再决定是否继续看客服工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing support tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果客服已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If support is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-small-business-tools',
                title: locale === 'cn' || locale === 'tw' ? '小企业榜单' : 'Small-business ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-customer-support',
                title: locale === 'cn' || locale === 'tw' ? '客服指南' : 'Support guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是回复、分流还是知识库。'
                    : 'Re-check whether the job is replies, triage, or knowledge base.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '自动化对比' : 'Automation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果重点是分流、通知和自动回复。'
                    : 'Useful when triage, notifications, and auto-replies are the real need.',
              },
              {
                href: '/guides/ai-chatbot-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '聊天机器人对比' : 'Chatbot comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心通用问答和对话体验。'
                    : 'Better when general Q&A and conversation quality matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`support_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_customer_support_comparison' />
    </>
  );
}
