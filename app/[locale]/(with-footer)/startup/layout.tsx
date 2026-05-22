import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.startup',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';
  const title = t('title');
  const description = t('description');
  const imageUrl = `${siteUrl}/images/aibesttool.png`;
  const pageUrl = `${siteUrl}/${locale}/startup`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: t('keywords'),
    alternates: {
      canonical: `/${locale}/startup`,
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
