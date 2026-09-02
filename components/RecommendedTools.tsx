import type { ReviewedToolRelationshipType } from '@/lib/config/reviewedToolRelationships';
import { getLocalizedToolPath } from '@/lib/config/toolRouteAliases';
import type { ReviewedToolRelationship } from '@/lib/services/reviewedToolRelationships';
import { getLocalizedField } from '@/lib/services/tools';
import WebNavCard from '@/components/webNav/WebNavCard';

interface RecommendedToolsProps {
  categoryName?: string;
  categorySlug?: string;
  compareAxes?: string[];
  locale?: string;
  pricingLabel?: string;
  relationships: ReviewedToolRelationship[];
  tagLabels?: string[];
}

function getRelationshipLabel(type: ReviewedToolRelationshipType, isChinese: boolean): string {
  const labels: Record<ReviewedToolRelationshipType, { cn: string; en: string }> = {
    alternative: { cn: '可替代', en: 'Alternative' },
    complements: { cn: '可配合', en: 'Works with' },
    overlaps: { cn: '部分重合', en: 'Overlaps' },
    replaces: { cn: '可替换', en: 'Can replace' },
  };
  return isChinese ? labels[type].cn : labels[type].en;
}

function getCompareAxes(categorySlug: string | undefined, isChinese: boolean): string[] {
  switch (categorySlug) {
    case 'design-art':
      return isChinese
        ? ['工作流覆盖', '授权边界', '生成与后期能力']
        : ['Workflow coverage', 'Licensing boundaries', 'Generation and finishing'];
    case 'productivity':
      return isChinese
        ? ['任务适配度', '生态集成', '额度与数据边界']
        : ['Task fit', 'Ecosystem integration', 'Limits and data boundaries'];
    case 'text-writing':
      return isChinese
        ? ['语言与写作任务', '额度与升级门槛', '数据处理方式']
        : ['Language and writing task', 'Limits and upgrade threshold', 'Data handling'];
    default:
      return isChinese ? ['任务适配度', '真实限制', '迁移成本'] : ['Task fit', 'Real limits', 'Switching cost'];
  }
}

export default function RecommendedTools({
  categoryName,
  categorySlug,
  compareAxes,
  locale = 'en',
  pricingLabel,
  relationships,
  tagLabels = [],
}: RecommendedToolsProps) {
  if (relationships.length === 0) return null;

  const isChinese = locale === 'cn';
  const activeCompareAxes = compareAxes?.length ? compareAxes : getCompareAxes(categorySlug, isChinese);
  let tagSummary = isChinese ? '通用工作流' : 'General workflows';
  if (tagLabels.length) {
    tagSummary = tagLabels.slice(0, 3).join(isChinese ? '、' : ', ');
  }

  return (
    <section className='mb-24 pb-2' data-reviewed-tool-relationships>
      <div className='mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700'>
              {isChinese ? '人工复核关系' : 'Editorially reviewed relationships'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-900 lg:text-3xl'>
              {isChinese ? '接下来比较哪些工具' : 'What to compare next'}
            </h2>
          </div>
          <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100'>
            {isChinese ? `${relationships.length} 条已复核关系` : `${relationships.length} reviewed relationships`}
          </span>
        </div>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
          {isChinese
            ? '这些链接不是按流量、付费或随机标签生成。每条都说明是替代、重合还是配合关系，并设有复核日期。'
            : 'These links are not selected by traffic, sponsorship, or random tags. Each states whether the tools replace, overlap, or complement one another and has a review date.'}
        </p>
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
              {isChinese ? '重点主题' : 'Topic context'}
            </p>
            <p className='mt-1 text-sm font-semibold text-slate-950'>{tagSummary}</p>
          </div>
        </div>
        <div className='mt-4 rounded-lg bg-cyan-50 p-4 ring-1 ring-cyan-100'>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先比这些决策点' : 'Compare these decision points'}
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

      <div className='grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {relationships.map((relationship) => {
          const { tool } = relationship;
          const relationshipLabel = getRelationshipLabel(relationship.relationshipType, isChinese);

          return (
            <article
              key={`${tool.id}-${relationship.relationshipType}`}
              className='flex h-full min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
            >
              <WebNavCard
                name={tool.name}
                title={getLocalizedField(tool.title, locale)}
                content={getLocalizedField(tool.content, locale)}
                url={tool.url}
                imageUrl={tool.imageUrl || ''}
                thumbnailUrl={tool.thumbnailUrl || ''}
                toolId={tool.id}
                averageRating={Number(tool.averageRating) || 0}
                ratingCount={Number(tool.ratingCount) || 0}
                compareHref={`${getLocalizedToolPath(tool.name, locale)}#decision-card`}
                compareLabel={isChinese ? '查看判断卡' : 'Open Decision Card'}
                locale={locale}
                density='compact'
              />
              <div className='mt-auto border-t border-slate-200 bg-slate-50/80 px-3 py-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-800 ring-1 ring-cyan-100'>
                    {relationshipLabel}
                  </span>
                  <span className='text-[10px] font-medium text-slate-500'>
                    {isChinese ? '复核于' : 'Reviewed'} {relationship.reviewedAt}
                  </span>
                </div>
                <p className='mt-2 text-xs leading-5 text-slate-700'>{relationship.rationale}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
