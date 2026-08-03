type DatabaseConnectionCandidate = {
  name: string;
  value: string | undefined;
};

export function getDatabaseConnectionString(): string {
  const candidates: DatabaseConnectionCandidate[] = [
    { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL },
    { name: 'POSTGRES_PRISMA_URL', value: process.env.POSTGRES_PRISMA_URL },
    { name: 'DATABASE_URL_UNPOOLED', value: process.env.DATABASE_URL_UNPOOLED },
    { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING },
    // Keep the legacy variable last because older deployments may contain a stale placeholder.
    { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
  ];

  const selected = candidates.find(({ value }) => {
    if (!value) return false;
    try {
      const parsed = new URL(value);
      return (
        ['postgres:', 'postgresql:'].includes(parsed.protocol) &&
        Boolean(parsed.hostname) &&
        parsed.hostname !== 'base'
      );
    } catch {
      return false;
    }
  });

  if (!selected?.value) {
    throw new Error('No valid Postgres connection URL is configured.');
  }

  return selected.value;
}
