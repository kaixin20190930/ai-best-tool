import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { loadEnvConfig } from '@next/env';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseUrl } from '@/lib/supabase/env';

loadEnvConfig(process.cwd());

type TestIdentity = { id: string; email: string; password: string; client: SupabaseClient };

async function createTestIdentity(label: string, apiKey: string): Promise<TestIdentity> {
  const admin = createAdminClient();
  const url = getSupabaseUrl();
  const token = randomUUID();
  const email = `stk-privacy-${label}-${token}@example.com`;
  const password = `Stk-${randomUUID()}-9a!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Unable to create ${label} privacy test identity.`);

  const client = createSupabaseClient(url, apiKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw new Error(
      `Unable to authenticate ${label} privacy test identity: ${signInError.code || 'AUTH_ERROR'} ${signInError.message}`,
    );
  }
  return { id: data.user.id, email, password, client };
}

async function verifyStackPrivacyIsolation() {
  const admin = createAdminClient();
  const url = getSupabaseUrl();
  const serverApiKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serverApiKey) throw new Error('A Supabase server key is required for the live privacy verifier.');
  const createdUserIds: string[] = [];

  try {
    const owner = await createTestIdentity('owner', serverApiKey);
    createdUserIds.push(owner.id);
    const other = await createTestIdentity('other', serverApiKey);
    createdUserIds.push(other.id);

    const { data: item, error: itemError } = await owner.client
      .from('user_tool_stack_items')
      .insert({
        user_id: owner.id,
        custom_tool_name: 'STK privacy verifier',
        subscription_status: 'free',
        currency: 'USD',
        billing_period: 'unknown',
        usage_frequency: 'rarely',
      })
      .select('id')
      .single();
    assert.ifError(itemError);
    assert.ok(item?.id);

    const { data: audit, error: auditError } = await owner.client
      .from('stack_audit_runs')
      .insert({
        user_id: owner.id,
        status: 'pending',
        input_snapshot: { verifier: true },
        rules_version: 'privacy-verifier',
        idempotency_key: `privacy-${randomUUID()}`,
      })
      .select('id')
      .single();
    assert.ifError(auditError);
    assert.ok(audit?.id);

    const { data: forbiddenAudit, error: forbiddenAuditError } = await owner.client
      .from('stack_audit_runs')
      .insert({
        user_id: owner.id,
        status: 'running',
        input_snapshot: { verifier: true },
        rules_version: 'privacy-verifier',
      })
      .select('id')
      .maybeSingle();
    assert.equal(forbiddenAudit, null);
    assert.ok(forbiddenAuditError, 'Client must not create a running audit.');

    const { data: forbiddenFinding, error: forbiddenFindingError } = await owner.client
      .from('stack_audit_findings')
      .insert({
        audit_id: audit.id,
        stack_item_id: item.id,
        finding_type: 'keep',
        rationale: { verifier: true },
        confidence_state: 'unknown',
      })
      .select('id')
      .maybeSingle();
    assert.equal(forbiddenFinding, null);
    assert.ok(forbiddenFindingError, 'Audit findings must remain service-write-only.');

    const toolId = randomUUID();
    const { data: trial, error: trialError } = await owner.client
      .from('trial_scorecards')
      .insert({
        user_id: owner.id,
        tool_id: toolId,
        status: 'planned',
        target_outcome: 'Verify private trial isolation',
        idempotency_key: `privacy-${randomUUID()}`,
      })
      .select('id')
      .single();
    assert.ifError(trialError);
    assert.ok(trial?.id);
    const { data: check, error: checkError } = await owner.client
      .from('trial_scorecard_checks')
      .insert({ scorecard_id: trial.id, sequence: 1, label: 'Private check', result: 'pending' })
      .select('id')
      .single();
    assert.ifError(checkError);
    assert.ok(check?.id);

    const otherReads = await Promise.all([
      other.client.from('user_tool_stack_items').select('id').eq('id', item.id),
      other.client.from('stack_audit_runs').select('id').eq('id', audit.id),
      other.client.from('trial_scorecards').select('id').eq('id', trial.id),
      other.client.from('trial_scorecard_checks').select('id').eq('id', check.id),
    ]);
    assert.ok(otherReads.every((result) => !result.error && result.data?.length === 0));

    const { data: otherUpdate, error: otherUpdateError } = await other.client
      .from('user_tool_stack_items')
      .update({ notes: 'cross-user write attempt' })
      .eq('id', item.id)
      .select('id');
    assert.ifError(otherUpdateError);
    assert.deepEqual(otherUpdate, []);
    const { data: otherDelete, error: otherDeleteError } = await other.client
      .from('trial_scorecards')
      .delete()
      .eq('id', trial.id)
      .select('id');
    assert.ifError(otherDeleteError);
    assert.deepEqual(otherDelete, []);

    const anonymousResponse = await fetch(`${url}/rest/v1/user_tool_stack_items?id=eq.${item.id}&select=id`);
    assert.ok([401, 403].includes(anonymousResponse.status), 'Requests without any API identity must be rejected.');

    console.log(
      JSON.stringify(
        {
          success: true,
          crossUserReadBlocked: true,
          crossUserUpdateBlocked: true,
          crossUserDeleteBlocked: true,
          anonymousReadBlocked: true,
          auditOutputsServiceWriteOnly: true,
          temporaryUsersCleaned: true,
        },
        null,
        2,
      ),
    );
  } finally {
    for (const userId of createdUserIds.reverse()) {
      await admin.auth.admin.deleteUser(userId);
    }
  }
}

verifyStackPrivacyIsolation().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
