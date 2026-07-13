import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 写作工具对比' : 'AI writing tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更有代表性的 AI 写作工具，帮你更快选出适合内容工作流的一个。'
      : 'Compare representative AI writing tools to choose the one that fits your content workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '写作工具', en: 'Writing tools' },
    comparisonLabel: { cn: 'AI 写作工具对比', en: 'AI writing tools comparison' },
    description: {
      cn: '如果你已经知道自己要处理博客、营销文案、改写或创意写作，这一页会帮你把几款更有代表性的写作工具放在一起看。',
      en: 'If you already know you need help with blogs, marketing copy, rewriting, or creative drafting, this page helps you compare a few more representative writing tools side by side.',
    },
    searchQuery: 'writing',
    guideHref: '/guides/ai-writing-tools',
    rankingHref: '/best-ai-tools/ai-writing-tools',
    rankingLabel: { cn: '转去写作榜单页', en: 'Open the writing ranking' },
    backGuideLabel: { cn: '回到写作指南', en: 'Back to writing guide' },
    altBrowseHref: '/explore?search=writing&sort=popular',
    altBrowseLabel: { cn: '浏览更多写作工具', en: 'Browse more writing tools' },
    breadcrumbLabel: { cn: '写作工具对比', en: 'Writing tools comparison' },
    compareTitle: {
      cn: '几款代表性写作工具的快速对照',
      en: 'A quick side-by-side look at representative writing tools',
    },
    compareSubtitle: { cn: '写作', en: 'Writing' },
    preferredToolNames: ['grammarly', 'frase', 'rytr', 'sudowrite'],
    decisionCards: [
      {
        title: { cn: '做博客和 SEO 内容', en: 'Blogs and SEO content' },
        description: {
          cn: '重点看内容结构、主题扩展、长文稳定性，以及是否能接进你的内容生产节奏。',
          en: 'Prioritize structure, topic expansion, long-form stability, and whether the tool fits a repeatable publishing rhythm.',
        },
      },
      {
        title: { cn: '做营销文案和转化页', en: 'Marketing copy and landing pages' },
        description: {
          cn: '更该看模板、语气控制和生成速度，而不是只看长文能力。',
          en: 'Templates, tone control, and speed matter more here than long-form depth alone.',
        },
      },
      {
        title: { cn: '做改写或创意写作', en: 'Rewriting or creative drafting' },
        description: {
          cn: '要看语气多样性、发散能力，以及你是否愿意反复迭代同一段内容。',
          en: 'Look for tonal range, ideation ability, and whether the tool supports iterative refinement well.',
        },
      },
    ],
    comparisonDimensions: [
      {
        title: { cn: '语气控制', en: 'Tone control' },
        description: {
          cn: '如果你要保持品牌口吻一致，这个能力比单纯的生成速度更重要。',
          en: 'If brand voice consistency matters, tone control is more important than raw generation speed.',
        },
      },
      {
        title: { cn: '改写与润色', en: 'Rewriting and polishing' },
        description: {
          cn: '重点看它能不能把已有内容改得更顺、更短或者更像人写，而不是只会扩写。',
          en: 'Check whether it can improve clarity, shorten copy, or make text feel more natural instead of only expanding it.',
        },
      },
      {
        title: { cn: '长文稳定性', en: 'Long-form stability' },
        description: {
          cn: '如果你常写文章、邮件和落地页，长篇内容是否稳定会直接影响可持续性。',
          en: 'For articles, emails, and landing pages, long-form stability directly affects whether the tool is sustainable to use.',
        },
      },
      {
        title: { cn: '模板和速度', en: 'Templates and speed' },
        description: {
          cn: '短内容和批量任务更看模板、切换成本和起稿速度。',
          en: 'Short-form and batch tasks depend more on templates, low switching cost, and quick first drafts.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '持续写内容的人', en: 'People publishing regularly' },
        description: {
          cn: '适合博客、newsletter、社媒和内容运营需要持续产出的团队或个人。',
          en: 'A better fit for teams or solo operators with recurring blogs, newsletters, social posts, or content ops.',
        },
      },
      {
        title: { cn: '想缩短起稿时间的人', en: 'People who want to shorten time-to-first-draft' },
        description: {
          cn: '如果你最痛的是“迟迟写不出来第一版”，写作工具的价值会很直接。',
          en: 'These tools are strongest when the main bottleneck is getting to a usable first draft fast.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想问答和聊天的人', en: 'People who mostly want chat and Q&A' },
        description: {
          cn: '如果重点不是内容产出，而是问答协助，聊天类工具通常更合适。',
          en: 'If the core need is Q&A rather than content output, chatbot tools are often a better fit.',
        },
      },
      {
        title: { cn: '只需要偶尔润色一句话的人', en: 'People doing only light cleanup' },
        description: {
          cn: '如果只是偶尔改改句子，很多轻量免费工具就够了。',
          en: 'For occasional sentence cleanup, lighter free tools may be more than enough.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-writing-tools',
        title: { cn: '先看写作榜单', en: 'Start with the writing ranking' },
        description: {
          cn: '如果你已经确认是写作场景，先用榜单缩小 shortlist。',
          en: 'If writing is clearly the lane, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-writing-tools',
        title: { cn: '回到写作指南', en: 'Return to the writing guide' },
        description: {
          cn: '先回到更高层判断，再重新看候选。',
          en: 'Step back to the broader guide, then re-review candidates.',
        },
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 对比', en: 'Go to SEO comparison' },
        description: {
          cn: '如果你的写作核心是搜索流量和内容规划，这条更高意图。',
          en: 'A better fit when search traffic and content planning are the real priorities.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你卡在资料整理、事实核对和主题理解，这条更贴近。',
          en: 'A tighter path when the real bottleneck is discovery, fact-checking, and topic understanding.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-writing-tools',
        title: { cn: '先看写作榜单页', en: 'Start with the writing ranking' },
        description: {
          cn: '如果你想先看更强的 shortlist，再回来细比，就先走榜单页。',
          en: 'Open the ranking page first if you want a tighter shortlist before comparing tools in detail.',
        },
      },
      {
        href: '/guides/ai-writing-tools',
        title: { cn: '回到写作选型指南', en: 'Back to the writing guide' },
        description: {
          cn: '如果你还没确定任务类型，先回到完整写作工作流判断。',
          en: 'Return here if you still need help identifying the right writing workflow first.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Switch to research tools comparison' },
        description: {
          cn: '如果你现在的瓶颈其实在资料整理、事实核对和主题理解，而不是写作本身，这页更合适。',
          en: 'Move there if the real bottleneck is discovery, fact-checking, and topic understanding rather than writing itself.',
        },
      },
      {
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 工具对比', en: 'Switch to SEO tools comparison' },
        description: {
          cn: '如果你发现自己其实在做搜索流量和内容规划，这页会更贴近决策。',
          en: 'Move there if the real decision is about search-driven planning rather than general writing.',
        },
      },
    ],
    toolSelectionNotes: {
      grammarly: {
        bestFor: {
          cn: '更重视改写、润色、语法一致性和日常写作质量的人。',
          en: 'People who care most about rewriting, polish, grammar consistency, and everyday writing quality.',
        },
        whyPickIt: {
          cn: '它更像稳定的编辑层助手，适合融入每天都会发生的写作动作里。',
          en: 'It behaves more like a dependable editing-layer assistant that fits daily writing habits.',
        },
        watchOut: {
          cn: '如果你期待它承担重度长文规划或 SEO 研究，它通常不是最强入口。',
          en: 'It is usually not the strongest entry point when long-form planning or SEO research is the real need.',
        },
      },
      frase: {
        bestFor: {
          cn: '既要内容起稿，又要兼顾搜索意图和主题调研的人。',
          en: 'People who need drafting plus search intent and topic research in the same workflow.',
        },
        whyPickIt: {
          cn: '它把写作和 SEO 连接得更紧，适合内容增长型工作流。',
          en: 'It connects writing and SEO more tightly, which makes it strong for growth-oriented content workflows.',
        },
        watchOut: {
          cn: '如果你只是做轻量社媒文案或简单改写，它可能比你需要的更完整。',
          en: 'It can be more suite-like than necessary for lightweight social copy or simple rewrites.',
        },
      },
      rytr: {
        bestFor: {
          cn: '想快速起稿、试模板、用较低门槛覆盖多种短内容任务的人。',
          en: 'People who want quick drafts, template-driven work, and lower-friction coverage for many short-form tasks.',
        },
        whyPickIt: {
          cn: '上手快、任务切换轻，适合先把内容跑起来。',
          en: 'It is fast to pick up and easy to switch across tasks, which helps get content moving quickly.',
        },
        watchOut: {
          cn: '如果你要求更强的品牌语气控制或更深的长文稳定性，仍然值得继续比较。',
          en: 'You may still want to compare further if brand voice control or long-form stability matters a lot.',
        },
      },
      sudowrite: {
        bestFor: {
          cn: '更偏创意写作、叙事发散和风格探索的人。',
          en: 'People leaning toward creative writing, narrative ideation, and style exploration.',
        },
        whyPickIt: {
          cn: '它的价值更在发散和续写，而不是标准化内容生产。',
          en: 'Its strength is expansion and continuation rather than standardized content production.',
        },
        watchOut: {
          cn: '如果你的目标是稳定产出营销内容或 SEO 页面，它可能不是最直接的选择。',
          en: 'It may not be the most direct pick if the goal is consistent marketing output or SEO pages.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在做博客、营销文案、改写，还是创意写作。',
        '再分清你需要的是编辑层、内容执行层，还是创意发散层工具。',
        '如果你想先试再买，优先看免费版本的限制和输出是否稳定。',
        '长期使用时，更应该看任务适配度，而不是只看一次生成效果。',
      ],
      en: [
        'Separate blogs, marketing copy, rewriting, and creative writing before comparing tools.',
        'Then separate editing-layer tools from execution-layer and creative-ideation tools.',
        'If you want to try before paying, focus on free-tier limits and output stability.',
        'For long-term use, fit to the task matters more than one impressive generation.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看任务匹配度、免费可用性、评分、更新情况和实际使用感。',
          en: 'We compare task fit, free usability, ratings, freshness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看这些写作工具？', en: 'Why only these writing tools?' },
        answer: {
          cn: '因为它们分别覆盖了日常编辑、搜索内容规划、轻量文案和创意写作这几类最常见的写作需求。',
          en: 'Because together they cover common writing jobs like editing, search-led content planning, lightweight copywriting, and creative drafting.',
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
            ? '写作工具对比的重点不是“写得像不像”，而是提纲、改写、语气控制和内容更新是否真的能提升产出。'
            : 'Writing tool comparison should focus less on sounding polished and more on outlines, rewriting, tone control, and whether they actually improve output.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '提纲能力' : 'Outline quality',
            value: locale === 'cn' || locale === 'tw' ? '先看结构是否靠谱' : 'Check whether the structure is solid',
            note:
              locale === 'cn' || locale === 'tw'
                ? '好不好用，往往先体现在能不能搭出可写的骨架。'
                : 'Useful writing tools usually start by producing a usable skeleton.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '改写质量' : 'Rewrite quality',
            value: locale === 'cn' || locale === 'tw' ? '看是否保持原意' : 'Check whether meaning stays intact',
            note:
              locale === 'cn' || locale === 'tw'
                ? '不是改得更长，而是改得更顺。'
                : 'The goal is not making it longer, but making it more usable.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期产出' : 'Long-term output',
            value: locale === 'cn' || locale === 'tw' ? '看它能否持续帮忙' : 'See whether it stays useful over time',
            note:
              locale === 'cn' || locale === 'tw'
                ? '要看更新、价格和真实使用反馈。'
                : 'Freshness, pricing, and real usage feedback matter here.',
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
              ? '这页已按真实写作决策路径重新核对，保留提纲、改写和语气控制入口。'
              : 'This page has been rechecked against a real writing decision path and keeps outline, rewrite, and tone-control entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实写作证据'
              : 'Keep it indexable and add real writing evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用提纲质量、改写记录和真人评论把它和泛写作页区分开。'
              : 'Use outline quality, rewrite notes, and real comments to differentiate it from generic writing pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实写作场景和反馈' : 'Add real writing scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补写作案例、改写样例和真人评论。'
              : 'Next, prioritize writing cases, rewrite examples, and real comments.'}
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
              ? '先看榜单，再决定是继续看写作工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing writing tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果写作已经是确定需求，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If writing is already the clear need, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-writing-tools',
                title: locale === 'cn' || locale === 'tw' ? '写作工具榜单' : 'Writing tools ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先看更高意图候选。'
                    : 'Start with the highest-intent candidates first.',
              },
              {
                href: '/guides/ai-writing-tools',
                title: locale === 'cn' || locale === 'tw' ? '写作指南' : 'Writing guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认起稿、改写还是长文。'
                    : 'Re-check whether the task is drafting, rewriting, or long-form writing.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '内容创作对比' : 'Content creation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '当写作已经要进入内容流程。'
                    : 'Useful when writing is part of a broader content workflow.',
              },
              {
                href: '/guides/ai-seo-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'SEO 工具对比' : 'SEO tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果核心已经变成搜索内容规划。'
                    : 'Better when the real need is search-driven content planning.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`writing_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_writing_tools_comparison' />
    </>
  );
}
