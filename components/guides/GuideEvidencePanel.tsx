import React from 'react';

import { validComparisonEvidence, type ComparisonEvidence } from '@/lib/content/verifiedComparison';

type GuideEvidencePanelProps = { locale: string; variant: 'verified'; evidence: ComparisonEvidence[] };

export default function GuideEvidencePanel(props: GuideEvidencePanelProps) {
  const { locale, variant, evidence } = props;
  const language = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  if (variant !== 'verified' || !evidence.length || !evidence.every(validComparisonEvidence)) return null;
  return (
    <div data-comparison-evidence>
      <h2 className='text-2xl font-bold text-slate-950'>
        {language === 'cn' ? '来源与核查日期' : 'Sources and check dates'}
      </h2>
      <ol className='mt-4 grid gap-4 md:grid-cols-2'>
        {evidence.map((item, index) => (
          <li
            id={`evidence-${item.id}`}
            key={item.id}
            className='scroll-mt-24 rounded-xl border border-slate-200 bg-slate-50 p-4'
          >
            <a
              href={item.source.url}
              target='_blank'
              rel='noreferrer'
              className='text-sm font-semibold text-cyan-800 underline underline-offset-4'
            >
              [{index + 1}] {item.source.label}
            </a>
            <p className='mt-2 text-sm leading-6 text-slate-800'>{item.claim[language]}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>{item.impact[language]}</p>
            <p className='mt-2 text-xs text-slate-500'>
              {language === 'cn' ? '官方文档核查：' : 'Official docs checked: '}
              <time dateTime={item.checkedAt}>{item.checkedAt}</time>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
