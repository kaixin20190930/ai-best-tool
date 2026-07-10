type EvidenceItem = {
  label: string;
  value: string;
  note: string;
};

type GuideEvidencePanelProps = {
  locale: string;
  checkedAt?: string;
  scope: string;
  items: EvidenceItem[];
};

export default function GuideEvidencePanel({
  locale,
  checkedAt = '2026-07-10',
  scope,
  items,
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
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-700'>
            {scope}
          </p>
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
    </section>
  );
}
