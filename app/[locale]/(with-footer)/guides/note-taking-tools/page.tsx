import NoteTakingToolsPage, { generateMetadata as generateNoteTakingToolsMetadata } from '../ai-note-taking-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateNoteTakingToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return NoteTakingToolsPage({ params: { locale } });
}
