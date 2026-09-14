import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import AgentToolsPage, { generateMetadata as generateAgentToolsMetadata } from '../ai-tools-for-agents/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateAgentToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{AgentToolsPage({ params: { locale } })}</>;
}
