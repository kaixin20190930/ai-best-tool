import { getNoindexMetadata } from '@/lib/seo/indexing';

import AutomationComparisonPage, {
  generateMetadata as generateAutomationComparisonMetadata,
} from '../ai-tools-for-automation-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateAutomationComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{AutomationComparisonPage({ params: { locale } })}</>;
}
