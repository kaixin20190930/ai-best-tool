'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Cookie Consent Banner Component
 *
 * Displays a cookie consent banner for GDPR/privacy compliance.
 * Stores user preference in localStorage.
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);

    // Enable analytics if they were disabled
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);

    // Disable analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300'>
      <div className='mx-auto max-w-7xl p-4'>
        <div className='theme-surface relative rounded-lg border border-slate-200 p-4 shadow-sm lg:p-6'>
          <button
            type='button'
            onClick={handleDecline}
            className='absolute right-2 top-2 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            aria-label='Close'
          >
            <X className='size-5' />
          </button>

          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex-1 pr-8'>
              <h3 className='mb-2 text-lg font-semibold text-slate-900'>
                🍪 We use cookies
              </h3>
              <p className='text-sm text-slate-600'>
                We use cookies and similar technologies to improve your experience, analyze site traffic,
                and personalize content. By clicking &quot;Accept&quot;, you consent to our use of cookies.
                {' '}
                <a
                  href='/privacy-policy'
                  className='text-cyan-700 underline hover:text-cyan-800'
                >
                  Learn more
                </a>
              </p>
            </div>

            <div className='flex flex-col gap-2 sm:flex-row lg:flex-shrink-0'>
              <button
                type='button'
                onClick={handleDecline}
                className='rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50'
              >
                Decline
              </button>
              <button
                type='button'
                onClick={handleAccept}
                className='rounded-lg border border-cyan-600 bg-cyan-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700'
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
