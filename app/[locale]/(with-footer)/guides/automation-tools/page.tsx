import type { Metadata } from 'next';

import AutomationToolsPage, {
  generateMetadata as generateAutomationToolsMetadata,
} from '../ai-tools-for-automation/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateAutomationToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-automation`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return AutomationToolsPage({ params: { locale } });
}
