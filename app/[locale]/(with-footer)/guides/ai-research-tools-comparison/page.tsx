import ResearchComparisonPage, {
  generateMetadata as generateResearchComparisonMetadata,
} from '../ai-tools-for-research-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateResearchComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ResearchComparisonPage({ params: { locale } });
}
