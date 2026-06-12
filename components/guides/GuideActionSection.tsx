import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { toolToListRow } from '@/lib/services/toolPresenter';
import { getToolByNameCached } from '@/lib/services/tools';
import WebNavCardList from '@/components/webNav/WebNavCardList';

type CompareLink = {
  href: string;
  title: string;
  description: string;
};

interface GuideActionSectionProps {
  locale: string;
  eyebrow: string;
  title: string;
  description: string;
  toolNames: string[];
  compareEyebrow?: string;
  compareTitle?: string;
  compareDescription?: string;
  compareLinks?: CompareLink[];
  nextEyebrow?: string;
  nextTitle?: string;
  nextDescription?: string;
  nextLinks?: CompareLink[];
}

export default async function GuideActionSection({
  locale,
  eyebrow,
  title,
  description,
  toolNames,
  compareEyebrow,
  compareTitle,
  compareDescription,
  compareLinks = [],
  nextEyebrow,
  nextTitle,
  nextDescription,
  nextLinks = [],
}: GuideActionSectionProps) {
  const tools = await Promise.all(toolNames.map((toolName) => getToolByNameCached(toolName).catch(() => null)));
  const toolCards = tools
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
    .map((tool) => toolToListRow(tool, locale));

  if (toolCards.length === 0 && compareLinks.length === 0 && nextLinks.length === 0) {
    return null;
  }

  return (
    <section className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
      <div className='flex flex-col gap-2'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{eyebrow}</p>
        <h2 className='text-2xl font-bold text-slate-950'>{title}</h2>
        <p className='max-w-3xl text-sm leading-6 text-slate-600'>{description}</p>
      </div>

      {toolCards.length > 0 && (
        <div className='mt-6'>
          <WebNavCardList dataList={toolCards} contextLabel='popular' />
        </div>
      )}

      {compareLinks.length > 0 && (
        <div className='mt-8 border-t border-slate-200 pt-6'>
          {compareTitle ? (
            <div className='mb-4 flex flex-col gap-2'>
              {compareEyebrow ? (
                <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{compareEyebrow}</p>
              ) : null}
              <h3 className='text-xl font-bold text-slate-950'>{compareTitle}</h3>
              {compareDescription ? (
                <p className='max-w-3xl text-sm leading-6 text-slate-600'>{compareDescription}</p>
              ) : null}
            </div>
          ) : null}

          <div className='grid gap-4 lg:grid-cols-3'>
            {compareLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>{link.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{link.description}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {nextLinks.length > 0 && (
        <div className='mt-8 border-t border-slate-200 pt-6'>
          {nextTitle ? (
            <div className='mb-4 flex flex-col gap-2'>
              {nextEyebrow ? (
                <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{nextEyebrow}</p>
              ) : null}
              <h3 className='text-xl font-bold text-slate-950'>{nextTitle}</h3>
              {nextDescription ? (
                <p className='max-w-3xl text-sm leading-6 text-slate-600'>{nextDescription}</p>
              ) : null}
            </div>
          ) : null}

          <div className='grid gap-4 lg:grid-cols-3'>
            {nextLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>{link.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{link.description}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
