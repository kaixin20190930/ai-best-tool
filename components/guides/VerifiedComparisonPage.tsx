/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The labeled overflow region must support keyboard scrolling. */
import React from 'react';

import {
  validateVerifiedComparison,
  type BilingualCopy,
  type VerifiedComparison,
} from '@/lib/content/verifiedComparison';
import { generateLocalizedPath } from '@/lib/seo/metadata';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

type Props = {
  comparison: VerifiedComparison;
  locale: string;
  tools: { name: string; title: string }[];
  guideHref: string;
  faqs: { question: BilingualCopy; answer: BilingualCopy }[];
};

export default function VerifiedComparisonPage({ comparison, locale, tools, guideHref, faqs }: Props) {
  const language = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  const cn = language === 'cn';
  const copy = (value: BilingualCopy) => value[language];
  const sectionClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8';
  const valid = validateVerifiedComparison(
    comparison,
    tools.map((tool) => tool.name),
  );
  if (!valid) {
    return (
      <div data-public-comparison='unavailable' className='theme-page mx-auto w-full min-w-0 max-w-6xl px-4 py-8'>
        <h1 className='text-3xl font-bold'>{cn ? 'Web3 工具选择' : 'Choosing Web3 tools'}</h1>
        <p className='mt-4'>
          {cn
            ? '暂时无法提供这组工具的完整比较。你可以从 Web3 指南按任务选择工具。'
            : 'This comparison is currently unavailable. Use the Web3 guide to choose tools by task.'}
        </p>
        <a href={generateLocalizedPath(guideHref, locale)} className='mt-4 inline-block text-cyan-800 underline'>
          {cn ? '查看 Web3 指南' : 'Read the Web3 guide'}
        </a>
      </div>
    );
  }
  const references = (refs: string[]) => (
    <span className='ml-1 inline-flex flex-wrap gap-1'>
      {refs.map((ref) => (
        <a
          key={ref}
          href={`#evidence-${ref}`}
          aria-label={`${cn ? '来源' : 'Source'} ${comparison.evidence.findIndex((item) => item.id === ref) + 1}`}
          className='text-cyan-800 underline underline-offset-2'
        >
          [{comparison.evidence.findIndex((item) => item.id === ref) + 1}]
        </a>
      ))}
    </span>
  );
  return (
    <div
      data-public-comparison='verified'
      className='theme-page mx-auto w-full min-w-0 max-w-6xl space-y-6 px-4 py-6 lg:px-6 lg:py-10'
    >
      <section data-comparison-section='scope' className={sectionClass}>
        <p className='text-sm font-semibold text-cyan-800'>{cn ? 'Web3 数据工具对比' : 'Web3 data tools compared'}</p>
        <h1 className='mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl'>{copy(comparison.title)}</h1>
        <p className='mt-4 max-w-4xl text-base leading-7 text-slate-600'>{copy(comparison.scope)}</p>
      </section>
      <section data-comparison-section='decision' className={`${sectionClass} !border-cyan-200 !bg-cyan-50/60`}>
        <h2 className='text-2xl font-bold text-slate-950'>{cn ? '按需求选谁' : 'Choose by the job'}</h2>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {comparison.candidates.map((candidate) => (
            <div key={candidate.slug} className='rounded-xl border border-cyan-100 bg-white p-4'>
              <h3 className='text-lg font-bold text-cyan-900'>{candidate.name}</h3>
              <p className='mt-2 text-sm leading-6 text-slate-700'>{copy(candidate.chooseWhen)}</p>
            </div>
          ))}
        </div>
      </section>
      <section data-comparison-section='matrix' className={sectionClass}>
        <h2 className='text-2xl font-bold text-slate-950'>
          {cn ? '关键差异与选择结论' : 'Key differences and the choice they support'}
        </h2>
        <div
          className='mt-5 overflow-x-auto'
          tabIndex={0}
          role='region'
          aria-label={cn ? '工具比较表，可横向滚动' : 'Tool comparison table, scroll horizontally'}
        >
          <table className='w-full min-w-[680px] border-collapse text-left text-sm leading-6'>
            <caption className='sr-only'>{copy(comparison.title)}</caption>
            <thead>
              <tr className='bg-slate-100'>
                <th scope='col' className='w-[14%] p-3'>
                  {cn ? '维度' : 'Dimension'}
                </th>
                {comparison.candidates.map((candidate) => (
                  <th scope='col' className='w-[26%] p-3' key={candidate.slug}>
                    {candidate.name}
                  </th>
                ))}
                <th scope='col' className='p-3'>
                  {cn ? '怎么选' : 'How to choose'}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.comparisonRows.map((row) => (
                <tr key={row.dimension.en} className='border-b border-slate-200 align-top'>
                  <th scope='row' className='p-3 font-semibold text-slate-950'>
                    {copy(row.dimension)}
                  </th>
                  {comparison.candidates.map((candidate) => (
                    <td key={candidate.slug} className='p-3 text-slate-700'>
                      {copy(row.values[candidate.slug])}
                    </td>
                  ))}
                  <td className='p-3'>
                    <p className='font-semibold text-cyan-900'>{copy(row.fit)}</p>
                    <p className='mt-1 text-slate-600'>
                      {copy(row.reason)} {references(row.evidenceRefs)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className='mt-3 text-xs text-slate-500 md:hidden'>
          {cn ? '左右滑动查看两款工具与选择结论。' : 'Swipe across to read both tools and the decision.'}
        </p>
      </section>
      <section data-comparison-section='candidates' className={sectionClass}>
        <h2 className='text-2xl font-bold text-slate-950'>{cn ? '优势与关键限制' : 'Strengths and limits'}</h2>
        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          {comparison.candidates.map((candidate) => (
            <article key={candidate.slug} className='rounded-xl border border-slate-200 p-5'>
              <h3 className='text-lg font-bold text-slate-950'>{candidate.name}</h3>
              <p className='mt-3 text-sm leading-6 text-slate-700'>
                {copy(candidate.strength)} {references(candidate.evidenceRefs)}
              </p>
              <p className='mt-3 border-l-2 border-amber-300 pl-3 text-sm leading-6 text-slate-600'>
                {copy(candidate.limitation)}
              </p>
              <a
                href={generateLocalizedPath(`/ai/${candidate.slug}#decision-card`, locale)}
                className='mt-4 inline-block text-sm font-semibold text-cyan-800 underline underline-offset-4'
              >
                {tools.find((tool) => tool.name === candidate.slug)?.title}
              </a>
            </article>
          ))}
        </div>
      </section>
      <section data-comparison-section='fit' className={sectionClass}>
        <h2 className='text-2xl font-bold text-slate-950'>{cn ? '适合谁、不适合谁' : 'Who each tool fits'}</h2>
        <dl className='mt-5 grid gap-5 md:grid-cols-2'>
          {comparison.candidates.map((candidate) => (
            <div key={candidate.slug}>
              <dt className='font-semibold text-slate-950'>{candidate.name}</dt>
              <dd className='mt-2 text-sm leading-6 text-slate-700'>{copy(candidate.fit)}</dd>
              <dd className='mt-2 text-sm leading-6 text-slate-600'>{copy(candidate.notFor)}</dd>
            </div>
          ))}
        </dl>
        <div data-comparison-faq className='mt-6 border-t border-slate-200 pt-4'>
          {faqs.map((faq) => (
            <details key={faq.question.en} className='py-2'>
              <summary className='cursor-pointer text-sm font-semibold text-slate-800'>{copy(faq.question)}</summary>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{copy(faq.answer)}</p>
            </details>
          ))}
        </div>
      </section>
      <section data-comparison-section='sources' className={sectionClass}>
        <GuideEvidencePanel locale={locale} variant='verified' evidence={comparison.evidence} />
        <div data-comparison-next className='mt-6 border-t border-slate-200 pt-5'>
          <p className='text-sm leading-6 text-slate-600'>{copy(comparison.next.description)}</p>
          <a
            data-comparison-primary-cta
            href={generateLocalizedPath(comparison.next.href, locale)}
            className='mt-4 inline-flex rounded-lg bg-cyan-800 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-900'
          >
            {copy(comparison.next.label)}
          </a>
        </div>
      </section>
    </div>
  );
}
