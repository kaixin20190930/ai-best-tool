import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Layers3, Sparkles, Star, Target } from 'lucide-react';

import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import { topListTopics } from '@/lib/data/topLists';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = locale === 'cn' || locale === 'tw';

  return {
    title: isChinese ? 'Top AI Tools | AI Best Tool' : 'Top AI Tools | AI Best Tool',
    description: isChinese
      ? '按用途整理的 AI 工具榜单：写作、开发、研究和视频。'
      : 'Purpose-driven AI tool rankings for writing, coding, research, and video.',
  };
}

export default function BestAiToolsPage({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <div className='theme-page mx-auto max-w-pc px-4 py-8 lg:px-0'>
      <section className='overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
        <div className='grid gap-0 lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white lg:p-10'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/10'>
              <Sparkles className='size-3.5' />
              {isChinese ? '榜单页' : 'Ranked lists'}
            </div>

            <div className='space-y-4'>
              <h1 className='max-w-3xl text-3xl font-bold tracking-tight text-white lg:text-5xl'>
                {isChinese ? '按真实使用场景挑 AI 工具，而不是按名气挑' : 'Pick AI tools by use case, not by hype'}
              </h1>
              <p className='max-w-2xl text-base leading-7 text-slate-200 lg:text-lg'>
                {isChinese
                  ? '这些榜单页会把用户带到更窄、更有意图的选择页，再往下接到详情页、提交页和付费页。'
                  : 'These ranking pages narrow the choice, then route people into detail pages, submission, and paid upgrades.'}
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                {
                  title: isChinese ? '清晰意图' : 'Clear intent',
                  text: isChinese ? '每页只解决一个选择问题' : 'Each page answers one decision',
                },
                {
                  title: isChinese ? '可比较' : 'Comparable',
                  text: isChinese ? '保留可对比的工具特征' : 'Keeps tools comparable',
                },
                {
                  title: isChinese ? '可转化' : 'Conversion-friendly',
                  text: isChinese ? '每页都有下一步 CTA' : 'Every page has a next step',
                },
              ].map((item) => (
                <div key={item.title} className='rounded-xl border border-white/10 bg-white/5 p-4'>
                  <p className='text-sm font-semibold text-white'>{item.title}</p>
                  <p className='mt-1 text-sm leading-6 text-slate-200'>{item.text}</p>
                </div>
              ))}
            </div>

            <div className='flex flex-wrap gap-3'>
              <TrackableCtaLink
                href={`/${locale}/submit`}
                ctaId='best_tools_submit'
                ctaLabel='Submit a tool'
                pageType='best_ai_tools'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400'
              >
                {isChinese ? '提交工具' : 'Submit a tool'}
                <ArrowRight className='ml-2 size-4' />
              </TrackableCtaLink>
              <TrackableCtaLink
                href={`/${locale}/pricing`}
                ctaId='best_tools_pricing'
                ctaLabel='View pricing'
                pageType='best_ai_tools'
                className='inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15'
              >
                {isChinese ? '查看定价' : 'View pricing'}
              </TrackableCtaLink>
            </div>
          </div>

          <div className='bg-slate-50 p-6 lg:p-10'>
            <div className='grid gap-4 sm:grid-cols-2'>
              {topListTopics.map((topic) => (
                <Link
                  key={topic.key}
                  href={`/${locale}/best-ai-tools/${topic.key}`}
                  className='group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{topic.title}</p>
                      <p className='mt-1 text-xs uppercase tracking-wide text-slate-500'>{topic.categorySlug}</p>
                    </div>
                    <div className='rounded-full bg-cyan-50 p-2 text-cyan-700'>
                      <Target className='size-4' />
                    </div>
                  </div>
                  <p className='mt-3 text-sm leading-6 text-slate-600'>{topic.summary}</p>
                  <p className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700'>
                    {topic.ctaLabel}
                    <ArrowRight className='size-4 transition group-hover:translate-x-0.5' />
                  </p>
                </Link>
              ))}
            </div>

            <div className='mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-5'>
              <div className='flex items-start gap-3'>
                <Layers3 className='mt-0.5 size-5 text-cyan-700' />
                <div>
                  <p className='text-sm font-semibold text-slate-950'>
                    {isChinese ? '榜单怎么用' : 'How to use the lists'}
                  </p>
                  <p className='mt-1 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看榜单，再进详情页比较关键差异，最后再去提交或付费。'
                      : 'Scan the list, compare the key differences in detail pages, then move into submit or paid options.'}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5'>
              <div>
                <p className='text-sm font-semibold text-slate-950'>{isChinese ? '下一步' : 'Next step'}</p>
                <p className='mt-1 text-sm text-slate-600'>
                  {isChinese ? '选一个主题开始比较' : 'Pick a topic and start comparing'}
                </p>
              </div>
              <Star className='size-5 text-amber-500' />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
