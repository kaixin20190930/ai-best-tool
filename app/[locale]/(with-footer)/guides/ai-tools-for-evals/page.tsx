import { Metadata } from 'next';
import { ClipboardCheck, ExternalLink, Layers3, Scale } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
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
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-evals-tools',
      title: isChinese ? '先看 evals 榜单' : 'Start with evals ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-evals-comparison',
      title: isChinese ? 'Evals 对比页' : 'Evals comparison',
      desc: isChinese
        ? '评分、数据集和验收流程一起看。'
        : 'Compare scoring, datasets, and acceptance workflows together.',
    },
    {
      href: '/guides/ai-tools-for-prompt-testing-comparison',
      title: isChinese ? 'Prompt 测试对比' : 'Prompt testing comparison',
      desc: isChinese
        ? '如果你更关注提示词版本和 A/B 对比。'
        : 'Useful when prompt versions and A/B comparisons matter more.',
    },
    {
      href: '/guides/ai-tools-for-api-observability-comparison',
      title: isChinese ? 'API 可观测对比' : 'API observability comparison',
      desc: isChinese
        ? '如果你要把质量和线上请求一起看。'
        : 'Use this when quality and production requests belong together.',
    },
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

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=eval&sort=popular'
              ctaId='evals_guide_browse_tools'
              ctaLabel='Evals guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 evals 工具' : 'Browse evals tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers'
              ctaId='evals_guide_developers'
              ctaLabel='Evals guide developers'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到开发者指南' : 'Back to developer guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-evals-comparison'
              ctaId='evals_guide_comparison'
              ctaLabel='Evals guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看 evals 对比页' : 'Evals comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-evals-tools'
              ctaId='evals_guide_top_list'
              ctaLabel='Evals guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 evals 榜单' : 'Open evals ranking'}
            </TrackableCtaLink>
          </div>
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

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助用户完成真实 evals 判断：是否有明确评分标准、数据集、验收门槛、版本回归路径，以及是否能继续进入对比页或榜单页。'
              : 'This page prioritizes whether the guide helps with a real evals decision: clear scoring rules, datasets, acceptance thresholds, regression paths, and next steps into comparison or ranking pages.'
          }
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '评分标准、数据集、验收、回归' : 'Scoring, datasets, acceptance, regression',
              note: isChinese
                ? '不只看工具功能，而是看它能否把结果质量变成可重复判断。'
                : 'We focus on whether the tool turns output quality into a repeatable decision.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心指南保留索引' : 'Core guide kept indexable',
              note: isChinese
                ? '薄内容或重复内容避免抢占同类页面的抓取预算。'
                : 'Thin or repetitive content should not compete for crawl budget with stronger pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实样本与复盘' : 'Add real samples and retros',
              note: isChinese
                ? '后续优先补评估样本、评分模板、验收清单和复盘笔记。'
                : 'Next, priority additions are evaluation samples, scoring templates, acceptance checklists, and retrospective notes.',
            },
          ]}
        />

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到 evals 页' : 'Compare first, then come back to evals pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要做的是输出评分、数据集验证或上线验收，就直接去更窄的榜单和对比页。'
              : 'If the real job is output scoring, dataset validation, or release acceptance, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`evals_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
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
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? 'Evals 意图更强的下一步入口' : 'Next paths for stronger evals intent'}
          compareDescription={
            isChinese
              ? '当你已经明确自己在找结果评估工具，而不是泛调试或 prompt 对比工具，继续进入更窄的比较页会更有效。'
              : 'Once the real job is output evaluation rather than broad debugging or prompt comparison, narrower comparison pages work better.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-evals-comparison',
              title: isChinese ? 'Evals 工具对比' : 'Evals comparison',
              description: isChinese
                ? '适合直接横向看评分、数据集和验收流程。'
                : 'A direct side-by-side path for scoring, datasets, and acceptance workflows.',
            },
            {
              href: '/best-ai-tools/ai-evals-tools',
              title: isChinese ? 'Evals 榜单' : 'Evals ranking',
              description: isChinese
                ? '适合已经确认方向、只想快速缩小 shortlist 的用户。'
                : 'Useful when the direction is clear and the goal is to narrow the shortlist faster.',
            },
            {
              href: '/guides/ai-tools-for-prompt-testing-comparison',
              title: isChinese ? 'Prompt 测试工具对比' : 'Prompt testing comparison',
              description: isChinese
                ? '如果你发现真正决策点更偏提示词版本和 A/B 对比，这页更合适。'
                : 'More useful if the real decision is shifting toward prompt versions and A/B comparisons.',
            },
            {
              href: '/guides/ai-tools-for-api-observability-comparison',
              title: isChinese ? 'API 可观测工具对比' : 'API observability comparison',
              description: isChinese
                ? '如果你更关心线上请求与质量观察，这页更贴近目标。'
                : 'Move there if the real job is more about production requests and quality visibility.',
            },
          ]}
        />

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 evals shortlist' : 'Use the ranking to narrow your evals shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要比的是输出评分、数据集验证和上线验收，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about output scoring, dataset validation, and release acceptance, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-evals-tools'
              ctaId='evals_guide_ranking_primary'
              ctaLabel='Evals guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入 evals 榜单' : 'Open evals ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-evals-comparison'
              ctaId='evals_guide_ranking_secondary'
              ctaLabel='Evals guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '继续看对比页' : 'Continue to comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_evals' />
      </div>
    </>
  );
}
