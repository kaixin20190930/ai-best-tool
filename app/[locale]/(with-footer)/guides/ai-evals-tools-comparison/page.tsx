import EvalsComparisonPage, {
  generateMetadata as generateEvalsComparisonMetadata,
} from '../ai-tools-for-evals-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateEvalsComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return EvalsComparisonPage({ params: { locale } });
}
