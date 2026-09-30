import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { Client } from 'pg';

import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';
import { createAdminClient } from '../lib/supabase/admin';

loadEnvConfig(process.cwd());

const toolId = 'cec78907-e2a1-4eb7-853a-a58334026280';
const taskId = '527fe8b7-c171-4c50-ab1f-9404d7536e7c';
const identitySource = 'https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/';
const mode = process.argv[2] || '--baseline';
assert.ok(['--baseline', '--identity', '--current'].includes(mode), 'Use --baseline, --identity, or --current');

async function read(label: string, request: PromiseLike<{ data: any[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function readWhen(
  label: string,
  count: number,
  request: () => PromiseLike<{ data: any[] | null; error: { message: string } | null }>,
) {
  if (!count) return [];
  return read(label, request());
}

function reviewedCurrent(row: any, now: number) {
  return (
    Boolean(row.reviewed_by) &&
    Number.isFinite(Date.parse(row.reviewed_at)) &&
    Date.parse(row.reviewed_at) <= now &&
    Date.parse(row.review_due_at) > now
  );
}

async function main() {
  const neon = new Client({ connectionString: getDatabaseConnectionString() });
  await neon.connect();
  let rows: any[];
  try {
    await neon.query('BEGIN READ ONLY');
    rows = (
      await neon.query(
        `SELECT id, name, title, content, detail, url, features, status, page_quality_status,
              next_review_date::text AS next_review_date, updated_at::text AS updated_at,
              md5(to_jsonb(t)::text) AS row_md5
       FROM tools t
       WHERE id = $1 OR lower(name) IN ('notebooklm', 'gemini-notebook', 'gemini notebook')
          OR lower(url) ~ '^https?://(notebooklm|notebook)\\.google\\.com([/?#]|$)'
          OR lower(title::text) LIKE '%gemini notebook%'
       ORDER BY id`,
        [toolId],
      )
    ).rows;
    await neon.query('ROLLBACK');
  } finally {
    await neon.end();
  }

  assert.equal(rows.length, 1, 'A second Notebook entity or domain match exists');
  const tool = rows[0];
  assert.equal(tool.id, toolId, 'Existing Notebook entity ID changed');
  assert.equal(tool.name, 'notebooklm', 'Historical slug must remain notebooklm');
  assert.equal(tool.status, 'published');
  assert.equal(tool.page_quality_status, 'monitor', 'Index gate changed');
  const indexDecision = getToolIndexDecision({
    status: tool.status,
    pageQualityStatus: tool.page_quality_status,
    categoryId: null,
    imageUrl: null,
    thumbnailUrl: null,
    content: tool.content,
    detail: tool.detail,
    pricing: null,
    tags: null,
  });
  assert.equal(indexDecision.indexable, false, 'Index state changed');
  assert.equal(indexDecision.reason, 'indexing_paused', 'Sitemap/noindex gate changed');

  const db = createAdminClient();
  const [profiles, decisionProfiles, capabilities, fits, tasks, capabilityDefinitions] = await Promise.all([
    read(
      'intelligence profiles',
      db
        .from('product_intelligence_profiles')
        .select(
          'id,owner_type,owner_id,canonical_domain,product_name,profile_status,last_verified_at,next_review_at,metadata',
        )
        .eq('owner_type', 'tool')
        .eq('owner_id', toolId),
    ),
    read(
      'decision profiles',
      db
        .from('tool_decision_profiles')
        .select('tool_id,editorial_status,reviewed_at,review_due_at,reviewed_by,decision_summary,watch_outs')
        .eq('tool_id', toolId),
    ),
    read(
      'tool capabilities',
      db
        .from('tool_capabilities')
        .select('id,tool_id,capability_id,status,support_level,availability,reviewed_at,review_due_at,reviewed_by')
        .eq('tool_id', toolId),
    ),
    read(
      'task fits',
      db
        .from('tool_task_fits')
        .select('id,tool_id,task_id,status,fit_level,reviewed_at,review_due_at,reviewed_by')
        .eq('tool_id', toolId),
    ),
    read('research task', db.from('decision_tasks').select('id,slug,status').eq('id', taskId)),
    read(
      'research capabilities',
      db
        .from('decision_capabilities')
        .select('id,slug,status')
        .in('slug', ['research-discovery', 'citation-traceability']),
    ),
  ]);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].slug, 'research-with-citations');
  assert.deepEqual(capabilityDefinitions.map((row) => row.slug).sort(), [
    'citation-traceability',
    'research-discovery',
  ]);
  assert.ok(profiles.length <= 1, 'Multiple intelligence profiles for Notebook');
  assert.ok(decisionProfiles.length <= 1, 'Multiple Decision profiles for Notebook');
  const profile = profiles[0];
  let sources: any[] = [];
  let claims: any[] = [];
  if (profile) {
    [sources, claims] = await Promise.all([
      read(
        'sources',
        db
          .from('product_intelligence_sources')
          .select('id,profile_id,url,source_type,fetch_status,last_verified_at')
          .eq('profile_id', profile.id),
      ),
      read(
        'claims',
        db
          .from('product_intelligence_claims')
          .select(
            'id,profile_id,source_id,source_url,source_type,claim_key,verification_status,conflict_status,invalidated_at,verified_at,verified_by,review_due_at,expires_at',
          )
          .eq('profile_id', profile.id),
      ),
    ]);
  }
  const relationIds = capabilities.map((row) => row.id);
  const fitIds = fits.map((row) => row.id);
  const [capabilityLinks, fitLinks, decisionLinks] = await Promise.all([
    readWhen('capability links', relationIds.length, () =>
      db
        .from('tool_capability_claims')
        .select('tool_capability_id,claim_id,purpose')
        .in('tool_capability_id', relationIds),
    ),
    readWhen('fit links', fitIds.length, () =>
      db.from('tool_task_fit_claims').select('fit_id,claim_id,purpose').in('fit_id', fitIds),
    ),
    readWhen('decision links', decisionProfiles.length, () =>
      db.from('tool_decision_profile_claims').select('tool_id,claim_id,purpose').eq('tool_id', toolId),
    ),
  ]);
  const now = Date.now();
  const claimById = new Map(claims.map((row) => [row.id, row]));
  const sourceById = new Map(sources.map((row) => [row.id, row]));
  for (const link of [...capabilityLinks, ...fitLinks, ...decisionLinks]) {
    const claim = claimById.get(link.claim_id);
    assert.ok(claim && claim.profile_id === profile?.id, 'Cross-owner or missing evidence link');
    assert.equal(claim.verification_status, 'verified');
    assert.equal(claim.conflict_status, 'none');
    assert.equal(claim.invalidated_at, null);
    assert.ok(claim.verified_by && Date.parse(claim.verified_at) <= now);
    assert.ok(Date.parse(claim.review_due_at) > now, 'Evidence review expired');
    assert.ok(!claim.expires_at || Date.parse(claim.expires_at) > now, 'Evidence expired');
    const source = sourceById.get(claim.source_id);
    assert.ok(source && source.profile_id === profile?.id && source.url === claim.source_url);
    assert.equal(source.source_type, 'official');
  }
  for (const row of [...capabilities, ...fits]) {
    if (row.status === 'reviewed' || row.status === 'published') {
      assert.ok(reviewedCurrent(row, now), 'Relation review expired or missing');
    }
  }
  if (decisionProfiles[0]?.editorial_status === 'reviewed' || decisionProfiles[0]?.editorial_status === 'published') {
    assert.ok(reviewedCurrent(decisionProfiles[0], now), 'Decision profile review expired or missing');
  }

  if (mode === '--baseline') {
    assert.equal(tool.url, 'https://notebooklm.google.com/');
    assert.deepEqual(tool.title, {
      en: 'NotebookLM Source-Grounded Research',
      cn: 'NotebookLM 资料锚定研究',
      zh: 'NotebookLM 资料锚定研究',
      tw: 'NotebookLM 资料锚定研究',
    });
    assert.equal(tool.features?.identity, undefined);
    assert.equal(tool.next_review_date, '2026-09-20');
    assert.equal(profiles.length, 0, 'Baseline evidence changed');
  } else {
    assert.equal(tool.url, 'https://notebook.google.com/');
    assert.deepEqual(tool.title, {
      en: 'Gemini Notebook Source-Grounded Research',
      cn: 'Gemini Notebook 资料锚定研究',
      zh: 'Gemini Notebook 资料锚定研究',
      tw: 'Gemini Notebook 資料錨定研究',
    });
    for (const locale of ['en', 'cn', 'tw', 'zh']) {
      const detail = String(tool.detail?.[locale]);
      assert.ok(detail.includes('Gemini Notebook') && detail.includes('NotebookLM'), `${locale} identity missing`);
      assert.ok(detail.includes('500') && detail.includes('600'), `${locale} Ultra tiers missing`);
    }
    assert.equal(tool.features?.identity?.currentName, 'Gemini Notebook');
    assert.equal(tool.features?.identity?.formerName, 'NotebookLM');
    assert.ok(tool.features.identity.aliases.includes('NotebookLM'));
    assert.equal(tool.features.identity.identityChangedAt, '2026-07-16');
    assert.equal(tool.features.identity.sourceUrl, identitySource);
    assert.equal(tool.features.identity.legacyOfficialUrl, 'https://notebooklm.google.com/');
    assert.equal(
      tool.features?.editorial?.sourceUrl,
      'https://support.google.com/gemininotebook/answer/16164461?hl=en',
    );
    assert.equal(tool.features.editorial.reviewedAt, '2026-09-30');
    assert.ok(
      ['en', 'cn', 'tw', 'zh'].every((locale) =>
        String(tool.features.editorial.summary?.[locale]).includes('Gemini Notebook'),
      ),
    );
    assert.ok(
      ['en', 'cn', 'tw', 'zh'].every((locale) =>
        String(tool.features.trialTemplate?.targetOutcome?.[locale]).includes('Gemini Notebook'),
      ),
    );
    assert.ok(tool.features.marketValidation?.evidenceUrls?.includes(identitySource));
    assert.ok(
      !tool.features.marketValidation?.evidenceUrls?.includes(
        'https://support.google.com/notebooklm/answer/16164461?hl=en',
      ),
    );
    assert.ok(Date.parse(tool.next_review_date) > now, 'Directory review expired');
  }
  if (mode === '--current') {
    assert.equal(profiles.length, 1, 'Notebook evidence profile missing');
    assert.equal(profile.owner_id, toolId);
    assert.equal(profile.canonical_domain, 'notebook.google.com');
    assert.equal(profile.product_name, 'Gemini Notebook');
    assert.equal(profile.profile_status, 'ready');
    assert.ok(Date.parse(profile.last_verified_at) <= now);
    assert.ok(Date.parse(profile.next_review_at) > now, 'Profile review expired');
    assert.ok(sources.some((source) => source.url === identitySource && source.source_type === 'official'));
    assert.ok(sources.length >= 5, 'Official Notebook source coverage incomplete');
    assert.ok(
      sources.every(
        (source) =>
          source.profile_id === profile.id &&
          source.source_type === 'official' &&
          source.fetch_status === 'success' &&
          Date.parse(source.last_verified_at) <= now,
      ),
    );
    assert.ok(claims.length >= 7, 'Notebook claim coverage incomplete');
    assert.ok(
      claims.every(
        (claim) =>
          claim.verification_status === 'verified' &&
          claim.conflict_status === 'none' &&
          claim.invalidated_at === null &&
          claim.verified_by &&
          Date.parse(claim.verified_at) <= now &&
          Date.parse(claim.review_due_at) > now &&
          (!claim.expires_at || Date.parse(claim.expires_at) > now) &&
          sourceById.get(claim.source_id)?.url === claim.source_url,
      ),
    );
    assert.equal(decisionProfiles.length, 1, 'Decision profile missing');
    assert.equal(decisionProfiles[0].editorial_status, 'reviewed');
    assert.ok(reviewedCurrent(decisionProfiles[0], now));
    assert.equal(capabilities.length, 2, 'Both Notebook Tool Capability candidates required');
    assert.deepEqual(
      capabilities.map((row) => row.capability_id).sort(),
      capabilityDefinitions.map((row) => row.id).sort(),
    );
    assert.ok(capabilities.every((row) => row.status === 'reviewed' && reviewedCurrent(row, now)));
    assert.equal(fits.filter((row) => row.task_id === taskId).length, 1, 'Notebook research Fit missing');
    assert.ok(
      fits
        .filter((row) => row.task_id === taskId)
        .every((row) => row.status === 'reviewed' && reviewedCurrent(row, now)),
    );
    assert.ok(
      capabilityLinks.length >= 8 && fitLinks.length >= 2 && decisionLinks.length >= 3,
      'Same-owner evidence links incomplete',
    );
  }
  console.log(
    JSON.stringify(
      {
        checkedAtUtc: new Date().toISOString(),
        mode,
        productionWrites: 0,
        tool: {
          id: tool.id,
          slug: tool.name,
          url: tool.url,
          title: tool.title,
          status: tool.status,
          pageQualityStatus: tool.page_quality_status,
          updatedAtUtc: tool.updated_at,
          rowMd5: tool.row_md5,
          indexDecision: indexDecision.reason,
          sitemapEligible: indexDecision.indexable,
          nextReviewDate: tool.next_review_date,
          editorial: tool.features?.editorial,
          identity: tool.features?.identity || null,
          localizedContentHasLegacyName: Object.fromEntries(
            Object.entries(tool.content || {}).map(([locale, text]) => [locale, /NotebookLM/i.test(String(text))]),
          ),
          localizedDetailHasLegacyName: Object.fromEntries(
            Object.entries(tool.detail || {}).map(([locale, text]) => [locale, /NotebookLM/i.test(String(text))]),
          ),
        },
        decision: { task: tasks[0], profiles: decisionProfiles, capabilities, fits },
        evidence: {
          profile: profile || null,
          sources: sources.map(({ id, ...row }) => row),
          claims: claims.map(({ id, source_id, ...row }) => row),
          links: { capabilities: capabilityLinks.length, fits: fitLinks.length, profile: decisionLinks.length },
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
