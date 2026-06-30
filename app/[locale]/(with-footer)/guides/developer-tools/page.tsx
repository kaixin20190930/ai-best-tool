import DeveloperToolsPage, {
  generateMetadata as generateDeveloperToolsMetadata,
} from '../ai-tools-for-developers/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateDeveloperToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return DeveloperToolsPage({ params: { locale } });
}
