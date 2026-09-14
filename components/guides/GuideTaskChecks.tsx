import Link from 'next/link';

import { guideTaskChecks } from '@/lib/content/guideTaskChecks';
import { generateLocalizedPath } from '@/lib/seo/metadata';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export default function GuideTaskChecks({ slug, locale }: { slug: string; locale: string }) {
  const content = guideTaskChecks[slug];
  if (!content) return null;
  const language = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  return (
    <section data-guide-task-checks className='mt-8 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8'>
      <div>
        <h2 className='text-2xl font-bold text-slate-950'>{content.title[language]}</h2>
        <p className='mt-2 text-sm leading-6 text-slate-600'>
          {language === 'cn'
            ? '下面是你可以执行的检查步骤，并非本站的产品实测结果。'
            : 'These are checks you can run, not product test results from this site.'}
        </p>
        <ol className='mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700'>
          {content.checks.map((check) => (
            <li key={check.en}>{check[language]}</li>
          ))}
        </ol>
      </div>
      <GuideEvidencePanel locale={locale} variant='verified' evidence={content.evidence} />
      <nav
        data-guide-next
        aria-label={language === 'cn' ? '下一步' : 'Next step'}
        className='border-t border-slate-200 pt-6'
      >
        <h3 className='font-semibold text-slate-950'>{language === 'cn' ? '继续核对' : 'Continue checking'}</h3>
        <div className='mt-3 flex flex-col gap-3'>
          {content.next.map((entry) => (
            <Link
              key={entry.href}
              href={generateLocalizedPath(entry.href, locale)}
              className='text-sm font-medium text-cyan-800 underline underline-offset-4'
            >
              {entry.label[language]}
            </Link>
          ))}
        </div>
      </nav>
    </section>
  );
}
