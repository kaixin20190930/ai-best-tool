import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, GraduationCap, NotebookPen } from 'lucide-react';
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
      locale === 'cn' || locale === 'tw' ? 'AI 学生工具推荐 | AI Best Tool' : `AI tools for students | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向学习、写作、总结、笔记和作业协作的 AI 工具选型指南。'
        : 'A practical guide to AI tools for learning, writing, summarizing, notes, and homework collaboration.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '学生工具' : 'Student tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-students` },
  ]);
  const faqs = [
    {
      question: isChinese ? '学生最适合用 AI 工具做什么？' : 'What are AI tools for students best for?',
      answer: isChinese
        ? '最适合查资料、整理笔记、总结文章、构思提纲、修改写作和做作业辅助。它们能帮你省时间，但最好保留自己的理解和判断。'
        : 'They are best for research, note organization, summarizing articles, outlining, writing help, and homework assistance. They save time, but your own understanding still matters.',
    },
    {
      question: isChinese ? '学生应该先看什么？' : 'What should students check first?',
      answer: isChinese
        ? '先看它是否支持你常用的语言、是否方便做总结和引用、以及是否能和笔记/文档工具配合。'
        : 'Start with language support, summarizing and citation workflow, and whether it works well with your notes/doc tools.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is the free tier enough?',
      answer: isChinese
        ? '做日常学习和轻量写作很多时候够用；如果你需要更长上下文、批量处理或者更稳定的输出，可能会更快碰到限制。'
        : 'Free tiers are often enough for daily learning and light writing. If you need longer context, bulk processing, or steadier output, you may hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接找到学生常用工具吗？' : 'Can I find student-friendly tools directly from here?',
      answer: isChinese
        ? '可以。你可以先看搜索结果和分类页，再结合评论与截图判断。'
        : 'Yes. Start from search results and categories, then judge using comments and screenshots.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清用途：查资料、做笔记、写作业、做总结、练语言或做项目协作。',
    '看它是否容易和你的笔记、文档、浏览器或者学习平台配合。',
    '如果你每天都会用，优先看稳定性、引用和导出，而不是只看回答速度。',
  ];
  const englishTips = [
    'Separate the use case first: research, notes, homework, summaries, language practice, or project collaboration.',
    'Check whether it fits your notes, docs, browser, or learning platforms.',
    'If you will use it daily, prioritize stability, citations, and export over raw speed.',
  ];
  const tips = isChinese ? chineseTips : englishTips;

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <GraduationCap className='size-4' />
              {isChinese ? '学生工具推荐' : 'Student tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <NotebookPen className='size-4' />
              {isChinese ? '学习与写作并重' : 'Learning and writing'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 学生工具推荐：怎么选更适合学习和作业'
              : 'AI tools for students: how to choose one for learning and homework'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '学生场景最需要的不是“最强”，而是“最顺手”。这个页面会帮你从学习、写作、总结和协作几个角度判断哪些工具真正适合学生使用。'
              : 'Students usually need tools that are not just powerful, but easy to use. This page helps you judge which tools fit learning, writing, summarizing, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=study&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看学生常用工具' : 'Browse student tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看学习场景，再看使用成本' : 'Start with the learning task, then the cost of use'}
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
              {isChinese ? '先看这些分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '学生常用工具通常在这些分类里' : 'Student tools often sit in these categories'}
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
              {isChinese ? '学生工具看什么' : 'What matters for student tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正帮你学得更轻松' : 'Can it actually make studying easier?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '学生工具最重要的是是否能帮你更快整理资料、做摘要、理解内容，而不是只在某个功能上看起来很强。'
                  : 'What matters most is whether it helps you organize material, summarize, and understand content faster, not just whether one feature looks impressive.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是学生或学习型用户，优先看引用、导出、笔记协作和中文支持。'
                  : 'If you are a student or learning-focused user, prioritize citations, export, note collaboration, and language support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '学生工具最常见的问题' : 'Common questions about student tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_students' />
      </div>
    </>
  );
}
