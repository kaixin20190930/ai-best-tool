/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The labeled overflow region must support keyboard scrolling. */
import React from 'react';

import {
  validateVerifiedComparison,
  type BilingualCopy,
  type VerifiedComparison,
} from '@/lib/content/verifiedComparison';
import { generateLocalizedPath } from '@/lib/seo/metadata';
import type {
  PublicComparisonCapabilityRow,
  PublicToolCapabilitySummary,
} from '@/lib/services/decision/capabilityReadModel';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

type Props = {
  comparison: VerifiedComparison;
  locale: string;
  tools: { name: string; title: string }[];
  capabilityRows?: PublicComparisonCapabilityRow[];
  guideHref: string;
  faqs: { question: BilingualCopy; answer: BilingualCopy }[];
};

function detailText(value: unknown, locale: string): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value))
    return value
      .map((item) => detailText(item, locale))
      .filter(Boolean)
      .join('; ');
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  const localized = record[locale] || record[locale === 'tw' ? 'cn' : 'en'] || record.en;
  if (typeof localized === 'string') return localized.trim();
  return Object.entries(record)
    .map(([key, item]) => `${key.replace(/[_-]/g, ' ')}: ${detailText(item, locale)}`)
    .filter((item) => !item.endsWith(': '))
    .join('; ');
}

const supportLabels: Record<PublicToolCapabilitySummary['supportLevel'], BilingualCopy> = {
  strong: { cn: '强支持', en: 'Strong' },
  partial: { cn: '部分支持', en: 'Partial' },
  limited: { cn: '有限支持', en: 'Limited' },
  not_supported: { cn: '不支持', en: 'Not supported' },
  unknown: { cn: '未知', en: 'Unknown' },
};

const availabilityLabels: Record<PublicToolCapabilitySummary['availability'], BilingualCopy> = {
  all_plans: { cn: '所有套餐', en: 'All plans' },
  paid_only: { cn: '付费套餐', en: 'Paid only' },
  enterprise_only: { cn: '企业套餐', en: 'Enterprise only' },
  add_on: { cn: '附加购买', en: 'Add-on' },
  unknown: { cn: '未知', en: 'Unknown' },
};

export default function VerifiedComparisonPage({
  comparison,
  locale,
  tools,
  capabilityRows = [],
  guideHref,
  faqs,
}: Props) {
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
      {capabilityRows.length > 0 && (
        <section data-comparison-section='capabilities' className={sectionClass}>
          <h2 className='text-2xl font-bold text-slate-950'>
            {cn ? '已核验能力差异' : 'Verified capability differences'}
          </h2>
          <p className='mt-2 text-sm text-slate-600'>
            {cn
              ? '未知表示目前没有符合公开条件的能力证据，不能据此判断工具不支持。'
              : 'Unknown means no qualifying public capability evidence is available; it does not mean the tool lacks the capability.'}
          </p>
          <div
            className='mt-5 overflow-x-auto'
            tabIndex={0}
            role='region'
            aria-label={
              cn ? '已核验能力比较表，可横向滚动' : 'Verified capability comparison table, scroll horizontally'
            }
          >
            <table className='w-full min-w-[680px] border-collapse text-left text-sm leading-6'>
              <caption className='sr-only'>{cn ? '已核验能力差异' : 'Verified capability differences'}</caption>
              <thead>
                <tr className='bg-slate-100'>
                  <th scope='col' className='p-3'>
                    {cn ? '能力' : 'Capability'}
                  </th>
                  {comparison.candidates.map((candidate) => (
                    <th scope='col' key={candidate.slug} className='p-3'>
                      {candidate.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {capabilityRows.map((row) => (
                  <tr key={`${row.group}-${row.name.en}`} className='border-b border-slate-200 align-top'>
                    <th scope='row' className='p-3 font-semibold text-slate-950'>
                      {row.name[locale] || row.name[language] || row.name.en}
                      {(row.description[locale] || row.description[language] || row.description.en) && (
                        <p className='mt-1 font-normal text-slate-600'>
                          {row.description[locale] || row.description[language] || row.description.en}
                        </p>
                      )}
                    </th>
                    {comparison.candidates.map((candidate) => {
                      const capability = row.cells[candidate.slug];
                      return (
                        <td key={candidate.slug} className='p-3 text-slate-700'>
                          {capability ? (
                            <>
                              <p className='font-semibold text-slate-950'>
                                {supportLabels[capability.supportLevel][language]}
                              </p>
                              <p>
                                {cn ? '可用范围' : 'Availability'}:{' '}
                                {availabilityLabels[capability.availability][language]}
                              </p>
                              {Object.keys(capability.planRequirement).length > 0 && (
                                <p>
                                  {cn ? '套餐要求' : 'Plan requirement'}:{' '}
                                  {detailText(capability.planRequirement, locale)}
                                </p>
                              )}
                              {capability.limitations.length > 0 && (
                                <p>
                                  {cn ? '限制' : 'Limitations'}: {detailText(capability.limitations, locale)}
                                </p>
                              )}
                              <ul className='mt-2 space-y-1 text-xs'>
                                {capability.evidence.map((item) => (
                                  <li key={`${item.sourceUrl}:${item.verifiedAt}`}>
                                    <a
                                      href={item.sourceUrl}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='break-all text-cyan-800 underline'
                                    >
                                      {item.sourceUrl}
                                    </a>
                                    {item.verifiedAt
                                      ? ` · ${cn ? '核验' : 'Verified'} ${item.verifiedAt.slice(0, 10)}`
                                      : ''}
                                    {item.reviewDueAt
                                      ? ` · ${cn ? '复查期限' : 'Review due'} ${item.reviewDueAt.slice(0, 10)}`
                                      : ''}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <span>{cn ? '未知' : 'Unknown'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
