import ImageToolsPage, { generateMetadata as generateImageToolsMetadata } from '../ai-image-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateImageToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ImageToolsPage({ params: { locale } });
}
