#!/usr/bin/env tsx
/**
 * Distribution migration rehearsal.
 *
 * Verifies that the distribution / target / review tables and key columns
 * are present in the current database. This is a dry-run style check for REL-011.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    '❌ Missing Supabase configuration. Need NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY.',
  );
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
  {
    name: 'Distribution entitlements',
    table: 'distribution_entitlements',
    columns: 'user_id, plan, status, source, current_period_end',
    required: true,
  },
  {
    name: 'Distribution workspaces',
    table: 'distribution_workspaces',
    columns: 'id, owner_id, name, slug, kind',
    required: true,
  },
  {
    name: 'Distribution projects',
    table: 'distribution_projects',
    columns:
      'id, workspace_id, owner_id, name, website_url, description, status, intelligence_profile_id, primary_goal, weekly_capacity, budget_preference, target_markets, onboarding_status, facts_confirmed_at',
    required: true,
  },
  {
    name: 'Distribution channels',
    table: 'distribution_channels',
    columns: 'id, channel_key, name, channel_type, instructions, requires_manual_action, is_active, sort_order',
    required: true,
  },
  {
    name: 'Distribution tasks',
    table: 'distribution_tasks',
    columns:
      'id, project_id, owner_id, channel_id, target_id, project_target_id, distribution_link_id, title, task_type, status, priority, due_date, instructions, notes, estimated_minutes, blocked_reason, submitted_at, next_action_at, completed_at, assigned_to',
    required: true,
  },
  {
    name: 'Distribution results',
    table: 'distribution_results',
    columns: 'id, task_id, owner_id, target_url, live_url, link_status, checked_at, notes',
    required: true,
  },
  {
    name: 'Distribution channel templates',
    table: 'distribution_channel_templates',
    columns:
      'id, channel_id, title_template, description_template, max_title_length, max_description_length, required_fields',
    required: true,
  },
  {
    name: 'Distribution links',
    table: 'distribution_links',
    columns:
      'id, project_id, owner_id, channel_id, name, destination_url, full_url, utm_source, utm_medium, utm_campaign, utm_content',
    required: true,
  },
  {
    name: 'Distribution attribution events',
    table: 'distribution_attribution_events',
    columns: 'id, event_type, session_id, user_id, project_id, channel_id, link_id, metadata',
    required: true,
  },
  {
    name: 'Distribution targets',
    table: 'distribution_targets',
    columns:
      'id, channel_id, name, homepage_url, submission_url, registration_url, pricing_url, target_status, requires_account, requires_payment, requires_captcha, requires_backlink, editorial_review, confidence',
    required: true,
  },
  {
    name: 'Target snapshots',
    table: 'distribution_target_snapshots',
    columns:
      'id, target_id, page_url, http_status, content_hash, page_title, visible_rules, pricing_info, form_fields, requires_account, requires_captcha',
    required: true,
  },
  {
    name: 'Target requirements',
    table: 'distribution_target_requirements',
    columns:
      'id, target_id, source_snapshot_id, required_field, field_type, character_limit, allowed_values, required_asset, rule_text, source_url, confidence',
    required: true,
  },
  {
    name: 'Project assets',
    table: 'distribution_project_assets',
    columns:
      'id, project_id, owner_id, profile_asset_id, asset_type, name, source_url, stored_url, width, height, status, verified_at, metadata',
    required: true,
  },
  {
    name: 'Project targets',
    table: 'distribution_project_targets',
    columns:
      'id, project_id, target_id, owner_id, match_score, match_reasons, opportunity_status, estimated_minutes, estimated_cost, selected_at, skipped_reason, last_submission_at, next_action_at',
    required: true,
  },
  {
    name: 'Distribution packages',
    table: 'distribution_packages',
    columns:
      'id, project_id, target_id, task_id, owner_id, profile_version, target_rule_version, fields_json, asset_requirements_json, preflight_json, generation_status, approved_at',
    required: true,
  },
  {
    name: 'Distribution task events',
    table: 'distribution_task_events',
    columns: 'id, task_id, project_id, owner_id, event_type, from_status, to_status, reason, metadata, created_at',
    required: true,
  },
  {
    name: 'Distribution reminders',
    table: 'distribution_reminders',
    columns:
      'id, task_id, project_id, owner_id, reminder_type, scheduled_at, status, delivery_channel, sent_at, resolved_at, metadata',
    required: true,
  },
];

async function runCheck(check: MigrationCheck): Promise<CheckResult> {
  let count: number | null = null;
  let lastError: { message: string } | null = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const result = await supabase.from(check.table).select(check.columns, { count: 'exact', head: true }).limit(1);
    count = result.count;
    lastError = result.error;
    if (!lastError) break;
    if (!lastError.message.includes('fetch failed') || attempt === 3) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }

  if (lastError) {
    return {
      name: check.name,
      table: check.table,
      passed: false,
      message: lastError.message,
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
  const results: CheckResult[] = [];
  for (const check of checks) {
    results.push(await runCheck(check));
  }
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
