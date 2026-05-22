import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getAdminToolById } from '@/app/actions/admin/tools';
import { getAllCategories } from '@/lib/services/categories';
import AdminToolEditForm from '@/components/admin/AdminToolEditForm';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: t('tools.edit'),
  };
}

export default async function AdminToolEditPage({
  params,
}: {
  params: { id: string };
}) {
  const tool = await getAdminToolById(params.id);

  if (!tool) {
    notFound();
  }

  const categories = await getAllCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Tool</h1>
        <p className="mt-2 text-slate-600">Update tool information and settings</p>
      </div>

      <AdminToolEditForm tool={tool} categories={categories} />
    </div>
  );
}
