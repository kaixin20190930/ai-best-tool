import assert from 'node:assert/strict';
import { closePool, query } from '@/db/neon/client';
import { loadEnvConfig } from '@next/env';

import { prepareTimelineEventInsert } from '@/lib/services/intelligence/changeTimeline';
import { createAdminClient } from '@/lib/supabase/admin';

loadEnvConfig(process.cwd());

type DecisionBaseline = {
  toolId: string;
  profileOwnerId?: string;
  profileId: string;
  toolName: string;
  profileName: string;
  allowedSourceHosts: string[];
  allowedPageQualityStatuses: string[];
  minimumVerifiedClaims: number;
  title: string;
  summary: string;
  primarySourceUrl: string;
  sourceUrls: string[];
  bestFit: string[];
  notIdealFor: string[];
  alternatives: string[];
};

const baselines: Record<string, DecisionBaseline> = {
  gamma: {
    toolId: '6512aa61-8663-49f8-809d-2a2ab4e529ad',
    profileId: '63031451-a3eb-497d-9396-d6904aa2d3b3',
    toolName: 'gamma',
    profileName: 'Gamma',
    allowedSourceHosts: ['help.gamma.app'],
    allowedPageQualityStatuses: ['monitor'],
    minimumVerifiedClaims: 2,
    title: 'Decision baseline established',
    summary:
      'Gamma is a strong fit for fast, browser-first presentation and visual-content drafts when the team will review the final structure and export. Keep PowerPoint, Google Slides, or Canva in the comparison when exact editable-file handoff, offline work, strict brand control, or predictable credit use is the deciding constraint.',
    primarySourceUrl:
      'https://help.gamma.app/en/articles/15939201-why-doesn-t-my-exported-pdf-or-powerpoint-match-what-i-see-in-gamma',
    sourceUrls: [
      'https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-documents-into-gamma',
      'https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma',
      'https://help.gamma.app/en/articles/15939201-why-doesn-t-my-exported-pdf-or-powerpoint-match-what-i-see-in-gamma',
      'https://help.gamma.app/en/articles/12281928-does-gamma-use-my-content-to-train-its-ai-features',
      'https://help.gamma.app/en/articles/7834324-how-do-credits-work-in-gamma',
      'https://help.gamma.app/en/articles/11048258-what-does-per-member-billing-mean-in-gamma',
    ],
    bestFit: ['Fast visual first drafts', 'Browser-based proposals and pitch decks'],
    notIdealFor: ['Pixel-perfect PowerPoint handoff', 'Offline-first editing'],
    alternatives: ['PowerPoint', 'Google Slides', 'Canva'],
  },
  luma: {
    toolId: '711df152-fdcf-4a19-930c-ab866b67605f',
    profileId: '4501f2f9-4579-4675-9a16-0ef800fe8385',
    toolName: 'luma-ai',
    profileName: 'Luma Dream Machine',
    allowedSourceHosts: ['lumalabs.ai'],
    allowedPageQualityStatuses: ['monitor'],
    minimumVerifiedClaims: 1,
    title: 'Decision baseline established',
    summary:
      'Luma Dream Machine is a fit for video concepting, shot exploration, and generative modification when the team can compare several outputs, measure the cost of accepted shots, and finish continuity and delivery elsewhere. Keep Runway, Adobe Firefly, or a dedicated timeline editor in the comparison when low-tier commercial rights, shared API credits, deterministic continuity, or complete post-production is required.',
    primarySourceUrl: 'https://lumalabs.ai/learning-hub/licensing',
    sourceUrls: [
      'https://lumalabs.ai/learning-hub/licensing',
      'https://lumalabs.ai/learning-hub/dream-machine-credit-system',
      'https://lumalabs.ai/learning-hub/payments-subscriptions',
      'https://lumalabs.ai/learning-hub/modify-video-dream-machine',
    ],
    bestFit: ['Video concept and shot exploration', 'Generative video modification'],
    notIdealFor: ['Commercial output on Free or Lite', 'Treating Dream Machine and API credits as one balance'],
    alternatives: ['Runway', 'Adobe Firefly', 'Dedicated timeline editor'],
  },
  n8n: {
    toolId: '23bb3601-a5ac-42c3-bff3-64b06a063959',
    profileId: '78427cbc-30df-43f4-99f1-ecbc2ae76c10',
    toolName: 'n8n',
    profileName: 'n8n',
    allowedSourceHosts: ['n8n.io', 'docs.n8n.io'],
    allowedPageQualityStatuses: ['continue_index'],
    minimumVerifiedClaims: 4,
    title: 'Decision baseline established',
    summary:
      'n8n is a fit for technical teams that need code-level workflow control, broad integrations, or a choice between managed and self-hosted deployment, and can own credentials, failures, and maintenance. Keep Make, Zapier, or managed n8n Cloud in the comparison when lower operational overhead, simpler collaboration, or managed delivery matters more than self-hosting flexibility.',
    primarySourceUrl: 'https://docs.n8n.io/sustainable-use-license/',
    sourceUrls: [
      'https://n8n.io/pricing/',
      'https://docs.n8n.io/hosting/community-edition-features/',
      'https://docs.n8n.io/sustainable-use-license/',
      'https://docs.n8n.io/hosting/scaling/queue-mode/',
    ],
    bestFit: ['Technical operations', 'Code-assisted workflows'],
    notIdealFor: ['Zero-maintenance self-hosting', 'Unrestricted workflow-platform resale'],
    alternatives: ['Make', 'Zapier', 'Managed n8n Cloud'],
  },
  openrouter: {
    toolId: 'f77fb817-e8dc-4c22-b7cd-8edc2e5b0a5e',
    profileId: '2c4881f1-edf8-4b6a-9280-0ab88a006057',
    toolName: 'openrouter',
    profileName: 'OpenRouter',
    allowedSourceHosts: ['openrouter.ai'],
    allowedPageQualityStatuses: ['continue_index'],
    minimumVerifiedClaims: 3,
    title: 'Decision baseline established',
    summary:
      'OpenRouter is a fit for application teams that need multi-model access, explicit provider routing, or fallback control through one integration and will benchmark cost, latency, reliability, and endpoint policy on representative workloads. Keep a direct provider API, LiteLLM, or another managed AI gateway in the comparison when one stable provider is sufficient, self-managed routing is preferred, or removing an additional gateway dependency matters more than provider optionality.',
    primarySourceUrl: 'https://openrouter.ai/docs/guides/routing/provider-selection',
    sourceUrls: [
      'https://openrouter.ai/pricing',
      'https://openrouter.ai/docs/guides/routing/provider-selection',
      'https://openrouter.ai/docs/guides/privacy/provider-logging',
      'https://openrouter.ai/docs/guides/features/zdr',
    ],
    bestFit: ['Multi-model application teams', 'Provider routing and fallback control'],
    notIdealFor: ['One stable provider is sufficient', 'Sensitive workloads without endpoint review'],
    alternatives: ['Direct provider API', 'LiteLLM', 'Managed AI gateway'],
  },
  runway: {
    toolId: 'f39ef025-c2b4-4392-be38-95a377931b5e',
    profileOwnerId: '1abacadf-7a7b-490c-bf9a-11fd5fc16682',
    profileId: '45a3f33b-ac86-404b-9955-2909c2b801cd',
    toolName: 'runway',
    profileName: 'Runway',
    allowedSourceHosts: ['runway.com', 'help.runwayml.com'],
    allowedPageQualityStatuses: ['monitor'],
    minimumVerifiedClaims: 3,
    title: 'Decision baseline established',
    summary:
      'Runway is a fit for creators and teams iterating on generative video shots, visual concepts, and AI-assisted edits when they can budget several attempts and finish continuity, audio, and delivery in a broader production workflow. Keep Luma Dream Machine, Adobe Firefly, or a professional timeline editor in the comparison when predictable accepted-shot cost, a simpler generation workflow, or complete deterministic post-production matters more than having generation and editing tools together.',
    primarySourceUrl: 'https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work',
    sourceUrls: [
      'https://runway.com/pricing',
      'https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work',
      'https://help.runwayml.com/hc/en-us/articles/21668707517587-Can-I-use-the-content-I-made-in-Runway-for-commercial-purposes',
      'https://help.runwayml.com/hc/en-us/articles/52685547867667-Trimming-and-Assembling-Clips-in-Studio',
    ],
    bestFit: ['Rapid video concept iteration', 'Generative shot editing'],
    notIdealFor: ['Replacing a full professional timeline editor', 'Assuming every generation will be usable'],
    alternatives: ['Luma Dream Machine', 'Adobe Firefly', 'Professional timeline editor'],
  },
  dune: {
    toolId: 'dd8cb6a3-ef78-4747-9075-ebf663290410',
    profileId: '4887453a-a4a4-489c-b6f0-80e88ccc9c09',
    toolName: 'dune',
    profileName: 'Dune',
    allowedSourceHosts: ['dune.com', 'docs.dune.com'],
    allowedPageQualityStatuses: ['monitor'],
    minimumVerifiedClaims: 2,
    title: 'Decision baseline established',
    summary:
      'Dune is a fit for onchain analysts and crypto researchers who need custom SQL queries, reusable dashboards, and evidence behind a thesis, and can own query logic, freshness checks, and credit usage. Keep DefiLlama, Nansen, or a direct data warehouse in the comparison when broad market scanning, packaged wallet intelligence, or governed application pipelines matter more than flexible public analytics.',
    primarySourceUrl: 'https://docs.dune.com/docs/product-comparison',
    sourceUrls: [
      'https://docs.dune.com/',
      'https://docs.dune.com/docs/product-comparison',
      'https://docs.dune.com/web-app/overview',
      'https://docs.dune.com/web-app/share',
    ],
    bestFit: ['On-chain analysts', 'Crypto researchers'],
    notIdealFor: ['People only wanting lightweight charts', 'Users who do not want to work close to raw data'],
    alternatives: ['DefiLlama', 'Nansen', 'Direct data warehouse'],
  },
  theGraph: {
    toolId: 'b189f440-f5d7-44ca-9b10-5906c6eedb62',
    profileOwnerId: 'ab03d4d1-003d-44af-a223-cc563c877ee4',
    profileId: 'd2b3186e-3343-4675-b85e-039b20f6bd34',
    toolName: 'the-graph',
    profileName: 'The Graph',
    allowedSourceHosts: ['thegraph.com'],
    allowedPageQualityStatuses: ['monitor'],
    minimumVerifiedClaims: 2,
    title: 'Decision baseline established',
    summary:
      'The Graph is a fit for application and data teams that need a typed, repeatable query layer over indexed onchain data and can own schema, deployment, key security, and freshness monitoring. Keep Dune, a managed blockchain data API, or direct RPC and warehouse infrastructure in the comparison when interactive research, broader prepackaged coverage, or complete control of the ingestion pipeline matters more than an application-specific Subgraph.',
    primarySourceUrl: 'https://thegraph.com/docs/en/',
    sourceUrls: [
      'https://thegraph.com/docs/en/',
      'https://thegraph.com/docs/en/supported-networks/',
      'https://thegraph.com/docs/en/subgraphs/providers/subgraph-studio/managing-api-keys/',
      'https://thegraph.com/docs/en/subgraphs/providers/subgraph-studio/introduction/',
    ],
    bestFit: ['Applications needing typed onchain APIs', 'Teams owning a Subgraph schema and deployment'],
    notIdealFor: ['Instant universal blockchain coverage', 'Assuming paid queries guarantee fresh indexing'],
    alternatives: ['Dune', 'Managed blockchain data API', 'Direct RPC and data warehouse'],
  },
};

function readBaseline(args: string[]) {
  const key = args.find((argument) => argument.startsWith('--tool='))?.slice('--tool='.length);
  assert(key && baselines[key], `Use --tool=${Object.keys(baselines).join('|')}`);
  return { key, baseline: baselines[key] };
}

function getLocalizedList(value: unknown, locale: string): string[] {
  if (!value || typeof value !== 'object') return [];
  const localized = value as Record<string, unknown>;
  return Array.isArray(localized[locale]) ? localized[locale].map(String) : [];
}

async function main() {
  const args = process.argv.slice(2).filter((argument) => argument !== '--');
  const { key, baseline } = readBaseline(args);
  const mode = args.includes('--commit') ? 'commit' : args.includes('--check') ? 'check' : 'dry-run';
  assert(
    args
      .filter((argument) => !argument.startsWith('--tool='))
      .every((argument) => ['--check', '--commit'].includes(argument)),
  );
  assert(baseline.sourceUrls.every((url) => baseline.allowedSourceHosts.includes(new URL(url).hostname)));
  assert(baseline.bestFit.length >= 2 && baseline.notIdealFor.length >= 2 && baseline.alternatives.length >= 2);
  if (mode === 'check') {
    console.log(`PASS ${key} fixed identity, decision fields and official-source boundaries`);
    return;
  }

  const toolResult = await query<{
    id: string;
    name: string;
    status: string;
    page_quality_status: string | null;
    features: Record<string, unknown> | null;
  }>('SELECT id, name, status, page_quality_status, features FROM tools WHERE id = $1', [baseline.toolId]);
  assert.equal(toolResult.rows.length, 1, `${key}: fixed tool record missing or duplicated`);
  const tool = toolResult.rows[0];
  assert.equal(tool.name, baseline.toolName);
  assert.equal(tool.status, 'published');
  assert(
    tool.page_quality_status && baseline.allowedPageQualityStatuses.includes(tool.page_quality_status),
    `${key}: unexpected page quality status ${tool.page_quality_status || 'null'}`,
  );
  const audience = (tool.features?.audience as Record<string, unknown> | undefined) || {};
  assert.deepEqual(getLocalizedList(audience.bestFit, 'en').slice(0, 2), baseline.bestFit);
  assert.deepEqual(getLocalizedList(audience.notIdealFor, 'en').slice(0, 2), baseline.notIdealFor);

  const supabase = createAdminClient();
  const [profileResult, claimsResult, existingResult] = await Promise.all([
    supabase
      .from('product_intelligence_profiles')
      .select('id, owner_type, owner_id, product_name')
      .eq('id', baseline.profileId)
      .maybeSingle(),
    supabase
      .from('product_intelligence_claims')
      .select('id, verification_status, conflict_status')
      .eq('profile_id', baseline.profileId),
    supabase
      .from('product_intelligence_timeline_events')
      .select('id, title, review_scope, occurred_at')
      .eq('profile_id', baseline.profileId)
      .in('review_scope', ['decision', 'full'])
      .order('occurred_at', { ascending: false }),
  ]);
  const error = profileResult.error || claimsResult.error || existingResult.error;
  if (error) throw new Error(error.message);
  assert(profileResult.data, `${key}: intelligence profile missing`);
  assert.equal(profileResult.data.owner_type, 'tool');
  assert.equal(profileResult.data.owner_id, baseline.profileOwnerId || baseline.toolId);
  assert.equal(profileResult.data.product_name, baseline.profileName);
  const verifiedClaims = (claimsResult.data || []).filter(
    (claim) => claim.verification_status === 'verified' && claim.conflict_status === 'none',
  );
  assert(
    verifiedClaims.length >= baseline.minimumVerifiedClaims,
    `${key}: at least ${baseline.minimumVerifiedClaims} verified official claims are required`,
  );

  if (existingResult.data?.length) {
    console.log(
      JSON.stringify(
        {
          success: true,
          tool: key,
          mode,
          created: false,
          reason: 'decision_baseline_already_exists',
          event: existingResult.data[0],
        },
        null,
        2,
      ),
    );
    return;
  }

  const insert = prepareTimelineEventInsert(
    {
      profileId: baseline.profileId,
      profileOwnerType: 'tool',
      eventType: 'reviewed_no_change',
      reviewScope: 'decision',
      title: baseline.title,
      summary: baseline.summary,
      sourceUrl: baseline.primarySourceUrl,
      visibility: 'public',
      occurredAt: new Date().toISOString(),
      reviewNote:
        'Evidence-only editorial baseline based on current official documentation. No hands-on trial or user outcome is claimed.',
    },
    null,
  );
  insert.metadata = {
    ...insert.metadata,
    entryMethod: 'controlled_decision_baseline',
    sourceUrls: baseline.sourceUrls,
    bestFit: baseline.bestFit,
    notIdealFor: baseline.notIdealFor,
    alternatives: baseline.alternatives,
    handsOnTrial: false,
    verifiedClaimCount: verifiedClaims.length,
  };

  if (mode === 'dry-run') {
    console.log(JSON.stringify({ success: true, tool: key, mode, created: false, insert }, null, 2));
    return;
  }

  const { data: created, error: insertError } = await supabase
    .from('product_intelligence_timeline_events')
    .insert(insert)
    .select('id, profile_id, event_type, review_scope, visibility, occurred_at')
    .single();
  if (insertError) throw new Error(insertError.message);
  console.log(JSON.stringify({ success: true, tool: key, mode, created: true, event: created }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closePool);
