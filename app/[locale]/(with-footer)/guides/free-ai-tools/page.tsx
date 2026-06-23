import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? '免费 AI 工具怎么选 | AI Best Tool' : `Best free AI tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '帮你挑选真正值得试的免费 AI 工具：先看场景，再看限制、更新和评论。'
        : 'A practical guide to choosing free AI tools: check use case, limits, updates, and comments first.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '免费工具' : 'Free tools', url: `${siteUrl}/${locale}/guides/free-ai-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? '免费 AI 工具是不是都差不多？' : 'Are all free AI tools basically the same?',
      answer: isChinese
        ? '不一样。免费额度、限制、导出能力、更新频率和评论反馈差别都很大。'
        : 'Not really. Free quotas, limits, export options, update frequency, and user feedback can differ a lot.',
    },
    {
      question: isChinese ? '我应该优先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否真的解决你的场景，再看它是不是有清晰的免费限制和最近更新。'
        : 'Start with the use case, then check whether the free limits and recent updates are clear.',
    },
    {
      question: isChinese ? '免费工具什么时候不够用？' : 'When is a free tool not enough?',
      answer: isChinese
        ? '如果你需要稳定支持、团队协作、较高额度或商业使用，免费版本往往会很快碰到边界。'
        : 'If you need reliability, team workflows, higher limits, or commercial use, free tiers usually hit their limits fast.',
    },
    {
      question: isChinese ? '我可以直接从这里找免费工具吗？' : 'Can I find free tools directly from here?',
      answer: isChinese
        ? '可以。你可以先看免费筛选，再结合分类页和评论做进一步判断。'
        : 'Yes. Start with the free filter, then refine with category pages and comments.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先看免费额度和限制，避免选到“看起来免费、实际上用不了”的工具。',
        '优先选择最近有更新、评论正常、截图清晰的工具。',
        '如果你是第一次尝试，用免费工具先验证场景最稳妥。',
      ]
    : [
        'Check quotas and limits first so you do not pick a tool that looks free but is unusable in practice.',
        'Prefer tools with recent updates, real comments, and clear screenshots.',
        'If you are trying a workflow for the first time, free tools are the safest place to start.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Sparkles className='size-4' />
              {isChinese ? '免费工具指南' : 'Free tools guide'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <FileText className='size-4' />
              {isChinese ? '先试用，再决定' : 'Try first, then decide'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? '免费 AI 工具怎么选，才不会白花时间' : 'How to choose free AI tools without wasting time'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '免费工具很适合先试，但并不是每一个都值得花时间。这个页面帮你把“能不能用”和“值不值得继续用”分开来看。'
              : 'Free tools are great for trying ideas, but not all of them are worth your time. This page helps you separate "usable" from "worth keeping".'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?pricing=free&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看免费工具' : 'View free tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/categories/productivity'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '先看一个类目' : 'Start with a category'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先看限制，再看有没有继续用的价值'
                : 'Check limits first, then decide whether it is worth keeping'}
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
              {isChinese ? '先看这些分类' : 'Good categories to start with'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '免费工具通常从这些类目开始看' : 'Free tools often start in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories.slice(0, 6).map((category) => (
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '免费工具看什么' : 'What matters for free tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '免费不代表随便选' : 'Free does not mean random'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '先看它能不能解决你的核心场景，再看有没有明显的限制。免费额度、导出、登录门槛和更新频率都很重要。'
                  : 'Start with whether it solves your core problem, then look at visible limits. Free quotas, export options, login friction, and update frequency matter a lot.'}
              </p>
              <p>
                {isChinese
                  ? '如果你只是试流程，免费工具很适合；如果你要长期使用，最好尽早判断它是否值得继续留在你的清单里。'
                  : 'If you are just trying a workflow, free tools are perfect. If you plan to keep using it, decide early whether it belongs on your shortlist.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '免费工具最常见的几个问题' : 'Common questions about free tools'}
            </h2>
            <div className='mt-4 space-y-4'>
              {faqs.map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='free_ai_tools' />
      </div>
    </>
  );
}
