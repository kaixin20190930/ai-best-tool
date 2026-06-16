import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Clock3, Columns3, ExternalLink, Globe2, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema, generateItemListSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { toolToListRow } from '@/lib/services/toolPresenter';
import { getPopularTools, getToolByNameCached, getTools, type Tool } from '@/lib/services/tools';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

type ComparisonConfig = {
  categoryLabel: {
    cn: string;
    en: string;
  };
  comparisonLabel: {
    cn: string;
    en: string;
  };
  description: {
    cn: string;
    en: string;
  };
  searchQuery: string;
  guideHref: string;
  backGuideLabel: {
    cn: string;
    en: string;
  };
  altBrowseHref: string;
  altBrowseLabel: {
    cn: string;
    en: string;
  };
  breadcrumbLabel: {
    cn: string;
    en: string;
  };
  compareTitle: {
    cn: string;
    en: string;
  };
  compareSubtitle: {
    cn: string;
    en: string;
  };
  decisionCards?: {
    title: {
      cn: string;
      en: string;
    };
    description: {
      cn: string;
      en: string;
    };
  }[];
  comparisonDimensions?: {
    title: {
      cn: string;
      en: string;
    };
    description: {
      cn: string;
      en: string;
    };
  }[];
  fitFor?: {
    title: {
      cn: string;
      en: string;
    };
    description: {
      cn: string;
      en: string;
    };
  }[];
  notFor?: {
    title: {
      cn: string;
      en: string;
    };
    description: {
      cn: string;
      en: string;
    };
  }[];
  nextPaths?: {
    href: string;
    title: {
      cn: string;
      en: string;
    };
    description: {
      cn: string;
      en: string;
    };
  }[];
  preferredToolNames?: string[];
  allowPopularFallback?: boolean;
  toolSelectionNotes?: Record<
    string,
    {
      bestFor: {
        cn: string;
        en: string;
      };
      whyPickIt: {
        cn: string;
        en: string;
      };
      watchOut: {
        cn: string;
        en: string;
      };
    }
  >;
  tips: {
    cn: string[];
    en: string[];
  };
  faqs: {
    question: {
      cn: string;
      en: string;
    };
    answer: {
      cn: string;
      en: string;
    };
  }[];
};

type ComparisonTool = ReturnType<typeof toolToListRow> & {
  rank: number;
  pricing: Tool['pricing'];
  categoryLabel: string;
  averageRating: number;
  ratingCount: number;
  summary: string;
  selectionNote?: {
    bestFor: string;
    whyPickIt: string;
    watchOut: string;
  };
};

function getPricingLabel(pricing: Tool['pricing'], isChinese: boolean): string {
  if (pricing === 'free') {
    return isChinese ? '免费' : 'Free';
  }

  if (pricing === 'freemium') {
    return isChinese ? '免费增值' : 'Freemium';
  }

  return isChinese ? '付费' : 'Paid';
}

function getRatingDisplay(averageRating: unknown, isChinese: boolean): string {
  let normalizedRating = NaN;

  if (typeof averageRating === 'number') {
    normalizedRating = averageRating;
  } else if (typeof averageRating === 'string') {
    normalizedRating = Number(averageRating);
  }

  if (Number.isFinite(normalizedRating) && normalizedRating > 0) {
    return `${normalizedRating.toFixed(1)}★`;
  }

  return isChinese ? '暂无' : 'N/A';
}

function formatUpdatedAt(updatedAt?: string): string {
  if (!updatedAt) return '';

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return '';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function buildDefaultDecisionCards(comparisonLabel: { cn: string; en: string }) {
  return [
    {
      title: {
        cn: '先看场景',
        en: 'Start with the workflow',
      },
      description: {
        cn: `${comparisonLabel.cn} 不只是比功能，更要看它是否真的贴合你的工作流。`,
        en: `${comparisonLabel.en} is not just about features; it is about whether the tool fits the job you actually need to do.`,
      },
    },
    {
      title: {
        cn: '再看限制',
        en: 'Check the limits',
      },
      description: {
        cn: '免费额度、使用限制、集成成本和学习曲线，通常比“宣传功能”更能决定你最后会不会继续用。',
        en: 'Free-tier limits, usage caps, integration cost, and learning curve usually matter more than marketing claims.',
      },
    },
    {
      title: {
        cn: '最后看可信度',
        en: 'Confirm trust signals',
      },
      description: {
        cn: '定价、更新频率、截图和真实反馈会帮助你判断这款工具是不是值得继续比较。',
        en: 'Pricing, freshness, screenshots, and real feedback tell you whether it is worth more of your time.',
      },
    },
  ];
}

function buildDefaultComparisonDimensions() {
  return [
    {
      title: {
        cn: '任务适配度',
        en: 'Task fit',
      },
      description: {
        cn: '这款工具到底是不是为你的核心工作流设计的。',
        en: 'Whether the tool was built for your core workflow or only looks adjacent.',
      },
    },
    {
      title: {
        cn: '定价门槛',
        en: 'Pricing threshold',
      },
      description: {
        cn: '免费能不能试出价值，付费后提升是否足够明确。',
        en: 'Whether the free tier is enough to validate value and whether paid tiers are clearly better.',
      },
    },
    {
      title: {
        cn: '更新与稳定性',
        en: 'Freshness and stability',
      },
      description: {
        cn: '最近更新、官网状态和是否还在维护，都会影响长期可用性。',
        en: 'Recent updates, official site status, and active maintenance all affect long-term usability.',
      },
    },
    {
      title: {
        cn: '真实反馈',
        en: 'Real-world feedback',
      },
      description: {
        cn: '评论、评分和收藏信号会告诉你它是否真的被人持续使用。',
        en: 'Reviews, ratings, and saves reveal whether people actually keep using it.',
      },
    },
  ];
}

function buildDefaultFitFor() {
  return [
    {
      title: {
        cn: '需求明确的人',
        en: 'People with a clear job to do',
      },
      description: {
        cn: '已经知道自己要解决什么问题，想快速收敛到最合适的工具。',
        en: 'People who already know the job they need to solve and want to narrow the shortlist quickly.',
      },
    },
    {
      title: {
        cn: '愿意对比的人',
        en: 'People willing to compare',
      },
      description: {
        cn: '愿意先看几项关键维度，再决定要不要试用或付费。',
        en: 'People who are willing to compare a few decision points before trying or paying.',
      },
    },
  ];
}

function buildDefaultNotFor() {
  return [
    {
      title: {
        cn: '只是随便看看的人',
        en: 'People just browsing',
      },
      description: {
        cn: '如果你还没确定自己的核心场景，先回到总指南会更高效。',
        en: 'If your use case is still fuzzy, start from the broader guide first.',
      },
    },
    {
      title: {
        cn: '只看宣传卖点的人',
        en: 'People chasing marketing claims',
      },
      description: {
        cn: '单看宣传页很容易误判，最好结合截图、评论和定价一起判断。',
        en: 'Marketing copy alone is misleading; check screenshots, reviews, and pricing too.',
      },
    },
  ];
}

export async function buildComparisonMetadata(locale: string, title: string, description: string): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw' ? `${title} | AI Best Tool` : `${title} | ${t('title')}`,
    description,
    ...getNoindexMetadata(),
  };
}

export async function buildComparisonPageData(locale: string, config: ComparisonConfig) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const comparisonPath = config.guideHref.endsWith('-comparison') ? config.guideHref : `${config.guideHref}-comparison`;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? config.breadcrumbLabel.cn : config.breadcrumbLabel.en,
      url: `${siteUrl}/${locale}${comparisonPath}`,
    },
  ]);

  const faqSchema = generateFAQSchema(
    config.faqs.map((faq) => ({
      question: isChinese ? faq.question.cn : faq.question.en,
      answer: isChinese ? faq.answer.cn : faq.answer.en,
    })),
  );

  const [preferredTools, queryResult, popularTools] = await Promise.all([
    config.preferredToolNames?.length
      ? Promise.all(config.preferredToolNames.map((toolName) => getToolByNameCached(toolName).catch(() => null)))
      : Promise.resolve([]),
    getTools({ search: config.searchQuery, status: 'published' }, { page: 1, pageSize: 4 }, 'popular').catch(
      () => null,
    ),
    getPopularTools(4).catch(() => []),
  ]);

  const preferredList = preferredTools.filter((tool): tool is Tool => Boolean(tool));
  const searchList = queryResult?.data || [];
  let fallbackList = searchList;
  if (fallbackList.length === 0) {
    fallbackList = config.allowPopularFallback === false ? [] : popularTools;
  }
  const mergedTools = [...preferredList, ...fallbackList].reduce<Tool[]>((acc, tool) => {
    if (!acc.some((item) => item.id === tool.id)) {
      acc.push(tool);
    }
    return acc;
  }, []);
  const sourceTools = mergedTools.slice(0, 4);
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const tools: ComparisonTool[] = sourceTools.map((tool, index) => {
    const row = toolToListRow(tool, locale);
    let selectionNote: ComparisonTool['selectionNote'] | undefined;
    const noteSource = config.toolSelectionNotes?.[tool.name];
    if (noteSource) {
      selectionNote = {
        bestFor: isChinese ? noteSource.bestFor.cn : noteSource.bestFor.en,
        whyPickIt: isChinese ? noteSource.whyPickIt.cn : noteSource.whyPickIt.en,
        watchOut: isChinese ? noteSource.watchOut.cn : noteSource.watchOut.en,
      };
    }

    return {
      ...row,
      rank: index + 1,
      pricing: tool.pricing,
      categoryLabel:
        tool.categoryId && categoryMap.has(tool.categoryId)
          ? getLocalizedField(categoryMap.get(tool.categoryId)!.name, locale)
          : '',
      averageRating: tool.averageRating,
      ratingCount: tool.ratingCount,
      summary: row.content,
      selectionNote,
    };
  });

  const itemListSchema = generateItemListSchema(
    tools.map((tool) => ({
      name: tool.title,
      url: `${siteUrl}/${locale}/ai/${tool.name}`,
    })),
    isChinese ? `${config.comparisonLabel.cn} comparison` : `${config.comparisonLabel.en} comparison`,
  );

  const tipSource = isChinese ? config.tips.cn : config.tips.en;
  const tips = tipSource.length > 0 ? tipSource : [];
  const decisionCardsSource =
    config.decisionCards && config.decisionCards.length > 0
      ? config.decisionCards
      : buildDefaultDecisionCards(config.comparisonLabel);
  const decisionCards = decisionCardsSource.map((card) => ({
    title: isChinese ? card.title.cn : card.title.en,
    description: isChinese ? card.description.cn : card.description.en,
  }));
  const fitForSource = config.fitFor && config.fitFor.length > 0 ? config.fitFor : buildDefaultFitFor();
  const fitFor = fitForSource.map((item) => ({
    title: isChinese ? item.title.cn : item.title.en,
    description: isChinese ? item.description.cn : item.description.en,
  }));
  const notForSource = config.notFor && config.notFor.length > 0 ? config.notFor : buildDefaultNotFor();
  const notFor = notForSource.map((item) => ({
    title: isChinese ? item.title.cn : item.title.en,
    description: isChinese ? item.description.cn : item.description.en,
  }));
  const nextPaths = (config.nextPaths || []).map((item) => ({
    href: item.href,
    title: isChinese ? item.title.cn : item.title.en,
    description: isChinese ? item.description.cn : item.description.en,
  }));
  const comparisonDimensionsSource =
    config.comparisonDimensions && config.comparisonDimensions.length > 0
      ? config.comparisonDimensions
      : buildDefaultComparisonDimensions();
  const comparisonDimensions = comparisonDimensionsSource.map((item) => ({
    title: isChinese ? item.title.cn : item.title.en,
    description: isChinese ? item.description.cn : item.description.en,
  }));

  return {
    isChinese,
    siteUrl,
    breadcrumbSchema,
    faqSchema,
    itemListSchema,
    tools,
    tips,
    decisionCards,
    comparisonDimensions,
    fitFor,
    notFor,
    nextPaths,
    categories,
    config,
  };
}

export function ComparisonPage({
  isChinese,
  breadcrumbSchema,
  faqSchema,
  itemListSchema,
  tools,
  tips,
  decisionCards,
  comparisonDimensions,
  fitFor,
  notFor,
  nextPaths,
  categories,
  config,
  locale,
}: Awaited<ReturnType<typeof buildComparisonPageData>> & { locale: string }) {
  const firstTool = tools[0] || null;
  const firstToolHref = firstTool ? `/ai/${firstTool.name}` : config.guideHref;
  let firstToolDescription = '';
  if (isChinese) {
    firstToolDescription = firstTool
      ? `直接看 ${firstTool.title} 的页面，确认截图、定价和反馈。`
      : '没有可直接打开的条目时，先返回指南页继续。';
  } else {
    firstToolDescription = firstTool
      ? `Open ${firstTool.title} to check screenshots, pricing, and feedback.`
      : 'If no tool is ready yet, go back to the guide first.';
  }

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <StructuredDataServer data={itemListSchema} />

      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Columns3 className='size-4' />
              {isChinese ? config.comparisonLabel.cn : config.comparisonLabel.en}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '快速对照' : 'Quick compare'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? config.comparisonLabel.cn : config.comparisonLabel.en}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese ? config.description.cn : config.description.en}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href={config.guideHref}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? config.backGuideLabel.cn : config.backGuideLabel.en}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href={config.altBrowseHref}
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? config.altBrowseLabel.cn : config.altBrowseLabel.en}
              <ArrowRight className='size-4' />
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '直接进入对比' : 'Jump into comparison'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '如果你已经知道要比什么，就直接走下一步'
              : 'If you already know what to compare, go straight to the next step'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href={config.guideHref}
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '回到指南' : 'Back to guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还想先看完整选型逻辑，就先回这页。'
                  : 'Go back here if you still want the broader selection logic.'}
              </p>
            </Link>
            <Link
              href={config.altBrowseHref}
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '继续浏览工具' : 'Browse more tools'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你想先扩大 shortlist，再回来比较，就从这里继续。'
                  : 'Widen the shortlist first, then return when you are ready.'}
              </p>
            </Link>
            <Link
              href={nextPaths[0]?.href || config.guideHref}
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {nextPaths[0]?.title || (isChinese ? '下一个入口' : 'Next entry point')}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {nextPaths[0]?.description ||
                  (isChinese
                    ? '如果你已经确定下一步方向，就直接去更窄的入口。'
                    : 'If the next direction is clear, move into the narrower path.')}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '把比较页接到更具体的决策路径' : 'Move this comparison into a more specific decision path'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <Link
              href={config.guideHref}
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '回到指南页' : 'Back to the guide'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你还想先看完整选型逻辑，就先回上一级。'
                      : 'Go back one level if you want the broader selection logic first.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>

            <Link
              href={config.altBrowseHref}
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '扩大 shortlist' : 'Expand the shortlist'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先多看几个同类工具，再回来对照关键维度。'
                      : 'Browse a few more related tools, then come back and compare the key points.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>

            <Link
              href={firstToolHref}
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '打开一个工具详情' : 'Open a tool detail'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{firstToolDescription}</p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '比较顺序' : 'How to compare'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看场景，再看免费限制' : 'Start with the use case, then the free-tier limits'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '可直接进入' : 'Quick links'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '相关入口' : 'Related entry points'}
            </h2>
            <div className='mt-4 grid gap-2'>
              <Link
                href='/guides'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '指南总览' : 'Guides hub'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
              <Link
                href='/guides/best-free-ai-tools'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '最佳免费 AI 工具' : 'Best free AI tools'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
            </div>
          </aside>
        </section>

        {(decisionCards.length > 0 || fitFor.length > 0 || notFor.length > 0) && (
          <section className='mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]'>
            <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '按场景做决定' : 'Decide by workflow'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '不是看谁最火，而是看谁最贴你的任务' : 'The best tool is the one that matches the job'}
              </h2>
              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                {decisionCards.map((card) => (
                  <div key={card.title} className='rounded-xl bg-slate-50 p-4'>
                    <p className='text-sm font-semibold text-slate-950'>{card.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='grid gap-4'>
              {fitFor.length > 0 && (
                <div className='rounded-[18px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm'>
                  <p className='text-sm font-semibold uppercase tracking-wide text-emerald-700'>
                    {isChinese ? '更适合谁' : 'Best for'}
                  </p>
                  <div className='mt-4 space-y-3'>
                    {fitFor.map((item) => (
                      <div key={item.title} className='rounded-lg bg-white/80 p-4'>
                        <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                        <p className='mt-1 text-sm leading-6 text-slate-600'>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notFor.length > 0 && (
                <div className='rounded-[18px] border border-amber-200 bg-amber-50/60 p-6 shadow-sm'>
                  <p className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
                    {isChinese ? '不太适合谁' : 'Probably not for'}
                  </p>
                  <div className='mt-4 space-y-3'>
                    {notFor.map((item) => (
                      <div key={item.title} className='rounded-lg bg-white/80 p-4'>
                        <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                        <p className='mt-1 text-sm leading-6 text-slate-600'>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {comparisonDimensions.length > 0 && (
          <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看比较维度' : 'Comparison dimensions'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '选工具时先盯住这几个关键点' : 'Watch these decision points first'}
            </h2>
            <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {comparisonDimensions.map((item) => (
                <div key={item.title} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '对比列表' : 'Comparison list'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? config.compareTitle.cn : config.compareTitle.en}
              </h2>
            </div>
            <p className='text-sm text-slate-500'>{isChinese ? `${tools.length} 个工具` : `${tools.length} tools`}</p>
          </div>

          {tools.length > 0 ? (
            <div className='grid gap-4'>
              {tools.map((tool) => (
                <div key={tool.id} className='rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm'>
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='inline-flex size-8 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700'>
                          {tool.rank}
                        </span>
                        <Link
                          href={`/ai/${tool.name}`}
                          className='text-lg font-semibold text-slate-950 hover:text-cyan-700'
                        >
                          {tool.title}
                        </Link>
                        <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                          {getPricingLabel(tool.pricing, isChinese)}
                        </span>
                      </div>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{tool.summary}</p>

                      <div className='mt-4 flex flex-wrap items-center gap-2 text-xs'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600'>
                          <Globe2 className='size-3.5' />
                          {isChinese ? '官网' : 'Official site'}
                          <a
                            href={tool.url}
                            target='_blank'
                            rel='noreferrer'
                            className='ml-1 inline-flex items-center gap-1 font-semibold text-cyan-700 hover:text-cyan-800'
                          >
                            {new URL(tool.url).hostname.replace(/^www\./, '')}
                            <ExternalLink className='size-3' />
                          </a>
                        </span>
                        {tool.updatedAt ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600'>
                            <Clock3 className='size-3.5' />
                            {isChinese ? '最近更新' : 'Updated'}
                            <span className='font-semibold text-slate-800'>{formatUpdatedAt(tool.updatedAt)}</span>
                          </span>
                        ) : null}
                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700'>
                          {isChinese ? '价格' : 'Pricing'}:
                          <span className='font-semibold'>{getPricingLabel(tool.pricing, isChinese)}</span>
                        </span>
                        {tool.isFeatured ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700'>
                            <Sparkles className='size-3.5' />
                            {isChinese ? '当前展示位' : 'Featured now'}
                          </span>
                        ) : null}
                      </div>

                      {tool.selectionNote ? (
                        <div className='mt-4 grid gap-3 md:grid-cols-3'>
                          <div className='rounded-xl border border-emerald-200 bg-emerald-50/70 p-3'>
                            <div className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
                              {isChinese ? '更适合' : 'Best for'}
                            </div>
                            <div className='mt-1 text-sm leading-6 text-slate-700'>{tool.selectionNote.bestFor}</div>
                          </div>
                          <div className='rounded-xl border border-cyan-200 bg-cyan-50/70 p-3'>
                            <div className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
                              {isChinese ? '为什么会选它' : 'Why pick it'}
                            </div>
                            <div className='mt-1 text-sm leading-6 text-slate-700'>{tool.selectionNote.whyPickIt}</div>
                          </div>
                          <div className='rounded-xl border border-amber-200 bg-amber-50/70 p-3'>
                            <div className='text-xs font-semibold uppercase tracking-wide text-amber-700'>
                              {isChinese ? '要注意' : 'Watch out'}
                            </div>
                            <div className='mt-1 text-sm leading-6 text-slate-700'>{tool.selectionNote.watchOut}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className='grid gap-3 text-sm text-slate-600 lg:w-[320px] lg:grid-cols-2'>
                      <div className='rounded-xl bg-slate-50 p-3'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '评分' : 'Rating'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>
                          {getRatingDisplay(tool.averageRating, isChinese)}
                        </div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '评分数' : 'Reviews'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>{tool.ratingCount || 0}</div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3 lg:col-span-2'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '分类' : 'Category'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>
                          {tool.categoryLabel || (isChinese ? '未分类' : 'Uncategorized')}
                        </div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3 lg:col-span-2'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '官网状态' : 'Website status'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>
                          {(() => {
                            if (tool.url) {
                              return isChinese ? '可访问' : 'Available';
                            }

                            return isChinese ? '缺失' : 'Missing';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-[18px] border border-dashed border-slate-300 bg-slate-50 p-6'>
              <p className='text-base font-semibold text-slate-950'>
                {isChinese ? '这一组工具还在继续补货中' : 'This tool cluster is still being expanded'}
              </p>
              <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当前目录里还没有足够多可直接横向比较的条目。你可以先看上面的决策说明，再进入搜索或相邻的 comparison 页面继续缩小范围。'
                  : 'There are not enough directly comparable listings in this cluster yet. Use the decision guidance above, then continue through search or adjacent comparison pages to narrow the field.'}
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <Link
                  href={config.altBrowseHref}
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
                >
                  {isChinese ? config.altBrowseLabel.cn : config.altBrowseLabel.en}
                  <ArrowRight className='size-4' />
                </Link>
                <Link
                  href={config.guideHref}
                  className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                >
                  {isChinese ? config.backGuideLabel.cn : config.backGuideLabel.en}
                </Link>
              </div>
            </div>
          )}
        </section>

        {nextPaths.length > 0 && (
          <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步怎么走' : 'Where to go next'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '把这页继续接到更窄的决策入口' : 'Move from this comparison into narrower intent paths'}
            </h2>
            <div className='mt-4 grid gap-4 lg:grid-cols-3'>
              {nextPaths.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>{item.title}</p>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{item.description}</p>
                    </div>
                    <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这些分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '可继续深入的分类入口' : 'Further category entry points'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                >
                  <span>{getLocalizedField(category.name, locale)}</span>
                  <span className='text-xs text-slate-500'>
                    {'toolCount' in category && typeof category.toolCount === 'number' ? category.toolCount : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '你可能会问的几个问题' : 'Questions you may ask'}
            </h2>
            <div className='mt-4 space-y-4'>
              {(isChinese
                ? config.faqs.map((faq) => ({ question: faq.question.cn, answer: faq.answer.cn }))
                : config.faqs.map((faq) => ({ question: faq.question.en, answer: faq.answer.en }))
              ).map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
