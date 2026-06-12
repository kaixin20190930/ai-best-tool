import { Suspense } from 'react';
import { Link } from '@/app/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFavorites } from '@/app/actions/favorites';
import WebNavCard from '@/components/webNav/WebNavCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';

export const metadata = {
  title: 'My Favorites - AI Tools',
  description: 'View and manage your favorite AI tools',
};

async function FavoritesList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Please log in to view your favorites</h2>
        <Link
          href="/login?redirect=/profile/favorites"
          className="inline-block rounded-lg bg-cyan-700 px-6 py-3 text-white transition-colors hover:bg-cyan-800"
        >
          Log In
        </Link>
      </div>
    );
  }

  const result = await getFavorites();

  if (!result.success || result.favorites.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Start exploring AI tools and add them to your favorites!"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {result.favorites.map((favorite: any) => {
        const tool = favorite.tools;
        if (!tool) return null;

        return (
          <WebNavCard
            key={favorite.id}
            name={tool.name}
            title={typeof tool.title === 'string' ? tool.title : tool.title?.en || tool.title?.zh || ''}
            content={typeof tool.content === 'string' ? tool.content : tool.content?.en || tool.content?.zh || ''}
            url={tool.url}
            thumbnailUrl={tool.thumbnail_url || tool.image_url}
            imageUrl={tool.image_url}
            toolId={tool.id}
            isFavorited={true}
          />
        );
      })}
    </div>
  );
}

export default async function FavoritesPage() {
  return (
    <div className="theme-page container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">My Favorites</h1>
        <p className="mt-2 text-slate-600">
          Manage your favorite AI tools in one place
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <FavoritesList />
      </Suspense>
    </div>
  );
}
