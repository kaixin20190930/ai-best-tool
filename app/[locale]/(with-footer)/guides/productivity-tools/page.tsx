import ProductivityToolsPage, {
  generateMetadata as generateProductivityToolsMetadata,
} from '../ai-productivity-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateProductivityToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ProductivityToolsPage({ params: { locale } });
}
