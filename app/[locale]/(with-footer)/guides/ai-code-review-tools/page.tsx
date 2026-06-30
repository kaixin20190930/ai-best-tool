import CodeReviewPage, { generateMetadata as generateCodeReviewMetadata } from '../ai-tools-for-code-review/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateCodeReviewMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return CodeReviewPage({ params: { locale } });
}
