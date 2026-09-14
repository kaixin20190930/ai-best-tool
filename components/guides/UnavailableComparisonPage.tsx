import React from 'react';

import type { BilingualCopy } from '@/lib/content/verifiedComparison';
import { generateLocalizedPath } from '@/lib/seo/metadata';

export type UnavailableComparisonProps = {
  locale: string;
  title: BilingualCopy;
  guideHref: string;
  guideLabel: BilingualCopy;
};

export default function UnavailableComparisonPage({
  locale,
  title,
  guideHref,
  guideLabel,
}: UnavailableComparisonProps) {
  const language = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  return (
    <div
      data-public-comparison='unavailable'
      className='theme-page mx-auto w-full min-w-0 max-w-4xl px-4 py-8 lg:py-12'
    >
      <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
        <h1 className='text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl'>{title[language]}</h1>
        <p className='mt-5 max-w-2xl text-base leading-7 text-slate-700'>
          {language === 'cn'
            ? '目前无法提供这组工具的完整比较，不能据此判断哪款更适合你。请先用下方指南确定任务、使用限制和试用检查项。'
            : 'A complete comparison of these tools is currently unavailable, so this page cannot establish which one fits you best. Use the guide below to define the task, constraints and trial checks.'}
        </p>
        <div data-comparison-next className='mt-6'>
          <a
            data-comparison-primary-cta
            href={generateLocalizedPath(guideHref, locale)}
            className='inline-flex rounded-lg bg-cyan-800 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-900'
          >
            {guideLabel[language]}
          </a>
        </div>
      </section>
    </div>
  );
}
