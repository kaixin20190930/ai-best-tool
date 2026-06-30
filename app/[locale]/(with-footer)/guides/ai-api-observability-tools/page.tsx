import ApiObservabilityPage, {
  generateMetadata as generateApiObservabilityMetadata,
} from '../ai-tools-for-api-observability/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateApiObservabilityMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ApiObservabilityPage({ params: { locale } });
}
