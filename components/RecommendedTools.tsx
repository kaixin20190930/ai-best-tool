import { getRecommendedTools } from '@/lib/services/recommendations';
import { getLocalizedField, Tool } from '@/lib/services/tools';
import WebNavCard from '@/components/webNav/WebNavCard';

interface RecommendedToolsProps {
  toolId: string;
  locale?: string;
  categoryName?: string;
  categorySlug?: string;
  compareAxes?: string[];
  pricing?: Tool['pricing'];
  pricingLabel?: string;
  tagSlugs?: string[];
  tagLabels?: string[];
}

type SimilarityReasonKind = 'best-fit' | 'compare' | 'tags' | 'pricing' | 'editorial' | 'fallback';

type SimilarityReason = {
  kind: SimilarityReasonKind;
  text: string;
};

function getReasonLabel(kind: SimilarityReasonKind, isChinese: boolean): string {
  switch (kind) {
    case 'best-fit':
      return isChinese ? '更适合' : 'Best fit';
    case 'compare':
      return isChinese ? '先比' : 'Compare on';
    case 'tags':
      return isChinese ? '重合标签' : 'Shared tags';
    case 'pricing':
      return isChinese ? '定价相近' : 'Same pricing';
    case 'editorial':
      return isChinese ? '编辑补充' : 'Editorial note';
    case 'fallback':
    default:
      return isChinese ? '通用参考' : 'General reference';
  }
}

function getPricingLabel(pricing: Tool['pricing'] | undefined, isChinese: boolean): string {
  if (pricing === 'free') return isChinese ? '免费' : 'Free';
  if (pricing === 'freemium') return isChinese ? '免费增值' : 'Freemium';
  if (pricing === 'paid') return isChinese ? '付费' : 'Paid';
  return isChinese ? '查看官网' : 'Check website';
}

function humanizeTag(tag: string, isChinese: boolean): string {
  if (isChinese) {
    return tag;
  }

  return tag
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function getLocalizedText(input: unknown, locale: string, fallback = 'en'): string | null {
  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed || null;
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const direct = record[locale];
    if (typeof direct === 'string' && direct.trim()) return direct.trim();

    const fallbackValue = record[fallback];
    if (typeof fallbackValue === 'string' && fallbackValue.trim()) return fallbackValue.trim();

    const firstString = Object.values(record).find((value) => typeof value === 'string' && value.trim());
    if (typeof firstString === 'string') return firstString.trim();
  }

  return null;
}

function getLocalizedList(input: unknown, locale: string, fallback = 'en'): string[] {
  if (Array.isArray(input)) {
    return input.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    return trimmed ? [trimmed] : [];
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    const direct = record[locale];
    if (Array.isArray(direct)) {
      return direct.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    }

    const fallbackValue = record[fallback];
    if (Array.isArray(fallbackValue)) {
      return fallbackValue.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    }
  }

  return [];
}

function getDecisionAxes(tool: Tool, locale: string, isChinese: boolean): string[] {
  const axes = getLocalizedList(tool.features?.decision?.compareAxes, locale, isChinese ? 'zh' : 'en');
  return axes.slice(0, 2);
}

function getBestFitSnippet(tool: Tool, locale: string, isChinese: boolean): string | null {
  const bestFit = getLocalizedList(tool.features?.audience?.bestFit, locale, isChinese ? 'zh' : 'en');
  if (bestFit.length > 0) {
    return bestFit[0];
  }

  const useCases = getLocalizedList(tool.useCases, locale, isChinese ? 'zh' : 'en');
  return useCases[0] || null;
}

function getEditorialSnippet(tool: Tool, locale: string, isChinese: boolean): string | null {
  return getLocalizedText(tool.features?.editorial?.summary, locale, isChinese ? 'zh' : 'en');
}

function getCompareAxes(categorySlug: string | undefined, isChinese: boolean): string[] {
  switch (categorySlug) {
    case 'web3':
      return isChinese
        ? ['链支持与数据覆盖', '钱包/协议视角深度', '研究与监控工作流']
        : ['Chain and data coverage', 'Wallet or protocol depth', 'Research and monitoring workflow'];
    case 'text-writing':
      return isChinese
        ? ['写作任务适配度', '免费额度与升级门槛', '内容质量与工作流顺手度']
        : ['Writing task fit', 'Free-tier and upgrade threshold', 'Content quality and workflow friction'];
    case 'developer-tools':
      return isChinese
        ? ['模型覆盖', '集成成本', '可观测性与团队协作']
        : ['Model coverage', 'Integration cost', 'Observability and team workflow'];
    case 'automation':
      return isChinese
        ? ['连接器覆盖', '触发方式', '维护和失败处理']
        : ['Connector coverage', 'Trigger style', 'Maintenance and failure handling'];
    default:
      return isChinese ? ['任务适配度', '定价', '真实反馈'] : ['Task fit', 'Pricing', 'Real-world feedback'];
  }
}

function getSimilarityReasons(
  tool: Tool,
  currentPricing: Tool['pricing'] | undefined,
  currentTagSlugs: string[],
  isChinese: boolean,
  locale: string,
) {
  const reasons: SimilarityReason[] = [];
  const sharedTags = tool.tags.filter((tag) => currentTagSlugs.includes(tag)).slice(0, 2);
  const bestFitSnippet = getBestFitSnippet(tool, locale, isChinese);
  const editorialSnippet = getEditorialSnippet(tool, locale, isChinese);
  const decisionAxes = getDecisionAxes(tool, locale, isChinese);

  if (bestFitSnippet) {
    reasons.push({
      kind: 'best-fit',
      text: isChinese ? `更适合：${bestFitSnippet}` : `Best for: ${bestFitSnippet}`,
    });
  }

  if (decisionAxes.length > 0) {
    reasons.push({
      kind: 'compare',
      text: isChinese ? `先比：${decisionAxes.join('、')}` : `Compare on: ${decisionAxes.join(', ')}`,
    });
  }

  if (sharedTags.length > 0) {
    reasons.push({
      kind: 'tags',
      text: isChinese
        ? `重合标签：${sharedTags.map((tag) => humanizeTag(tag, true)).join('、')}`
        : `Shared tags: ${sharedTags.map((tag) => humanizeTag(tag, false)).join(', ')}`,
    });
  }

  if (currentPricing && tool.pricing === currentPricing) {
    reasons.push({
      kind: 'pricing',
      text: isChinese
        ? `同样是${getPricingLabel(tool.pricing, true)}模式`
        : `Same ${getPricingLabel(tool.pricing, false).toLowerCase()} pricing model`,
    });
  }

  if (reasons.length < 3 && editorialSnippet) {
    reasons.push({ kind: 'editorial', text: editorialSnippet });
  }

  if (reasons.length === 0) {
    reasons.push({
      kind: 'fallback',
      text: isChinese ? '同类任务里常被一起比较' : 'Commonly compared in similar workflows',
    });
  }

  return reasons.slice(0, 3);
}

export default async function RecommendedTools({
  toolId,
  locale = 'en',
  categoryName,
  categorySlug,
  compareAxes,
  pricing,
  pricingLabel,
  tagSlugs = [],
  tagLabels = [],
}: RecommendedToolsProps) {
  const recommendedTools = await getRecommendedTools(toolId, 6);

  if (recommendedTools.length === 0) {
    return null;
  }

  const isChinese = locale === 'cn';
  const comparisonTitle = isChinese ? '相似工具对比' : 'Compare Similar Tools';
  const comparisonDescription = isChinese
    ? '先把同类工具放在一起比，再决定哪一款更适合你的工作流。'
    : 'Put similar tools side by side first, then decide which one fits your workflow best.';
  const activeCompareAxes =
    compareAxes && compareAxes.length > 0 ? compareAxes : getCompareAxes(categorySlug, isChinese);
  let tagSummary = isChinese ? '通用工作流' : 'General workflows';
  if (tagLabels.length > 0) {
    tagSummary = tagLabels.slice(0, 3).join(isChinese ? '、' : ', ');
  }

  return (
    <section className='mb-24 pb-2'>
      <div className='mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-2xl font-bold text-slate-900 lg:text-3xl'>{comparisonTitle}</h2>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>{comparisonDescription}</p>
        <div className='mt-4 grid gap-3 sm:grid-cols-3'>
          <div className='rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '当前分类' : 'Current category'}
            </p>
            <p className='mt-1 text-sm font-semibold text-slate-950'>
              {categoryName || (isChinese ? 'AI 工具' : 'AI tool')}
            </p>
          </div>
          <div className='rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '当前定价' : 'Pricing model'}
            </p>
            <p className='mt-1 text-sm font-semibold text-slate-950'>
              {pricingLabel || (isChinese ? '查看官网' : 'Check website')}
            </p>
          </div>
          <div className='rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '重点标签' : 'Topic overlap'}
            </p>
            <p className='mt-1 text-sm font-semibold text-slate-950'>{tagSummary}</p>
          </div>
        </div>
        <div className='mt-4 rounded-lg bg-cyan-50 p-4 ring-1 ring-cyan-100'>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先比这三个点' : 'Compare these first'}
          </p>
          <div className='mt-2 flex flex-wrap gap-2'>
            {activeCompareAxes.map((axis) => (
              <span
                key={axis}
                className='inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-cyan-900 ring-1 ring-cyan-100'
              >
                {axis}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className='grid gap-6 lg:grid-cols-2 2xl:grid-cols-3'>
        {recommendedTools.map((tool) => {
          const reasons = getSimilarityReasons(tool, pricing, tagSlugs, isChinese, locale);

          return (
            <div key={tool.id} className='min-w-0 space-y-3'>
              <WebNavCard
                name={tool.name}
                title={getLocalizedField(tool.title, locale)}
                content={getLocalizedField(tool.content, locale)}
                url={tool.url}
                imageUrl={tool.imageUrl || ''}
                thumbnailUrl={tool.thumbnailUrl || ''}
                toolId={tool.id}
                averageRating={tool.averageRating}
                ratingCount={tool.ratingCount}
              />
              <div className='overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {isChinese ? '为什么推荐它' : 'Why compare this one'}
                </p>
                <p className='mt-1 text-xs leading-5 text-slate-500'>
                  {isChinese
                    ? '先看这几条，再决定要不要继续点官网或继续比较。'
                    : 'Read these signals first, then decide whether to open the official site or keep comparing.'}
                </p>
                <div className='mt-2 space-y-2'>
                  {reasons.map((reason) => (
                    <div
                      key={`${reason.kind}-${reason.text}`}
                      className='rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700 ring-1 ring-slate-200'
                    >
                      <p className='text-[10px] font-semibold uppercase tracking-wide text-slate-500'>
                        {getReasonLabel(reason.kind, isChinese)}
                      </p>
                      <p className='mt-1 break-words text-sm text-slate-800'>{reason.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
