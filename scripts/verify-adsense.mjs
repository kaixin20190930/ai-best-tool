import { readFile } from 'node:fs/promises';
import path from 'node:path';

const accountId = 'ca-pub-5252543031076112';
const publisherId = 'pub-5252543031076112';
const adsTxtContent = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
const root = process.cwd();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

async function verify() {
  const [configSource, publicAdsTxt, routeSource, componentSource, layoutSource] = await Promise.all([
    read('lib/adsense.ts'),
    read('public/ads.txt'),
    read('app/ads.txt/route.ts'),
    read('components/ad/GoogleAdSense.tsx'),
    read('app/[locale]/layout.tsx'),
  ]);

  const checks = [
    {
      ok:
        configSource.includes(`ADSENSE_PUBLISHER_ID = '${publisherId}'`) &&
        configSource.includes('ADSENSE_ADS_TXT_CONTENT') &&
        configSource.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),
      message: 'lib/adsense.ts must contain the canonical publisher, ads.txt, and script configuration',
    },
    {
      ok: publicAdsTxt === adsTxtContent,
      message: 'public/ads.txt must match the canonical AdSense record',
    },
    {
      ok: routeSource.includes('ADSENSE_ADS_TXT_CONTENT'),
      message: '/ads.txt route must use the canonical AdSense record',
    },
    {
      ok:
        componentSource.includes('ADSENSE_ACCOUNT_ID') &&
        componentSource.includes('ADSENSE_SCRIPT_URL') &&
        componentSource.includes('google-adsense-account'),
      message: 'GoogleAdSense component must include the account meta and script',
    },
    {
      ok:
        layoutSource.includes("from '@/components/ad/GoogleAdSense'") &&
        layoutSource.includes('<GoogleAdSense />'),
      message: 'root locale layout must render the standard GoogleAdSense component',
    },
    {
      ok: accountId === `ca-${publisherId}`,
      message: 'AdSense account and publisher IDs do not match',
    },
  ];

  const failures = checks.filter((check) => !check.ok);
  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`AdSense verification failed: ${failure.message}`));
    process.exitCode = 1;
    return;
  }

  console.log(`AdSense verification passed for ${accountId}`);
}

void verify();
