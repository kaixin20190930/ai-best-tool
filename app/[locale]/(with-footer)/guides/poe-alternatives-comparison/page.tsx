import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Poe 替代方案对比' : 'Poe alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Poe 的 AI 工具，帮你更快判断多模型切换、统一入口和对话体验该怎么选。'
      : 'Compare AI tools that are commonly used as Poe alternatives so you can choose the right fit for multi-model switching, unified entry points, and conversational experience.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '聊天工具', en: 'Chat tools' },
    comparisonLabel: { cn: 'Poe 替代方案对比', en: 'Poe alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Poe 这种多模型入口，这一页会把常见替代项放在一起看，帮助你判断是继续用聚合入口，还是换成更偏单一主入口的工具。',
      en: 'If you are already comparing a Poe-style multi-model entry point, this page puts the common alternatives side by side so you can decide whether to keep an aggregator or move to a more focused primary entry.',
    },
    searchQuery: 'poe',
    guideHref: '/guides/ai-chatbot-tools',
    rankingHref: '/best-ai-tools/ai-chatbot-tools',
    rankingLabel: { cn: '转去聊天榜单页', en: 'Open the chatbot ranking' },
    backGuideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' },
    altBrowseHref: '/explore?search=poe&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Poe 相关工具', en: 'Browse more Poe-related tools' },
    breadcrumbLabel: { cn: 'Poe 替代方案对比', en: 'Poe alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Poe 替代项的快速对照',
      en: 'A quick side-by-side look at common Poe alternatives',
    },
    compareSubtitle: { cn: 'Poe', en: 'Poe' },
    preferredToolNames: ['poe', 'gemini', 'anthropic', 'chatgpt-mac'],
    decisionCards: [
      {
        title: { cn: '先看你要不要聚合入口', en: 'Do you need an aggregator' },
        description: {
          cn: 'Poe 的核心价值之一是多模型聚合；如果你只想要单一稳定主入口，替代项可能更适合。',
          en: 'One of Poe’s main values is multi-model aggregation; if you only want a single stable primary entry, a different tool may fit better.',
        },
      },
      {
        title: { cn: '再看是否要常切模型', en: 'How often will you switch models' },
        description: {
          cn: '如果你经常要比较回答风格或在模型间切换，入口体验比单个模型名更重要。',
          en: 'If you often compare answer styles or switch between models, the entry experience matters more than a single model name.',
        },
      },
      {
        title: { cn: '最后看对话体验顺不顺手', en: 'Is the conversation flow smooth' },
        description: {
          cn: '聚合入口好不好用，最终还是看你能不能顺手把对话、对比和下一步动作连起来。',
          en: 'An aggregator is only useful if it helps you move smoothly from conversation to comparison and then to the next action.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '喜欢多模型并排看的人', en: 'People who like comparing models side by side' },
        description: {
          cn: '适合你本来就习惯在多个模型之间比较风格和答案。',
          en: 'Best if you are already used to comparing response styles across multiple models.',
        },
      },
      {
        title: { cn: '需要一个统一入口的人', en: 'People who want one unified entry' },
        description: {
          cn: '如果你不想在很多产品之间来回切，聚合入口会更省事。',
          en: 'If you do not want to bounce between many products, a unified entry can be more convenient.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只要一个最稳的主工具的人', en: 'People who want one single primary tool' },
        description: {
          cn: '如果你已经明确只会长期用一个入口，Poe 的聚合优势就没那么关键了。',
          en: 'If you know you will stick to one primary tool, Poe’s aggregator advantage matters less.',
        },
      },
      {
        title: { cn: '还没想好用途的人', en: 'People still unsure about the use case' },
        description: {
          cn: '如果你还没想清楚是聊天、写作、研究还是代码理解，先回聊天机器人指南。',
          en: 'If you are still unsure whether the job is chat, writing, research, or code understanding, go back to the chatbot guide.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-chatbot-tools',
        title: { cn: '先看聊天榜单', en: 'Start with the chatbot ranking' },
        description: {
          cn: '如果你已经明确是在找聊天入口，先用榜单收口。',
          en: 'If a chat entry point is already the goal, use the ranking to narrow things down first.',
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
          cn: '如果你更需要通用聊天入口，这条路径更高意图。',
          en: 'A higher-intent path when a more general chat entry is the real need.',
        },
      },
      {
        href: '/guides/character-ai-alternatives-comparison',
        title: { cn: '转去 Character AI 替代方案对比', en: 'Go to Character AI alternatives comparison' },
        description: {
          cn: '如果你更在意角色沉浸和互动氛围，这页也值得继续看。',
          en: 'Move here if character immersion and interaction vibe are also part of the decision.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你想比较更偏通用聊天入口的候选，这页更合适。',
          en: 'Use this when you want to compare more general-purpose chat entry points.',
        },
      },
      {
        href: '/guides/claude-alternatives-comparison',
        title: { cn: '转去 Claude 替代方案对比', en: 'Go to Claude alternatives comparison' },
        description: {
          cn: '如果你更在意长上下文和分析，这条路径更合适。',
          en: 'Switch here if long context and analysis matter more.',
        },
      },
      {
        href: '/guides/gemini-alternatives-comparison',
        title: { cn: '转去 Gemini 替代方案对比', en: 'Go to Gemini alternatives comparison' },
        description: {
          cn: '如果你更看重生态和移动入口，继续看 Gemini 页。',
          en: 'Move here if ecosystem fit and mobile access matter more.',
        },
      },
    ],
    toolSelectionNotes: {
      poe: {
        bestFor: {
          cn: '想在一个入口里同时比较多个模型的人。',
          en: 'People who want to compare multiple models inside one entry point.',
        },
        whyPickIt: {
          cn: '它的核心价值就是聚合多个模型，让切换和对比更省事。',
          en: 'Its main value is aggregating multiple models so switching and comparison feel easier.',
        },
        watchOut: {
          cn: '如果你其实只想长期使用一个主工具，聚合带来的价值会变少。',
          en: 'If you really only want one long-term primary tool, the aggregator value gets smaller.',
        },
      },
      gemini: {
        bestFor: {
          cn: '更在意 Google 生态和手机入口的人。',
          en: 'People who care more about the Google ecosystem and mobile entry points.',
        },
        whyPickIt: {
          cn: '它更像一个自然融入 Google 体系的主入口。',
          en: 'It feels like a natural primary entry point inside Google’s ecosystem.',
        },
        watchOut: {
          cn: '如果你要的是真正多模型并排比较，Gemini 不是那一类工具。',
          en: 'If true side-by-side multi-model comparison is the goal, Gemini is not that kind of tool.',
        },
      },
      anthropic: {
        bestFor: {
          cn: '更看重稳定输出和长内容处理的人。',
          en: 'People who care more about steady output and long-form handling.',
        },
        whyPickIt: {
          cn: '它更适合做深一点的分析和解释，而不是多模型聚合。',
          en: 'It is stronger for deeper analysis and explanation than for multi-model aggregation.',
        },
        watchOut: {
          cn: '如果你常常要比较不同模型，就要记得它不是聚合平台。',
          en: 'If you constantly compare different models, remember it is not an aggregation platform.',
        },
      },
      'chatgpt-mac': {
        bestFor: {
          cn: '想把 ChatGPT 放进更顺手的桌面工作流里的人。',
          en: 'People who want ChatGPT inside a smoother desktop workflow.',
        },
        whyPickIt: {
          cn: '它把熟悉的聊天体验和更贴近日常工作的入口感连起来。',
          en: 'It combines the familiar chat experience with a workflow-friendly entry point.',
        },
        watchOut: {
          cn: '如果你更看重比较多个模型，它不会像 Poe 那样天然聚合。',
          en: 'If multi-model comparison is the priority, it will not aggregate like Poe.',
        },
      },
    },
    tips: {
      cn: [
        '先决定你是要“聚合多个模型”，还是要“稳定用一个主入口”。',
        '如果你经常对比回答风格，聚合入口会更占优势。',
        '如果你只求稳定长期使用，单一主工具可能更轻。',
      ],
      en: [
        'First decide whether you want to aggregate multiple models or stick to one primary entry.',
        'If you compare answer styles often, an aggregator has the advantage.',
        'If you only need a stable long-term tool, a single primary option may feel lighter.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Poe 替代方案页？', en: 'Why make a separate Poe alternatives page?' },
        answer: {
          cn: '因为它的决策重点是“要不要聚合入口”，这和普通聊天工具比较不完全一样。',
          en: 'Because the key decision is whether you need an aggregator, which is not quite the same as a normal chatbot comparison.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看多模型体验、入口顺手程度、长期使用稳定性、价格和真实反馈。',
          en: 'We compare multi-model experience, entry ergonomics, long-term stability, pricing, and real feedback.',
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
            ? '这页先看真实可验证的多模型聚合信号，再继续判断是否真的需要 Poe 这类统一入口。'
            : 'This page looks at verifiable multi-model aggregation signals first, then helps you decide whether a Poe-style unified entry is actually needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '聚合能力' : 'Aggregation',
            value:
              locale === 'cn' || locale === 'tw' ? '是否真的能并排比较' : 'Can it truly compare models side by side',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果不能方便切换和并比，聚合入口的价值就会下降。'
                : 'If switching and comparison are awkward, the aggregator value drops fast.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '对话顺手度' : 'Chat ergonomics',
            value: locale === 'cn' || locale === 'tw' ? '入口是否顺手' : 'Is the entry comfortable',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'Poe 的关键是“切换时不别扭”，不是单个模型多强。'
                : 'The key question is whether switching feels smooth, not how strong one model is.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期使用' : 'Long-term use',
            value: locale === 'cn' || locale === 'tw' ? '是否适合长期保留' : 'Can it stay in your stack',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你只要一个稳定主入口，别让聚合层过度复杂。'
                : 'If you only want one stable primary entry, do not overcomplicate the aggregation layer.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实 Poe 替代路径重新核对，保留聚合、切换和长期使用入口。'
              : 'This page has been rechecked against a real Poe-alternative workflow and keeps aggregation, switching, and long-term-use entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实替代证据'
              : 'Keep it indexable and add real alternative evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用聚合体验、切换顺手度和真人评论把它和泛聊天页区分开。'
              : 'Use aggregation experience, switching ergonomics, and real comments to differentiate it from generic chat pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '补真实替代场景和反馈'
              : 'Add real alternative scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、切换样例和真人评论。'
              : 'Next, prioritize cases, switching examples, and real comments.'}
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
              ? '先看榜单，再决定是继续看多模型入口还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing multi-model entry points or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经在找 Poe 这类聚合入口，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If you are already looking for a Poe-style aggregator, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-chatbot-tools',
                title: locale === 'cn' || locale === 'tw' ? '聊天榜单' : 'Chatbot ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看更高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-chatbot-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '聊天机器人总对比' : 'Chatbot comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你还要扩大 shortlist。'
                    : 'Useful when you want a broader shortlist.',
              },
              {
                href: '/guides/chatgpt-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'ChatGPT 替代方案' : 'ChatGPT alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更偏通用主入口。'
                    : 'Better when a general primary entry is the real need.',
              },
              {
                href: '/guides/character-ai-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Character AI 替代方案' : 'Character AI alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果角色互动和氛围更重要。'
                    : 'Useful when roleplay and interaction vibe matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`poe_alternatives_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='poe_alternatives_comparison' />
    </>
  );
}
