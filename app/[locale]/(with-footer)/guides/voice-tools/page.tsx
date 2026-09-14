import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import VoiceToolsPage, { generateMetadata as generateVoiceToolsMetadata } from '../ai-tools-for-voice/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateVoiceToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{VoiceToolsPage({ params: { locale } })}</>;
}
