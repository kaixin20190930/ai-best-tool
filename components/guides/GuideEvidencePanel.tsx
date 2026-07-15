type EvidenceItem = {
  label: string;
  value: string;
  note: string;
};

type SignalCard = {
  label: string;
  value: string;
  note: string;
  tone?: string;
};

type GuideEvidencePanelProps = {
  locale: string;
  checkedAt?: string;
  scope: string;
  items: EvidenceItem[];
  decisionSteps?: string[];
  signalCards?: SignalCard[];
};

export default function GuideEvidencePanel({
  locale,
  checkedAt = '2026-07-15',
  scope,
  items,
  decisionSteps,
  signalCards,
}: GuideEvidencePanelProps) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <section className='mt-8 rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm lg:p-8'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-wide text-emerald-700'>
            {isChinese ? '真实信号与验证口径' : 'Evidence and verification'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '这页不是只按功能堆列表' : 'This page is not only a feature list'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-700'>{scope}</p>
        </div>
        <div className='rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm shadow-sm'>
          <p className='font-semibold text-slate-950'>{isChinese ? '最近检查' : 'Last checked'}</p>
          <p className='mt-1 text-slate-600'>{checkedAt}</p>
        </div>
      </div>

      <div className='mt-5 grid gap-3 md:grid-cols-3'>
        {items.map((item) => (
          <div key={item.label} className='rounded-2xl border border-white bg-white p-4 shadow-sm'>
            <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>{item.label}</p>
            <p className='mt-2 text-base font-semibold text-slate-950'>{item.value}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>{item.note}</p>
          </div>
        ))}
      </div>

      {signalCards && signalCards.length > 0 ? (
        <div className='mt-5 grid gap-3 md:grid-cols-3'>
          {signalCards.slice(0, 3).map((signal) => (
            <div
              key={signal.label}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${signal.tone || 'border-cyan-200'}`}
            >
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>{signal.label}</p>
              <p className='mt-2 text-base font-semibold text-slate-950'>{signal.value}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{signal.note}</p>
            </div>
          ))}
        </div>
      ) : null}

      {decisionSteps && decisionSteps.length > 0 ? (
        <div className='mt-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm'>
          <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
            {isChinese ? '决策顺序' : 'Decision order'}
          </p>
          <div className='mt-3 grid gap-2 md:grid-cols-3'>
            {decisionSteps.slice(0, 3).map((step, index) => (
              <div key={step} className='rounded-xl bg-emerald-50/60 px-3 py-3 text-sm leading-6 text-slate-700'>
                <span className='mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200'>
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
