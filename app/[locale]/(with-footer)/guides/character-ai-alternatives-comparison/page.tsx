import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Character AI 替代方案对比' : 'Character AI alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Character AI 的 AI 工具，帮你更快判断角色对话、沉浸式互动和通用聊天该怎么选。'
      : 'Compare AI tools that are commonly used as Character AI alternatives so you can choose the right fit for character chat, immersive interaction, and general-purpose conversation.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '聊天工具', en: 'Chat tools' },
    comparisonLabel: { cn: 'Character AI 替代方案对比', en: 'Character AI alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Character AI 这类角色对话入口，这一页会把常见替代项放在一起看，帮助你判断是要角色沉浸感，还是更通用的聊天能力。',
      en: 'If you are already comparing Character AI-style character chat entry points, this page puts the common alternatives side by side so you can decide whether you need immersive roleplay or more general-purpose chat.',
    },
    searchQuery: 'character',
    guideHref: '/guides/ai-chatbot-tools',
    rankingHref: '/best-ai-tools/ai-chatbot-tools',
    rankingLabel: { cn: '转去聊天榜单页', en: 'Open the chatbot ranking' },
    backGuideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' },
    altBrowseHref: '/explore?search=character&sort=popular',
    altBrowseLabel: { cn: '浏览更多角色聊天工具', en: 'Browse more character chat tools' },
    breadcrumbLabel: { cn: 'Character AI 替代方案对比', en: 'Character AI alternatives comparison' },
    compareTitle: {
      cn: '几款常见角色聊天工具的快速对照',
      en: 'A quick side-by-side look at common character chat tools',
    },
    compareSubtitle: { cn: 'Character AI', en: 'Character AI' },
    preferredToolNames: ['character_ai', 'chatgpt-mac', 'poe', 'anthropic'],
    decisionCards: [
      {
        title: { cn: '先看是不是要角色沉浸感', en: 'Do you need character immersion' },
        description: {
          cn: 'Character AI 的核心就是“角色感”和互动氛围；如果你只是要问答，那就不一定非它不可。',
          en: 'Character AI is really about character feel and interactive immersion; if you only need Q&A, it may not be the only option.',
        },
      },
      {
        title: { cn: '再看是剧情互动还是日常聊天', en: 'Story interaction or daily chat' },
        description: {
          cn: '有些工具更适合长期角色扮演和沉浸式对话，有些则更适合普通聊天和生产力用途。',
          en: 'Some tools are better for ongoing roleplay and immersion, while others are better for everyday chat and productivity.',
        },
      },
      {
        title: { cn: '最后看你要不要更稳定的主入口', en: 'Do you want a more stable primary entry' },
        description: {
          cn: '如果你希望长期使用、切换更少、记忆更稳，替代项的差异会很明显。',
          en: 'If you want long-term use with fewer switches and steadier memory, the differences between alternatives matter a lot.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '喜欢角色聊天和互动体验的人', en: 'People who like character chat and interaction' },
        description: {
          cn: '适合你把聊天当成一种沉浸式体验，而不只是工具问答。',
          en: 'Best if you treat chat as an immersive experience, not just a utility for answers.',
        },
      },
      {
        title: { cn: '想比较通用聊天入口的人', en: 'People comparing general chat entries' },
        description: {
          cn: '如果你正在看角色对话和更通用的助手之间差在哪，这页会很有用。',
          en: 'Useful if you are comparing character-focused chat with more general assistants.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只需要严肃工作助手的人', en: 'People who only need a serious work assistant' },
        description: {
          cn: '如果你的核心任务是写作、研究或代码，角色聊天页通常不是第一层决策。',
          en: 'If your main task is writing, research, or coding, character chat pages are usually not the first layer to evaluate.',
        },
      },
      {
        title: { cn: '还没想好自己想聊什么的人', en: 'People who have not decided what they want to chat about' },
        description: {
          cn: '如果你还没明确是角色、聊天还是通用助手，先回到更宽的聊天工具指南。',
          en: 'If you are not sure whether you want roleplay, chat, or a general assistant, start from the broader chatbot guide.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-chatbot-tools',
        title: { cn: '先看聊天榜单', en: 'Start with the chatbot ranking' },
        description: {
          cn: '如果你已经明确是在找聊天入口，先用榜单缩小候选。',
          en: 'If a chat entry point is already the goal, use the ranking first to narrow down.',
        },
      },
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人总对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你更在意通用聊天和工作流，这条路径更高意图。',
          en: 'A higher-intent path when general chat and workflow fit matter more.',
        },
      },
      {
        href: '/guides/poe-alternatives-comparison',
        title: { cn: '转去 Poe 替代方案对比', en: 'Go to Poe alternatives comparison' },
        description: {
          cn: '如果你更关心多模型并排和聚合入口，这页也值得继续看。',
          en: 'Move here if multi-model comparison and aggregation are also part of the decision.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人总对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你想把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want to broaden the shortlist again.',
        },
      },
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你更需要的是通用聊天入口，这条路径更合适。',
          en: 'Move here if a more general chat entry is what you need.',
        },
      },
      {
        href: '/guides/poe-alternatives-comparison',
        title: { cn: '转去 Poe 替代方案对比', en: 'Go to Poe alternatives comparison' },
        description: {
          cn: '如果你想要多模型聚合和并排比较，这页更贴近。',
          en: 'Switch here if you want multi-model aggregation and side-by-side comparison.',
        },
      },
    ],
    toolSelectionNotes: {
      character_ai: {
        bestFor: {
          cn: '想要沉浸式角色对话和互动氛围的人。',
          en: 'People who want immersive character chat and a strong interaction vibe.',
        },
        whyPickIt: {
          cn: '它的核心卖点是角色感和对话氛围，而不是通用问答。',
          en: 'Its main draw is the character feel and conversation atmosphere, not generic Q&A.',
        },
        watchOut: {
          cn: '如果你要的是更稳的生产力工具，它不一定是最合适的主入口。',
          en: 'If you need a steadier productivity tool, it may not be the best primary entry.',
        },
      },
      'chatgpt-mac': {
        bestFor: {
          cn: '想要更通用、偏工作流的聊天入口的人。',
          en: 'People who want a more general-purpose, workflow-friendly chat entry.',
        },
        whyPickIt: {
          cn: '它更适合把聊天变成可持续的日常助手，而不是角色扮演平台。',
          en: 'It is better for turning chat into a daily helper rather than a roleplay platform.',
        },
        watchOut: {
          cn: '如果你真正想要的是沉浸式角色互动，它的定位会更宽。',
          en: 'If immersive character interaction is the real goal, its positioning is broader.',
        },
      },
      poe: {
        bestFor: {
          cn: '想在多个模型和不同风格间切换的人。',
          en: 'People who want to switch between models and response styles.',
        },
        whyPickIt: {
          cn: '它更适合做对比和聚合，而不是单一角色沉浸体验。',
          en: 'It is better for comparison and aggregation than for a single immersive roleplay experience.',
        },
        watchOut: {
          cn: '如果你需要明确的角色连续性和专门的互动氛围，别只看聚合能力。',
          en: 'If you need clear character continuity and a dedicated interaction vibe, do not focus only on aggregation.',
        },
      },
      anthropic: {
        bestFor: {
          cn: '更看重长文本、分析和稳定输出的人。',
          en: 'People who care more about long text, analysis, and steady output.',
        },
        whyPickIt: {
          cn: '它更适合认真讨论和复杂内容，而不是纯娱乐角色互动。',
          en: 'It is stronger for serious discussion and complex content than for pure entertainment roleplay.',
        },
        watchOut: {
          cn: '如果你要的是角色沉浸感，它并不是同一类产品。',
          en: 'If you want character immersion, it is not the same kind of product.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你要的是角色沉浸感，还是通用聊天助手。',
        '如果你常常切换角色，重点看连续性和互动氛围。',
        '如果你只想解决工作任务，角色聊天通常不是第一选择。',
      ],
      en: [
        'First decide whether you want character immersion or a general chat assistant.',
        'If you switch characters often, focus on continuity and interaction vibe.',
        'If you only want to get work done, character chat is usually not the first choice.',
      ],
    },
    faqs: [
      {
        question: {
          cn: '为什么单独做 Character AI 替代方案页？',
          en: 'Why make a separate Character AI alternatives page?',
        },
        answer: {
          cn: '因为角色对话和沉浸式互动的决策重点，和普通聊天入口不一样。',
          en: 'Because the decision points for character chat and immersive interaction are different from a normal chat entry.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看角色感、互动体验、通用性、稳定性、价格和真实反馈。',
          en: 'We compare character feel, interaction experience, general-purpose fit, stability, pricing, and real feedback.',
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
              ? '先看榜单，再决定是继续看角色聊天还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing character chat tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做角色对话或沉浸式聊天，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If character chat or immersive conversation is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-chatbot-tools',
                title: locale === 'cn' || locale === 'tw' ? '聊天榜单' : 'Chat ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的聊天候选。'
                    : 'Narrow to the most trial-worthy chat candidates first.',
              },
              {
                href: '/guides/ai-chatbot-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '聊天工具对比' : 'Chat tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你需要更通用的聊天能力。'
                    : 'Useful when the need is broader general-purpose chat.',
              },
              {
                href: '/guides/chatgpt-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'ChatGPT 替代方案' : 'ChatGPT alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的决策其实更偏通用助手。'
                    : 'A better path when the real decision is a general-purpose assistant.',
              },
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Agent 工具对比' : 'Agent tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你开始需要多步骤执行。'
                    : 'Useful once your workflow moves beyond chat into multi-step execution.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`character_ai_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='character_ai_alternatives_comparison' />
    </>
  );
}
