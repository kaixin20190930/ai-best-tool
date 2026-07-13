import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import ChatbotToolsPage, { generateMetadata as generateChatbotToolsMetadata } from '../ai-chatbot-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateChatbotToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-chatbot-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ChatbotToolsPage({ params: { locale } });
}
