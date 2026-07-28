import { discoverDistributionTargetPages } from '@/lib/services/intelligence/targetDiscovery';

async function run() {
  const homepageUrl = process.argv.slice(2).find((argument) => argument !== '--');
  if (!homepageUrl) {
    throw new Error('Usage: pnpm run distribution:discover-target -- https://example.com');
  }

  const result = await discoverDistributionTargetPages(homepageUrl);
  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
