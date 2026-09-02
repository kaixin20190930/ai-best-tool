import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.startup',
  });

  const title = t('title');
  const description = t('description');
  return buildLocalizedPageMetadata({
    locale,
    path: '/startup',
    title,
    description,
    keywords: t('keywords'),
    image: '/images/aibesttool.png',
    indexable: false,
    baseUrl: BASE_URL,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className='mx-auto w-full max-w-pc'>{children}</div>;
}
