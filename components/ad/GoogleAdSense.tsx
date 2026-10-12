'use client';

import { usePathname } from 'next/navigation';
import { ADSENSE_ACCOUNT_ID, ADSENSE_SCRIPT_URL } from '@/lib/adsense';

export default function GoogleAdSense() {
  const pathname = usePathname() || '';
  const sensitiveDecisionPage = /(?:^|\/)ai\/[^/]+\/?$/.test(pathname) ||
    /(?:^|\/)guides\/[^/]*comparison\/?$/.test(pathname);

  return (
    <>
      <meta name='google-adsense-account' content={ADSENSE_ACCOUNT_ID} />
      {!sensitiveDecisionPage && <script async src={ADSENSE_SCRIPT_URL} crossOrigin='anonymous' />}
    </>
  );
}
