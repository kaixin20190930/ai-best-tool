import { persistDistributionTargetReview } from '@/lib/services/intelligence/targetPersistence';

async function run() {
  const args = process.argv.slice(2).filter((argument) => argument !== '--');
  const targetId = args[0];
  const homepageUrl = args.find((argument) => /^https?:\/\//i.test(argument));
  const dryRun = process.argv.includes('--dry-run');

  if (!targetId) {
    throw new Error('Usage: pnpm run distribution:review-target -- <target-id> [https://example.com] [--dry-run]');
  }

  const result = await persistDistributionTargetReview({
    targetId,
    homepageUrl,
    dryRun,
  });
  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
