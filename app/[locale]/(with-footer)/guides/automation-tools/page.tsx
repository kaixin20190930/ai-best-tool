import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import AutomationToolsPage, {
  generateMetadata as generateAutomationToolsMetadata,
} from '../ai-tools-for-automation/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateAutomationToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{AutomationToolsPage({ params: { locale } })}</>;
}
