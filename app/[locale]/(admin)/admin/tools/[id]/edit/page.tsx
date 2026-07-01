import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getAllCategories } from '@/lib/services/categories';
import AdminToolEditForm from '@/components/admin/AdminToolEditForm';
import { getAdminToolById } from '@/app/actions/admin/tools';
import { getToolStats } from '@/app/actions/analytics';
import { getCommentCount } from '@/app/actions/comments';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  try {
    const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

    return {
      title: t('tools.edit'),
    };
  } catch (error) {
    console.error('Admin tool edit metadata failed to load:', error);
    return {
      title: 'Edit Tool',
    };
  }
}

export default async function AdminToolEditPage({ params }: { params: { id: string } }) {
  try {
    const tool = await getAdminToolById(params.id);

    if (!tool) {
      notFound();
    }

    const [categories, toolStats, commentCount] = await Promise.all([
      getAllCategories(),
      getToolStats(tool.id),
      getCommentCount(tool.id),
    ]);

    return (
      <div>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Edit Tool</h1>
          <p className='mt-2 text-slate-600'>Update tool information and settings</p>
        </div>

        <AdminToolEditForm tool={tool} categories={categories} toolStats={toolStats} commentCount={commentCount} />
      </div>
    );
  } catch (error) {
    console.error('Admin tool edit page failed to load:', error);
    return (
      <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900'>
        <h1 className='text-2xl font-bold'>Tool editor unavailable</h1>
        <p className='mt-2 text-sm leading-6'>
          The edit page could not finish loading right now. Please try again, or go back to the tools list and reopen
          this entry.
        </p>
      </div>
    );
  }
}
