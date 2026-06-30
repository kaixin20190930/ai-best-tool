import VoiceToolsPage, { generateMetadata as generateVoiceToolsMetadata } from '../ai-tools-for-voice/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateVoiceToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return VoiceToolsPage({ params: { locale } });
}
