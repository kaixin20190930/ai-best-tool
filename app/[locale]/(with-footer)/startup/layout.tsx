import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.startup',
  });

  const title = t('title');
  const description = t('description');
  const imageUrl = `${BASE_URL}/images/aibesttool.png`;
  const pageUrl = `${BASE_URL}/${locale}/startup`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords: t('keywords'),
    ...getNoindexMetadata(),
    alternates: {
      canonical: `/${locale}/startup`,
    },
    openGraph: {
      type: 'website',
      locale,
      url: pageUrl,
      siteName: 'AI Best Tool',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Startup Launch Sites - AI Best Tool Directory',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@aibesttool',
      creator: '@aibesttool',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className='mx-auto w-full max-w-pc'>{children}</div>;
}
