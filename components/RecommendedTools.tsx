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
      return isChinese
        ? ['任务适配度', '定价', '真实反馈']
        : ['Task fit', 'Pricing', 'Real-world feedback'];
  }
}

function getSimilarityReasons(
  tool: Tool,
  currentPricing: Tool['pricing'] | undefined,
  currentTagSlugs: string[],
  isChinese: boolean,
) {
  const reasons: string[] = [];
  const sharedTags = tool.tags.filter((tag) => currentTagSlugs.includes(tag)).slice(0, 2);

  if (sharedTags.length > 0) {
    reasons.push(
      isChinese
        ? `重合标签：${sharedTags.map((tag) => humanizeTag(tag, true)).join('、')}`
        : `Shared tags: ${sharedTags.map((tag) => humanizeTag(tag, false)).join(', ')}`,
    );
  }

  if (currentPricing && tool.pricing === currentPricing) {
    reasons.push(
      isChinese
        ? `同样是${getPricingLabel(tool.pricing, true)}模式`
        : `Same ${getPricingLabel(tool.pricing, false).toLowerCase()} pricing model`,
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      isChinese ? '同类任务里常被一起比较' : 'Commonly compared in similar workflows',
    );
  }

  return reasons;
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
    ? '先看同类工具的定价、使用场景和标签重合度，再决定哪一款更适合你的工作流。'
    : 'Compare pricing, workflow fit, and topic overlap before you commit to one option.';
  const activeCompareAxes = compareAxes && compareAxes.length > 0 ? compareAxes : getCompareAxes(categorySlug, isChinese);
  let tagSummary = isChinese ? '通用工作流' : 'General workflows';
  if (tagLabels.length > 0) {
    tagSummary = tagLabels.slice(0, 3).join(isChinese ? '、' : ', ');
  }

  return (
    <section className='mb-8'>
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
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendedTools.map((tool) => {
          const reasons = getSimilarityReasons(tool, pricing, tagSlugs, isChinese);

          return (
            <div key={tool.id} className='space-y-3'>
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
              <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-sm'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {isChinese ? '为什么推荐它' : 'Why compare this one'}
                </p>
                <ul className='mt-2 space-y-1.5 text-sm leading-6 text-slate-700'>
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
