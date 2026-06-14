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
    nextPaths: [
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

  return ComparisonPage({ ...data, locale });
}
