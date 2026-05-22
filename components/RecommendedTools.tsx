import { getLocalizedField } from '@/lib/services/tools';
import { getRecommendedTools } from '@/lib/services/recommendations';
import WebNavCard from '@/components/webNav/WebNavCard';

interface RecommendedToolsProps {
  toolId: string;
  locale?: string;
}

export default async function RecommendedTools({ toolId, locale = 'en' }: RecommendedToolsProps) {
  const recommendedTools = await getRecommendedTools(toolId, 6);

  if (recommendedTools.length === 0) {
    return null;
  }

  return (
    <section className='mb-8'>
      <h2 className='mb-6 text-2xl font-bold text-slate-900 lg:text-3xl'>
        You Might Also Like
      </h2>
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
