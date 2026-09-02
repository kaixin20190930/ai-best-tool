import { ArrowRight, CheckCircle2, CircleHelp, ExternalLink, ShieldCheck } from 'lucide-react';

import type {
  DecisionCardField,
  DecisionCardRelationshipItem,
  DecisionCardV2Model,
} from '@/lib/services/decision/card';
import type { DecisionEvidenceReference } from '@/lib/services/decision/evidence';

function localizedText(value: unknown, locale: string): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const keys = locale === 'cn' || locale === 'tw' ? [locale, 'cn', 'zh', 'en'] : [locale, 'en'];
  const match = keys.map((key) => record[key]).find((candidate) => typeof candidate === 'string' && candidate.trim());
  return typeof match === 'string' ? match.trim() : null;
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return locale === 'cn' || locale === 'tw' ? '待补' : 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'cn' || locale === 'tw' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function EvidenceSources({ evidence, locale }: { evidence: DecisionEvidenceReference[]; locale: string }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  if (evidence.length === 0) return null;

  return (
    <details className='mt-3 border-t border-slate-200 pt-3 text-xs'>
      <summary className='cursor-pointer font-semibold text-cyan-800'>
        {isChinese
          ? `${evidence.length} 条核验证据`
          : `${evidence.length} verified source${evidence.length === 1 ? '' : 's'}`}
      </summary>
      <div className='mt-2 space-y-2'>
        {evidence.map((reference) => (
          <a
            key={`${reference.claimId}-${reference.purpose}`}
            href={reference.sourceUrl}
            target='_blank'
            rel='noreferrer'
            className='flex items-start justify-between gap-3 rounded-md bg-white p-2 text-slate-600 ring-1 ring-slate-200 hover:text-cyan-800'
          >
            <span className='min-w-0'>
              <span className='block truncate font-medium'>{reference.claimType.replace(/[_-]+/g, ' ')}</span>
              <span className='mt-0.5 block text-[11px] text-slate-500'>
                {isChinese ? '核验于' : 'Verified'} {formatDate(reference.verifiedAt, locale)}
              </span>
            </span>
            <ExternalLink className='mt-0.5 size-3.5 shrink-0' />
          </a>
        ))}
      </div>
    </details>
  );
}

function FactCard({
  title,
  value,
  field,
  locale,
}: {
  title: string;
  value: string | null;
  field: DecisionCardField<unknown>;
  locale: string;
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const supported = field.state === 'supported' && value;
  const unknownLabel = isChinese ? '待核验，暂不作判断' : 'Unknown until verified';
  return (
    <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{title}</p>
        {supported ? (
          <CheckCircle2 className='size-4 shrink-0 text-emerald-600' aria-label={isChinese ? '已核验' : 'Verified'} />
        ) : (
          <CircleHelp className='size-4 shrink-0 text-amber-600' aria-label={isChinese ? '待核验' : 'Unknown'} />
        )}
      </div>
      <p className={`mt-2 text-sm font-semibold leading-6 ${supported ? 'text-slate-950' : 'text-amber-800'}`}>
        {supported ? value : unknownLabel}
      </p>
      {supported ? <EvidenceSources evidence={field.evidence} locale={locale} /> : null}
    </div>
  );
}

function RelationshipGroup({
  title,
  emptyLabel,
  items,
  locale,
}: {
  title: string;
  emptyLabel: string;
  items: DecisionCardRelationshipItem[];
  locale: string;
}) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{title}</p>
      {items.length > 0 ? (
        <div className='mt-3 space-y-3'>
          {items.map((item) => (
            <div key={item.id} className='rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200'>
              <a
                href={item.href}
                className='flex items-center justify-between gap-3 font-semibold text-slate-950 hover:text-cyan-800'
              >
                <span>{item.title}</span>
                <ArrowRight className='size-4 shrink-0' />
              </a>
              {localizedText(item.rationale, locale) ? (
                <p className='mt-2 text-sm leading-6 text-slate-600'>{localizedText(item.rationale, locale)}</p>
              ) : null}
              <EvidenceSources evidence={item.evidence} locale={locale} />
            </div>
          ))}
        </div>
      ) : (
        <p className='mt-3 text-sm font-medium text-amber-800'>{emptyLabel}</p>
      )}
    </div>
  );
}

function formatTrueCost(model: DecisionCardV2Model, isChinese: boolean): string | null {
  const cost = model.trueCost.value;
  if (!cost) return null;
  if (cost.period === 'one_time') return `${cost.currency} ${cost.amount} ${isChinese ? '一次性' : 'one time'}`;
  const monthlyPeriod = isChinese ? '月' : 'month';
  const yearlyPeriod = isChinese ? '年' : 'year';
  const period = cost.period === 'month' ? monthlyPeriod : yearlyPeriod;
  const monthly = cost.monthlyEquivalent;
  const monthlyText = monthly === null ? '' : ` · ${cost.currency} ${monthly.toFixed(2)}/${isChinese ? '月' : 'mo'}`;
  return `${cost.currency} ${cost.amount}/${period}${cost.period === 'year' ? monthlyText : ''}`;
}

function formatSetup(model: DecisionCardV2Model, isChinese: boolean): string | null {
  const setup = model.setup.value;
  if (!setup) return null;
  const labels = isChinese
    ? { low: '低', medium: '中', high: '高', unknown: '未知' }
    : { low: 'Low', medium: 'Medium', high: 'High', unknown: 'Unknown' };
  const range =
    setup.minutesLow !== null && setup.minutesHigh !== null
      ? ` · ${setup.minutesLow}-${setup.minutesHigh} ${isChinese ? '分钟' : 'minutes'}`
      : '';
  return `${labels[setup.complexity]}${range}`;
}

function formatDataUse(model: DecisionCardV2Model, isChinese: boolean): string | null {
  const { value } = model.dataUse;
  if (!value) return null;
  const labels = isChinese
    ? {
      no: '不用于训练',
      opt_in: '主动加入后用于训练',
      opt_out: '需主动退出训练',
      yes: '可能用于训练',
      unknown: '未知',
    }
    : {
      no: 'Not used for training',
      opt_in: 'Training is opt-in',
      opt_out: 'Training requires opt-out',
      yes: 'May be used for training',
      unknown: 'Unknown',
    };
  return labels[value];
}

function formatExit(model: DecisionCardV2Model, isChinese: boolean): string | null {
  const { value } = model.exitPath;
  if (!value) return null;
  const selfHost = value.selfHostLevel ? `${isChinese ? '自托管' : 'Self-host'}: ${value.selfHostLevel}` : null;
  const exportValue = value.exportLevel ? `${isChinese ? '导出' : 'Export'}: ${value.exportLevel}` : null;
  return [selfHost, exportValue].filter(Boolean).join(' · ');
}

function formatWhyNot(model: DecisionCardV2Model, locale: string): string | null {
  return (
    model.whyNot.value
      ?.map((item) => localizedText(item, locale))
      .filter(Boolean)
      .slice(0, 3)
      .join('；') || null
  );
}

export default function DecisionCardV2({ model, locale }: { model: DecisionCardV2Model; locale: string }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <section
      id='decision-card'
      data-tool-decision-card-v2
      className='scroll-mt-28 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200'
    >
      <div className='bg-slate-950 px-6 py-6 text-white lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <ShieldCheck className='size-6 text-cyan-300' />
              <h2 className='text-2xl font-bold lg:text-3xl'>{isChinese ? '选择判断卡 2.0' : 'Decision Card 2.0'}</h2>
            </div>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-300'>
              {isChinese
                ? '只展示已核验且未过期的证据。没有来源支持的字段明确保留为未知。'
                : 'Only verified, current evidence is shown. Fields without source support remain explicitly unknown.'}
            </p>
          </div>
          <div className='shrink-0 rounded-lg bg-white/10 px-3 py-2 text-xs text-slate-200'>
            {isChinese ? '复核于' : 'Reviewed'} {formatDate(model.reviewedAt, locale)}
          </div>
        </div>
      </div>

      <div className='p-6 lg:p-8'>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
          <FactCard
            title={isChinese ? '真实成本' : 'True cost'}
            value={formatTrueCost(model, isChinese)}
            field={model.trueCost}
            locale={locale}
          />
          <FactCard
            title={isChinese ? '部署成本' : 'Setup'}
            value={formatSetup(model, isChinese)}
            field={model.setup}
            locale={locale}
          />
          <FactCard
            title={isChinese ? '数据使用' : 'Data'}
            value={formatDataUse(model, isChinese)}
            field={model.dataUse}
            locale={locale}
          />
          <FactCard
            title={isChinese ? '退出路径' : 'Exit'}
            value={formatExit(model, isChinese)}
            field={model.exitPath}
            locale={locale}
          />
          <FactCard
            title={isChinese ? '为什么不选' : 'Why not'}
            value={formatWhyNot(model, locale)}
            field={model.whyNot}
            locale={locale}
          />
        </div>

        <div className='mt-5 grid gap-4 lg:grid-cols-2'>
          <RelationshipGroup
            title={isChinese ? '可以替换谁' : 'Replaces'}
            emptyLabel={isChinese ? '暂无已核验的替代关系' : 'No verified replacement relationship yet'}
            items={model.replaces}
            locale={locale}
          />
          <RelationshipGroup
            title={isChinese ? '可以和谁配合' : 'Works with'}
            emptyLabel={isChinese ? '暂无已核验的互补关系' : 'No verified complementary relationship yet'}
            items={model.worksWith}
            locale={locale}
          />
        </div>
      </div>
    </section>
  );
}
