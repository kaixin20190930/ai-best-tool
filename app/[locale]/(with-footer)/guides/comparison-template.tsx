import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Columns3, ExternalLink, Sparkles } from 'lucide-react';
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

function getRatingDisplay(averageRating: number, isChinese: boolean): string {
  if (averageRating) {
    return `${averageRating.toFixed(1)}★`;
  }

  return isChinese ? '暂无' : 'N/A';
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
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? config.breadcrumbLabel.cn : config.breadcrumbLabel.en,
      url: `${siteUrl}/${locale}${config.guideHref}`,
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
  const fallbackList = searchList.length > 0 ? searchList : popularTools;
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
    };
  });

  const itemListSchema = generateItemListSchema(
    tools.map((tool) => ({
      name: tool.title,
      url: `${siteUrl}/${locale}/ai/${tool.name}`,
    })),
    isChinese ? `${config.comparisonLabel.cn} comparison` : `${config.comparisonLabel.en} comparison`,
  );

  const tips = isChinese ? config.tips.cn : config.tips.en;
  const decisionCards = (config.decisionCards || []).map((card) => ({
    title: isChinese ? card.title.cn : card.title.en,
    description: isChinese ? card.description.cn : card.description.en,
  }));
  const fitFor = (config.fitFor || []).map((item) => ({
    title: isChinese ? item.title.cn : item.title.en,
    description: isChinese ? item.description.cn : item.description.en,
  }));
  const notFor = (config.notFor || []).map((item) => ({
    title: isChinese ? item.title.cn : item.title.en,
    description: isChinese ? item.description.cn : item.description.en,
  }));
  const nextPaths = (config.nextPaths || []).map((item) => ({
    href: item.href,
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
  fitFor,
  notFor,
  nextPaths,
  categories,
  config,
  locale,
}: Awaited<ReturnType<typeof buildComparisonPageData>> & { locale: string }) {
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
                  </div>
                </div>
              </div>
            ))}
          </div>
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
