import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? '最佳免费 AI 工具对比' : 'Best free AI tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的免费 AI 工具，帮你更快找出真正值得长期试用的选项。'
      : 'Compare common free AI tools to find the ones worth keeping in your workflow longer.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '免费 AI 工具', en: 'Free AI tools' },
    comparisonLabel: { cn: '最佳免费 AI 工具对比', en: 'Best free AI tools comparison' },
    description: {
      cn: '如果你正在找可以长期试用的免费 AI 工具，这一页会帮你把常见候选放在一起看。',
      en: 'If you are looking for free AI tools you can actually keep using, this page helps you compare the common candidates side by side.',
    },
    searchQuery: 'free',
    guideHref: '/guides/best-free-ai-tools',
    rankingHref: '/guides/best-free-ai-tools',
    rankingLabel: { cn: '回到免费榜单', en: 'Back to the free ranking' },
    backGuideLabel: { cn: '回到免费指南', en: 'Back to the free tools guide' },
    altBrowseHref: '/explore?pricing=free&sort=popular',
    altBrowseLabel: { cn: '浏览更多免费工具', en: 'Browse more free tools' },
    breadcrumbLabel: { cn: '最佳免费 AI 工具对比', en: 'Best free AI tools comparison' },
    compareTitle: { cn: '免费 AI 工具的快速对照', en: 'A quick side-by-side look at free AI tools' },
    compareSubtitle: { cn: '免费工具', en: 'Free tools' },
    preferredToolNames: ['chatgpt', 'gemini', 'claude', 'perplexity', 'poe', 'copilot'],
    decisionCards: [
      {
        title: { cn: '先看是否真免费', en: 'Check if it is truly free' },
        description: {
          cn: '别只看“能注册”，要看免费额度够不够你做完一轮完整工作。',
          en: 'Do not stop at sign-up; check whether the free tier is enough to complete a real workflow.',
        },
      },
      {
        title: { cn: '再看限制和更新', en: 'Then check limits and freshness' },
        description: {
          cn: '免费工具常常变化快，所以更新频率和限制说明特别重要。',
          en: 'Free tools change quickly, so freshness and limit clarity matter a lot.',
        },
      },
      {
        title: { cn: '最后看是否值得留下', en: 'Decide whether to keep it' },
        description: {
          cn: '如果它不能稳定解决你的场景，就把它放回候选池，不必长期占位。',
          en: 'If it cannot reliably solve the job, put it back in the shortlist rather than keeping it forever.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '想先试再付费的人', en: 'People who want to try first' },
        description: {
          cn: '适合先用免费层验证自己的工作流。',
          en: 'A good fit when you want to validate the workflow on a free tier first.',
        },
      },
      {
        title: { cn: '还没决定方向的人', en: 'People still narrowing the use case' },
        description: {
          cn: '适合先粗筛，再进入更窄的比较页。',
          en: 'Useful for broad filtering before moving into narrower comparison pages.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '明确需要商业版的人', en: 'People who already need paid features' },
        description: {
          cn: '如果你知道自己会马上碰到额度或协作限制，直接看付费方案更高效。',
          en: 'If you already know limits or collaboration will matter immediately, compare paid tiers instead.',
        },
      },
      {
        title: { cn: '只想看一个品牌的人', en: 'People who only want one brand' },
        description: {
          cn: '这页的作用是横向比较，不是替你直接做单选。',
          en: 'This page is meant for side-by-side comparison, not a one-brand recommendation.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/free-ai-tools',
        title: { cn: '回到免费工具指南', en: 'Back to the free tools guide' },
        description: {
          cn: '先把判断标准再过一遍，再决定要不要继续试。',
          en: 'Revisit the judging criteria before deciding what to try next.',
        },
      },
      {
        href: '/explore?pricing=free&sort=popular',
        title: { cn: '浏览免费工具', en: 'Browse free tools' },
        description: {
          cn: '继续扩大免费候选列表。',
          en: 'Keep expanding the free shortlist.',
        },
      },
      {
        href: '/guides/best-free-ai-tools',
        title: { cn: '回到免费榜单', en: 'Back to the free ranking' },
        description: {
          cn: '再看一次榜单顺序和高意图条目。',
          en: 'Review the ranking order and top candidates again.',
        },
      },
    ],
    tips: {
      cn: [
        '先看免费层能不能支撑你的一次完整任务。',
        '把免费额度、更新频率和导出能力放在前面看。',
        '如果同类工具很多，先选更新更近、评价更稳的。',
      ],
      en: [
        'First check whether the free tier can support a complete task.',
        'Put limits, freshness, and export options near the top of your checklist.',
        'If there are many similar tools, start with the ones that are fresher and better reviewed.',
      ],
    },
    faqs: [
      {
        question: { cn: '免费工具对比最重要什么？', en: 'What matters most in free tool comparison?' },
        answer: {
          cn: '最重要的是免费层是否真的能完成你的工作，而不是只能打开首页。',
          en: 'The key question is whether the free tier can actually complete your job, not just open the homepage.',
        },
      },
      {
        question: { cn: '为什么这页还要看更新和评论？', en: 'Why include freshness and comments?' },
        answer: {
          cn: '因为免费产品变化很快，更新和评论能帮助你判断它是不是还值得继续试。',
          en: 'Free products change quickly, and freshness plus real comments help you decide whether to keep trying them.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='best_free_ai_tools_comparison' />
    </>
  );
}
