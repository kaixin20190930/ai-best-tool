import { BellRing, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getCurrentUserProfile } from '@/lib/services/user';
import { getMySubmissionEmailPreference } from '@/app/actions/userPreferences';

import SubmissionEmailPreferenceToggle from '../profile/submissions/SubmissionEmailPreferenceToggle';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Navigation' });

  return {
    title: `${t('title')} - Settings`,
    ...getNoindexMetadata(),
  };
}

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const [profileResult, submissionEmailsEnabledResult] = await Promise.allSettled([
    getCurrentUserProfile(),
    getMySubmissionEmailPreference(),
  ]);
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const submissionEmailsEnabled =
    submissionEmailsEnabledResult.status === 'fulfilled' ? submissionEmailsEnabledResult.value : true;
  let accountText = '';
  if (profile) {
    accountText = profile.email;
  } else {
    accountText = isChinese ? '未登录或无法读取账号。' : 'Not signed in or unavailable.';
  }

  let emailStatusText = '—';
  if (profile) {
    if (profile.emailVerified) {
      emailStatusText = isChinese ? '已验证' : 'Verified';
    } else {
      emailStatusText = isChinese ? '未验证' : 'Unverified';
    }
  }

  let submissionEmailsText = '';
  if (submissionEmailsEnabled) {
    submissionEmailsText = isChinese ? '已开启投稿状态邮件。' : 'Submission status emails are on.';
  } else {
    submissionEmailsText = isChinese ? '已关闭投稿状态邮件。' : 'Submission status emails are off.';
  }

  return (
    <div className='theme-page container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900 lg:text-4xl'>{isChinese ? '个人设置' : 'Settings'}</h1>
        <p className='mt-2 text-slate-600'>
          {isChinese
            ? '管理你的通知、账号和个人偏好。'
            : 'Manage notifications, account info, and personal preferences.'}
        </p>
      </div>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '账号' : 'Account'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>{accountText}</p>
            </div>
            <UserRound className='size-5 text-cyan-700' />
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '邮箱状态' : 'Email status'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>{emailStatusText}</p>
            </div>
            <ShieldCheck className='size-5 text-cyan-700' />
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '投稿通知' : 'Submission emails'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>{submissionEmailsText}</p>
            </div>
            <BellRing className='size-5 text-cyan-700' />
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-medium text-slate-600'>{isChinese ? '联系邮箱' : 'Contact email'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-500'>
                {isChinese ? '用于接收通知和验证邮件。' : 'Used for notifications and verification.'}
              </p>
            </div>
            <Mail className='size-5 text-cyan-700' />
          </div>
        </div>
      </section>

      <div className='mt-6'>
        <SubmissionEmailPreferenceToggle initialEnabled={submissionEmailsEnabled} />
      </div>
    </div>
  );
}
