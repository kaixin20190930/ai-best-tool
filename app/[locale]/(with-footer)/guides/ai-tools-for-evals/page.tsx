import { Metadata } from 'next';
import { ClipboardCheck, Layers3, Scale } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? 'AI Evals 工具推荐 | AI Best Tool' : `AI tools for evals | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向输出质量验证、结果评估、评分体系和验收流程的 AI 工具选型指南。'
        : 'A practical guide to AI tools for output evaluation, quality validation, scoring systems, and acceptance workflows.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);

  const siteUrl = BASE_URL;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? 'Evals 工具' : 'Evals tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-evals`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? 'Evals 工具最适合做什么？' : 'What are evals tools best for?',
      answer: isChinese
        ? '适合做输出质量评分、验收标准检查、数据集验证、模型或工作流版本对比。'
        : 'They are best for output quality scoring, acceptance checks, dataset validation, and comparing model or workflow versions.',
    },
    {
      question: isChinese ? '它和 prompt 测试有什么区别？' : 'How is this different from prompt testing?',
      answer: isChinese
        ? 'Prompt 测试更偏提示词本身，evals 更偏结果层面的标准化判断和验收。'
        : 'Prompt testing leans more toward prompts themselves, while evals are more about standardized judgment and acceptance at the output level.',
    },
    {
      question: isChinese ? '我先看什么维度？' : 'What should I check first?',
      answer: isChinese
        ? '先看评分方式、数据集支持、结果复盘和是否方便接进你的发布流程。'
        : 'Start with scoring style, dataset support, result review, and how easily the tool fits your release process.',
    },
    {
      question: isChinese ? '适合小团队吗？' : 'Does this matter for small teams?',
      answer: isChinese
        ? '适合，尤其当你开始反复上线 AI 功能，需要明确“变好了还是变差了”的时候。'
        : 'Yes, especially once you ship AI features repeatedly and need a clear way to judge whether things got better or worse.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要的是验收打分、数据集评估，还是版本回归判断。',
        '看它能不能把输出、评分标准和样本绑定到一起复盘。',
        '如果会进入团队流程，优先看共享、验收和接入 CI / 发布流程的便利性。',
      ]
    : [
        'Separate acceptance scoring, dataset evaluation, and regression judgment before comparing tools.',
        'Look for tools that bind outputs, scoring rules, and samples together for review.',
        'If the work feeds team process, prioritize sharing, signoff, and fit with CI or release flow.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? 'Evals 工具推荐' : 'Evals tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Scale className='size-4' />
              {isChinese ? '评分与验收优先' : 'Scoring and acceptance first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Evals 工具推荐：从输出评分到上线验收，怎么选更合适'
              : 'AI tools for evals: how to choose for output scoring and release acceptance'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'Evals 工具真正要解决的，不是“能不能看一堆样本”，而是能不能把质量标准、样本结果和版本变化连起来，变成稳定判断。'
              : 'Evals tools are not mainly about browsing samples. The real job is connecting quality standards, sample results, and version changes into a stable decision process.'}
          </p>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看评估标准，再看接入流程' : 'Start with evaluation logic, then workflow fit'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <ClipboardCheck className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'Evals 工具通常会落在这些分类里' : 'Evals tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['developer-tools', 'research', 'automation'].includes(String(category.slug)))
                .slice(0, 6)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                  >
                    <span>{getLocalizedField(category.name, locale)}</span>
                    <span className='text-xs text-slate-500'>
                      {'toolCount' in category && typeof category.toolCount === 'number' ? category.toolCount : ''}
                    </span>
                  </Link>
                ))}
            </div>
          </aside>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={
            isChinese
              ? '更贴近结果评估与上线验收的入口'
              : 'Real entry points for output evaluation and release acceptance'
          }
          description={
            isChinese
              ? '如果你关心的是输出评分、数据集验证和上线验收，这几款工具会比泛开发者页更快进入核心问题。'
              : 'If output scoring, dataset validation, and release acceptance matter most, these tools get to the core problem faster than a broad developer page.'
          }
          toolNames={['langfuse', 'langsmith', 'helicone', 'portkey']}
        />
      </div>
    </>
  );
}
