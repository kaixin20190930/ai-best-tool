import { loadEnvConfig } from '@next/env';

import { getDecisionEvidenceBundle } from '@/lib/services/decision/evidence';

loadEnvConfig(process.cwd());

async function verifyDecisionEvidenceReadLayer() {
  const result = await getDecisionEvidenceBundle(['00000000-0000-0000-0000-000000000000']);
  if (!result.available) {
    throw new Error(`${result.code}: ${result.message}`);
  }
  if (result.profiles.length || result.taskFits.length || result.relationships.length) {
    throw new Error('The empty-tool smoke unexpectedly returned decision records.');
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        productionSchemaReadable: true,
        emptyResultHandled: true,
        evidenceFailureIsExplicit: true,
      },
      null,
      2,
    ),
  );
}

verifyDecisionEvidenceReadLayer().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
