import Web3ToolsPage, { generateMetadata as generateWeb3ToolsMetadata } from '../ai-tools-for-web3/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateWeb3ToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return Web3ToolsPage({ params: { locale } });
}
