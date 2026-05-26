import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LayoutDashboard, Heart, MessageSquareText, Settings2 } from 'lucide-react';

import { getCurrentUserProfile } from '@/lib/services/user';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Navigation' });

  return {
    title: `${t('title')} - Profile`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { locale: string };
}) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const profile = await getCurrentUserProfile();

  return (
    <div className="theme-page container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          {isChinese ? '个人中心' : 'Profile'}
        </h1>
        <p className="mt-2 text-slate-600">
          {isChinese
            ? '查看你的账号概况、收藏、投稿和设置。'
            : 'View your account overview, favorites, submissions, and settings.'}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/profile/favorites" className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{isChinese ? '收藏' : 'Favorites'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isChinese ? '查看你收藏过的工具。' : 'Browse the tools you saved.'}
              </p>
            </div>
            <Heart className="size-5 text-cyan-700" />
          </div>
        </Link>

        <Link href="/profile/submissions" className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{isChinese ? '投稿' : 'Submissions'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isChinese ? '追踪你提交的工具状态。' : 'Track the status of your submitted tools.'}
              </p>
            </div>
            <MessageSquareText className="size-5 text-cyan-700" />
          </div>
        </Link>

        <Link href="/settings" className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{isChinese ? '设置' : 'Settings'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isChinese ? '管理通知和个人偏好。' : 'Manage notifications and preferences.'}
              </p>
            </div>
            <Settings2 className="size-5 text-cyan-700" />
          </div>
        </Link>

        <div className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">{isChinese ? '账号信息' : 'Account'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {profile
                  ? `${profile.username || profile.email} · ${profile.emailVerified ? (isChinese ? '已验证' : 'Verified') : (isChinese ? '未验证' : 'Unverified')}`
                  : isChinese
                  ? '暂无用户信息。'
                  : 'No user information available.'}
              </p>
            </div>
            <LayoutDashboard className="size-5 text-cyan-700" />
          </div>
        </div>
      </section>
    </div>
  );
}
