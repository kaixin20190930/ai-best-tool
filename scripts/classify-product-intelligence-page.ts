import { extractProductEvidence } from '@/lib/services/intelligence/evidenceExtractor';
import { classifyProductPage } from '@/lib/services/intelligence/pageClassifier';
import { safeFetchText } from '@/lib/services/intelligence/safeFetch';

async function run() {
  const pageUrl = process.argv.slice(2).find((argument) => argument !== '--');
  if (!pageUrl) {
    throw new Error('Usage: pnpm run intelligence:classify-page -- https://example.com/pricing');
  }

  const page = await safeFetchText(pageUrl);
  const result = classifyProductPage({ url: page.finalUrl, html: page.body });
  const evidence = extractProductEvidence({
    url: page.finalUrl,
    html: page.body,
    pageType: result.pageType,
  });
  console.log(
    JSON.stringify(
      {
        requestedUrl: pageUrl,
        finalUrl: page.finalUrl,
        status: page.status,
        classification: result,
        evidence,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
