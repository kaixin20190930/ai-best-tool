import type { Metadata } from 'next';

import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { getActiveDecisionTasks, type DecisionTaskOption } from '@/lib/services/decision/repository';
import DecisionFinder from '@/components/decision/DecisionFinder';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  return buildLocalizedPageMetadata({
    locale: params.locale,
    path: '/find-tools',
    title: isChinese ? '按任务和硬条件选择 AI 工具' : 'Find AI Tools by Task and Hard Constraints',
    description: isChinese
      ? '按任务、预算、隐私、自托管和导出要求，从已核验证据中获得最多三项可解释建议。'
      : 'Use task, budget, privacy, self-hosting, and export constraints to get up to three evidence-backed recommendations.',
    indexable: false,
  });
}

export default async function FindToolsPage({ params }: { params: { locale: string } }) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  let tasks: DecisionTaskOption[] = [];
  let unavailable = false;
  try {
    tasks = await getActiveDecisionTasks();
  } catch {
    unavailable = true;
  }

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.13),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]'>
      <div className='container mx-auto px-4 py-8 lg:py-12'>
        <SeoBreadcrumbs
          locale={params.locale}
          items={[
            { name: isChinese ? '首页' : 'Home', path: '/' },
            { name: isChinese ? '按任务找工具' : 'Find tools', path: '/find-tools' },
          ]}
          className='mb-6'
        />
        <header className='mb-8 max-w-4xl'>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700'>
            {isChinese ? 'Task & Constraint Finder' : 'Task & Constraint Finder'}
          </p>
          <h1 className='mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl'>
            {isChinese ? '不要再从一整页工具里猜答案' : 'Stop guessing from a wall of tools'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg'>
            {isChinese
              ? '先说明任务和不能妥协的条件。系统只使用已核验、未过期、无冲突的证据，明确告诉你为什么推荐、什么仍然未知。'
              : 'State the task and the constraints you cannot compromise on. The finder uses only verified, current, conflict-free evidence and shows what is still unknown.'}
          </p>
        </header>

        {unavailable ? (
          <div role='alert' className='rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800'>
            {isChinese
              ? '任务数据暂时不可用，请稍后刷新。'
              : 'Decision tasks are temporarily unavailable. Please refresh later.'}
          </div>
        ) : (
          <DecisionFinder locale={params.locale} tasks={tasks} />
        )}
      </div>
    </main>
  );
}
