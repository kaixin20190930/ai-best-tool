import AgentToolsComparisonPage, {
  generateMetadata as generateAgentToolsComparisonMetadata,
} from '../ai-tools-for-agents-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAgentToolsComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return AgentToolsComparisonPage({ params: { locale } });
}
