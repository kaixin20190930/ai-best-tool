import { getNoindexMetadata } from '@/lib/seo/indexing';

import AgentToolsComparisonPage, {
  generateMetadata as generateAgentToolsComparisonMetadata,
} from '../ai-tools-for-agents-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateAgentToolsComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{AgentToolsComparisonPage({ params: { locale } })}</>;
}
