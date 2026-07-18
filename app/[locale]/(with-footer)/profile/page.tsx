import { ArrowUpRight, Heart, LayoutDashboard, MessageSquareText, Settings2, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getCurrentUserProfile } from '@/lib/services/user';
import { getMyOwnedTools } from '@/app/actions/ownedTools';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Navigation' });

  return {
    title: `${t('title')} - Profile`,
    ...getNoindexMetadata(),
  };
}

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const [profileResult, ownedToolsResult] = await Promise.allSettled([getCurrentUserProfile(), getMyOwnedTools()]);
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const ownedTools =
    ownedToolsResult.status === 'fulfilled' && ownedToolsResult.value.success ? ownedToolsResult.value.tools : [];
  const ownedSummary = ownedTools.reduce(
    (acc, tool) => {
      acc.views += tool.viewCount || 0;
      acc.clicks += tool.clickCount || 0;
      acc.favorites += tool.favoriteCount || 0;
      acc.ratings += tool.ratingCount || 0;
      acc.comments += tool.commentCount || 0;
      return acc;
    },
    { views: 0, clicks: 0, favorites: 0, ratings: 0, comments: 0 },
  );
  const ownedClaimSummary = ownedTools.reduce(
    (acc, tool) => {
      const status = tool.claimStatus || 'unclaimed';
      if (status === 'claimed') acc.claimed += 1;
      else if (status === 'pending') acc.pending += 1;
      else if (status === 'rejected') acc.rejected += 1;
      else acc.unclaimed += 1;
      return acc;
    },
    { claimed: 0, pending: 0, rejected: 0, unclaimed: 0 },
  );
  const ownedToolsNeedingAttention = ownedTools.filter(
    (tool) =>
      tool.status !== 'published' ||
      (tool.claimStatus || 'unclaimed') !== 'claimed' ||
      !tool.pricing ||
      !tool.claimedAt,
  );
  const stableOwnedTools = ownedTools.filter(
    (tool) => tool.status === 'published' && (tool.claimStatus || 'unclaimed') === 'claimed' && Boolean(tool.pricing),
  );
  const now = new Date();
  const featuredOwnedTools = ownedTools.filter((tool) => tool.isSponsoredPlacement && Boolean(tool.featuredUntil));
  const activeFeaturedTools = featuredOwnedTools.filter((tool) => {
    if (!tool.featuredUntil) return false;
    const until = new Date(tool.featuredUntil);
    return !Number.isNaN(until.getTime()) && until >= now;
  });
  const expiredFeaturedTools = featuredOwnedTools.filter((tool) => {
    if (!tool.featuredUntil) return false;
    const until = new Date(tool.featuredUntil);
    return !Number.isNaN(until.getTime()) && until < now;
  });
  const nextFeaturedTool =
    activeFeaturedTools
      .slice()
      .sort((a, b) => new Date(a.featuredUntil || 0).getTime() - new Date(b.featuredUntil || 0).getTime())[0] || null;
  const nextFeaturedDaysLeft = nextFeaturedTool?.featuredUntil
    ? Math.max(
        0,
        Math.ceil((new Date(nextFeaturedTool.featuredUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
    : null;
  const featuredNeedsAttention =
    expiredFeaturedTools.length > 0 || (nextFeaturedDaysLeft !== null && nextFeaturedDaysLeft <= 3);
  const submissionsHref = featuredNeedsAttention ? '/profile/submissions?focus=payment' : '/profile/submissions';
  let nextStepButtonLabel = isChinese ? '查看提交状态' : 'Check submissions';
  if (featuredNeedsAttention) {
    nextStepButtonLabel = isChinese ? '处理付费 / 续期' : 'Handle payment / renewal';
  }
  let paymentRenewalTitle = isChinese
    ? '把提交、付费和续期放在同一条路径里'
    : 'Keep submissions, payments, and renewals on one path';
  if (featuredNeedsAttention) {
    paymentRenewalTitle = isChinese ? '有展示窗口快到期，先去处理续期' : 'Your visibility window needs attention';
  }
  let accountInfoText: string;
  if (!profile) {
    accountInfoText = isChinese ? '暂无用户信息。' : 'No user information available.';
  } else {
    let verificationLabel = 'Unverified';
    if (profile.emailVerified) {
      verificationLabel = isChinese ? '已验证' : 'Verified';
    } else if (isChinese) {
      verificationLabel = '未验证';
    }
    accountInfoText = `${profile.username || profile.email} · ${verificationLabel}`;
  }

  let nextFeaturedTitleText: string;
  if (!nextFeaturedTool) {
    nextFeaturedTitleText = isChinese ? '暂无' : 'None';
  } else if (typeof nextFeaturedTool.title === 'string') {
    nextFeaturedTitleText = nextFeaturedTool.title;
  } else {
    nextFeaturedTitleText =
      nextFeaturedTool.title.en ||
      nextFeaturedTool.title.zh ||
      Object.values(nextFeaturedTool.title)[0] ||
      nextFeaturedTool.name;
  }

  let nextFeaturedDaysText: string;
  if (!nextFeaturedTool || nextFeaturedDaysLeft === null) {
    nextFeaturedDaysText = isChinese ? '目前没有在跑的前排窗口。' : 'There is no active featured window right now.';
  } else if (isChinese) {
    nextFeaturedDaysText = `还剩 ${nextFeaturedDaysLeft} 天`;
  } else if (nextFeaturedDaysLeft === 1) {
    nextFeaturedDaysText = '1 day left';
  } else {
    nextFeaturedDaysText = `${nextFeaturedDaysLeft} days left`;
  }

  let nextMoveText: string;
  if (featuredNeedsAttention) {
    nextMoveText = isChinese ? '优先检查快到期的前排窗口。' : 'Check the expiring featured windows first.';
  } else {
    nextMoveText = isChinese ? '前排状态稳定，可以继续观察。' : 'Featured status looks stable for now.';
  }

  const getOwnedToolTitleText = (tool: (typeof ownedTools)[number]) => {
    if (typeof tool.title === 'string') {
      return tool.title;
    }

    return tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name;
  };

  const getOwnedPricingText = (tool: (typeof ownedTools)[number]) => {
    if (tool.pricing) return tool.pricing;
    return isChinese ? '未设置定价' : 'No pricing set';
  };

  const getClaimedAtText = (tool: (typeof ownedTools)[number]) => {
    if (!tool.claimedAt) return isChinese ? '暂无' : 'Not set';
    return new Date(tool.claimedAt).toLocaleDateString();
  };

  const nextOwnerAction = (() => {
    if (ownedClaimSummary.pending > 0) {
      return isChinese ? '先跟进待确认的认领请求' : 'Follow up on pending claim requests first';
    }
    if (ownedClaimSummary.unclaimed > 0) {
      return isChinese ? '先认领还没建立 owner 链路的条目' : 'Claim the listings that still have no owner link';
    }
    if (ownedClaimSummary.rejected > 0) {
      return isChinese ? '先修正被驳回的认领信息' : 'Resolve rejected claim details first';
    }
    if (ownedToolsNeedingAttention.length > 0) {
      return isChinese ? '检查还没准备好的条目并补齐信息' : 'Check the listings that still need cleanup';
    }
    return isChinese ? '继续维护已稳定的条目' : 'Keep the stable listings warm and current';
  })();

  const getFeaturedLabel = (tool: (typeof ownedTools)[number]) => {
    if (!tool.featuredUntil) return isChinese ? '未设置前排窗口' : 'No featured window';

    const until = new Date(tool.featuredUntil);
    if (Number.isNaN(until.getTime())) return isChinese ? '前排窗口无效' : 'Invalid featured window';

    if (until < now) return isChinese ? '已过期' : 'Expired';

    const daysLeft = Math.max(0, Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    if (daysLeft <= 3) {
      return isChinese ? `即将到期 · ${daysLeft} 天` : `Ending soon · ${daysLeft} days`;
    }

    return isChinese ? `运行中 · ${daysLeft} 天` : `Active · ${daysLeft} days`;
  };

  function getOwnedStatusLabel(status: string) {
    if (status === 'published') return isChinese ? '已发布' : 'Published';
    if (status === 'pending') return isChinese ? '审核中' : 'Pending review';
    if (status === 'rejected') return isChinese ? '已拒绝' : 'Rejected';
    return isChinese ? '草稿' : 'Draft';
  }

  function getClaimLabel(claimStatus: string | null) {
    if (claimStatus === 'claimed') return isChinese ? '已认领' : 'Claimed';
    if (claimStatus === 'pending') return isChinese ? '待确认' : 'Pending';
    if (claimStatus === 'rejected') return isChinese ? '已驳回' : 'Rejected';
    return isChinese ? '未认领' : 'Unclaimed';
  }

  return (
    <div className='theme-page container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900 lg:text-4xl'>{isChinese ? '个人中心' : 'Profile'}</h1>
        <p className='mt-2 text-slate-600'>
          {isChinese
            ? '查看你的账号概况、收藏、投稿和设置。'
            : 'View your account overview, favorites, submissions, and settings.'}
        </p>
      </div>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Link
          href='/profile/favorites'
          className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md'
        >
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '收藏' : 'Favorites'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>
                {isChinese ? '查看你收藏过的工具。' : 'Browse the tools you saved.'}
              </p>
            </div>
            <Heart className='size-5 text-cyan-700' />
          </div>
        </Link>

        <Link
          href='/profile/submissions'
          className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md'
        >
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '投稿' : 'Submissions'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>
                {isChinese ? '追踪你提交的工具状态。' : 'Track the status of your submitted tools.'}
              </p>
            </div>
            <MessageSquareText className='size-5 text-cyan-700' />
          </div>
        </Link>

        <Link
          href='/settings'
          className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md'
        >
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '设置' : 'Settings'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>
                {isChinese ? '管理通知和个人偏好。' : 'Manage notifications and preferences.'}
              </p>
            </div>
            <Settings2 className='size-5 text-cyan-700' />
          </div>
        </Link>

        <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '账号信息' : 'Account'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>{accountInfoText}</p>
            </div>
            <LayoutDashboard className='size-5 text-cyan-700' />
          </div>
        </div>
      </section>

      <section className='mt-8 rounded-[20px] border border-cyan-100 bg-cyan-50 p-6 shadow-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100'>
              <Sparkles className='size-3.5' />
              {isChinese ? 'Owner 概览' : 'Owner overview'}
            </div>
            <h2 className='mt-3 text-2xl font-bold text-slate-950'>
              {isChinese ? '你认领的工具和基础表现' : 'Your claimed tools and basic performance'}
            </h2>
            <p className='mt-2 text-sm leading-6 text-cyan-900/80'>
              {isChinese
                ? '这里先给你一个轻量看板：看得见条目、状态和互动数据，方便后续跟进认领和更新。'
                : 'This is a lightweight dashboard: listing status plus core engagement data so you can follow up and update details.'}
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 xl:min-w-[520px] xl:grid-cols-5'>
            {[
              { label: isChinese ? '条目' : 'Listings', value: ownedTools.length },
              { label: isChinese ? '浏览' : 'Views', value: ownedSummary.views },
              { label: isChinese ? '点击' : 'Clicks', value: ownedSummary.clicks },
              { label: isChinese ? '收藏' : 'Favorites', value: ownedSummary.favorites },
              { label: isChinese ? '评论' : 'Comments', value: ownedSummary.comments },
            ].map((item) => (
              <div key={item.label} className='rounded-xl border border-white bg-white p-4 shadow-sm'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{item.label}</p>
                <p className='mt-2 text-2xl font-bold text-slate-950'>{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {[
            { label: isChinese ? '已认领' : 'Claimed', value: ownedClaimSummary.claimed, tone: 'text-emerald-700' },
            { label: isChinese ? '待确认' : 'Pending', value: ownedClaimSummary.pending, tone: 'text-cyan-700' },
            { label: isChinese ? '已驳回' : 'Rejected', value: ownedClaimSummary.rejected, tone: 'text-rose-700' },
            { label: isChinese ? '未认领' : 'Unclaimed', value: ownedClaimSummary.unclaimed, tone: 'text-slate-700' },
          ].map((item) => (
            <div key={item.label} className='rounded-xl border border-white bg-white p-4 shadow-sm'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{item.label}</p>
              <p className={`mt-2 text-2xl font-bold ${item.tone}`}>{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
          <div className='rounded-2xl border border-white bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步建议' : 'Recommended next step'}
            </p>
            <h3 className='mt-2 text-xl font-bold text-slate-950'>{nextOwnerAction}</h3>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这个区块是给 owner / operator 用的轻量操作提示，帮你先抓住最可能影响转化和维护成本的那一步。'
                : 'This is a lightweight operating cue for owners and operators, so you can focus on the step that most likely affects conversion and maintenance cost first.'}
            </p>
            <div className='mt-4 flex flex-wrap gap-3'>
              <Link
                href={submissionsHref}
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {nextStepButtonLabel}
              </Link>
              <Link
                href='/developer/listing'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
              >
                {isChinese ? '认领或更新条目' : 'Claim or update listing'}
              </Link>
            </div>
          </div>

          <div className='rounded-2xl border border-white bg-white p-5 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
              {isChinese ? '需要关注' : 'Needs attention'}
            </p>
            <p className='mt-2 text-3xl font-bold text-slate-950'>{ownedToolsNeedingAttention.length}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这些条目还没有完全进入稳定状态，通常要么还在审核中，要么还需要 owner / pricing 信息。'
                : 'These listings are not fully stable yet, usually because they are still under review or missing owner / pricing information.'}
            </p>
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {isChinese ? '稳定条目' : 'Stable listings'}
                </p>
                <p className='mt-1 text-lg font-bold text-emerald-700'>{stableOwnedTools.length}</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {isChinese ? '需处理条目' : 'Action items'}
                </p>
                <p className='mt-1 text-lg font-bold text-amber-700'>{ownedToolsNeedingAttention.length}</p>
              </div>
            </div>
            <div className='mt-4 space-y-2'>
              {ownedToolsNeedingAttention.slice(0, 3).map((tool) => (
                <div key={tool.id} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>
                        {typeof tool.title === 'string'
                          ? tool.title
                          : tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name}
                      </p>
                      <p className='mt-1 text-xs text-slate-500'>{tool.name}</p>
                    </div>
                    <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200'>
                      {getClaimLabel(tool.claimStatus)}
                    </span>
                  </div>
                </div>
              ))}
              {ownedToolsNeedingAttention.length === 0 && (
                <div className='rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800'>
                  {isChinese ? '目前没有需要优先处理的条目。' : 'Nothing needs immediate attention right now.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='mt-6 rounded-2xl border border-white bg-white p-5 shadow-sm'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
                {isChinese ? '前排状态' : 'Featured status'}
              </p>
              <h3 className='mt-1 text-xl font-bold text-slate-950'>
                {isChinese ? '看清哪些条目正在吃曝光窗口' : 'See which listings are using visibility windows right now'}
              </h3>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这里把前排中的、快到期的和已经过期的条目放在一起，方便你决定要不要续期。'
                  : 'This groups active, expiring, and expired featured windows so you can decide whether to renew.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-2 text-xs font-semibold'>
              <span className='rounded-full bg-amber-50 px-3 py-1.5 text-amber-800'>
                {isChinese ? `前排中 ${activeFeaturedTools.length}` : `Active ${activeFeaturedTools.length}`}
              </span>
              <span className='rounded-full bg-rose-50 px-3 py-1.5 text-rose-800'>
                {isChinese ? `已过期 ${expiredFeaturedTools.length}` : `Expired ${expiredFeaturedTools.length}`}
              </span>
            </div>
          </div>

          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            <div
              className={`rounded-xl border p-4 ${featuredNeedsAttention ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '下一条到期' : 'Next expiry'}
              </p>
              <p className='mt-2 text-lg font-bold text-slate-950'>{nextFeaturedTitleText}</p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>{nextFeaturedDaysText}</p>
            </div>

            {nextFeaturedTool && (
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {isChinese ? '当前窗口' : 'Current window'}
                </p>
                <p className='mt-2 text-sm font-semibold text-slate-950'>{getFeaturedLabel(nextFeaturedTool)}</p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '如果这个窗口快到期，可以回到“我的提交”继续处理。'
                    : 'If this window is close to ending, head back to My Submissions to continue.'}
                </p>
              </div>
            )}

            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {isChinese ? '下一步' : 'Next move'}
              </p>
              <p className='mt-2 text-sm font-semibold text-slate-950'>{nextMoveText}</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Link
                  href='/profile/submissions'
                  className='inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700'
                >
                  {isChinese ? '查看我的提交' : 'Open submissions'}
                </Link>
                <Link
                  href='/pricing'
                  className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100'
                >
                  {isChinese ? '查看续期方案' : 'View renewal options'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='max-w-2xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-amber-700'>
                {isChinese ? '付费与续期' : 'Payment and renewal'}
              </p>
              <h3 className='mt-2 text-xl font-bold text-slate-950'>{paymentRenewalTitle}</h3>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '提交后如果需要支付或续期，可以直接跳到“我的提交”处理，不必在几个页面之间来回找。'
                  : 'After submitting, you can go straight to My Submissions to pay or renew instead of bouncing between pages.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href={submissionsHref}
                className='inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700'
              >
                {isChinese ? '打开我的提交' : 'Open My Submissions'}
              </Link>
              <Link
                href='/pricing'
                className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100'
              >
                {isChinese ? '查看定价与续期' : 'View pricing and renew'}
              </Link>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          {ownedTools.length > 0 ? (
            <div className='grid gap-4 lg:grid-cols-2'>
              {ownedTools.map((tool) => (
                <div key={tool.id} className='rounded-2xl border border-white bg-white p-5 shadow-sm'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        {getOwnedStatusLabel(tool.status)}
                      </p>
                      <h3 className='mt-1 text-lg font-bold text-slate-950'>{getOwnedToolTitleText(tool)}</h3>
                      <p className='mt-1 text-sm text-slate-600'>{tool.name}</p>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                        {getClaimLabel(tool.claimStatus)}
                      </span>
                      {tool.isSponsoredPlacement && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            tool.featuredUntil && new Date(tool.featuredUntil) >= now
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getFeaturedLabel(tool)}
                        </span>
                      )}
                      <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                        {getOwnedPricingText(tool)}
                      </span>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                    {[
                      { label: isChinese ? '浏览' : 'Views', value: tool.viewCount },
                      { label: isChinese ? '点击' : 'Clicks', value: tool.clickCount },
                      { label: isChinese ? '收藏' : 'Favorites', value: tool.favoriteCount },
                      { label: isChinese ? '评分' : 'Ratings', value: tool.ratingCount },
                      { label: isChinese ? '评论' : 'Comments', value: tool.commentCount },
                      { label: isChinese ? '认领时间' : 'Claimed', value: getClaimedAtText(tool) },
                    ].map((item) => (
                      <div key={item.label} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{item.label}</p>
                        <p className='mt-1 font-semibold text-slate-950'>{String(item.value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className='mt-4 flex flex-wrap gap-3'>
                    <Link
                      href={`/${params.locale}/ai/${tool.name}`}
                      className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
                    >
                      {isChinese ? '打开详情页' : 'Open listing'} <ArrowUpRight className='ml-2 size-4' />
                    </Link>
                    <Link
                      href='/profile/submissions'
                      className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                    >
                      {isChinese ? '查看投稿状态' : 'View submissions'}
                    </Link>
                    <Link
                      href='/developer/listing'
                      className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
                    >
                      {isChinese ? '认领或更新条目' : 'Claim or update listing'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-cyan-200 bg-white p-6 text-sm leading-6 text-slate-600'>
              <p>
                {isChinese
                  ? '还没有找到与你邮箱匹配的认领条目。你可以先去提交页新增工具，或者到认领页确认是否已有条目。'
                  : 'No claimed listing matches your email yet. You can submit a new tool first or check the claim page if the listing already exists.'}
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <Link
                  href='/developer/listing'
                  className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800'
                >
                  {isChinese ? '去认领条目' : 'Go to claim listing'}
                </Link>
                <Link
                  href='/submit'
                  className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                >
                  {isChinese ? '去提交工具' : 'Submit a tool'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
