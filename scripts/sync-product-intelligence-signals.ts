import { loadEnvConfig } from '@next/env';

import { syncProductIntelligenceSignals } from '@/lib/services/intelligence/signalPersistence';

loadEnvConfig(process.cwd());

syncProductIntelligenceSignals()
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
