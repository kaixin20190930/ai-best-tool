import { getNoindexMetadata } from '@/lib/seo/indexing';

import AgentToolsPage, { generateMetadata as generateAgentToolsMetadata } from '../ai-tools-for-agents/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateAgentToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{AgentToolsPage({ params: { locale } })}</>;
}
