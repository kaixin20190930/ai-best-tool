import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import Faq from '@/components/Faq';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.explore',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';
  const title = t('title');
  const description = t('description');
  const imageUrl = `${siteUrl}/images/aibesttool.png`;
  const pageUrl = `${siteUrl}/${locale}/explore`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: t('keywords'),
    alternates: {
      canonical: `/${locale}/explore`,
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: pageUrl,
      siteName: 'AI Best Tool',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Explore AI Tools - AI Best Tool Directory',
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
  const t = useTranslations('Explore');

  return (
    <div className='theme-page flex-y-center mx-auto w-full max-w-pc px-3'>
      <div className='my-5 flex flex-col gap-1 text-balance text-center lg:my-10 lg:gap-3'>
        <h1 className='text-2xl text-slate-900 lg:text-5xl'>{t('title')}</h1>
        <h2 className='text-xs text-slate-500 lg:text-sm'>{t('subTitle')}</h2>
      </div>
      {children}
      <Faq />
    </div>
  );
}
