import Link from 'next/link';
import { notFound } from 'next/navigation';

import ExploreList from '@/app/[locale]/(with-footer)/explore/ExploreList';
import {
  getAllCategories,
  getCategoryBySlug,
  getLocalizedField,
} from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

export interface CategoryContentProps {
  params: { locale: string; slug: string };
  pageNum?: string;
  searchParams?: {
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
}

export default async function CategoryContent({
  params,
  pageNum,
  searchParams,
}: CategoryContentProps) {
  const [category, categories, tags] = await Promise.all([
    getCategoryBySlug(params.slug, true),
    getAllCategories(true),
    getAllTags('count'),
  ]);

  if (!category) {
    notFound();
  }

  const categoryName = getLocalizedField(category.name, params.locale);
  const categoryDescription =
    getLocalizedField(category.description, params.locale) ||
    `Browse the latest and most useful ${categoryName} AI tools.`;
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const helperBullets = isChinese
    ? [
        `先看工具是否真正适合 ${categoryName} 的工作流，而不只是“看起来很强”。`,
        '优先看是否有真实截图、定价说明和最近更新。',
        '如果你是开发者，可以先提交到目录，再观察用户反馈。',
      ]
    : [
        `Check whether the tool truly fits the ${categoryName} workflow, not just whether it looks impressive.`,
        'Prefer tools with real screenshots, clear pricing, and recent updates.',
        'If you are a developer, submit first and use feedback to refine positioning.',
      ];
  const faqs = [
    {
      question: isChinese
        ? `这个 ${categoryName} 分类页适合什么人？`
        : `Who is this ${categoryName} category page for?`,
      answer: isChinese
        ? `如果你正在寻找 ${categoryName} 相关工具，或者想快速比较多个选项，这一页会帮你从最新、热门和筛选条件里快速缩小范围。`
        : `If you are looking for ${categoryName} tools or want to compare options quickly, this page helps you narrow the list by freshness, popularity, and filters.`,
    },
    {
      question: isChinese
        ? `我应该怎么选 ${categoryName} 工具？`
        : `How should I choose a ${categoryName} tool?`,
      answer: isChinese
        ? '先看它是否解决你的核心场景，再看价格、更新频率、截图和真实评论。能直接试用的工具通常更容易判断是否适合你。'
        : 'Start with the core use case, then check pricing, update frequency, screenshots, and real comments. Tools you can try quickly are easier to evaluate.',
    },
    {
      question: isChinese
        ? `免费工具和付费工具有什么区别？`
        : `What is the difference between free and paid tools?`,
      answer: isChinese
        ? '免费工具更适合入门和低成本尝试；付费工具通常在稳定性、限制、支持或功能深度上更完整。'
        : 'Free tools are great for getting started and testing low cost. Paid tools usually offer more stability, fewer limits, stronger support, or deeper features.',
    },
    {
      question: isChinese
        ? `我可以提交自己的 ${categoryName} 工具吗？`
        : `Can I submit my own ${categoryName} tool?`,
      answer: isChinese
        ? '可以，直接提交到目录。你也可以在提交页里补充截图、定价和一句清晰的能力描述，帮助审核更快完成。'
        : 'Yes, you can submit it to the directory. Add screenshots, pricing, and a clear one-line capability summary to help reviews move faster.',
    },
  ];
  const basePath = `/categories/${category.slug}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${params.locale}` },
    { name: 'Explore', url: `${siteUrl}/${params.locale}/explore` },
    {
      name: categoryName,
      url: `${siteUrl}/${params.locale}/categories/${category.slug}`,
    },
  ]);
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className="theme-page container mx-auto px-4 py-8">
        <div className="theme-surface mb-8 rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
                {isChinese ? '按场景浏览' : 'Browse by use case'}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
                {isChinese ? `Best ${categoryName} AI 工具` : `Best ${categoryName} AI tools`}
              </h1>
              <p className="mt-3 text-slate-600">{categoryDescription}</p>
              {'toolCount' in category && (
                <p className="mt-4 text-sm font-medium text-slate-500">
                  {category.toolCount} {isChinese ? '个已发布工具' : 'published tools'}
                </p>
              )}
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              {isChinese ? '提交这个分类的工具' : 'Submit a tool'}
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              {isChinese ? '选择建议' : 'How to choose'}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {isChinese ? `${categoryName} 工具先看什么` : `What to look for in ${categoryName} tools`}
            </h2>
            <div className="mt-4 space-y-3">
              {helperBullets.map((bullet) => (
                <div key={bullet} className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {bullet}
                </div>
              ))}
            </div>
          </section>

          <section className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {isChinese ? '这个分类页最常见的问题' : 'Common questions about this category'}
            </h2>
            <div className="mt-4 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <ExploreList
          locale={params.locale}
          searchParams={searchParams}
          pageNum={pageNum}
          categories={categories}
          tags={tags}
          forcedCategorySlug={category.slug}
          basePath={basePath}
        />
      </div>
    </>
  );
}
