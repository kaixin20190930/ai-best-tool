import { analyzeDistributionTarget } from '@/lib/services/intelligence/targetAnalyzer';
import { discoverDistributionTargetPages } from '@/lib/services/intelligence/targetDiscovery';

async function run() {
  const homepageUrl = process.argv.slice(2).find((argument) => argument !== '--');
  if (!homepageUrl) {
    throw new Error('Usage: pnpm run distribution:analyze-target -- https://example.com');
  }

  const discovery = await discoverDistributionTargetPages(homepageUrl);
  const analysis = analyzeDistributionTarget(discovery);
  console.log(JSON.stringify({ discovery, analysis }, null, 2));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
