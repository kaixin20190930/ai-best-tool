#!/usr/bin/env tsx
/**
 * Distribution migration rehearsal.
 *
 * Verifies that the distribution / target / review tables and key columns
 * are present in the current database. This is a dry-run style check for REL-011.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase configuration. Need NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type MigrationCheck = {
  name: string;
  table: string;
  columns: string;
  required: boolean;
};

type CheckResult = {
  name: string;
  table: string;
  passed: boolean;
  message: string;
  count: number | null;
};

const checks: MigrationCheck[] = [
  { name: 'Distribution entitlements', table: 'distribution_entitlements', columns: 'user_id, plan, status, source, current_period_end', required: true },
  { name: 'Distribution workspaces', table: 'distribution_workspaces', columns: 'id, owner_id, name, slug, kind', required: true },
  { name: 'Distribution projects', table: 'distribution_projects', columns: 'id, workspace_id, owner_id, name, website_url, description, status', required: true },
  { name: 'Distribution channels', table: 'distribution_channels', columns: 'id, channel_key, name, channel_type, instructions, requires_manual_action, is_active, sort_order', required: true },
  { name: 'Distribution tasks', table: 'distribution_tasks', columns: 'id, project_id, owner_id, channel_id, title, task_type, status, priority, due_date, instructions, notes', required: true },
  { name: 'Distribution results', table: 'distribution_results', columns: 'id, task_id, owner_id, target_url, live_url, link_status, checked_at, notes', required: true },
  { name: 'Distribution channel templates', table: 'distribution_channel_templates', columns: 'id, channel_id, title_template, description_template, max_title_length, max_description_length, required_fields', required: true },
  { name: 'Distribution links', table: 'distribution_links', columns: 'id, project_id, owner_id, channel_id, name, destination_url, full_url, utm_source, utm_medium, utm_campaign, utm_content', required: true },
  { name: 'Distribution attribution events', table: 'distribution_attribution_events', columns: 'id, event_type, session_id, user_id, project_id, channel_id, link_id, metadata', required: true },
  { name: 'Distribution targets', table: 'distribution_targets', columns: 'id, channel_id, name, homepage_url, submission_url, registration_url, pricing_url, target_status, requires_account, requires_payment, requires_captcha, requires_backlink, editorial_review, confidence', required: true },
  { name: 'Target snapshots', table: 'distribution_target_snapshots', columns: 'id, target_id, page_url, http_status, content_hash, page_title, visible_rules, pricing_info, form_fields, requires_account, requires_captcha', required: true },
  { name: 'Target requirements', table: 'distribution_target_requirements', columns: 'id, target_id, source_snapshot_id, required_field, field_type, character_limit, allowed_values, required_asset, rule_text, source_url, confidence', required: true },
];

async function runCheck(check: MigrationCheck): Promise<CheckResult> {
  const { count, error } = await supabase
    .from(check.table)
    .select(check.columns, { count: 'exact', head: true })
    .limit(1);

  if (error) {
    return {
      name: check.name,
      table: check.table,
      passed: false,
      message: error.message,
      count: null,
    };
  }

  return {
    name: check.name,
    table: check.table,
    passed: true,
    message: check.required ? 'Table and columns are available.' : 'Optional table is available.',
    count: count ?? 0,
  };
}

async function main() {
  console.log('🔎 Distribution migration rehearsal');
  const results = await Promise.all(checks.map((check) => runCheck(check)));
  const failed = results.filter((result) => !result.passed);

  console.table(
    results.map((result) => ({
      table: result.table,
      passed: result.passed ? 'yes' : 'no',
      count: result.count ?? '-',
      message: result.message,
    })),
  );

  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} migration check(s) failed.`);
    process.exit(1);
  }

  console.log(`\n✅ ${results.length} migration checks passed.`);
}

main().catch((error) => {
  console.error('❌ Distribution migration rehearsal failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
