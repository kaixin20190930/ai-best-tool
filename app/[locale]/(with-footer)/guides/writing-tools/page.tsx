import WritingToolsPage, { generateMetadata as generateWritingToolsMetadata } from '../ai-writing-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateWritingToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return WritingToolsPage({ params: { locale } });
}
