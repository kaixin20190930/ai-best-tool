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
        href: '/guides/ai-seo-tools-comparison',
        title: { cn: '转去 SEO 工具对比', en: 'Switch to SEO tools comparison' },
        description: {
          cn: '如果你发现自己其实在做搜索流量和内容规划，这页会更贴近决策。',
          en: 'Move there if the real decision is about search-driven planning rather than general writing.',
        },
      },
      {
        href: '/explore?search=writing&sort=popular',
        title: { cn: '继续看更多写作工具', en: 'See more writing candidates' },
        description: {
          cn: '当你已经知道方向，只需要扩大候选列表时，直接去 Explore。',
          en: 'Go straight to Explore once you know the lane and just need more real candidates.',
        },
      },
    ],
    tips: {
      cn: [
        '先分清你是在做博客、营销文案、改写，还是创意写作。',
        '如果你想先试再买，优先看免费版本的限制和输出是否稳定。',
        '长期使用时，更应该看任务适配度，而不是只看一次生成效果。',
      ],
      en: [
        'Separate blogs, marketing copy, rewriting, and creative writing before comparing tools.',
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
