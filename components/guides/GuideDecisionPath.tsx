import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';

export interface GuideDecisionTask {
  task: string;
  toolName: string;
  toolLabel: string;
  bestFor: string;
  verifyFirst: string;
}

interface GuideDecisionPathProps {
  locale: string;
  guideId: string;
  title: string;
  description: string;
  tasks: GuideDecisionTask[];
}

export default function GuideDecisionPath({ locale, guideId, title, description, tasks }: GuideDecisionPathProps) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <section
      data-guide-decision-path
      className='mt-8 rounded-[20px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm lg:p-8'
    >
      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300'>
        {isChinese ? '按任务做决定' : 'Decide by task'}
      </p>
      <h2 className='mt-2 max-w-3xl text-2xl font-bold tracking-tight lg:text-3xl'>{title}</h2>
      <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-300 lg:text-base'>{description}</p>

      <div className='mt-6 grid gap-4 lg:grid-cols-3'>
        {tasks.map((item, index) => (
          <article
            key={`${item.toolName}-${item.task}`}
            className='flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-5'
          >
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-300'>
              {isChinese ? `任务 ${index + 1}` : `Task ${index + 1}`}
            </p>
            <h3 className='mt-2 text-lg font-bold text-white'>{item.task}</h3>

            <div className='mt-4 space-y-3 text-sm leading-6'>
              <div className='flex gap-2 text-slate-200'>
                <CheckCircle2 className='mt-1 size-4 shrink-0 text-emerald-300' />
                <p>
                  <span className='font-semibold text-white'>{isChinese ? '更适合：' : 'Best for: '}</span>
                  {item.bestFor}
                </p>
              </div>
              <div className='flex gap-2 text-slate-300'>
                <ShieldAlert className='mt-1 size-4 shrink-0 text-amber-300' />
                <p>
                  <span className='font-semibold text-white'>{isChinese ? '先核验：' : 'Verify first: '}</span>
                  {item.verifyFirst}
                </p>
              </div>
            </div>

            <TrackableCtaLink
              href={`/ai/${item.toolName}#decision-card`}
              ctaId={`${guideId}_decision_${item.toolName}`}
              ctaLabel={`${item.toolLabel} Decision Card`}
              pageType='guide'
              className='mt-5 inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50'
            >
              <span>{isChinese ? `查看 ${item.toolLabel} 判断卡` : `Open ${item.toolLabel} Decision Card`}</span>
              <ArrowRight className='size-4 shrink-0' />
            </TrackableCtaLink>
          </article>
        ))}
      </div>
    </section>
  );
}
