// Keep aligned with 20261006_admin_publish_reviewed_task_tool_group_bilingual_gate.sql.
// Match the explicit SQL ASCII whitespace trim set and PostgreSQL Unicode code-point length.
const longEnough = (value: unknown, minimum: number) =>
  typeof value === 'string' && Array.from(value.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, '')).length >= minimum;
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// The unchanged Fit RPC uses btrim(text): trim ASCII spaces and count code points.
export function reviewedFitConditionsComplete(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (entry) =>
        object(entry) &&
        ['en', 'cn'].every((language) => {
          const text = entry[language];
          return typeof text === 'string' && Array.from(text.replace(/^ +| +$/g, '')).length >= 8;
        }),
    )
  );
}

export function reviewedToolCapabilityContentBlockers(row: {
  support_level?: unknown;
  availability?: unknown;
  plan_requirement?: unknown;
  limitations?: unknown;
}): string[] {
  const blockers: string[] = [];
  if (row.support_level == null || row.support_level === 'unknown') blockers.push('SUPPORT_LEVEL_UNKNOWN');
  if (row.availability == null || row.availability === 'unknown') blockers.push('AVAILABILITY_UNKNOWN');
  const plan = row.plan_requirement;
  if (
    !object(plan) ||
    !longEnough(plan.en, 3) ||
    !longEnough(plan.cn, 3) ||
    !Object.values(plan).every((value) => longEnough(value, 3))
  )
    blockers.push('PLAN_REQUIREMENT_BILINGUAL_STRINGS_MIN_3');
  const limits = row.limitations;
  if (!Array.isArray(limits) || limits.length === 0) {
    blockers.push('LIMITATIONS_NONEMPTY_ARRAY_REQUIRED');
  } else {
    limits.forEach((entry, index) => {
      if (!object(entry) || !longEnough(entry.en, 8) || !longEnough(entry.cn, 8)) {
        blockers.push(`LIMITATIONS_${index}_BILINGUAL_STRINGS_MIN_8`);
      }
    });
  }
  return blockers;
}
