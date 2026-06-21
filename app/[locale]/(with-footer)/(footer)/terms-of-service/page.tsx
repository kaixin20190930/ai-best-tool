import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';

import { Link } from '@/app/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms of Service | AI Best Tool',
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function Page() {
  const t = useTranslations('FooterNavigation.termsConditions');

  return (
    <div className='theme-page px-4 py-8 lg:px-6 lg:py-10'>
      <div className='theme-surface prose mx-auto max-w-4xl rounded-lg p-6 text-slate-700 prose-headings:text-slate-950 prose-a:text-cyan-700 lg:p-8'>
        <h1>{t('1-h1')}</h1>
        <p>{t('1-p')}</p>

        <h2>{t('2-h2')}</h2>
        <ul>
          <li>{t('2-p')}</li>
        </ul>

        <h2>{t('3-h2')}</h2>
        <ul>
          <li>{t('3-p')}</li>
        </ul>

        <h2>{t('4-h2')}</h2>
        <ul>
          <li>
            {t('4-p')}{' '}
            <Link href='/terms-of-service' className='font-bold text-cyan-700 hover:text-cyan-800'>
              {t('terms-of-service')}
            </Link>
          </li>
        </ul>

        <h2>{t('5-h2')}</h2>
        <ul>
          <li>{t('5-p')}</li>
        </ul>

        <h2>{t('6-h2')}</h2>
        <ul>
          <li>{t('6-p')}</li>
        </ul>

        <h2>{t('7-h2')}</h2>
        <ul>
          <li>{t('7-p')}</li>
        </ul>

        <p>{t('last-p')}</p>
      </div>
    </div>
  );
}
