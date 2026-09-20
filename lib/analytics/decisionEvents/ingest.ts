/* eslint-disable @typescript-eslint/indent */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import {
  getDecisionEventObjectId,
  validateDecisionEvent,
  type DecisionEvent,
  type DecisionEventName,
  type DecisionTrafficQuality,
} from './contract';

const IDEMPOTENCY_BUCKET_MS = 30 * 60 * 1000;

export interface DecisionEventRuntimeConfig {
  collectionEnabled: boolean;
  hashSecret: string | null;
  retentionDays: number | null;
  retentionApproved: boolean;
  internalTokenHashes: readonly string[];
}

export interface DecisionEventRequestContext {
  host?: string | null;
  userAgent?: string | null;
  deploymentEnvironment?: string | null;
  requestPurpose?: string | null;
  internalTrafficToken?: string | null;
  path?: string | null;
}

export type DecisionTrafficExclusion = 'bot' | 'preview' | 'local' | 'health' | 'internal';

export type DecisionTrafficClassification =
  | { accepted: true; trafficQuality: DecisionTrafficQuality }
  | { accepted: false; reason: DecisionTrafficExclusion };

export interface DecisionMetricEventRecord {
  eventName: DecisionEventName;
  eventVersion: number;
  flowInstanceHash: string;
  idempotencyKey: string;
  receivedAt: string;
  expiresAt: string;
  retentionDays: number;
  trafficQuality: DecisionTrafficQuality;
  locale: 'en' | 'cn';
  surface: string;
  taskId: string | null;
  resultId: string | null;
  toolId: string | null;
  constraintKey: string | null;
  constraintValueCode: string | null;
  rulesVersion: string | null;
  resultCount: number | null;
  hasUnknown: boolean | null;
  zeroReasonCode: string | null;
  entryPoint: string | null;
  comparisonKey: string | null;
  sourceToolId: string | null;
  evidenceSurface: string | null;
  claimType: string | null;
  saveMode: string | null;
  officialDomainCode: string | null;
}

export interface DecisionEventRepository {
  insert(record: DecisionMetricEventRecord): Promise<'inserted' | 'duplicate'>;
}

export type DecisionEventIngestionResult =
  | { accepted: true; duplicate: boolean; trafficQuality: DecisionTrafficQuality }
  | {
      accepted: false;
      code: 'collection_disabled' | 'configuration_invalid' | 'invalid_payload' | 'excluded_traffic' | 'storage_error';
      detail?: string;
    };

function parseRetentionDays(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function getDecisionEventRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): DecisionEventRuntimeConfig {
  const hashSecret = environment.DECISION_EVENT_HASH_SECRET?.trim() || null;
  const internalTokenHashes = (environment.DECISION_EVENT_INTERNAL_TOKEN_HASHES || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^[0-9a-f]{64}$/.test(value));

  return {
    collectionEnabled: environment.DECISION_EVENT_COLLECTION_ENABLED === 'true',
    hashSecret,
    retentionDays: parseRetentionDays(environment.DECISION_EVENT_RETENTION_DAYS),
    retentionApproved: environment.DECISION_EVENT_RETENTION_APPROVED === 'true',
    internalTokenHashes,
  };
}

function safeTokenMatches(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(createHash('sha256').update(token).digest('hex'));
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function classifyDecisionEventTraffic(
  context: DecisionEventRequestContext,
  config: Pick<DecisionEventRuntimeConfig, 'internalTokenHashes'>,
): DecisionTrafficClassification {
  const deployment = (context.deploymentEnvironment || '').trim().toLowerCase();
  const host = (context.host || '').trim().toLowerCase().split(':')[0];
  const purpose = (context.requestPurpose || '').trim().toLowerCase();
  const path = (context.path || '').trim().toLowerCase();
  const userAgent = (context.userAgent || '').trim();
  const normalizedUa = userAgent.toLowerCase();

  if (deployment === 'preview' || host.endsWith('.vercel.app') || host.startsWith('preview.')) {
    return { accepted: false, reason: 'preview' };
  }
  if (
    deployment === 'development' ||
    deployment === 'test' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.endsWith('.local')
  ) {
    return { accepted: false, reason: 'local' };
  }
  if (purpose === 'health' || purpose === 'monitor' || /^\/(?:api\/)?health(?:\/|$)/.test(path)) {
    return { accepted: false, reason: 'health' };
  }
  if (
    context.internalTrafficToken &&
    config.internalTokenHashes.some((expected) => safeTokenMatches(context.internalTrafficToken as string, expected))
  ) {
    return { accepted: false, reason: 'internal' };
  }
  if (
    /bot|crawler|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|linkedinbot|twitterbot|curl|wget/i.test(
      userAgent,
    )
  ) {
    return { accepted: false, reason: 'bot' };
  }

  const looksHuman = /mozilla\/5\.0|chrome\/|safari\/|firefox\/|edg\//.test(normalizedUa);
  return { accepted: true, trafficQuality: looksHuman ? 'human' : 'unknown' };
}

function keyedHash(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function buildDecisionEventHashes(event: DecisionEvent, receivedAt: Date, secret: string) {
  const bucket = Math.floor(receivedAt.getTime() / IDEMPOTENCY_BUCKET_MS);
  const objectId = getDecisionEventObjectId(event);
  return {
    flowInstanceHash: keyedHash(secret, `flow:v1:${event.flowInstanceId}`),
    idempotencyKey: keyedHash(
      secret,
      `idempotency:v1:${event.eventName}:${event.flowInstanceId}:${objectId}:${bucket}`,
    ),
  };
}

function toRecord(
  event: DecisionEvent,
  receivedAt: Date,
  retentionDays: number,
  trafficQuality: DecisionTrafficQuality,
  hashSecret: string,
): DecisionMetricEventRecord {
  const hashes = buildDecisionEventHashes(event, receivedAt, hashSecret);
  const expiresAt = new Date(receivedAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);
  const record: DecisionMetricEventRecord = {
    eventName: event.eventName,
    eventVersion: event.eventVersion,
    ...hashes,
    receivedAt: receivedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    retentionDays,
    trafficQuality,
    locale: event.locale,
    surface: event.surface,
    taskId: null,
    resultId: null,
    toolId: null,
    constraintKey: null,
    constraintValueCode: null,
    rulesVersion: null,
    resultCount: null,
    hasUnknown: null,
    zeroReasonCode: null,
    entryPoint: null,
    comparisonKey: null,
    sourceToolId: null,
    evidenceSurface: null,
    claimType: null,
    saveMode: null,
    officialDomainCode: null,
  };

  switch (event.eventName) {
    case 'find_tools_view':
      break;
    case 'task_start':
      record.taskId = event.taskId;
      break;
    case 'constraint_selected':
      record.constraintKey = event.constraintKey;
      record.constraintValueCode = event.constraintValueCode;
      break;
    case 'task_results_shown':
      record.taskId = event.taskId;
      record.rulesVersion = event.rulesVersion;
      record.resultId = event.resultId;
      record.resultCount = event.resultCount;
      record.hasUnknown = event.hasUnknown;
      break;
    case 'task_zero_result':
      record.taskId = event.taskId;
      record.rulesVersion = event.rulesVersion;
      record.resultId = event.resultId;
      record.zeroReasonCode = event.zeroReasonCode;
      break;
    case 'tool_detail_open':
      record.resultId = event.resultId;
      record.toolId = event.toolId;
      record.entryPoint = event.entryPoint;
      break;
    case 'comparison_open':
      record.comparisonKey = event.comparisonKey;
      record.entryPoint = event.entryPoint;
      record.sourceToolId = event.sourceToolId || null;
      record.resultId = event.resultId || null;
      break;
    case 'evidence_open':
      record.toolId = event.toolId;
      record.evidenceSurface = event.evidenceSurface;
      record.claimType = event.claimType;
      break;
    case 'decision_saved':
      record.taskId = event.taskId;
      record.resultId = event.resultId;
      record.saveMode = event.saveMode;
      record.rulesVersion = event.rulesVersion;
      break;
    case 'official_site_click':
      record.toolId = event.toolId;
      record.entryPoint = event.entryPoint;
      record.officialDomainCode = event.officialDomainCode;
      break;
    default:
      event satisfies never;
  }
  return record;
}

export async function ingestDecisionEvent(input: {
  payload: unknown;
  context: DecisionEventRequestContext;
  repository: DecisionEventRepository;
  config?: DecisionEventRuntimeConfig;
  receivedAt?: Date;
  serverConfirmedSave?: boolean;
  verifyOfficialDomain?: (toolId: string, officialDomainCode: string) => Promise<boolean>;
}): Promise<DecisionEventIngestionResult> {
  const config = input.config || getDecisionEventRuntimeConfig();
  if (!config.collectionEnabled) return { accepted: false, code: 'collection_disabled' };
  if (
    !config.retentionApproved ||
    config.retentionDays === null ||
    !config.hashSecret ||
    config.hashSecret.length < 32
  ) {
    return { accepted: false, code: 'configuration_invalid' };
  }

  const validation = validateDecisionEvent(input.payload);
  if (!validation.ok) {
    return { accepted: false, code: 'invalid_payload', detail: validation.code };
  }
  if (validation.event.eventName === 'decision_saved' && input.serverConfirmedSave !== true) {
    return { accepted: false, code: 'invalid_payload', detail: 'server_confirmation_required' };
  }
  if (validation.event.eventName === 'official_site_click') {
    if (!input.verifyOfficialDomain) {
      return { accepted: false, code: 'invalid_payload', detail: 'official_domain_unverified' };
    }
    try {
      const verified = await input.verifyOfficialDomain(validation.event.toolId, validation.event.officialDomainCode);
      if (!verified) return { accepted: false, code: 'invalid_payload', detail: 'official_domain_unverified' };
    } catch {
      return { accepted: false, code: 'invalid_payload', detail: 'official_domain_unverified' };
    }
  }
  const traffic = classifyDecisionEventTraffic(input.context, config);
  if (!traffic.accepted) {
    return { accepted: false, code: 'excluded_traffic', detail: traffic.reason };
  }

  const receivedAt = input.receivedAt || new Date();
  if (!Number.isFinite(receivedAt.getTime())) return { accepted: false, code: 'configuration_invalid' };
  const expiresAtTime = receivedAt.getTime() + config.retentionDays * 24 * 60 * 60 * 1000;
  if (!Number.isFinite(expiresAtTime) || expiresAtTime > 8_640_000_000_000_000) {
    return { accepted: false, code: 'configuration_invalid' };
  }
  const record = toRecord(
    validation.event,
    receivedAt,
    config.retentionDays,
    traffic.trafficQuality,
    config.hashSecret,
  );

  try {
    const result = await input.repository.insert(record);
    return { accepted: true, duplicate: result === 'duplicate', trafficQuality: traffic.trafficQuality };
  } catch {
    return { accepted: false, code: 'storage_error' };
  }
}

export const DECISION_EVENT_IDEMPOTENCY_BUCKET_MS = IDEMPOTENCY_BUCKET_MS;
