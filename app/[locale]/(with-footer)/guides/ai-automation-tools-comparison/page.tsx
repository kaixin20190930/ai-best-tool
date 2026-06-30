import AutomationComparisonPage, {
  generateMetadata as generateAutomationComparisonMetadata,
} from '../ai-tools-for-automation-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAutomationComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return AutomationComparisonPage({ params: { locale } });
}
