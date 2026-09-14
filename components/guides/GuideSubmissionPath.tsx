import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';

type GuideSubmissionPathProps = {
  locale: string;
  ctaPrefix: string;
  /** PUB-01 pilot opts out; legacy callers are migrated in PUB-02. */
  audience?: 'reader' | 'tool-owner';
};

export default function GuideSubmissionPath({ locale, ctaPrefix, audience }: GuideSubmissionPathProps) {
  if (audience !== 'tool-owner') return null;
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
      <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
          {isChinese ? '工具方入口' : 'For tool owners'}
        </p>
        <h2 className='mt-1 text-2xl font-bold text-slate-950'>
          {isChinese
            ? '如果这是你的工具，下一步就去提交或认领'
            : 'If this is your tool, the next step is submission or claiming'}
        </h2>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
          {isChinese
            ? '提交新工具，或认领已有条目以维护产品信息。'
            : 'Submit a new tool or claim an existing listing to maintain its product information.'}
        </p>
        <div className='mt-5 flex flex-wrap gap-3'>
          <TrackableCtaLink
            href='/submit'
            ctaId={`${ctaPrefix}_submit`}
            ctaLabel={`${ctaPrefix} submit`}
            pageType='guide'
            className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
          >
            {isChinese ? '提交你的工具' : 'Submit your tool'}
          </TrackableCtaLink>
          <TrackableCtaLink
            href='/developer/listing'
            ctaId={`${ctaPrefix}_claim`}
            ctaLabel={`${ctaPrefix} claim`}
            pageType='guide'
            className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
          >
            {isChinese ? '认领条目' : 'Claim listing'}
          </TrackableCtaLink>
        </div>
      </section>
    </div>
  );
}
