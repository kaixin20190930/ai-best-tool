import ResearchToolsPage, { generateMetadata as generateResearchToolsMetadata } from '../ai-tools-for-research/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateResearchToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ResearchToolsPage({ params: { locale } });
}
