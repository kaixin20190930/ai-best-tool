import type { Metadata } from 'next';

import AgentToolsPage, { generateMetadata as generateAgentToolsMetadata } from '../ai-tools-for-agents/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateAgentToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-agents`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return AgentToolsPage({ params: { locale } });
}
