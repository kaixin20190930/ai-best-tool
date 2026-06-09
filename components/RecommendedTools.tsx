import { getRecommendedTools } from '@/lib/services/recommendations';
import { getLocalizedField } from '@/lib/services/tools';
import WebNavCard from '@/components/webNav/WebNavCard';

interface RecommendedToolsProps {
  toolId: string;
  locale?: string;
  categoryName?: string;
  pricingLabel?: string;
  tagLabels?: string[];
}

export default async function RecommendedTools({
  toolId,
  locale = 'en',
  categoryName,
  pricingLabel,
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
      </div>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendedTools.map((tool) => (
          <WebNavCard
            key={tool.id}
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
        ))}
      </div>
    </section>
  );
}
