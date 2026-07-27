import { ADSENSE_ACCOUNT_ID, ADSENSE_SCRIPT_URL } from '@/lib/adsense';

export default function GoogleAdSense() {
  return (
    <>
      <meta name='google-adsense-account' content={ADSENSE_ACCOUNT_ID} />
      <script async src={ADSENSE_SCRIPT_URL} crossOrigin='anonymous' />
    </>
  );
}
