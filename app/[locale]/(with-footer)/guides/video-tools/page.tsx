import VideoToolsPage, { generateMetadata as generateVideoToolsMetadata } from '../ai-video-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateVideoToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return VideoToolsPage({ params: { locale } });
}
