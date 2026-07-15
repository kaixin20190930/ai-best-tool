import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { isAdminUser } from '@/lib/auth/admin';
import { getNoindexMetadata, isIndexableLocale } from '@/lib/seo/indexing';
import { getSupabaseConfig } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/home/Navigation';

import './globals.css';

import { Suspense } from 'react';

import GoogleAdScript from '@/components/ad/GoogleAdScript';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import SeoScript from '@/components/seo/SeoScript';

import Loading from './loading';

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(197 100% 98%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(197 100% 98%)' },
  ],
};

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!isIndexableLocale(locale)) {
    return {
      ...getNoindexMetadata(),
    };
  }

  return {};
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  // Get current user when Supabase is configured; otherwise render a guest session.
  let user = null;
  try {
    getSupabaseConfig();
    const supabase = await createClient();
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  } catch {
    user = null;
  }
  const isAdmin = isAdminUser(user);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <SeoScript />
      </head>
      <body className='theme-page relative mx-auto flex min-h-screen flex-col text-slate-800'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Toaster
            position='top-center'
            toastOptions={{
              classNames: {
                error: 'bg-red-400',
                success: 'text-green-400',
                warning: 'text-yellow-400',
                info: 'bg-cyan-400',
              },
            }}
          />
          <Navigation user={user} isAdmin={isAdmin} />
          <PageViewTracker />
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </NextIntlClientProvider>
        <GoogleAdScript />
      </body>
    </html>
  );
}
