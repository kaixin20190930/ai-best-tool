import CodeReviewComparisonPage, {
  generateMetadata as generateCodeReviewComparisonMetadata,
} from '../ai-tools-for-code-review-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateCodeReviewComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return CodeReviewComparisonPage({ params: { locale } });
}
