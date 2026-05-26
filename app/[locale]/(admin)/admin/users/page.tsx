import { getTranslations } from 'next-intl/server';
import { Users, Shield, MailCheck, CalendarDays } from 'lucide-react';

import { createAdminClient } from '@/lib/supabase/admin';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Users`,
  };
}

type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  emailConfirmed: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

export default async function AdminUsersPage({
  params,
}: {
  params: { locale: string };
}) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';

  let rows: AdminUserRow[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 25,
    });

    if (error) {
      errorMessage = error.message;
    } else {
      rows =
        data.users?.map((user) => ({
          id: user.id,
          email: user.email || '',
          role: String(user.user_metadata?.role || 'user'),
          emailConfirmed: !!user.email_confirmed_at,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at || null,
        })) || [];
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Failed to load users.';
  }

  const summaryCards = [
    {
      label: isChinese ? '当前页面用户数' : 'Users on this page',
      value: rows.length.toString(),
      icon: Users,
    },
    {
      label: isChinese ? '已验证邮箱' : 'Verified emails',
      value: rows.filter((row) => row.emailConfirmed).length.toString(),
      icon: MailCheck,
    },
    {
      label: isChinese ? '管理员/协作者' : 'Admins / moderators',
      value: rows.filter((row) => row.role === 'admin' || row.role === 'moderator').length.toString(),
      icon: Shield,
    },
    {
      label: isChinese ? '最近创建账号' : 'Newest account',
      value: rows[0]?.createdAt ? new Date(rows[0].createdAt).toLocaleDateString() : '—',
      icon: CalendarDays,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {isChinese ? '用户管理' : 'Users'}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {isChinese
            ? '这里先展示 Supabase Auth 用户，方便你快速确认注册、登录和管理员身份。'
            : 'This page shows Supabase Auth users so you can quickly verify registration, login, and admin roles.'}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                <card.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {errorMessage ? (
        <section className="theme-surface mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">
          {isChinese
            ? `加载用户列表失败：${errorMessage}`
            : `Failed to load users: ${errorMessage}`}
        </section>
      ) : null}

      <section className="theme-surface mt-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {isChinese ? '最近 25 位用户' : 'Latest 25 users'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  {isChinese ? '邮箱' : 'Email'}
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  {isChinese ? '角色' : 'Role'}
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  {isChinese ? '邮箱验证' : 'Email verified'}
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  {isChinese ? '创建时间' : 'Created'}
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  {isChinese ? '最近登录' : 'Last sign in'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    {isChinese ? '暂无用户数据。' : 'No user data yet.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.emailConfirmed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.emailConfirmed
                          ? isChinese
                            ? '已验证'
                            : 'Verified'
                          : isChinese
                          ? '未验证'
                          : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.lastSignInAt ? new Date(row.lastSignInAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
