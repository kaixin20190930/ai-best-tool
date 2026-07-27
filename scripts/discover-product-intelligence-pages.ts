import { discoverProductPages } from '@/lib/services/intelligence/pageDiscovery';

async function run() {
  const websiteUrl = process.argv.slice(2).find((argument) => argument !== '--');
  if (!websiteUrl) {
    throw new Error('Usage: pnpm run intelligence:discover-pages -- https://example.com');
  }

  const result = await discoverProductPages(websiteUrl);
  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
