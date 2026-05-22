import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/middleware';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Verify admin access
    await requireAdmin();
  } catch (error) {
    // Redirect to home if not admin
    redirect('/');
  }

  return (
    <div className="theme-page flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
