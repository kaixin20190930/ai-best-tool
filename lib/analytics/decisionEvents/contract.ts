/* eslint-disable @typescript-eslint/indent */

export const DECISION_EVENT_VERSION = 1 as const;

export const decisionEventNames = [
  'find_tools_view',
  'task_start',
  'constraint_selected',
  'task_results_shown',
  'task_zero_result',
  'tool_detail_open',
  'comparison_open',
  'evidence_open',
  'decision_saved',
  'official_site_click',
] as const;

export type DecisionEventName = (typeof decisionEventNames)[number];
export type DecisionEventLocale = 'en' | 'cn';
export type DecisionTrafficQuality = 'human' | 'unknown';

export const decisionClaimTypes = [
  'product_name',
  'one_line_positioning',
  'target_audience',
  'use_case',
  'feature',
  'integration',
  'supported_platform',
  'pricing_model',
  'pricing_plan',
  'free_trial',
  'free_limit',
  'export_limit',
  'license_limit',
  'security_claim',
  'official_social',
  'official_repository',
  'changelog_update',
  'limitation',
] as const;

export type DecisionClaimType = (typeof decisionClaimTypes)[number];

type BaseDecisionEvent = {
  eventName: DecisionEventName;
  eventVersion: typeof DECISION_EVENT_VERSION;
  flowInstanceId: string;
  locale: DecisionEventLocale;
};

export type DecisionEvent =
  | (BaseDecisionEvent & { eventName: 'find_tools_view'; surface: 'find_tools' })
  | (BaseDecisionEvent & { eventName: 'task_start'; surface: 'find_tools'; taskId: string })
  | (BaseDecisionEvent & {
      eventName: 'constraint_selected';
      surface: 'find_tools';
      constraintKey:
        | 'role'
        | 'team_size'
        | 'budget'
        | 'budget_period'
        | 'integrations'
        | 'data_sensitivity'
        | 'self_host'
        | 'export';
      constraintValueCode: string;
    })
  | (BaseDecisionEvent & {
      eventName: 'task_results_shown';
      surface: 'find_tools';
      taskId: string;
      rulesVersion: 'decision-v1';
      resultId: string;
      resultCount: 0 | 1 | 2 | 3;
      hasUnknown: boolean;
    })
  | (BaseDecisionEvent & {
      eventName: 'task_zero_result';
      surface: 'find_tools';
      taskId: string;
      rulesVersion: 'decision-v1';
      resultId: string;
      zeroReasonCode: 'no_published_fit' | 'no_candidate_after_rules' | 'evidence_unavailable';
    })
  | (BaseDecisionEvent & {
      eventName: 'tool_detail_open';
      surface: 'tool_detail';
      resultId: string;
      toolId: string;
      entryPoint: 'finder_result';
    })
  | (BaseDecisionEvent & {
      eventName: 'comparison_open';
      surface: 'comparison';
      comparisonKey: string;
      entryPoint: 'finder_result' | 'tool_detail';
      sourceToolId?: string;
      resultId?: string;
    })
  | (BaseDecisionEvent & {
      eventName: 'evidence_open';
      surface: 'tool_detail';
      toolId: string;
      evidenceSurface: 'ledger' | 'card_source';
      claimType: DecisionClaimType;
    })
  | (BaseDecisionEvent & {
      eventName: 'decision_saved';
      surface: 'find_tools' | 'profile';
      taskId: string;
      resultId: string;
      saveMode: 'create' | 'update';
      rulesVersion: 'decision-v1';
    })
  | (BaseDecisionEvent & {
      eventName: 'official_site_click';
      surface: 'tool_detail' | 'guide' | 'comparison';
      toolId: string;
      entryPoint: 'tool_detail' | 'guide' | 'comparison';
      officialDomainCode: string;
    });

export type DecisionEventValidationErrorCode =
  | 'not_an_object'
  | 'unknown_event'
  | 'forbidden_field'
  | 'unknown_field'
  | 'missing_field'
  | 'invalid_field';

export type DecisionEventValidationResult =
  | { ok: true; event: DecisionEvent }
  | { ok: false; code: DecisionEventValidationErrorCode; field?: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const opaqueCodePattern = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;
const eventNameSet = new Set<string>(decisionEventNames);
const claimTypeSet = new Set<string>(decisionClaimTypes);
const baseFields = ['eventName', 'eventVersion', 'flowInstanceId', 'locale', 'surface'] as const;

const eventFields: Record<DecisionEventName, readonly string[]> = {
  find_tools_view: baseFields,
  task_start: [...baseFields, 'taskId'],
  constraint_selected: [...baseFields, 'constraintKey', 'constraintValueCode'],
  task_results_shown: [...baseFields, 'taskId', 'rulesVersion', 'resultId', 'resultCount', 'hasUnknown'],
  task_zero_result: [...baseFields, 'taskId', 'rulesVersion', 'resultId', 'zeroReasonCode'],
  tool_detail_open: [...baseFields, 'resultId', 'toolId', 'entryPoint'],
  comparison_open: [...baseFields, 'comparisonKey', 'entryPoint', 'sourceToolId', 'resultId'],
  evidence_open: [...baseFields, 'toolId', 'evidenceSurface', 'claimType'],
  decision_saved: [...baseFields, 'taskId', 'resultId', 'saveMode', 'rulesVersion'],
  official_site_click: [...baseFields, 'toolId', 'entryPoint', 'officialDomainCode'],
};

const forbiddenNormalizedFields = new Set([
  'userid',
  'email',
  'emailaddress',
  'phone',
  'phonenumber',
  'name',
  'address',
  'ip',
  'ipaddress',
  'useragent',
  'ua',
  'referrer',
  'referer',
  'url',
  'fullurl',
  'sourceurl',
  'href',
  'query',
  'querystring',
  'searchquery',
  'text',
  'freetext',
  'roletext',
  'budgetvalue',
  'integrationvalue',
  'sessionid',
  'cookieid',
  'deviceid',
  'fingerprint',
  'trafficquality',
]);

type DecisionConstraintKey = Extract<DecisionEvent, { eventName: 'constraint_selected' }>['constraintKey'];

const constraintValues: Record<DecisionConstraintKey, Set<string>> = {
  role: new Set(['redacted']),
  team_size: new Set(['unknown', 'solo', '2_10', '11_50', '51_plus']),
  budget: new Set(['redacted']),
  budget_period: new Set(['unknown', 'month', 'year', 'one_time']),
  integrations: new Set(['redacted']),
  data_sensitivity: new Set(['low', 'medium', 'high', 'regulated']),
  self_host: new Set(['required', 'not_required']),
  export: new Set(['required', 'not_required']),
};

function normalizedFieldName(field: string): string {
  return field.replace(/[_-]/g, '').toLowerCase();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isStringEnum(value: unknown, values: readonly string[]): value is string {
  return typeof value === 'string' && values.includes(value);
}

function invalid(field: string): DecisionEventValidationResult {
  return { ok: false, code: 'invalid_field', field };
}

function missing(record: Record<string, unknown>, fields: readonly string[]): DecisionEventValidationResult | null {
  const field = fields.find((name) => !(name in record));
  return field ? { ok: false, code: 'missing_field', field } : null;
}

function validateBase(record: Record<string, unknown>): DecisionEventValidationResult | null {
  const required = missing(record, baseFields);
  if (required) return required;
  if (record.eventVersion !== DECISION_EVENT_VERSION) return invalid('eventVersion');
  if (typeof record.flowInstanceId !== 'string' || !uuidPattern.test(record.flowInstanceId)) {
    return invalid('flowInstanceId');
  }
  if (!isStringEnum(record.locale, ['en', 'cn'])) return invalid('locale');
  return null;
}

function validateUuid(record: Record<string, unknown>, field: string): DecisionEventValidationResult | null {
  if (!(field in record)) return { ok: false, code: 'missing_field', field };
  const value = record[field];
  return typeof value === 'string' && uuidPattern.test(value) ? null : invalid(field);
}

function validateOpaqueCode(record: Record<string, unknown>, field: string): DecisionEventValidationResult | null {
  if (!(field in record)) return { ok: false, code: 'missing_field', field };
  const value = record[field];
  return typeof value === 'string' && value.length <= 80 && opaqueCodePattern.test(value) ? null : invalid(field);
}

function validateEventShape(
  eventName: DecisionEventName,
  record: Record<string, unknown>,
): DecisionEventValidationResult | null {
  const expect = (field: string, values: readonly string[]): DecisionEventValidationResult | null => {
    if (!(field in record)) return { ok: false, code: 'missing_field', field };
    return isStringEnum(record[field], values) ? null : invalid(field);
  };

  switch (eventName) {
    case 'find_tools_view':
      return expect('surface', ['find_tools']);
    case 'task_start':
      return expect('surface', ['find_tools']) || validateUuid(record, 'taskId');
    case 'constraint_selected': {
      const surface = expect('surface', ['find_tools']);
      if (surface) return surface;
      const key = record.constraintKey;
      if (typeof key !== 'string' || !Object.prototype.hasOwnProperty.call(constraintValues, key)) {
        return invalid('constraintKey');
      }
      if (!constraintValues[key as DecisionConstraintKey].has(String(record.constraintValueCode))) {
        return invalid('constraintValueCode');
      }
      return null;
    }
    case 'task_results_shown': {
      const result =
        expect('surface', ['find_tools']) ||
        validateUuid(record, 'taskId') ||
        expect('rulesVersion', ['decision-v1']) ||
        validateUuid(record, 'resultId');
      if (result) return result;
      if (!Number.isInteger(record.resultCount) || Number(record.resultCount) < 0 || Number(record.resultCount) > 3) {
        return invalid('resultCount');
      }
      return typeof record.hasUnknown === 'boolean' ? null : invalid('hasUnknown');
    }
    case 'task_zero_result':
      return (
        expect('surface', ['find_tools']) ||
        validateUuid(record, 'taskId') ||
        expect('rulesVersion', ['decision-v1']) ||
        validateUuid(record, 'resultId') ||
        expect('zeroReasonCode', ['no_published_fit', 'no_candidate_after_rules', 'evidence_unavailable'])
      );
    case 'tool_detail_open':
      return (
        expect('surface', ['tool_detail']) ||
        validateUuid(record, 'resultId') ||
        validateUuid(record, 'toolId') ||
        expect('entryPoint', ['finder_result'])
      );
    case 'comparison_open': {
      const result =
        expect('surface', ['comparison']) ||
        validateOpaqueCode(record, 'comparisonKey') ||
        expect('entryPoint', ['finder_result', 'tool_detail']);
      if (result) return result;
      if (record.entryPoint === 'finder_result') {
        if ('sourceToolId' in record) return invalid('sourceToolId');
        return validateUuid(record, 'resultId');
      }
      if ('resultId' in record) return invalid('resultId');
      return validateUuid(record, 'sourceToolId');
    }
    case 'evidence_open':
      return (
        expect('surface', ['tool_detail']) ||
        validateUuid(record, 'toolId') ||
        expect('evidenceSurface', ['ledger', 'card_source']) ||
        (typeof record.claimType === 'string' && claimTypeSet.has(record.claimType) ? null : invalid('claimType'))
      );
    case 'decision_saved':
      return (
        expect('surface', ['find_tools', 'profile']) ||
        validateUuid(record, 'taskId') ||
        validateUuid(record, 'resultId') ||
        expect('saveMode', ['create', 'update']) ||
        expect('rulesVersion', ['decision-v1'])
      );
    case 'official_site_click': {
      const result =
        expect('surface', ['tool_detail', 'guide', 'comparison']) ||
        validateUuid(record, 'toolId') ||
        expect('entryPoint', ['tool_detail', 'guide', 'comparison']) ||
        validateOpaqueCode(record, 'officialDomainCode');
      if (result) return result;
      return record.surface === record.entryPoint ? null : invalid('entryPoint');
    }
    default:
      return { ok: false, code: 'unknown_event', field: 'eventName' };
  }
}

export function validateDecisionEvent(input: unknown): DecisionEventValidationResult {
  if (!isPlainObject(input)) return { ok: false, code: 'not_an_object' };

  const rawName = input.eventName;
  if (typeof rawName !== 'string' || !eventNameSet.has(rawName)) {
    return { ok: false, code: 'unknown_event', field: 'eventName' };
  }
  const eventName = rawName as DecisionEventName;
  const allowedFields = new Set(eventFields[eventName]);
  const inputFields = Object.keys(input);
  const forbiddenField = inputFields.find((field) => forbiddenNormalizedFields.has(normalizedFieldName(field)));
  if (forbiddenField) return { ok: false, code: 'forbidden_field', field: forbiddenField };
  const unknownField = inputFields.find((field) => !allowedFields.has(field));
  if (unknownField) return { ok: false, code: 'unknown_field', field: unknownField };

  const requiredBase = validateBase(input);
  if (requiredBase) return requiredBase;
  const eventShape = validateEventShape(eventName, input);
  if (eventShape) return eventShape;

  return { ok: true, event: input as DecisionEvent };
}

export function getDecisionEventObjectId(event: DecisionEvent): string {
  switch (event.eventName) {
    case 'find_tools_view':
      return 'find_tools';
    case 'task_start':
      return event.taskId;
    case 'constraint_selected':
      return `${event.constraintKey}:${event.constraintValueCode}`;
    case 'task_results_shown':
    case 'task_zero_result':
    case 'decision_saved':
      return event.resultId;
    case 'tool_detail_open':
      return `${event.resultId}:${event.toolId}`;
    case 'comparison_open':
      return `${event.comparisonKey}:${event.resultId || event.sourceToolId || ''}`;
    case 'evidence_open':
      return `${event.toolId}:${event.evidenceSurface}:${event.claimType}`;
    case 'official_site_click':
      return `${event.toolId}:${event.officialDomainCode}`;
    default:
      return event satisfies never;
  }
}
