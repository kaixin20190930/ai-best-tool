import AutomationToolsPage, {
  generateMetadata as generateAutomationToolsMetadata,
} from '../ai-tools-for-automation/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAutomationToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return AutomationToolsPage({ params: { locale } });
}
