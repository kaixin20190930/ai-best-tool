import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import Faq from '@/components/Faq';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.explore',
  });

  const title = t('title');
  const description = t('description');

  return buildLocalizedPageMetadata({
    locale,
    path: '/explore',
    title,
    description,
    keywords: t('keywords'),
    image: '/images/aibesttool.png',
    baseUrl: BASE_URL,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='theme-page flex-y-center mx-auto w-full max-w-pc px-3'>
      {children}
      <Faq />
    </div>
  );
}
