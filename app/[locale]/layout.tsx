import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Viewport } from 'next';

import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/home/Navigation';
import { createClient } from '@/lib/supabase/server';

import './globals.css';

import { Suspense } from 'react';

import GoogleAdScript from '@/components/ad/GoogleAdScript';
import SeoScript from '@/components/seo/SeoScript';
import VercelAnalytics from '@/components/analytics/VercelAnalytics';
import CookieConsent from '@/components/CookieConsent';

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

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  
  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
    >
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
          <Navigation user={user} />
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </NextIntlClientProvider>
        <SeoScript />
        <GoogleAdScript />
      </body>
    </html>
  );
}
