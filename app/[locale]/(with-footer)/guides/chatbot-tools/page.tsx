import ChatbotToolsPage, { generateMetadata as generateChatbotToolsMetadata } from '../ai-chatbot-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateChatbotToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ChatbotToolsPage({ params: { locale } });
}
