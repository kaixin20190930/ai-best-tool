import { useTranslations } from 'next-intl';

import { Link } from '@/app/navigation';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <html>
      <body>
        <div className='theme-page flex min-h-screen flex-col items-center justify-center gap-4 p-4'>
          <h1 className='text-4xl font-bold text-slate-900'>{t('title')}</h1>
          <Link href='/' className='rounded-lg bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700'>
            {t('goHome')}
          </Link>
        </div>
      </body>
    </html>
  );
}
